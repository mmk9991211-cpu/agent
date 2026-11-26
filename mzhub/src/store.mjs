// 单文件 JSON 存储（零依赖，替代 SQLite）。写入用 tmp + rename，避免半截文件
import fs from 'node:fs'
import path from 'node:path'
import { DATA_DIR } from './config.mjs'

const FILE = path.join(DATA_DIR, 'store.json')

const blank = () => ({
  episodes: [],
  tasks: {}, // `${episodeId}:${platform}` -> { state, detail, url, updatedAt, logs[] }
  metrics: [], // { day, episodeId, platform, views, likes, comments, favorites, shares }
  fans: [], // [{ day, byPlatform: { id: n } }]
  platformState: {}, // { id: { fans, loggedIn, enabled, checkedAt } }
  logs: [],
  notify: [],
  meta: {},
})

function load() {
  try {
    const raw = JSON.parse(fs.readFileSync(FILE, 'utf8'))
    return { ...blank(), ...raw }
  } catch {
    return blank()
  }
}

export const db = load()

let timer = null
export function save() {
  if (timer) return
  timer = setTimeout(() => {
    timer = null
    fs.mkdirSync(DATA_DIR, { recursive: true })
    const tmp = FILE + '.tmp'
    fs.writeFileSync(tmp, JSON.stringify(db), 'utf8')
    fs.renameSync(tmp, FILE)
  }, 60)
}

export function saveNow() {
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
  fs.mkdirSync(DATA_DIR, { recursive: true })
  const tmp = FILE + '.tmp'
  fs.writeFileSync(tmp, JSON.stringify(db), 'utf8')
  fs.renameSync(tmp, FILE)
}

export function reset() {
  const b = blank()
  for (const k of Object.keys(db)) delete db[k]
  Object.assign(db, b)
  saveNow()
}

export const STORE_FILE = FILE
