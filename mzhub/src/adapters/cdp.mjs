// 真实驱动占位：接专用 Chrome + CDP 后，把 fill / collectLink 换成读页面、填表单
// 这里保留接口与失败原因，避免「看起来能跑其实没接线」
const hint = (what) =>
  new Error(
    `真实驱动未接入（${what}）：需要一台已登录各平台的专用 Chrome + CDP，详见 README「接入真实平台」。` +
      `当前请用 driver: "mock"（默认）。`,
  )

export async function fill() {
  throw hint('fill')
}

export async function collectLink() {
  throw hint('collectLink')
}

export const cdpDriver = { fill, collectLink, name: 'cdp' }
