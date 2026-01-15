'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstall, setShowInstall] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [showIOSGuide, setShowIOSGuide] = useState(false)

  useEffect(() => {
    // 注册 Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.error)
    }

    // 检测 iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    setIsIOS(iOS)

    // 检测是否已安装
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    if (isStandalone) return

    // 监听安装提示事件
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowInstall(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    // iOS 显示安装指南
    if (iOS && !isStandalone) {
      const dismissed = localStorage.getItem('ios-install-dismissed')
      if (!dismissed) {
        setTimeout(() => setShowIOSGuide(true), 3000)
      }
    }

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setShowInstall(false)
    }
    setDeferredPrompt(null)
  }

  const dismissIOSGuide = () => {
    setShowIOSGuide(false)
    localStorage.setItem('ios-install-dismissed', 'true')
  }

  // Android/Chrome 安装提示
  if (showInstall && deferredPrompt) {
    return (
      <div className="fixed bottom-20 left-4 right-4 bg-gradient-to-r from-cyan-600 to-purple-600 rounded-xl p-4 shadow-lg z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Download className="w-8 h-8 text-white" />
            <div>
              <p className="font-bold text-white">安装应用</p>
              <p className="text-cyan-100 text-sm">添加到主屏幕，获得更好体验</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" className="text-white" onClick={() => setShowInstall(false)}>
              <X className="w-4 h-4" />
            </Button>
            <Button size="sm" className="bg-white text-cyan-600" onClick={handleInstall}>
              安装
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // iOS 安装指南
  if (showIOSGuide && isIOS) {
    return (
      <div className="fixed bottom-20 left-4 right-4 bg-slate-800 rounded-xl p-4 shadow-lg z-50 border border-slate-700">
        <button className="absolute top-2 right-2 text-slate-400" onClick={dismissIOSGuide}>
          <X className="w-5 h-5" />
        </button>
        <div className="text-center">
          <p className="font-bold text-white mb-2">添加到主屏幕</p>
          <p className="text-slate-300 text-sm mb-3">
            点击底部 <span className="inline-block px-2 py-1 bg-slate-700 rounded text-xs">分享</span> 按钮，
            然后选择 <span className="text-cyan-400">"添加到主屏幕"</span>
          </p>
          <div className="flex justify-center gap-2 text-3xl">
            <span>📤</span>
            <span>→</span>
            <span>➕</span>
          </div>
        </div>
      </div>
    )
  }

  return null
}
