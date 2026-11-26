// 通知：控制台 + 飞书 webhook（配了才发）。每条都落库，大屏右上有通知流水
import { db, save } from './store.mjs'
import { config } from './config.mjs'

const LEVEL_COLOR = { info: 'blue', ok: 'green', warn: 'orange', err: 'red' }

export async function notify(level, title, body = '') {
  const rec = { ts: new Date().toISOString(), level, title, body }
  db.notify.unshift(rec)
  if (db.notify.length > 120) db.notify.length = 120
  save()

  const tag = { info: '·', ok: '✓', warn: '!', err: '×' }[level] || '·'
  console.log(`  ${tag} [${title}] ${body}`)

  if (!config.webhook) return rec
  const card = {
    msg_type: 'interactive',
    card: {
      header: {
        title: { tag: 'plain_text', content: `${config.name} · ${title}` },
        template: LEVEL_COLOR[level] || 'blue',
      },
      elements: [{ tag: 'div', text: { tag: 'plain_text', content: body || title } }],
    },
  }
  try {
    await fetch(config.webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(card),
      signal: AbortSignal.timeout(8000),
    })
  } catch (e) {
    console.log(`  × 飞书通知发送失败：${e.message}`)
  }
  return rec
}
