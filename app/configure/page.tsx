'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LANGS } from '@/lib/types'
import type { Lang } from '@/lib/types'
import { plural } from '@/lib/i18n'
import { useI18n } from '../i18n-provider'
import { LangSwitcher } from '../components/lang-switcher'
import { AppLogo } from '@/components/app-logo'
// Language names shown inside a card are translated; flags stay literal.
const LANGUAGE_FLAG: Record<Lang, string> = {
  sk: '🇸🇰',
  cz: '🇨🇿',
  en: '🇬🇧',
}

export default function ConfigurePage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-stone-50">
          <p className="text-sm text-stone-500">Loading…</p>
        </main>
      }
    >
      <ConfigureApp />
    </Suspense>
  )
}

function ConfigureApp() {
  const { t, lang: uiLang } = useI18n()
  const router = useRouter()
  // Word-list defaults to the current UI language. The i18n provider
  // starts at 'en' on first paint, so track that first resolution and
  // apply it before letting the user override it with the radio cards.
  const [lang, setLang] = useState<Lang>(uiLang)
  const userTouchedLang = useRef(false)
  useEffect(() => {
    if (!userTouchedLang.current) setLang(uiLang)
  }, [uiLang])
  const pickLang = (l: Lang) => {
    userTouchedLang.current = true
    setLang(l)
  }
  const [pages, setPages] = useState(3)

  const [minLength, setMinLength] = useState(3)
  const [maxLength, setMaxLength] = useState(6)
  const [diagonals, setDiagonals] = useState(true)

  const start = () => {
    const params = new URLSearchParams({
      lang,
      pages: String(pages),
      minLength: String(minLength),
      maxLength: String(Math.max(maxLength, minLength)),
      diagonals: String(diagonals),
    })
    router.push(`/generate?${params.toString()}`)
  }

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-5">
          <Link href="/" className="flex items-center gap-2.5">
            <AppLogo />
            <span className="font-display text-lg font-semibold tracking-tight">
              {t('word_search')}
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-stone-500">{t('step')}</span>
            <LangSwitcher />
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="font-display text-2xl font-bold tracking-tight">{t('cfg_title')}</h1>
        <p className="mt-2 text-sm text-stone-600">
          {t('cfg_note', {
            n: 3,
            p: plural(uiLang, 3, {
              one: 'puzzle_one',
              many: 'puzzle_interval',
              other: 'puzzle_other',
            }),
          })}
        </p>

        <div className="mt-8 space-y-8">
          <fieldset>
            <legend className="mb-3 font-medium">{t('language')}</legend>
            <div className="grid gap-3 sm:grid-cols-3">
              {LANGS.map((code) => (
                <label
                  key={code}
                  className={`flex cursor-pointer items-center gap-2.5 rounded-xl border-2 px-4 py-3 transition ${
                    lang === code
                      ? 'border-stone-800 bg-stone-50 font-semibold text-stone-900'
                      : 'border-stone-200 bg-white hover:border-stone-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="lang"
                    value={code}
                    checked={lang === code}
                    onChange={() => pickLang(code)}
                    className="sr-only"
                  />
                  <span className="grid h-5 place-items-center leading-none">
                    {LANGUAGE_FLAG[code]}
                  </span>
                  <span className="leading-none">{t(`lang_${code}`)}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <div className="mb-3 flex items-baseline justify-between">
              <legend className="font-medium">{t('pages')}</legend>
              <span className="text-sm text-stone-600">
                {pages}{' '}
                {plural(uiLang, pages, {
                  one: 'page_one',
                  many: 'page_interval',
                  other: 'page_other',
                })}{' '}
                · {pages * 3}{' '}
                {plural(uiLang, pages * 3, {
                  one: 'puzzle_one',
                  many: 'puzzle_interval',
                  other: 'puzzle_other',
                })}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="number"
                min={1}
                max={20}
                value={pages}
                onChange={(e) => {
                  const raw = Number(e.target.value)
                  if (!Number.isFinite(raw)) return
                  setPages(Math.min(20, Math.max(1, Math.round(raw))))
                }}
                aria-label={t('pages')}
                className="w-20 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-medium tabular-nums outline-none transition focus:border-stone-500 focus:ring-2 focus:ring-stone-200"
              />
              <div className="flex-1">
                <input
                  type="range"
                  min={1}
                  max={20}
                  value={pages}
                  onChange={(e) => setPages(Number(e.target.value))}
                  className="w-full accent-stone-900"
                />
                <div className="mt-1 flex justify-between text-xs text-stone-400">
                  <span>1</span>
                  <span>20</span>
                </div>
              </div>
            </div>
          </fieldset>

          <fieldset className="grid gap-6 sm:grid-cols-2">
            <div>
              <legend className="mb-3 font-medium">
                {t('word_length')}: {minLength}–{Math.max(maxLength, minLength)}{' '}
                {t('letters')}
              </legend>
              <div className="space-y-4">
                <label className="block text-xs text-stone-600">
                  {t('min')}
                  <input
                    type="range"
                    min={2}
                    max={8}
                    value={minLength}
                    onChange={(e) => {
                      const v = Number(e.target.value)
                      setMinLength(v)
                      if (maxLength < v) setMaxLength(v)
                    }}
                    className="mt-1 w-full accent-stone-900"
                  />
                </label>
                <label className="block text-xs text-stone-600">
                  {t('max')}
                  <input
                    type="range"
                    min={3}
                    max={8}
                    value={Math.max(maxLength, minLength)}
                    onChange={(e) => setMaxLength(Number(e.target.value))}
                    className="mt-1 w-full accent-stone-900"
                  />
                </label>
              </div>
            </div>
            <div>
              <legend className="mb-3 font-medium">{t('directions')}</legend>
              <label className="flex cursor-pointer items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={diagonals}
                  onChange={(e) => setDiagonals(e.target.checked)}
                  className="h-4 w-4 rounded accent-stone-900"
                />
                {t('allow_diagonals')}
              </label>
              <p className="mt-3 text-xs leading-relaxed text-stone-500">
                {t('directions_desc')}
              </p>
            </div>
          </fieldset>
        </div>

        <div className="mt-12 flex items-center justify-between">
          <Link
            href="/"
            className="text-sm text-stone-500 hover:text-stone-800"
          >
            {t('back')}
          </Link>
          <button
            type="button"
            onClick={start}
            className="rounded-lg bg-stone-900 px-8 py-3 font-medium text-white transition hover:bg-stone-700"
          >
            {t('generate_cta', {
              n: pages * 3,
              p: plural(uiLang, pages * 3, {
                one: 'puzzle_one',
                many: 'puzzle_interval',
                other: 'puzzle_other',
              }),
            })}
          </button>
        </div>
      </section>
    </main>
  )
}
