// 配置与路径：config.json 不存在时用内置默认值，不会因为缺文件退出
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)))
export const CONFIG_PATH = process.env.MZ_CONFIG || path.join(ROOT, 'config.json')
export const DATA_DIR = process.env.MZ_DATA || path.join(ROOT, 'data')

const DEFAULTS = {
  name: 'MZ 分发中控',
  port: 8899,
  key: 'mz-demo',
  tickSeconds: 20,
  batches: [
    ['bilibili', 'douyin'],
    ['xhs', 'channels'],
    ['youtube'],
    ['x', 'threads', 'instagram'],
  ],
  auto: ['youtube', 'x', 'instagram', 'threads'],
  manual: ['bilibili', 'douyin', 'xhs', 'channels'],
  disabled: [],
  webhook: '',
  keepAlive: ['channels'],
  sampleHours: 6,
  rootPath: path.join(DATA_DIR, 'episodes'),
}

function read() {
  try {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'))
  } catch {
    return null
  }
}

export const config = { ...DEFAULTS, ...(read() || {}) }

export function saveConfig(patch) {
  Object.assign(config, patch)
  const out = { ...config }
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(out, null, 2) + '\n', 'utf8')
}

export const isManual = (id) => (config.manual || []).includes(id)
export const isDisabled = (id) => (config.disabled || []).includes(id)
