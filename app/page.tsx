'use client'

import { useEffect, useState } from 'react'
import Link from "next/link"
import { useI18n } from './i18n-provider'
import { SolvePuzzleDemo } from '@/components/solving-puzzle'
import type { PuzzleData } from '@/lib/types'
import { LangSwitcher } from './components/lang-switcher'

const features = [
  {
    titleKey: 'feat1_title',
    descKey: 'feat1_desc',
  },
  {
    titleKey: 'feat2_title',
    descKey: 'feat2_desc',
  },
  {
    titleKey: 'feat3_title',
    descKey: 'feat3_desc',
  },
]

export default function Home() {
  const { t } = useI18n()
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2.5">
          <Logo />
          <span className="text-lg font-semibold tracking-tight">
            {t('word_search')}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <LangSwitcher />
          <Link
            href="/configure"
            className=" rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            {t('generatePuzzles')}
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 pb-20 pt-16 md:pt-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="mb-4 inline-block rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium uppercase tracking-wider text-indigo-700">
              {t('badge')}
            </p>
            <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-5xl">
              {t('h1a')}
              <br />
              <span className="text-indigo-600">{t('h1b')}</span>
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-slate-600">
              {t('intro')}
            </p>
            <div className="mt-8 flex items-center gap-4">
              <Link
                href="/configure"
                className="rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white shadow-sm transition hover:bg-indigo-500"
              >
                {t('start')}
              </Link>
              <span className="text-sm text-slate-500">
                {t('free')}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <DemoPuzzle />
            <p className="mt-3 text-center text-xs text-slate-400">
              {t('demo_caption')}
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-16 md:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.titleKey}>
              <h3 className="font-semibold text-slate-900">
                {t(feature.titleKey)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {t(feature.descKey)}
              </p>
            </div>
          ))}
        </div>
      </section>

      <footer className="mx-auto flex max-w-6xl items-center justify-between px-6 py-8 text-xs text-slate-400">
        <span>{t('footer')}</span>
        <Link href="/configure" className="hover:text-slate-600">
          {t('configureLink')}
        </Link>
      </footer>
    </main>
  )
}

function Skeleton() {
  return (
    <div className="grid h-full w-full place-items-center py-16">
      <div className="h-5 w-5 animate-pulse rounded-full bg-slate-200" />
    </div>
  )
}

function DemoPuzzle() {
  // `ready` is true once the i18n provider has resolved the real UI language
  // (it starts as the SSR default 'en' on first paint). Fetching only after
  // that guarantees exactly one request for the one language the user is
  // actually on — no fetch for the placeholder, no double-fire in
  // StrictMode (that one is cancelled by the cleanup's abort anyway).
  const { lang, ready } = useI18n()
  const [puzzle, setPuzzle] = useState<PuzzleData | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!ready) return
    setPuzzle(null)
    setFailed(false)
    const ctrl = new AbortController()
    fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lang, count: 1 }),
      signal: ctrl.signal,
    })
      .then(async (r) => {
        if (!r.ok) throw new Error(`generate failed: ${r.status}`)
        const data = await r.json()
        return data.puzzles?.[0] as PuzzleData | undefined
      })
      .then((p) => {
        if (ctrl.signal.aborted) return
        if (p) setPuzzle(p)
        else setFailed(true)
      })
      .catch((e: unknown) => {
        if (ctrl.signal.aborted) return
        if (
          e instanceof DOMException &&
          (e.name === 'AbortError' || e.name === 'TimeoutError')
        )
          return
        setFailed(true)
      })
    return () => ctrl.abort()
  }, [lang, ready])

  if (failed || !puzzle) return <Skeleton />
  return <SolvePuzzleDemo key={lang} puzzle={puzzle} />
}

function Logo() {
  return (
    <div className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-600 font-mono text-sm font-bold text-white">
      WS
    </div>
  )
}


