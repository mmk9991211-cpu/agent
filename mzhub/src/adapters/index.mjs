// 驱动切换：默认 mock（演示填写）；配 driver: "cdp" 走专用 Chrome
import { config } from '../config.mjs'
import { mockDriver } from './mock.mjs'

let cached = null

export async function driver() {
  if (cached) return cached
  const kind = process.env.MZ_DRIVER || config.driver || 'mock'
  if (kind === 'cdp') {
    const { cdpDriver } = await import('./cdp.mjs')
    cached = cdpDriver
  } else {
    cached = mockDriver
  }
  return cached
}
