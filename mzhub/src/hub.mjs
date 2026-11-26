#!/usr/bin/env node
// MZ 分发中控 · CLI 与守护进程
import { config, ROOT } from './config.mjs'
import { db, saveNow } from './store.mjs'
import { PLATFORMS, BY_ID } from './platforms.mjs'
import { tasksOf, STATE_LABEL } from './state.mjs'
import { review, series } from './metrics.mjs'
import { runEpisode, syncEpisode, sampleToday, updateFans, tick, activePlatforms } from './runner.mjs'
import { seedDemo } from './seed.mjs'

const args = process.argv.slice(2)
const cmd = args[0]
const arg = (i) => (args[i] && !args[i].startsWith('--') ? args[i] : null)
const has = (f) => args.includes(f)
const optOf = (f) => (args.includes(f) ? args[args.indexOf(f) + 1] : null)

const time = (d = new Date()) => new Date(d).toLocaleString('zh-CN', { hour12: false, timeZone: 'Asia/Shanghai' })
const epById = (id) => db.episodes.find((e) => e.id === id || String(e.no) === String(id) || e.slug === id)

function table(ep) {
  const lines = [`第 ${ep.no} 期 · ${ep.title}`, `定时 ${time(ep.schedule)}`, '']
  for (const t of tasksOf(ep.id)) {
    const p = BY_ID[t.platform]
    lines.push(`  ${p.name.padEnd(10)} ${(STATE_LABEL[t.state] || t.state).padEnd(8)} ${t.detail || ''}${t.url ? '  ' + t.url : ''}`)
  }
  return lines.join('\n')
}

function overview() {
  const fans = Object.values(db.platformState).reduce((a, p) => a + (p.fans || 0), 0)
  const last7 = series(7).reduce((a, d) => a + d.views, 0)
  console.log(`\n${config.name}  ·  ${time()}`)
  console.log(`  全平台粉丝 ${fans.toLocaleString()}   近 7 天播放 ${last7.toLocaleString()}   期数 ${db.episodes.length}\n`)
  for (const p of PLATFORMS) {
    const s = db.platformState[p.id] || {}
    console.log(
      `  ${p.name.padEnd(10)} ${String(s.fans || 0).padStart(8)}   ${s.loggedIn === false ? '未登录' : '已登录'}   ${s.enabled === false ? '已停用' : ''}`,
    )
  }
}

function reviewText(ep) {
  const r = review(ep)
  const rows = r.platforms.map(
    (p) =>
      `  ${p.name.padEnd(10)} ${String(p.views).padStart(7)}  ${(p.share * 100).toFixed(1).padStart(5)}%  ${(p.engagement * 100).toFixed(1).padStart(5)}%`,
  )
  const cmp = r.compare
    ? `  环比第 ${r.compare.with.no} 期同龄：播放 ${(r.compare.views.delta * 100).toFixed(1)}%，互动率 ${(r.compare.engagement.delta * 100).toFixed(1)}%`
    : '  没有可对比的上一期'
  return [
    `\n第 ${ep.no} 期复盘（发布 ${r.ageDays} 天）`,
    `  总播放 ${r.views.toLocaleString()}   互动率 ${(r.engagement * 100).toFixed(2)}%`,
    '',
    ...rows,
    '',
    cmp,
  ].join('\n')
}

function banner() {
  const base = `http://127.0.0.1:${config.port}/`
  console.log(`\n  ${config.name}`)
  console.log(`  大屏  ${base}?key=${encodeURIComponent(config.key)}`)
  console.log(`  目录  ${ROOT}`)
  console.log(`  巡检  每 ${config.tickSeconds} 秒一次（到点开跑 / 到点取链接 / 采样）\n`)
}

async function main() {
  switch (cmd) {
    case 'demo':
    case 'web': {
      if (seedDemo()) console.log('已生成演示数据：8 期 + 30 天播放与粉丝曲线')
      const { startWeb } = await import('./web/server.mjs')
      banner()
      startWeb()
      if (!has('--no-tick')) startLoop(cmd === 'web')
      break
    }
    case 'seed':
      console.log(seedDemo({ force: has('--force') }) ? '演示数据已重建' : '已有数据（加 --force 覆盖）')
      break
    case 'status': {
      const ep = epById(arg(1))
      if (ep) console.log(table(ep))
      else overview()
      break
    }
    case 'run': {
      const ep = epById(arg(1)) || db.episodes.filter((e) => tasksOf(e.id).some((t) => t.state === 'planned')).sort((a, b) => a.no - b.no)[0]
      await runEpisode(ep, {
        only: optOf('--only') ? optOf('--only').split(',') : null,
        force: has('--force'),
        stepMs: Number(process.env.MZ_STEP_MS || 220),
      })
      console.log('\n' + table(ep))
      break
    }
    case 'sync': {
      const ep = epById(arg(1))
      await syncEpisode(ep, {})
      console.log('\n' + table(ep))
      break
    }
    case 'metrics': {
      const n = sampleToday()
      updateFans()
      saveNow()
      console.log(`采样完成，写入 ${n} 行`)
      break
    }
    case 'review': {
      const ep = epById(arg(1)) || db.episodes.filter((e) => e.publishedAt).sort((a, b) => b.no - a.no)[0]
      console.log(reviewText(ep))
      break
    }
    case 'login': {
      const ids = arg(1) ? [arg(1)] : activePlatforms()
      for (const i of ids) {
        if (!db.platformState[i]) continue
        db.platformState[i].loggedIn = true
        db.platformState[i].checkedAt = new Date().toISOString()
      }
      saveNow()
      console.log(`已标记为已登录：${ids.map((i) => BY_ID[i]?.name || i).join('、')}`)
      break
    }
    case 'tick': {
      const a = await tick({ quiet: false })
      if (!a.length) console.log('没有到点的事要做')
      break
    }
    case 'daemon':
      console.log('守护进程启动')
      startLoop(false)
      break
    default:
      console.log(`MZ 分发中控

用法：
  node src/hub.mjs demo              生成演示数据并打开大屏（最常用）
  node src/hub.mjs web               只开大屏（有数据就复用）
  node src/hub.mjs seed [--force]    重建演示数据
  node src/hub.mjs status [期]       看总览或某一期
  node src/hub.mjs run [期] [--only a,b] [--force]   跑一期（填写各平台）
  node src/hub.mjs sync [期]         取链接
  node src/hub.mjs metrics           立即采样一次
  node src/hub.mjs review [期]       单期复盘
  node src/hub.mjs login [平台]      标记登录态（真实接入前占位）
  node src/hub.mjs tick              手动巡检一次
  node src/hub.mjs daemon            常驻巡检
`)
  }
}

function startLoop(quiet = true) {
  const loop = async () => {
    try {
      const a = await tick({ quiet })
      if (!quiet && a.length) console.log(`[${time()}] ${a.join('；')}`)
    } catch (e) {
      console.log(`巡检出错：${e.message}`)
    }
  }
  loop()
  setInterval(loop, Math.max(5, config.tickSeconds) * 1000)
}

main().catch((e) => {
  console.error('出错：' + e.message)
  process.exitCode = 1
})
