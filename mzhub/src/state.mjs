// 平台任务状态机。LOCKED 里的状态一律不再重跑 —— 这是防重上传的唯一依据
import { db, save } from './store.mjs'

export const STATES = ['planned', 'running', 'filled', 'awaiting_user', 'scheduled', 'published', 'failed', 'not_logged_in', 'stopped', 'skipped']

export const LOCKED = new Set(['filled', 'awaiting_user', 'scheduled', 'published'])

export const STATE_LABEL = {
  planned: '计划中',
  running: '填写中',
  filled: '已填写',
  awaiting_user: '待你发布',
  scheduled: '已定时',
  published: '已发布',
  failed: '异常',
  not_logged_in: '未登录',
  stopped: '已停止',
  skipped: '跳过',
}

export const key = (episodeId, platform) => `${episodeId}:${platform}`

export function getTask(episodeId, platform) {
  return db.tasks[key(episodeId, platform)] || null
}

export function setTask(episodeId, platform, state, detail = '', url) {
  const k = key(episodeId, platform)
  const prev = db.tasks[k] || { logs: [] }
  const t = {
    ...prev,
    episodeId,
    platform,
    state,
    detail,
    url: url || prev.url || null,
    updatedAt: new Date().toISOString(),
  }
  if (detail && prev.detail !== detail) t.logs = [...(prev.logs || []), { ts: Date.now(), msg: detail }].slice(-30)
  db.tasks[k] = t
  log(episodeId, platform, state, detail)
  save()
  return t
}

export function isLocked(episodeId, platform) {
  const t = getTask(episodeId, platform)
  return !!(t && LOCKED.has(t.state))
}

export function tasksOf(episodeId) {
  return Object.values(db.tasks).filter((t) => t.episodeId === episodeId)
}

export function log(episodeId, platform, action, result) {
  db.logs.unshift({
    ts: new Date().toISOString(),
    episodeId: episodeId || null,
    platform: platform || null,
    action,
    result: result || '',
  })
  if (db.logs.length > 400) db.logs.length = 400
}

// 一期的平台进度：已发布 / 总数（不含停用与跳过）
export function progressOf(episodeId, platformIds) {
  const ts = tasksOf(episodeId)
  const done = ts.filter((t) => t.state === 'published').length
  return { done, total: platformIds.length }
}
