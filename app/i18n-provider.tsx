'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  LocaleCookie,
  UI_LANGS,
  detectUILang,
  isUILangCode,
  readDocumentCookie,
  translate,
} from '@/lib/i18n'
import type { UILang } from '@/lib/i18n'

type I18nValue = {
  lang: UILang
  setLang: (l: UILang) => void
  t: (key: string, vars?: Record<string, string | number>) => string
  /**
   * True on the next tick after mount. The **initial** `lang` is already the
   * correct value — it came pre-resolved from the server (cookie first, then
   * Accept-Language) — so `ready` only exists to defer *side effects* like
   * fetches until after hydration. It is NOT a "waiting for the real
   * language to load" flag anymore (that was the pre-SSR-resolution design).
   */
  ready: boolean
}

const I18nContext = createContext<I18nValue>({
  lang: 'en',
  setLang: () => {},
  t: (k) => translate('en', k),
  ready: false,
})

/**
 * Client-side locale check (runs once on mount). Only *overrides* the
 * server's initialLang when a strong signal says otherwise — an explicit
 * stored choice (cookie or legacy localStorage) or a non-English browser
 * locale. A bare "en" from navigator never overrides a server default of
 * 'en', and a server 'en' from a defaulted Accept-Language is overridden
 * by an sk/cz browser locale (no flash for cz/sk users with no cookie yet).
 */
function resolveClient(defaultFromServer: UILang): UILang {
  const stored = readDocumentCookie(LocaleCookie)
  if (stored && isUILangCode(stored)) return stored
  const fromStorage = detectUILang({
    getItem: (k) =>
      typeof window !== 'undefined' ? window.localStorage.getItem(k) : null,
  })
  if (fromStorage !== 'en') return fromStorage
  // Server picked something other than 'en' (e.g. cookie-based sk) — trust it.
  if (defaultFromServer !== 'en') return defaultFromServer
  return fromStorage
}

function persist(lang: UILang) {
  try {
    document.cookie = `${LocaleCookie}=${lang};max-age=31536000;path=/;SameSite=Lax`
    window.localStorage.setItem(LocaleCookie, lang)
  } catch {
    /* ignore */
  }
}

export function I18nProvider({
  initialLang,
  children,
}: {
  initialLang: UILang
  children: React.ReactNode
}) {
  // `initialLang` is the correct language on first paint (server-resolved),
  // so there is no 'en' → real-lang swap and therefore no text flash. `ready`
  // still flips on the next tick — side-effect effects (fetches) gate on it.
  const [lang, setLangState] = useState<UILang>(initialLang)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Safety-net reconciliation (once, on mount): cookie / legacy storage /
    // browser locale win over a default 'en' the server had to guess at.
    // The first-paint value was `initialLang` (server-resolved), so if
    // resolveClient returns a different one, the swap is one frame after
    // hydration — imperceptible, and only happens in the rare no-cookie /
    // default-Accept-Language cases.
    const resolved = resolveClient(initialLang)
    if (resolved !== initialLang) setLangState(resolved)
    setReady(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setLang = (l: UILang) => {
    setLangState(l)
    persist(l)
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

/**
 * Re-export for existing call sites (e.g. `lang-switcher.tsx`). The
 * `UI_LANGS` array is the source of truth for the language codes.
 */
export { UI_LANGS }
export function isUILang(v: string | null | undefined): v is UILang {
  return !!v && (UI_LANGS as readonly string[]).includes(v)
}
