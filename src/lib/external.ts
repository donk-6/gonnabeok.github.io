/**
 * 打开外部链接，兼容普通浏览器与 H5 内嵌 WebView。
 *
 * 普通浏览器会新开标签页；部分 App / 微信内置浏览器会屏蔽 window.open，
 * 此时先往历史栈压入当前博客地址，再跳转外链，
 * 这样用户在外部页面按返回键时会回到博客，而不是直接退出站点。
 */
export function openExternal(url: string): void {
  try {
    const win = window.open(url, '_blank')
    if (win) {
      win.opener = null
      return
    }
  } catch {
    // 内嵌 WebView 可能直接抛错，走下面的回退方案
  }

  try {
    window.history.pushState({ gonnabeokReturn: true }, '', window.location.href)
  } catch {
    // 极端情况下 history 不可用，仍直接跳转
  }
  window.location.href = url
}
