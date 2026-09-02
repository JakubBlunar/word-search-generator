'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { detectUILang, UI_LANGS, translate } from '@/lib/i18n'
import type { UILang } from '@/lib/i18n'

const STORAGE_KEY = 'ws.ui-lang'

type I18nValue = {
  lang: UILang
  setLang: (l: UILang) => void
  t: (key: string, vars?: Record<string, string | number>) => string
}

const I18nContext = createContext<I18nValue>({
  lang: 'en',
  setLang: () => {},
  t: (k, v) => translate('en', k, v),
})

function readStored(): UILang | null {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem(STORAGE_KEY)
  return raw && UI_LANGS.includes(raw as UILang) ? (raw as UILang) : null
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  // Start as 'en' on both server and first client render (no hydration
  // mismatch), then reconcile to the stored/preferred language on mount.
  const [lang, setLangState] = useState<UILang>('en')

  useEffect(() => {
    setLangState(readStored() ?? detectUILang())
  }, [])

  const setLang = (l: UILang) => {
    setLangState(l)
    try {
      window.localStorage.setItem(STORAGE_KEY, l)
    } catch {
      /* ignore */
    }
  }

  const value = useMemo<I18nValue>(
    () => ({
      lang,
      setLang,
      t: (key, vars) => translate(lang, key, vars),
    }),
    [lang],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  return useContext(I18nContext)
}

export function isUILang(v: string | null | undefined): v is UILang {
  return !!v && UI_LANGS.includes(v as UILang)
}
