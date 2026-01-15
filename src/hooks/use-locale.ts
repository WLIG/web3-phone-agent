'use client'

import { useState, useCallback, useEffect } from 'react'
import { Locale, defaultLocale, translations, locales } from '@/lib/i18n'

const LOCALE_KEY = 'app-locale'

export function useLocale() {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale)

  useEffect(() => {
    // 从localStorage读取语言设置
    const saved = localStorage.getItem(LOCALE_KEY) as Locale
    if (saved && locales.includes(saved)) {
      setLocaleState(saved)
    } else {
      // 尝试从浏览器语言检测
      const browserLang = navigator.language.split('-')[0] as Locale
      if (locales.includes(browserLang)) {
        setLocaleState(browserLang)
      }
    }
  }, [])

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem(LOCALE_KEY, newLocale)
  }, [])

  const t = useCallback((key: string): string => {
    return translations[locale][key] || translations[defaultLocale][key] || key
  }, [locale])

  return { locale, setLocale, t }
}
