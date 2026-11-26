// 状态机与防重是这个项目的命门：跑重了就是重复上传，所以这里覆盖得细一点
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mzhub-test-'))
process.env.MZ_DATA = dir
process.env.MZ_CONFIG = path.join(dir, 'config.json') // 不存在 → 用默认配置
process.env.MZ_DRIVER = 'mock'

const { db } = await import('../src/store.mjs')
const { setTask, getTask, isLocked, tasksOf, LOCKED } = await import('../src/state.mjs')
const { seedDemo } = await import('../src/seed.mjs')
const { runEpisode, syncEpisode, sampleToday } = await import('../src/runner.mjs')
const { dayIncrement, episodeTotals, review, series, totalsWithin } = await import('../src/metrics.mjs')

seedDemo({ force: true })
const ep7 = () => db.episodes.find((e) => e.no === 7)
const ep6 = () => db.episodes.find((e) => e.no === 6)

test('演示数据齐了：8 期，前 6 期已发', () => {
  assert.equal(db.episodes.length, 8)
  assert.equal(db.episodes.filter((e) => e.publishedAt).length, 6)
  assert.ok(db.metrics.length > 0, '应该有采集数据')
  assert.equal(db.fans.length > 0, true)
})

test('LOCKED 覆盖了所有「已到位」状态', () => {
  for (const s of ['filled', 'awaiting_user', 'scheduled', 'published']) assert.ok(LOCKED.has(s), s)
  for (const s of ['planned', 'running', 'failed', 'not_logged_in']) assert.ok(!LOCKED.has(s), s)
})

test('跑一期：自动平台发布、国内四家停在待你点、未登录平台被跳过', async () => {
  const ep = ep7()
  const r = await runEpisode(ep, { stepMs: 0, quiet: true })

  assert.equal(r.done, 3, 'YouTube / X / Instagram 应自动发布')
  assert.equal(getTask(ep.id, 'bilibili').state, 'awaiting_user')
  assert.equal(getTask(ep.id, 'douyin').state, 'awaiting_user')
  assert.equal(getTask(ep.id, 'channels').state, 'awaiting_user')
  assert.equal(getTask(ep.id, 'threads').state, 'not_logged_in')
  assert.ok(getTask(ep.id, 'youtube').url, '自动发布的平台应该拿到链接')
  assert.equal(getTask(ep.id, 'bilibili').url, null, '等你自己点的平台不该有链接')
  assert.ok(r.offline.includes('threads'))
})

test('防重：再跑一次不会重跑已到位的平台', async () => {
  const ep = ep7()
  const before = tasksOf(ep.id).filter((t) => t.state === 'published').length
  const r = await runEpisode(ep, { stepMs: 0, quiet: true })
  const after = tasksOf(ep.id).filter((t) => t.state === 'published').length

  assert.equal(after, before, '已发布数量不能变')
  assert.equal(r.ran, 1, '只剩未登录的 Threads 还会被尝试')
})

test('force 才会重跑已到位的平台', async () => {
  const ep = ep7()
  const r = await runEpisode(ep, { stepMs: 0, quiet: true, force: true })
  assert.ok(r.ran >= 6, `force 后应重跑大部分平台，实际 ${r.ran}`)
})

test('取链接：待你点 → 已发布，并回填链接', async () => {
  const ep = ep7()
  const r = await syncEpisode(ep, { quiet: true })
  assert.ok(r.synced >= 3)
  const t = getTask(ep.id, 'bilibili')
  assert.equal(t.state, 'published')
  assert.match(t.url, /bilibili\.com/)
})

test('已发布的平台不再出现在待取链接里', async () => {
  const ep = ep7()
  const again = await syncEpisode(ep, { quiet: true })
  assert.equal(again.synced, 0)
})

test('跳过（skip）的平台永远是 skipped', () => {
  const ep = db.episodes.find((e) => e.no === 8)
  assert.ok(ep.skip.includes('threads'))
  assert.equal(getTask(ep.id, 'threads').state, 'skipped')
  assert.equal(getTask(ep.id, 'bilibili').state, 'planned')
})

test('数据模型可重复：同一天同一平台算两次结果一样', () => {
  const ep = ep6()
  const a = dayIncrement(ep, 'bilibili', db.metrics[0].day)
  const b = dayIncrement(ep, 'bilibili', db.metrics[0].day)
  assert.deepEqual(a, b)
})

test('采样幂等：同一天重复采样不会把当天数据翻倍', () => {
  const ep = ep6()
  const day = db.metrics.filter((m) => m.episodeId === ep.id).at(-1).day
  const pick = () => db.metrics.filter((m) => m.episodeId === ep.id && m.day === day && m.platform === 'bilibili')[0]
  const before = pick().views
  sampleToday()
  sampleToday()
  assert.equal(pick().views, before)
})

test('复盘：各平台占比加起来是 1，且总量等于平台之和', () => {
  const r = review(ep6())
  const sum = r.platforms.reduce((a, p) => a + p.share, 0)
  assert.ok(Math.abs(sum - 1) < 0.001, `占比合计 ${sum}`)
  const total = r.platforms.reduce((a, p) => a + p.views, 0)
  assert.equal(total, r.views)
})

test('复盘：同龄对比只取发布后同样天数', () => {
  const ep = ep6()
  const r = review(ep)
  if (r.compare) {
    assert.ok(r.compare.views.prev <= totalsWithin(ep6(), 30).views + 1)
    assert.equal(typeof r.compare.views.delta, 'number')
  }
})

test('近 30 天序列长度固定、无负数', () => {
  const s = series(30)
  assert.equal(s.length, 30)
  assert.ok(s.every((d) => d.views >= 0))
})

test('状态流转会写日志，日志里能追到平台和期次', () => {
  const ep = ep7()
  setTask(ep.id, 'x', 'failed', '测试用失败')
  assert.equal(getTask(ep.id, 'x').state, 'failed')
  assert.ok(db.logs.some((l) => l.episodeId === ep.id && l.platform === 'x'))
})
