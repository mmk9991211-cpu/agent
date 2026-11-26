// 演示数据：7 期已发 + 1 期待发。数字由 metrics.mjs 的模型统一生成，界面和复盘口径一致
import { db, saveNow, reset } from './store.mjs'
import { PLATFORMS, BY_ID } from './platforms.mjs'
import { backfill, dayOf, DAY } from './metrics.mjs'
import { urlOf } from './adapters/mock.mjs'
import { setTask } from './state.mjs'

const now = Date.now()
const iso = (ts) => new Date(ts).toISOString()

const SERIES = 'AI 内容运营实战'

const EPISODES = [
  { no: 1, title: '一个人怎么同时运营 5 个店铺', days: 36, skip: ['youtube', 'threads', 'instagram'] },
  { no: 2, title: 'Excel 台账怎么变成能查的数据库', days: 29, skip: ['threads'] },
  { no: 3, title: '抖音资金账单对账的正确姿势', days: 22, skip: ['instagram'] },
  { no: 4, title: '选题不是玄学：热点打分的三个维度', days: 15, skip: [] },
  { no: 5, title: '我用 AI 写公众号的真实流程', days: 8, skip: ['threads'] },
  { no: 6, title: '从 0 搭一个自己的运营看板', days: 3, skip: [] },
]

const PLANNED = [
  {
    no: 7,
    title: '多平台分发：一期视频填七个平台的自动化',
    scheduleAt: new Date(new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Shanghai' }) + 'T19:00:00+08:00').getTime(),
    skip: [],
  },
  {
    no: 8,
    title: '给运营做个能说话的看板',
    scheduleAt: new Date(new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Shanghai' }) + 'T19:00:00+08:00').getTime() + DAY,
    skip: ['threads', 'instagram'],
  },
]

const slugOf = (no, title) => `ep${String(no).padStart(2, '0')}-${title.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]+/g, '-').slice(0, 12)}`

const pad = (n) => String(n).padStart(2, '0')

export function isSeeded() {
  return db.episodes.length > 0 && !!db.meta.seededAt
}

export function seedDemo({ force = false } = {}) {
  if (isSeeded() && !force) return false
  if (force) reset()

  for (const p of PLATFORMS) {
    db.platformState[p.id] = {
      fans: p.fans,
      loggedIn: p.id !== 'threads',
      enabled: !(db.meta.disabled || []).includes(p.id),
      checkedAt: iso(now),
    }
  }

  // 粉丝 30 天历史：每天涨一点点，周末涨得慢
  const GROWTH = { bilibili: 96, douyin: 130, xhs: 42, channels: 26, youtube: 9, x: 6, threads: 3, instagram: 4 }
  for (let i = 29; i >= 0; i--) {
    const t = now - i * DAY
    const by = {}
    for (const p of PLATFORMS) {
      const g = GROWTH[p.id] * ((i % 7 === 0 || i % 7 === 6) ? 0.55 : 1)
      by[p.id] = Math.round(p.fans - g * i)
    }
    db.fans.push({ day: dayOf(t), byPlatform: by })
  }

  const all = PLATFORMS.map((p) => p.id)
  const makeTask = (ep, id, state, detail, url) => {
    db.tasks[`${ep.id}:${id}`] = {
      episodeId: ep.id,
      platform: id,
      state,
      detail,
      url: url || null,
      updatedAt: iso(now),
      logs: [{ ts: now, msg: detail }],
    }
  }

  for (const e of EPISODES) {
    const publishedAt = now - e.days * DAY
    const ep = {
      id: `ep${pad(e.no)}`,
      no: e.no,
      series: SERIES,
      title: e.title,
      slug: slugOf(e.no, e.title),
      dir: `${SERIES}/第${pad(e.no)}期`,
      duration: 720 + e.no * 60,
      publishedAt: iso(publishedAt),
      schedule: iso(publishedAt),
      skip: e.skip,
      createdAt: iso(publishedAt - 5 * DAY),
    }
    db.episodes.push(ep)
    for (const p of PLATFORMS) {
      if (e.skip.includes(p.id)) {
        makeTask(ep, p.id, 'skipped', '这期不发')
      } else {
        makeTask(ep, p.id, 'published', '取到链接', urlOf(p.id, ep))
      }
    }
    backfill(ep, all.filter((id) => !e.skip.includes(id)))
  }

  for (const e of PLANNED) {
    const ep = {
      id: `ep${pad(e.no)}`,
      no: e.no,
      series: SERIES,
      title: e.title,
      slug: slugOf(e.no, e.title),
      dir: `${SERIES}/第${pad(e.no)}期`,
      duration: 840,
      publishedAt: null,
      schedule: iso(e.scheduleAt),
      skip: e.skip,
      createdAt: iso(now - DAY),
    }
    db.episodes.push(ep)
    for (const p of PLATFORMS) {
      if (e.skip.includes(p.id)) makeTask(ep, p.id, 'skipped', '这期不发')
      else makeTask(ep, p.id, 'planned', '等开工')
    }
  }

  db.meta.seededAt = iso(now)
  db.meta.lastSample = dayOf(now)
  db.logs = [
    { ts: iso(now - 3600e3), episodeId: null, platform: null, action: 'daemon', result: '守护进程已启动，每 20 秒一次巡检' },
    { ts: iso(now - 5400e3), episodeId: 'ep06', platform: null, action: 'sync', result: 'ep06 取链接完成，8 个平台全部到位' },
    { ts: iso(now - 7200e3), episodeId: 'ep06', platform: 'bilibili', action: 'published', result: '取到链接' },
  ]
  db.notify = [
    { ts: iso(now - 1200e3), level: 'warn', title: 'Threads 未登录', body: 'Threads 登录态失效，本期先跳过；补登录后会自动补跑' },
    { ts: iso(now - 5400e3), level: 'ok', title: '第 6 期全部到位', body: '8 个平台已发布，链接已回填发布记录' },
    { ts: iso(now - 20 * 3600e3), level: 'info', title: '每日数据已采集', body: `采集到 ${dayOf(now)} 10:00，失败平台保留上次成功数据` },
  ]

  saveNow()
  return true
}

export { SERIES, BY_ID }
