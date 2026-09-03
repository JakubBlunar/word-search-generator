'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { detectUILang, UI_LANGS, translate } from '@/lib/i18n'
import type { UILang } from '@/lib/i18n'

const STORAGE_KEY = 'ws.ui-lang'

type I18nValue = {
  lang: UILang
  setLang: (l: UILang) => void
  t: (key: string, vars?: Record<string, string | number>) => string
  /** True once the real UI language has been resolved on the client.
   *  Consumers with side effects (fetches, etc.) should wait for this —
   *  `lang` is the SSR default ('en') until then. */
  ready: boolean
}

const I18nContext = createContext<I18nValue>({
  lang: 'en',
  setLang: () => {},
  t: (k, v) => translate('en', k, v),
  ready: false,
})

function readStored(): UILang | null {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem(STORAGE_KEY)
  return raw && UI_LANGS.includes(raw as UILang) ? (raw as UILang) : null
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  // Render as 'en' on the server and first client paint (no hydration
  // mismatch). On mount, resolve to the stored/detected language in one
  // shot and flip `ready` — effects gated on `ready` never observe the
  // placeholder 'en' value.
  const [lang, setLangState] = useState<UILang>('en')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setLangState(readStored() ?? detectUILang())
    setReady(true)
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
      ready,
      t: (key, vars) => translate(lang, key, vars),
    }),
    [lang, ready],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  return useContext(I18nContext)
}

export function isUILang(v: string | null | undefined): v is UILang {
  return !!v && UI_LANGS.includes(v as UILang)
}
