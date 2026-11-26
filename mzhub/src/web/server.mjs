// 网页大屏：零框架，手写 HTML/CSS/JS + 一个 http 服务。所有接口都要口令
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { config, saveConfig, isDisabled } from '../config.mjs'
import { db, saveNow } from '../store.mjs'
import { PLATFORMS, BY_ID } from '../platforms.mjs'
import { tasksOf, STATE_LABEL } from '../state.mjs'
import { series, totalsOf, episodeTotals, review, dayOf, fansSeries, engagement } from '../metrics.mjs'
import { runEpisode, syncEpisode, activePlatforms } from '../runner.mjs'
import { seedDemo } from '../seed.mjs'

const DIR = path.dirname(fileURLToPath(import.meta.url))
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml' }

const json = (res, code, body) => {
  const buf = Buffer.from(JSON.stringify(body))
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'Content-Length': buf.length })
  res.end(buf)
}

const keyOk = (req, url) => {
  const k = url.searchParams.get('key') || req.headers['x-key']
  return !!config.key && k === config.key
}

const epOf = (id) => db.episodes.find((e) => e.id === id)

function progressOf(ep) {
  const ids = activePlatforms().filter((id) => !(ep.skip || []).includes(id))
  const ts = tasksOf(ep.id)
  const count = (s) => ts.filter((t) => (Array.isArray(s) ? s.includes(t.state) : t.state === s)).length
  return {
    total: ids.length,
    published: count('published'),
    waiting: count('awaiting_user'),
    running: count('running'),
    failed: count(['failed', 'not_logged_in']),
  }
}

function viewsInDays(platformId, days) {
  const cut = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10)
  return db.metrics
    .filter((m) => m.platform === platformId && m.day >= cut)
    .reduce((a, m) => a + (m.views || 0), 0)
}

function fansKpi() {
  const fans = Object.values(db.platformState).reduce((a, p) => a + (p.fans || 0), 0)
  const h = db.fans
  const prev = h[Math.max(0, h.length - 8)]
  const prevTotal = prev ? Object.values(prev.byPlatform).reduce((a, n) => a + n, 0) : fans
  return { fans, delta: fans - prevTotal }
}

export function overview() {
  const k = fansKpi()
  const s7 = series(7).reduce((a, d) => a + d.views, 0)
  const s30 = series(30)
  const eps = db.episodes
  const pending = eps
    .map((e) => ({ ep: e, p: progressOf(e) }))
    .filter((x) => x.p.published < x.p.total)
    .sort((a, b) => Date.parse(a.ep.schedule) - Date.parse(b.ep.schedule))

  return {
    name: config.name,
    now: new Date().toISOString(),
    kpi: {
      fans: k.fans,
      fansDelta: k.delta,
      views7: s7,
      views30: s30.reduce((a, d) => a + d.views, 0),
      episodes: eps.length,
      published: eps.filter((e) => e.publishedAt).length,
      waiting: pending.reduce((a, x) => a + x.p.waiting, 0),
    },
    trend: s30,
    platforms: PLATFORMS.map((p) => {
      const st = db.platformState[p.id] || {}
      const hist = fansSeries(p.id, 30)
      const h7 = hist[Math.max(0, hist.length - 8)]
      return {
        id: p.id,
        name: p.name,
        color: p.color,
        fans: st.fans || 0,
        delta: h7 ? (st.fans || 0) - h7.fans : 0,
        loggedIn: st.loggedIn !== false,
        enabled: st.enabled !== false && !isDisabled(p.id),
        manual: (config.manual || []).includes(p.id),
        views7: viewsInDays(p.id, 7),
        spark: hist.slice(-14).map((x) => x.fans),
      }
    }),
    queue: pending.slice(0, 6).map(({ ep, p }) => ({
      id: ep.id,
      no: ep.no,
      title: ep.title,
      schedule: ep.schedule,
      progress: p,
    })),
    notify: db.notify.slice(0, 6),
  }
}

export function episodeList() {
  return db.episodes
    .slice()
    .sort((a, b) => b.no - a.no)
    .map((ep) => {
      const t = episodeTotals(ep)
      const p = progressOf(ep)
      return {
        id: ep.id,
        no: ep.no,
        title: ep.title,
        series: ep.series,
        schedule: ep.schedule,
        publishedAt: ep.publishedAt,
        progress: p,
        views: t.views,
        engagement: t.engagement,
        status: p.published >= p.total ? 'done' : p.running ? 'running' : p.waiting ? 'waiting' : 'planned',
      }
    })
}

export function episodeDetail(id) {
  const ep = epOf(id)
  if (!ep) return null
  const r = review(ep)
  const tasks = tasksOf(ep.id)
    .map((t) => {
      const p = BY_ID[t.platform] || { name: t.platform, color: '#888' }
      const tot = totalsOf(ep, t.platform)
      return {
        platform: t.platform,
        name: p.name,
        color: p.color,
        state: t.state,
        stateLabel: STATE_LABEL[t.state] || t.state,
        detail: t.detail,
        url: t.url,
        updatedAt: t.updatedAt,
        logs: (t.logs || []).slice(-8),
        ...tot,
        engagement: engagement(tot),
      }
    })
    .sort((a, b) => b.views - a.views)

  return {
    episode: {
      id: ep.id,
      no: ep.no,
      title: ep.title,
      series: ep.series,
      dir: ep.dir,
      schedule: ep.schedule,
      publishedAt: ep.publishedAt,
      duration: ep.duration,
      skip: ep.skip || [],
    },
    progress: progressOf(ep),
    tasks,
    review: r,
  }
}

export function platformPage() {
  return PLATFORMS.map((p) => {
    const st = db.platformState[p.id] || {}
    return {
      id: p.id,
      name: p.name,
      color: p.color,
      login: p.login,
      fans: st.fans || 0,
      loggedIn: st.loggedIn !== false,
      enabled: st.enabled !== false && !isDisabled(p.id),
      checkedAt: st.checkedAt || null,
      manual: (config.manual || []).includes(p.id),
      views7: viewsInDays(p.id, 7),
      series: fansSeries(p.id, 14),
    }
  })
}

export function logsPage() {
  return db.logs.slice(0, 80).map((l) => ({
    ...l,
    name: l.platform ? BY_ID[l.platform]?.name || l.platform : l.episodeId ? String(l.episodeId).toUpperCase() : '系统',
  }))
}

export function pollState() {
  const tasks = {}
  for (const t of Object.values(db.tasks)) {
    tasks[t.episodeId] = tasks[t.episodeId] || {}
    tasks[t.episodeId][t.platform] = t.state
  }
  return {
    tasks,
    notify: db.notify.slice(0, 3),
    kpi: { waiting: db.notify.filter((n) => n.level === 'warn').length },
    logs: db.logs.slice(0, 12),
    now: new Date().toISOString(),
  }
}

async function body(req) {
  let raw = ''
  for await (const chunk of req) raw += chunk
  try {
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

async function serveStatic(req, res, pathname) {
  const file = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '')
  const abs = path.join(DIR, file)
  if (!abs.startsWith(DIR) || !fs.existsSync(abs) || fs.statSync(abs).isDirectory()) return false
  const buf = fs.readFileSync(abs)
  res.writeHead(200, {
    'Content-Type': MIME[path.extname(abs)] || 'application/octet-stream',
    'Content-Length': buf.length,
    'Cache-Control': 'no-cache',
  })
  res.end(buf)
  return true
}

export function startWeb() {
  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`)
    const p = url.pathname

    if (!p.startsWith('/api/')) {
      if (await serveStatic(req, res, p)) return
      res.writeHead(404).end('not found')
      return
    }

    if (!keyOk(req, url)) return json(res, 401, { error: '口令不对' })

    try {
      if (req.method === 'GET') {
        if (p === '/api/overview') return json(res, 200, overview())
        if (p === '/api/episodes') return json(res, 200, episodeList())
        if (p === '/api/episode') {
          const d = episodeDetail(url.searchParams.get('id'))
          return d ? json(res, 200, d) : json(res, 404, { error: '没有这一期' })
        }
        if (p === '/api/platforms') return json(res, 200, platformPage())
        if (p === '/api/logs') return json(res, 200, logsPage())
        if (p === '/api/state') return json(res, 200, pollState())
        return json(res, 404, { error: '没有这个接口' })
      }

      if (req.method === 'POST') {
        const b = await body(req)
        if (p === '/api/run') {
          const ep = epOf(b.id)
          if (!ep) return json(res, 404, { error: '没有这一期' })
          runEpisode(ep, { force: !!b.force, stepMs: 220 }).catch((e) => console.log('run 出错：' + e.message))
          return json(res, 200, { started: true })
        }
        if (p === '/api/sync') {
          const ep = epOf(b.id)
          if (!ep) return json(res, 404, { error: '没有这一期' })
          const r = await syncEpisode(ep, {})
          return json(res, 200, r)
        }
        if (p === '/api/platform') {
          const st = db.platformState[b.id]
          if (!st) return json(res, 404, { error: '没有这个平台' })
          if (typeof b.enabled === 'boolean') st.enabled = b.enabled
          if (typeof b.loggedIn === 'boolean') st.loggedIn = b.loggedIn
          st.checkedAt = new Date().toISOString()
          saveNow()
          return json(res, 200, st)
        }
        if (p === '/api/settings') {
          const patch = {}
          if (typeof b.key === 'string' && b.key.trim()) patch.key = b.key.trim()
          if (typeof b.webhook === 'string') patch.webhook = b.webhook.trim()
          if (Number(b.tickSeconds) >= 5) patch.tickSeconds = Number(b.tickSeconds)
          saveConfig(patch)
          return json(res, 200, { ok: true, key: config.key })
        }
        if (p === '/api/reset') {
          seedDemo({ force: true })
          return json(res, 200, { ok: true })
        }
        return json(res, 404, { error: '没有这个接口' })
      }
      json(res, 405, { error: '方法不支持' })
    } catch (e) {
      console.log('接口出错：' + e.message)
      json(res, 500, { error: e.message })
    }
  })

  server.listen(config.port, '127.0.0.1', () => {
    console.log(`  大屏已启动：http://127.0.0.1:${config.port}/?key=${encodeURIComponent(config.key)}`)
  })
  return server
}
