// 模拟填写引擎：把「打开上传页 → 传片 → 传封面 → 填文案 → 设定时 → 回读核对」跑一遍
// 真实接入时用 adapters/cdp.mjs 替换，接口保持一致
import { BY_ID } from '../platforms.mjs'
import { isManual } from '../config.mjs'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// 每个平台的填写步骤不一样，这里按平台类型调 wording，让日志看起来像真的
const FIELDS = {
  bilibili: ['填写标题（≤80 字）', '填写简介与章节', '填写标签'],
  douyin: ['填写标题（≤30 字）', '填写正文与话题', '选择封面'],
  xhs: ['填写标题（≤20 字）', '填写正文与话题', '选择竖版封面 3:4'],
  channels: ['填写短标题（6–16 字）', '填写描述', '声明原创'],
  youtube: ['填写标题（≤100 字）', '填写简介（含章节）', '设置缩略图 16:9'],
  x: ['填写推文（280 字符内）', '附加视频'],
  threads: ['填写帖文（≤500 字）', '选择话题'],
  instagram: ['填写配文（≤2200 字）', '确认 Reels 裁切'],
}

export function urlOf(platformId, ep) {
  const tag = String(ep.id || 'ep' + ep.no).replace(/\W/g, '').toUpperCase()
  const n = String(ep.no).padStart(2, '0')
  switch (platformId) {
    case 'bilibili':
      return `https://www.bilibili.com/video/BV1${n}MZ${tag}`
    case 'douyin':
      return `https://www.douyin.com/video/74${n}${String(ep.duration || 840).slice(0, 5)}`
    case 'xhs':
      return `https://www.xiaohongshu.com/explore/66${n}${tag.toLowerCase()}`
    case 'channels':
      return `https://channels.weixin.qq.com/platform/post/6${n}${tag.toLowerCase()}`
    case 'youtube':
      return `https://youtu.be/MZ${tag}${n}`
    case 'x':
      return `https://x.com/mz/status/19${n}${String(Date.now()).slice(-8)}`
    case 'threads':
      return `https://www.threads.com/@mz/post/9${n}${tag.toLowerCase()}`
    case 'instagram':
      return `https://www.instagram.com/reel/MZ${tag}${n}/`
    default:
      return null
  }
}

/**
 * 跑一个平台的填写。返回 { state, detail, url }
 * opts: { stepMs, onStep(msg), forceState }
 */
export async function fill(ep, platformId, opts = {}) {
  const { stepMs = 260, onStep = () => {}, dryRun = false } = opts
  const p = BY_ID[platformId]
  if (!p) throw new Error(`未知平台：${platformId}`)
  const manual = isManual(platformId)
  const fields = FIELDS[platformId] || ['填写文案']

  const steps = [
    `打开 ${p.name} 上传页`,
    `上传成片.mp4（${ep.duration || 1080}s）`,
    '上传封面',
    ...fields,
    `设置定时 ${new Date(ep.schedule).toLocaleString('zh-CN', { hour12: false, timeZone: 'Asia/Shanghai' })}`,
    '回读表单核对',
  ]

  for (const s of steps) {
    await sleep(stepMs)
    if (!dryRun) onStep(s)
  }

  if (manual) {
    return { state: 'awaiting_user', detail: '已填好，等你点发布', url: null }
  }
  await sleep(stepMs)
  if (!dryRun) onStep('核对一致，自动提交')
  return { state: 'published', detail: '自动提交成功', url: urlOf(platformId, ep) }
}

// 取链接：把「等人点」变成「已发布」
export async function collectLink(ep, platformId, opts = {}) {
  await sleep(opts.stepMs ?? 200)
  return { state: 'published', detail: '取到链接', url: urlOf(platformId, ep) }
}

export const mockDriver = { fill, collectLink, name: 'mock' }
