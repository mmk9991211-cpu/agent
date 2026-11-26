// 把当前 store 的数据导出成一份静态快照，供 GitHub Pages 这类纯静态托管使用。
// 用法：node scripts/export-static.mjs   → 产出 dist-static/
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { db } from '../src/store.mjs'
import { overview, episodeList, episodeDetail, platformPage, pollState, logsPage } from '../src/web/server.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const WEB = path.join(ROOT, 'src', 'web')
const OUT = path.join(ROOT, 'dist-static')

fs.rmSync(OUT, { recursive: true, force: true })
fs.mkdirSync(OUT, { recursive: true })

const detail = {}
for (const ep of db.episodes) {
  const d = episodeDetail(ep.id)
  if (d) detail[ep.id] = d
}

const snap = {
  generatedAt: new Date().toISOString(),
  readOnly: true,
  overview: overview(),
  episodes: episodeList(),
  platforms: platformPage(),
  logs: logsPage(),
  state: pollState(),
  detail,
}

for (const f of ['index.html', 'app.js', 'style.css']) {
  fs.copyFileSync(path.join(WEB, f), path.join(OUT, f))
}
fs.writeFileSync(path.join(OUT, 'snapshot.json'), JSON.stringify(snap))
fs.writeFileSync(path.join(OUT, '.nojekyll'), '')

const kb = (n) => (n / 1024).toFixed(0) + 'KB'
const size = fs.statSync(path.join(OUT, 'snapshot.json')).size
console.log(`静态快照已生成：dist-static/`)
console.log(`  期次 ${snap.episodes.length} 个 · 平台 ${snap.platforms.length} 个 · 日志 ${snap.logs.length} 条`)
console.log(`  snapshot.json ${kb(size)} · 快照时间 ${snap.generatedAt}`)
