// 执行层：跑一期 / 取链接 / 采样 / 巡检。CLI 和网页都调这里，保证同一套状态机
import { config, isDisabled } from './config.mjs'
import { db, saveNow } from './store.mjs'
import { PLATFORMS, BY_ID } from './platforms.mjs'
import { setTask, isLocked, tasksOf, STATE_LABEL } from './state.mjs'
import { driver } from './adapters/index.mjs'
import { notify } from './notify.mjs'
import { publishAt, dayIncrement, upsertMetric, dayOf, DAY } from './metrics.mjs'

export function activePlatforms() {
  return PLATFORMS.filter((p) => !isDisabled(p.id) && db.platformState[p.id]?.enabled !== false).map((p) => p.id)
}

export function batchesFor(ids) {
  const out = []
  const left = new Set(ids)
  for (const b of config.batches || []) {
    const hit = b.filter((id) => left.has(id))
    if (hit.length) {
      out.push(hit)
      hit.forEach((id) => left.delete(id))
    }
  }
  if (left.size) out.push([...left])
  return out
}

export async function runEpisode(ep, { only = null, force = false, stepMs = 260, quiet = false } = {}) {
  if (!ep) throw new Error('没有这一期')
  const drv = await driver()
  const skip = ep.skip || []
  const base = activePlatforms().filter((id) => !skip.includes(id))
  let ids = only ? base.filter((id) => only.includes(id)) : base

  const locked = ids.filter((id) => isLocked(ep.id, id))
  if (force) {
    for (const id of locked) setTask(ep.id, id, 'planned', '强制重跑')
    ids = [...new Set([...ids, ...locked])]
  } else {
    ids = ids.filter((id) => !isLocked(ep.id, id))
  }
  if (!ids.length) {
    if (!quiet) console.log(`第 ${ep.no} 期没有可跑的平台（都已到位，加 --force 可重跑）`)
    return { ran: 0 }
  }

  const offline = ids.filter((id) => db.platformState[id]?.loggedIn === false)
  const attempted = ids.length // 含被登录态拦下的，调用方需要知道「尝试过」
  for (const id of offline) setTask(ep.id, id, 'not_logged_in', '登录态失效，等待扫码')
  if (offline.length) {
    await notify(
      'warn',
      `${offline.map((id) => BY_ID[id].name).join('、')} 未登录`,
      '这几家本期先跳过，扫完码 20 分钟内会自动补跑',
    )
  }
  ids = ids.filter((id) => !offline.includes(id))

  let done = 0
  for (const batch of batchesFor(ids)) {
    for (const id of batch) {
      const p = BY_ID[id]
      setTask(ep.id, id, 'running', `打开 ${p.name} 上传页`)
      const res = await drv.fill(ep, id, {
        stepMs,
        onStep: (msg) => setTask(ep.id, id, 'running', msg),
      })
      setTask(ep.id, id, res.state, res.detail, res.url)
      if (res.state === 'published') {
        done++
        if (!ep.publishedAt) ep.publishedAt = new Date().toISOString()
      }
      await notify(res.state === 'published' ? 'ok' : 'info', `${p.name} · ${STATE_LABEL[res.state]}`, res.detail)
    }
  }

  await notify('info', `第 ${ep.no} 期填写完成`, `已发布 ${done} 个，待你点发布 ${ids.length - done} 个`)
  saveNow()
  return { ran: attempted, done, offline }
}

export async function syncEpisode(ep, { only = null, quiet = false } = {}) {
  if (!ep) throw new Error('没有这一期')
  const drv = await driver()
  const target = tasksOf(ep.id).filter(
    (t) => ['awaiting_user', 'scheduled', 'filled'].includes(t.state) && (!only || only.includes(t.platform)),
  )
  if (!target.length) {
    if (!quiet) console.log('这一期没有待取链接的平台')
    return { synced: 0 }
  }
  let n = 0
  for (const t of target) {
    const res = await drv.collectLink(ep, t.platform, {})
    setTask(ep.id, t.platform, res.state, res.detail, res.url)
    if (!ep.publishedAt) ep.publishedAt = new Date().toISOString()
    n++
    if (!quiet) console.log(`  ✓ ${BY_ID[t.platform].name} ${res.url}`)
  }
  const left = tasksOf(ep.id).filter((t) => t.state === 'awaiting_user').length
  await notify('ok', `第 ${ep.no} 期取链接完成`, left ? `还有 ${left} 个平台在等你点发布` : '这一期全部到位')
  saveNow()
  return { synced: n }
}

export function sampleToday(now = Date.now()) {
  const today = dayOf(now)
  let rows = 0
  for (const ep of db.episodes) {
    const pub = publishAt(ep)
    if (!pub || pub > now || now - pub > 30 * DAY) continue
    for (const t of tasksOf(ep.id)) {
      if (t.state !== 'published') continue
      const row = dayIncrement(ep, t.platform, today, now)
      if (!row) continue
      upsertMetric({ day: today, episodeId: ep.id, platform: t.platform, ...row })
      rows++
    }
  }
  db.meta.lastSample = today
  return rows
}

export function updateFans() {
  const today = dayOf()
  if (db.meta.fansDay === today) return 0
  const by = {}
  for (const p of PLATFORMS) {
    const s = db.platformState[p.id]
    if (!s) continue
    if (db.meta.fansDay) {
      const jitter = ((p.weight + new Date().getDate() * 13) % 11) + 2
      s.fans = Math.round((s.fans || p.fans) + jitter)
    }
    s.checkedAt = new Date().toISOString()
    by[p.id] = s.fans
  }
  const last = db.fans[db.fans.length - 1]
  if (!last || last.day !== today) db.fans.push({ day: today, byPlatform: by })
  else last.byPlatform = by
  db.meta.fansDay = today
  return 1
}

export async function tick({ quiet = true } = {}) {
  const actions = []
  const now = Date.now()
  updateFans()
  sampleToday(now)

  for (const ep of db.episodes) {
    const due = Date.parse(ep.schedule)
    if (!Number.isFinite(due)) continue
    if (tasksOf(ep.id).some((t) => t.state === 'planned') && due <= now + 60e3) {
      actions.push(`第 ${ep.no} 期到点，开始填写`)
      if (!quiet) console.log(`▸ 第 ${ep.no} 期到点，开始填写`)
      await runEpisode(ep, { quiet })
    }
    if (tasksOf(ep.id).some((t) => t.state === 'awaiting_user') && due <= now) {
      actions.push(`第 ${ep.no} 期到点，取链接`)
      if (!quiet) console.log(`▸ 第 ${ep.no} 期到点，取链接`)
      await syncEpisode(ep, { quiet })
    }
  }
  saveNow()
  return actions
}
