'use client'

import dynamic from 'next/dynamic'

const PWAInstaller = dynamic(
  () => import('@/components/pwa-installer').then(mod => mod.PWAInstaller),
  { ssr: false }
)

export function PWAWrapper() {
  return <PWAInstaller />
}
