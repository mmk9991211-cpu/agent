// MZ 分发中控 · 前端（零框架，ES 模块）
const $ = (s, el = document) => el.querySelector(s)
const view = $('#view')

let KEY = localStorage.getItem('mz.key') || new URLSearchParams(location.search).get('key') || ''
if (KEY) localStorage.setItem('mz.key', KEY)

const SHORT = {
  planned: '计划中', running: '填写中', filled: '已填', awaiting_user: '待你点',
  scheduled: '已定时', published: '已发布', failed: '异常', not_logged_in: '未登录',
  stopped: '停止', skipped: '跳过',
}

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))
const num = (n) => {
  const v = Number(n) || 0
  return v >= 10000 ? (v / 10000).toFixed(1).replace(/\.0$/, '') + '万' : v.toLocaleString('zh-CN')
}
const pct = (x, d = 1) => ((Number(x) || 0) * 100).toFixed(d) + '%'
const when = (iso) => {
  if (!iso) return '未定'
  const d = new Date(iso)
  return d.toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })
}
const dayLabel = (day) => day.slice(5).replace('-', '/')

// ---------- 网络 ----------
// 静态托管（GitHub Pages 这类没有后端的环境）时，自动回落到 snapshot.json 只读快照。
let SNAP = null
let snapTried = false

async function loadSnapshot() {
  if (SNAP || snapTried) return !!SNAP
  snapTried = true
  try {
    const r = await fetch('./snapshot.json', { cache: 'no-store' })
    if (!r.ok || !(r.headers.get('content-type') || '').includes('json')) return false
    SNAP = await r.json()
    document.body.classList.add('snap-mode')
    const b = $('#roBanner')
    if (b) b.hidden = false
    return true
  } catch {
    return false
  }
}

function fromSnapshot(path) {
  const [p, qs] = path.split('?')
  const q = new URLSearchParams(qs || '')
  if (p === '/api/overview') return SNAP.overview
  if (p === '/api/episodes') return SNAP.episodes
  if (p === '/api/platforms') return SNAP.platforms
  if (p === '/api/logs') return SNAP.logs
  if (p === '/api/state') return SNAP.state
  if (p === '/api/episode') {
    const d = SNAP.detail[q.get('id')]
    if (!d) throw new Error('这一期不在快照里')
    return d
  }
  throw new Error('快照里没有这个接口')
}

async function api(path, method = 'GET', body) {
  if (SNAP) {
    if (method !== 'GET') {
      toast('这是演示快照，只读；本地 `node src/hub.mjs demo` 才能操作')
      throw new Error('只读快照')
    }
    return fromSnapshot(path)
  }

  let res
  try {
    res = await fetch(path, {
      method,
      headers: { 'x-key': KEY, 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch (e) {
    if (await loadSnapshot()) return fromSnapshot(path)
    throw e
  }

  if (res.status === 401) {
    showGate(true)
    throw new Error('口令不对')
  }

  const ct = res.headers.get('content-type') || ''
  if (!ct.includes('json')) {
    // 静态托管对 /api/* 会返回 404 的 HTML
    if (await loadSnapshot()) return fromSnapshot(path)
    throw new Error('返回的不是 JSON')
  }

  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || '请求失败')
  return data
}

function toast(msg) {
  const el = $('#toast')
  el.textContent = msg
  el.hidden = false
  clearTimeout(el._t)
  el._t = setTimeout(() => (el.hidden = true), 2400)
}

// ---------- 图标 ----------
const ICONS = {
  grid: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
  calendar: 'M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM4 9h16M9 3v4M15 3v4',
  layers: 'M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5M3 17l9 5 9-5',
  plug: 'M9 3v6M15 3v6M6 9h12v3a6 6 0 0 1-12 0zM12 18v3',
  list: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
  gear: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 7 19.4a1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0-1.2-2.9H1a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 2.6 7a1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 2.9-1.2V1a2 2 0 1 1 4 0v.1A1.7 1.7 0 0 0 15 2.6a1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0 1.2 2.9H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1.2z',
}
const icon = (name) => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${ICONS[name]}" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`

// ---------- 路由 ----------
const NAV = [
  { key: 'overview', label: '概览', icon: 'grid' },
  { key: 'plan', label: '分发计划', icon: 'calendar' },
  { key: 'episodes', label: '期次', icon: 'layers' },
  { key: 'platforms', label: '平台', icon: 'plug' },
  { key: 'logs', label: '运行日志', icon: 'list' },
  { key: 'settings', label: '设置', icon: 'gear' },
]
const TITLES = {
  overview: ['概览', '今天的数据，一屏看完'],
  plan: ['分发计划', '到点自动填，国内平台等你点'],
  episodes: ['期次', '每一期在各平台的表现'],
  episode: ['单期复盘', '各平台明细与同龄对比'],
  platforms: ['平台', '登录态、粉丝与近 7 天播放'],
  logs: ['运行日志', '谁在什么时候做了什么'],
  settings: ['设置', '口令、巡检节奏与通知'],
}

function route() {
  const h = location.hash.replace(/^#\/?/, '') || 'overview'
  const [name, id] = h.split('/')
  return { name: name || 'overview', id }
}

function paintNav(name) {
  const active = name === 'episode' ? 'episodes' : name
  $('#nav').innerHTML = NAV.map(
    (n) => `<a href="#/${n.key}" class="${n.key === active ? 'on' : ''}">${icon(n.icon)}<span>${n.label}</span></a>`,
  ).join('')
  const [t, s] = TITLES[name] || TITLES.overview
  $('#pageTitle').textContent = t
  $('#pageSub').textContent = s
}

// ---------- 图表 ----------
function trendSvg(trend) {
  const W = 720, H = 176, pad = { l: 36, r: 10, t: 16, b: 20 }
  const vals = trend.map((d) => d.views)
  const max = Math.max(1, ...vals)
  const iw = W - pad.l - pad.r
  const ih = H - pad.t - pad.b
  const x = (i) => pad.l + (trend.length <= 1 ? 0 : (i * iw) / (trend.length - 1))
  const y = (v) => pad.t + ih * (1 - v / max)
  const line = vals.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join('')
  const area = `${line}L${x(vals.length - 1).toFixed(1)} ${pad.t + ih}L${pad.l} ${pad.t + ih}Z`
  const peak = vals.indexOf(max)
  const grid = [0, 0.5, 1]
    .map((f) => {
      const yy = pad.t + ih * f
      return `<line class="grid-line" x1="${pad.l}" y1="${yy}" x2="${W - pad.r}" y2="${yy}"/>` +
        `<text x="0" y="${yy + 3}">${num(Math.round(max * (1 - f)))}</text>`
    })
    .join('')
  const ticks = [0, Math.floor(trend.length / 2), trend.length - 1]
    .map((i) => `<text x="${x(i)}" y="${H - 4}" text-anchor="middle">${dayLabel(trend[i].day)}</text>`)
    .join('')
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">
    <defs><linearGradient id="gArea" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#d8a24a" stop-opacity=".26"/>
      <stop offset="100%" stop-color="#d8a24a" stop-opacity="0"/>
    </linearGradient></defs>
    ${grid}<path class="area" d="${area}"/><path class="line" d="${line}"/>
    <circle class="dot" cx="${x(peak)}" cy="${y(max)}" r="3"/>
    <text class="peak-label" x="${Math.min(x(peak) + 6, W - 90)}" y="${y(max) - 7}">峰值 ${num(max)}</text>
    ${ticks}
  </svg>`
}

function spark(points, color) {
  if (!points || points.length < 2) return ''
  const max = Math.max(...points), min = Math.min(...points)
  const span = max - min || 1
  const pts = points
    .map((v, i) => `${(i * 100) / (points.length - 1)},${18 - ((v - min) / span) * 16}`)
    .join(' ')
  return `<svg class="spark" viewBox="0 0 100 20" preserveAspectRatio="none"><polyline points="${pts}" fill="none" stroke="${color}" stroke-width="1.3" stroke-linejoin="round" stroke-linecap="round" opacity=".9"/></svg>`
}

// ---------- 视图：概览 ----------
function renderOverview(d) {
  const k = d.kpi
  const head = `
    <div class="kpi-row">
      <div class="kpi"><div class="label">全平台粉丝</div><div class="value">${num(k.fans)}</div>
        <div class="foot"><span class="${k.fansDelta >= 0 ? 'up' : 'down'}">${k.fansDelta >= 0 ? '+' : ''}${k.fansDelta}</span> 近 7 天</div></div>
      <div class="kpi"><div class="label">近 7 天播放</div><div class="value">${num(k.views7)}</div>
        <div class="foot">近 30 天 ${num(k.views30)}</div></div>
      <div class="kpi"><div class="label">待你点发布</div><div class="value">${k.waiting}</div>
        <div class="foot">${k.waiting ? '国内四家填好就停' : '当前没有等你点的'}</div></div>
      <div class="kpi"><div class="label">已发布期数</div><div class="value">${k.published}<span style="font-size:13px;color:var(--text-3)"> / ${k.episodes}</span></div>
        <div class="foot">数据每日自动采集</div></div>
    </div>`

  const trend = `
    <div class="card">
      <div class="card-head"><h2>近 30 天播放</h2><span class="hint">全平台合计 · 每日增量</span></div>
      <div class="chart-wrap">${trendSvg(d.trend)}</div>
    </div>`

  const plats = `
    <div class="card">
      <div class="card-head"><h2>平台</h2><span class="hint">${d.platforms.filter((p) => p.loggedIn).length} / ${d.platforms.length} 已登录</span></div>
      <div class="plat-grid">
        ${d.platforms
          .map(
            (p) => `<div class="plat ${p.enabled ? '' : 'off'}">
          <div class="top"><i class="sq" style="background:${p.color}"></i><span class="name">${esc(p.name)}</span>
            <span class="tag">${p.manual ? '人点' : '自动'}</span></div>
          <div class="fans">${num(p.fans)}</div>
          <div class="meta"><span class="${p.delta >= 0 ? 'up' : 'down'}">${p.delta >= 0 ? '+' : ''}${p.delta}</span><span>7 天 ${num(p.views7)} 播放</span>${
            p.loggedIn ? '' : '<span style="color:var(--rose)">未登录</span>'
          }</div>
          ${spark(p.spark, p.color)}
        </div>`,
          )
          .join('')}
      </div>
    </div>`

  const queue = `
    <div class="card">
      <div class="card-head"><h2>待处理</h2><span class="hint">按定时排序</span></div>
      <div class="row-list">
        ${
          d.queue.length
            ? d.queue
                .map(
                  (q) => `<div class="row-item" data-goto="#/episode/${q.id}" style="cursor:pointer">
            <span class="no">${String(q.no).padStart(2, '0')}</span>
            <span class="title">${esc(q.title)}</span>
            <span class="mini-bar"><i style="width:${(q.progress.published / Math.max(1, q.progress.total)) * 100}%"></i></span>
            <span class="when">${q.progress.waiting ? `${q.progress.waiting} 待点` : when(q.schedule)}</span>
          </div>`,
                )
                .join('')
            : '<div class="row-item muted">这一批都发完了</div>'
        }
      </div>
    </div>`

  const feed = `
    <div class="card">
      <div class="card-head"><h2>通知</h2><span class="hint">飞书同步</span></div>
      <div class="feed">
        ${d.notify
          .map(
            (n) => `<div class="feed-item ${n.level}"><span class="bar"></span><div>
          <div class="t">${esc(n.title)}</div><div class="b">${esc(n.body)}</div>
          <div class="ts">${new Date(n.ts).toLocaleString('zh-CN', { hour12: false, month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
        </div></div>`,
          )
          .join('') || '<div class="muted" style="font-size:12px">暂时没有通知</div>'}
      </div>
    </div>`

  view.innerHTML = head + `<div class="grid-2"><div class="view">${trend}${plats}</div><div class="view">${queue}${feed}</div></div>`
  view.querySelectorAll('[data-goto]').forEach((el) => (el.onclick = () => (location.hash = el.dataset.goto)))
}

// ---------- 视图：分发计划 ----------
function epCard(e, active) {
  const chips = Object.entries(e.tasks || {})
    .map(
      ([pf, st]) =>
        `<span class="chip ${st}"><i class="sq" style="background:${e.colors?.[pf] || 'currentColor'}"></i>${esc(e.names?.[pf] || pf)} · ${SHORT[st] || st}</span>`,
    )
    .join('')
  const p = e.progress
  return `<div class="ep-card ${active ? 'active' : ''}">
    <div class="ep-head">
      <span class="no">EP${String(e.no).padStart(2, '0')}</span>
      <h3>${esc(e.title)}</h3>
      <span class="when">${when(e.schedule)}</span>
    </div>
    <div class="chips">${chips}</div>
    <div class="ep-foot">
      <span class="meta">${p.published}/${p.total} 已发布${p.waiting ? ` · ${p.waiting} 等你点` : ''}${p.failed ? ` · ${p.failed} 异常` : ''}</span>
      <div class="btn-row">
        <button class="btn ghost" data-detail="${e.id}">详情</button>
        ${p.waiting ? `<button class="btn" data-sync="${e.id}">取链接</button>` : ''}
        <button class="btn primary" data-run="${e.id}">${p.published ? '补跑' : '开始填写'}</button>
      </div>
    </div>
  </div>`
}

function renderPlan(list, detailMap) {
  const pending = list.filter((e) => e.progress.published < e.progress.total)
  const done = list.filter((e) => e.progress.published >= e.progress.total)
  const doneTable = done.length
    ? `<div class="card">
        <div class="card-head"><h2>已完成</h2><span class="hint">${done.length} 期 · 全部到位</span></div>
        <table class="tbl">
          <thead><tr><th style="width:44px">期</th><th>标题</th><th>定时</th><th class="num">播放</th><th>进度</th><th class="num"></th></tr></thead>
          <tbody>${done
            .map(
              (e) => `<tr>
              <td><span style="font-family:var(--mono);color:var(--gold)">${String(e.no).padStart(2, '0')}</span></td>
              <td>${esc(e.title)}</td>
              <td class="muted">${when(e.schedule)}</td>
              <td class="num">${e.views ? num(e.views) : '–'}</td>
              <td><span class="chip published">${e.progress.published}/${e.progress.total}</span></td>
              <td class="num"><button class="btn ghost" data-detail="${e.id}">详情</button></td>
            </tr>`,
            )
            .join('')}</tbody>
        </table>
      </div>`
    : ''

  view.innerHTML = `
    <div class="view">
      ${
        pending.length
          ? pending.map((e) => epCard({ ...e, ...detailMap[e.id] }, e.progress.running > 0)).join('')
          : '<div class="card muted">没有待发的期次</div>'
      }
    </div>
    ${doneTable}`
  bindActions()
}

async function buildPlan() {
  const list = await api('/api/episodes')
  const detailMap = {}
  await Promise.all(
    list.map(async (e) => {
      const d = await api(`/api/episode?id=${encodeURIComponent(e.id)}`)
      detailMap[e.id] = {
        tasks: Object.fromEntries(d.tasks.map((t) => [t.platform, t.state])),
        names: Object.fromEntries(d.tasks.map((t) => [t.platform, t.name])),
        colors: Object.fromEntries(d.tasks.map((t) => [t.platform, t.color])),
      }
    }),
  )
  renderPlan(list, detailMap)
}

// ---------- 视图：期次列表 ----------
async function renderEpisodes() {
  const list = await api('/api/episodes')
  view.innerHTML = `<div class="card"><table class="tbl">
    <thead><tr><th>期</th><th>标题</th><th>定时</th><th class="num">播放</th><th class="num">互动率</th><th>进度</th><th></th></tr></thead>
    <tbody>${list
      .map(
        (e) => `<tr>
        <td><span style="font-family:var(--mono);color:var(--gold)">${String(e.no).padStart(2, '0')}</span></td>
        <td>${esc(e.title)}</td>
        <td class="muted">${when(e.schedule)}</td>
        <td class="num">${e.views ? num(e.views) : '–'}</td>
        <td class="num">${e.views ? pct(e.engagement, 2) : '–'}</td>
        <td><span class="chip ${e.status === 'done' ? 'published' : e.status === 'waiting' ? 'awaiting_user' : e.status === 'running' ? 'running' : 'planned'}">${e.progress.published}/${e.progress.total}${e.progress.waiting ? ` · ${e.progress.waiting} 待点` : ''}</span></td>
        <td><button class="btn ghost" data-detail="${e.id}">查看</button></td>
      </tr>`,
      )
      .join('')}</tbody></table></div>`
  view.querySelectorAll('[data-detail]').forEach((b) => (b.onclick = () => (location.hash = `#/episode/${b.dataset.detail}`)))
}

// ---------- 视图：单期 ----------
async function renderEpisode(id) {
  const d = await api(`/api/episode?id=${encodeURIComponent(id)}`)
  const e = d.episode
  const p = d.progress
  const r = d.review

  const head = `<div class="card">
    <div class="ep-head">
      <span class="no">EP${String(e.no).padStart(2, '0')}</span>
      <h3>${esc(e.title)}</h3>
      <span class="when">${when(e.schedule)}</span>
    </div>
    <div class="chips">
      <span class="chip published">${p.published}/${p.total} 已发布</span>
      ${p.waiting ? `<span class="chip awaiting_user">${p.waiting} 等你点发布</span>` : ''}
      ${p.failed ? `<span class="chip failed">${p.failed} 异常</span>` : ''}
      <span class="chip">${esc(e.series)}</span>
      <span class="chip">${Math.round(e.duration / 60)} 分钟</span>
    </div>
    <div class="ep-foot">
      <span class="meta">${esc(e.dir || '')}</span>
      <div class="btn-row">
        <button class="btn ghost" data-back>返回</button>
        ${p.waiting ? `<button class="btn" data-sync="${e.id}">取链接</button>` : ''}
        <button class="btn primary" data-run="${e.id}">${p.published ? '强制补跑' : '开始填写'}</button>
      </div>
    </div>
  </div>`

  const table = `<div class="card">
    <div class="card-head"><h2>各平台</h2><span class="hint">按播放排序</span></div>
    <table class="tbl">
      <thead><tr><th>平台</th><th>状态</th><th class="num">播放</th><th class="num">点赞</th><th class="num">评论</th><th class="num">互动率</th><th>链接</th></tr></thead>
      <tbody>${d.tasks
        .map(
          (t) => `<tr>
        <td><span class="pf"><i class="sq" style="background:${t.color}"></i>${esc(t.name)}</span></td>
        <td><span class="chip ${t.state}">${t.stateLabel}</span></td>
        <td class="num">${t.views ? num(t.views) : '–'}</td>
        <td class="num">${t.likes ? num(t.likes) : '–'}</td>
        <td class="num">${t.comments ? num(t.comments) : '–'}</td>
        <td class="num">${t.views ? pct(t.engagement, 2) : '–'}</td>
        <td>${t.url ? `<a href="${esc(t.url)}" target="_blank" rel="noreferrer">打开</a>` : '<span class="muted">–</span>'}</td>
      </tr>`,
        )
        .join('')}</tbody>
    </table>
  </div>`

  const shares = `<div class="card">
    <div class="card-head"><h2>平台占比</h2><span class="hint">发布 ${r.ageDays} 天</span></div>
    <div class="view">
      ${r.platforms
        .map(
          (x) => `<div>
        <div style="display:flex;justify-content:space-between;font-size:12px">
          <span><i class="sq" style="background:${x.color};display:inline-block;margin-right:6px"></i>${esc(x.name)}</span>
          <span class="muted">${num(x.views)} · ${pct(x.share)}</span>
        </div>
        <div class="share-bar"><i style="width:${x.share * 100}%;background:${x.color}"></i></div>
      </div>`,
        )
        .join('') || '<div class="muted">还没有数据</div>'}
    </div>
  </div>`

  const cmp = r.compare
    ? `<div class="card"><div class="card-head"><h2>同龄对比</h2><span class="hint">对比第 ${r.compare.with.no} 期</span></div>
      <div class="cmp">
        <div class="cmp-box"><div class="k">播放</div><div class="v">${num(r.compare.views.mine)}</div>
          <div class="d ${r.compare.views.delta >= 0 ? 'up' : 'down'}">${r.compare.views.delta >= 0 ? '↑' : '↓'} ${pct(Math.abs(r.compare.views.delta))} · 上期 ${num(r.compare.views.prev)}</div></div>
        <div class="cmp-box"><div class="k">互动率</div><div class="v">${pct(r.compare.engagement.mine, 2)}</div>
          <div class="d ${r.compare.engagement.delta >= 0 ? 'up' : 'down'}">${r.compare.engagement.delta >= 0 ? '↑' : '↓'} ${pct(Math.abs(r.compare.engagement.delta))} · 上期 ${pct(r.compare.engagement.prev, 2)}</div></div>
      </div></div>`
    : ''

  view.innerHTML = head + `<div class="grid-2"><div class="view">${table}</div><div class="view">${shares}${cmp}</div></div>`
  $('[data-back]', view).onclick = () => (location.hash = '#/episodes')
  bindActions()
}

// ---------- 视图：平台 ----------
async function renderPlatforms() {
  const list = await api('/api/platforms')
  view.innerHTML = `<div class="plat-grid">${list
    .map(
      (p) => `<div class="plat ${p.enabled ? '' : 'off'}" style="padding:14px 15px">
      <div class="top"><i class="sq" style="background:${p.color}"></i><span class="name">${esc(p.name)}</span>
        <span class="tag">${p.manual ? '填完等你点' : '自动提交'}</span></div>
      <div class="fans">${num(p.fans)}</div>
      <div class="meta"><span>7 天 ${num(p.views7)} 播放</span><span style="color:${p.loggedIn ? 'var(--green)' : 'var(--rose)'}">${p.loggedIn ? '已登录' : '未登录'}</span></div>
      ${spark(p.series.map((s) => s.fans), p.color)}
      <div class="btn-row" style="margin-top:11px">
        <button class="btn ghost" data-login="${p.id}">${p.loggedIn ? '重检登录' : '去登录'}</button>
        <button class="btn ghost" data-toggle="${p.id}" data-on="${p.enabled}">${p.enabled ? '停用' : '启用'}</button>
      </div>
    </div>`,
    )
    .join('')}</div>
    <div class="card"><div class="card-head"><h2>说明</h2></div>
      <p class="muted" style="font-size:12px;line-height:1.75;margin:0">
        登录态真实接入后来自专用 Chrome 的资料目录，一个平台只有一份，网页里没法嵌扫码 —— 点「去登录」会在那台机器上打开这一家的后台。<br>
        标「填完等你点」的平台（B站 / 抖音 / 小红书 / 视频号）永远停在<strong>待你发布</strong>，最后一下由你点，降低风控风险。
      </p>
    </div>`

  view.querySelectorAll('[data-login]').forEach(
    (b) =>
      (b.onclick = async () => {
        await api('/api/platform', 'POST', { id: b.dataset.login, loggedIn: true })
        toast('已标记为已登录（真实接入时会打开登录页）')
        renderPlatforms()
      }),
  )
  view.querySelectorAll('[data-toggle]').forEach(
    (b) =>
      (b.onclick = async () => {
        const enabled = b.dataset.on !== 'true'
        await api('/api/platform', 'POST', { id: b.dataset.toggle, enabled })
        toast(enabled ? '已启用' : '已停用：不体检、不发布、不采粉丝')
        renderPlatforms()
      }),
  )
}

// ---------- 视图：日志 ----------
async function renderLogs() {
  const logs = await api('/api/logs')
  view.innerHTML = `<div class="card"><div class="card-head"><h2>最近 80 条</h2><span class="hint">状态变化与操作</span></div>
    <div class="logs">${logs
      .map(
        (l) => `<div class="log-row">
      <span class="ts">${new Date(l.ts).toLocaleString('zh-CN', { hour12: false, month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
      <span class="pf">${esc(l.name || l.platform || '系统')}</span>
      <span class="res">${esc(l.result || l.action)}</span>
    </div>`,
      )
      .join('')}</div></div>`
}

// ---------- 视图：设置 ----------
async function renderSettings() {
  view.innerHTML = `<div class="card">
    <div class="card-head"><h2>访问与巡检</h2></div>
    <form class="form" id="setForm">
      <div class="field"><label>访问口令</label><input name="key" value="${esc(KEY)}"><span class="tip">所有接口没有口令一律 401；改完要重新输入</span></div>
      <div class="field"><label>飞书 webhook（可空）</label><input name="webhook" placeholder="https://open.feishu.cn/open-apis/bot/v2/hook/..."><span class="tip">填了就发卡片，留空只写日志</span></div>
      <div class="field"><label>巡检间隔（秒）</label><input name="tickSeconds" type="number" min="5" value="20"><span class="tip">到点开跑、到点取链接、采样都在这一个循环里</span></div>
      <div class="btn-row"><button class="btn primary" type="submit">保存</button>
        <button class="btn ghost" type="button" id="resetBtn">重建演示数据</button></div>
    </form>
  </div>
  <div class="card"><div class="card-head"><h2>这一版是什么</h2></div>
    <p class="muted" style="font-size:12px;line-height:1.8;margin:0">
      发布填写用的是<strong>模拟驱动</strong>（mock）：状态机、分批、防重、取链接、采样、复盘全是真代码，只有「怎么点开网页填表」这一步是演的。<br>
      真实接入要一台已登录各平台的专用 Chrome + CDP，把 <code style="font-family:var(--mono);color:var(--gold-2)">src/adapters/cdp.mjs</code> 的 fill / collectLink 换成真实现即可，其余不用动。
    </p>
  </div>`
  $('#setForm').onsubmit = async (ev) => {
    ev.preventDefault()
    const f = new FormData(ev.target)
    const r = await api('/api/settings', 'POST', {
      key: String(f.get('key') || ''),
      webhook: String(f.get('webhook') || ''),
      tickSeconds: Number(f.get('tickSeconds')),
    })
    KEY = r.key
    localStorage.setItem('mz.key', KEY)
    toast('已保存，立即生效')
  }
  $('#resetBtn').onclick = async () => {
    if (!confirm('会被演示数据覆盖，确定吗？')) return
    await api('/api/reset', 'POST', {})
    toast('已重建演示数据')
    location.hash = '#/overview'
    load()
  }
}

// ---------- 动作绑定 ----------
function bindActions() {
  view.querySelectorAll('[data-run]').forEach(
    (b) =>
      (b.onclick = async () => {
        const force = b.textContent.includes('补跑')
        b.disabled = true
        await api('/api/run', 'POST', { id: b.dataset.run, force })
        toast('已开跑，正在分批填写各平台')
        setTimeout(load, 900)
      }),
  )
  view.querySelectorAll('[data-sync]').forEach(
    (b) =>
      (b.onclick = async () => {
        b.disabled = true
        const r = await api('/api/sync', 'POST', { id: b.dataset.sync })
        toast(`取到 ${r.synced} 个链接`)
        load()
      }),
  )
  view.querySelectorAll('[data-detail]').forEach((b) => (b.onclick = () => (location.hash = `#/episode/${b.dataset.detail}`)))
}

// ---------- 口令门 ----------
function showGate(on) {
  $('#gate').hidden = !on
  if (on) setTimeout(() => $('#gateInput').focus(), 40)
}
$('#gateForm').onsubmit = (ev) => {
  ev.preventDefault()
  KEY = $('#gateInput').value.trim()
  localStorage.setItem('mz.key', KEY)
  showGate(false)
  load()
}

// ---------- 主循环 ----------
let lastState = ''

async function load() {
  const { name, id } = route()
  paintNav(name)
  try {
    if (name === 'plan') return await buildPlan()
    if (name === 'episodes') return await renderEpisodes()
    if (name === 'episode') return await renderEpisode(id)
    if (name === 'platforms') return await renderPlatforms()
    if (name === 'logs') return await renderLogs()
    if (name === 'settings') return await renderSettings()
    return renderOverview(await api('/api/overview'))
  } catch (e) {
    if (String(e.message) !== '口令不对') view.innerHTML = `<div class="card muted">${esc(e.message)}</div>`
  }
}

async function poll() {
  if (SNAP) return
  try {
    const s = await api('/api/state')
    const sig = JSON.stringify(s.tasks)
    const pill = $('#waitPill')
    const waiting = Object.values(s.tasks).length
    void waiting
    const n = s.notify.filter((x) => x.level === 'warn' || x.level === 'err').length
    if (n) {
      pill.hidden = false
      $('#waitTxt').textContent = `${s.notify[0].title}`
    } else pill.hidden = true
    if (sig !== lastState && lastState) {
      lastState = sig
      const { name } = route()
      if (['plan', 'episode', 'episodes', 'overview'].includes(name)) load()
    }
    lastState = sig
  } catch {}
}

setInterval(() => {
  $('#clock').textContent = new Date().toLocaleTimeString('zh-CN', { hour12: false })
}, 1000)
$('#clock').textContent = new Date().toLocaleTimeString('zh-CN', { hour12: false })
$('#refresh').onclick = () => load()
window.addEventListener('hashchange', load)
setInterval(poll, 2500)

;(async () => {
  if (KEY) return load()
  // 没有口令：先确认是不是静态快照站点（快照本身不含敏感数据，不需要口令）
  if (await loadSnapshot()) {
    $('#statusTxt').textContent = '演示快照'
    $('#statusDot').className = 'dot'
    return load()
  }
  showGate(true)
})()
