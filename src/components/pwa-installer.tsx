'use client'

import { useEffect } from 'react'

// PWA安装组件 - 仅注册Service Worker，不显示安装提示
export function PWAInstaller() {
  useEffect(() => {
    // 仅注册 Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.error)
    }
  }, [])

  // 不显示任何安装提示浮窗
  return null
}
