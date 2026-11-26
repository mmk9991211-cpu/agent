// 播放/互动增长模型（演示用）：cum(t) = 权重 × 期次系数 × (1 - e^(-t/τ))
// 同一期同一平台永远算出同一组数，所以截图和复盘可重复
import { db, save } from './store.mjs'
import { BY_ID, PLATFORMS } from './platforms.mjs'

export const DAY = 86400000
const TZ = 8 * 3600000

export const dayOf = (ts = Date.now()) => new Date(ts + TZ).toISOString().slice(0, 10)
export const dayStart = (day) => Date.parse(day + 'T00:00:00+08:00')

function hash01(str) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return ((h >>> 0) % 100000) / 100000
}

const epFactor = (no) => 0.72 + 0.14 * ((no * 37) % 9) / 9 + (no <= 2 ? 0.25 : 0)

function cum(ep, platformId, hours) {
  const p = BY_ID[platformId]
  if (!p || hours <= 0) return 0
  const h = Math.max(hours, 0.08) // 刚发出去也给一点首播，别让刚发布的一期显示 0
  const r = hash01(ep.id + platformId)
  const w = p.weight * epFactor(ep.no) * (0.78 + 0.5 * r)
  const tau = 12 + 16 * hash01(platformId + ep.id + 'tau')
  // 前 3 天冲得快，再拖一条长尾，避免曲线在两次发布之间掉回 0
  const fast = 0.78 * (1 - Math.exp(-h / tau))
  const slow = 0.22 * (1 - Math.exp(-h / 260))
  return Math.round(w * (fast + slow))
}

const ratio = (ep, platformId, kind, base) => {
  const r = hash01(ep.id + platformId + kind)
  return Math.max(0, base * (0.75 + 0.5 * r))
}

export function publishAt(ep) {
  return Date.parse(ep.publishedAt || ep.schedule)
}

// 某一天各平台的「当日新增」（增量，不是累计）
export function dayIncrement(ep, platformId, day, now = Date.now()) {
  const pub = publishAt(ep)
  const s = Math.max(pub, dayStart(day))
  const e = Math.min(now, dayStart(day) + DAY)
  if (e <= s) return 0
  const hEnd = (e - pub) / 3600000
  const hStart = (s - pub) / 3600000
  const views = Math.max(0, cum(ep, platformId, hEnd) - cum(ep, platformId, hStart))
  if (!views) return 0
  return {
    views,
    likes: Math.round(ratio(ep, platformId, 'l', views * 0.052)),
    comments: Math.round(ratio(ep, platformId, 'c', views * 0.0062)),
    favorites: Math.round(ratio(ep, platformId, 'f', views * 0.021)),
    shares: Math.round(ratio(ep, platformId, 's', views * 0.0041)),
  }
}

// 用历史补齐到今天（只在 seed 或首次 tick 时调用）
export function backfill(ep, platformIds) {
  const pub = publishAt(ep)
  if (!pub || pub > Date.now()) return 0
  let n = 0
  for (let t = dayStart(dayOf(pub)); t <= Date.now(); t += DAY) {
    const day = dayOf(t)
    for (const id of platformIds) {
      const row = dayIncrement(ep, id, day)
      if (!row) continue
      upsertMetric({ day, episodeId: ep.id, platform: id, ...row })
      n++
    }
  }
  return n
}

export function upsertMetric(row) {
  const i = db.metrics.findIndex((m) => m.day === row.day && m.episodeId === row.episodeId && m.platform === row.platform)
  const rec = { ...row, collectedAt: new Date().toISOString() }
  if (i >= 0) db.metrics[i] = rec
  else db.metrics.push(rec)
  save()
}

export function totalsOf(ep, platformId) {
  const rows = db.metrics.filter((m) => m.episodeId === ep.id && m.platform === platformId)
  return rows.reduce(
    (a, r) => ({
      views: a.views + (r.views || 0),
      likes: a.likes + (r.likes || 0),
      comments: a.comments + (r.comments || 0),
      favorites: a.favorites + (r.favorites || 0),
      shares: a.shares + (r.shares || 0),
    }),
    { views: 0, likes: 0, comments: 0, favorites: 0, shares: 0 },
  )
}

export const engagement = (t) => (t.views ? (t.likes + t.comments + t.favorites + t.shares) / t.views : 0)

export function episodeTotals(ep) {
  const per = {}
  let views = 0
  let inter = 0
  for (const p of PLATFORMS) {
    const t = totalsOf(ep, p.id)
    if (!t.views) continue
    per[p.id] = t
    views += t.views
    inter += t.likes + t.comments + t.favorites + t.shares
  }
  return { views, engagement: views ? inter / views : 0, per }
}

// 近 N 天全站播放（每日增量求和）
export function series(days = 30) {
  const out = []
  const today = dayStart(dayOf())
  for (let i = days - 1; i >= 0; i--) {
    const d = dayOf(today - i * DAY)
    const v = db.metrics.filter((m) => m.day === d).reduce((a, m) => a + (m.views || 0), 0)
    out.push({ day: d, views: v })
  }
  return out
}

export function fansSeries(platformId, days = 30) {
  const rows = db.fans.filter((f) => f.byPlatform && f.byPlatform[platformId] != null)
  return rows
    .slice(-days)
    .map((f) => ({ day: f.day, fans: f.byPlatform[platformId] }))
}

export function fansTotal() {
  return Object.values(db.platformState).reduce((a, p) => a + (p.fans || 0), 0)
}

// 只取「发布后前 N 天」的数据，用于同龄对比（第 N 天对第 N 天）
export function totalsWithin(ep, ageDays) {
  const base = Math.floor(dayStart(dayOf(publishAt(ep))) / DAY)
  const per = {}
  let views = 0
  let inter = 0
  for (const m of db.metrics) {
    if (m.episodeId !== ep.id) continue
    if (Math.floor(dayStart(m.day) / DAY) - base >= ageDays) continue
    const t = (per[m.platform] = per[m.platform] || { views: 0, likes: 0, comments: 0, favorites: 0, shares: 0 })
    t.views += m.views || 0
    t.likes += m.likes || 0
    t.comments += m.comments || 0
    t.favorites += m.favorites || 0
    t.shares += m.shares || 0
    views += m.views || 0
    inter += (m.likes || 0) + (m.comments || 0) + (m.favorites || 0) + (m.shares || 0)
  }
  return { views, engagement: views ? inter / views : 0, per }
}

// 单期复盘：各平台占比 + 互动率 + 与上一期同龄对比
export function review(ep) {
  const ageDays = Math.max(1, Math.floor((Date.now() - publishAt(ep)) / DAY) + 1)
  const mine = totalsWithin(ep, ageDays)
  const prev = db.episodes
    .filter((e) => e.no < ep.no && (e.publishedAt || e.schedule) && Date.now() >= publishAt(e))
    .sort((a, b) => b.no - a.no)[0]

  const platforms = Object.entries(mine.per)
    .map(([id, t]) => ({
      id,
      name: BY_ID[id]?.name || id,
      color: BY_ID[id]?.color || '#888',
      ...t,
      share: mine.views ? t.views / mine.views : 0,
      engagement: engagement(t),
    }))
    .sort((a, b) => b.views - a.views)

  let compare = null
  // 刚发出去几小时内数据还没沉降，同龄对比没有意义，先不给结论
  if (prev && Date.now() - publishAt(ep) >= 8 * 3600e3) {
    const pv = totalsWithin(prev, ageDays)
    compare = {
      with: { id: prev.id, no: prev.no, title: prev.title },
      views: { mine: mine.views, prev: pv.views, delta: pv.views ? mine.views / pv.views - 1 : 0 },
      engagement: { mine: mine.engagement, prev: pv.engagement, delta: pv.engagement ? mine.engagement / pv.engagement - 1 : 0 },
    }
  }

  return { episodeId: ep.id, ageDays, views: mine.views, engagement: mine.engagement, platforms, compare }
}
