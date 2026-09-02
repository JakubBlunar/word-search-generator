'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { LANGS } from '@/lib/types'
import type { Lang } from '@/lib/types'

const LANGUAGE_META: Record<Lang, { label: string; flag: string }> = {
  sk: { label: 'Slovak', flag: '🇸🇰' },
  cz: { label: 'Czech', flag: '🇨🇿' },
  en: { label: 'English', flag: '🇬🇧' },
}

const inLangs = (v: string | null): v is Lang =>
  v !== null && (LANGS as readonly string[]).includes(v)

export default function ConfigurePage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-50">
          <p className="text-sm text-slate-500">Loading…</p>
        </main>
      }
    >
      <ConfigureApp />
    </Suspense>
  )
}

function ConfigureApp() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const langParam = searchParams.get('lang')
  const initialLang: Lang = inLangs(langParam) ? langParam : 'sk'
  const [lang, setLang] = useState<Lang>(initialLang)
  const [pages, setPages] = useState(3)
  const [wordsPerPuzzle, setWordsPerPuzzle] = useState(50)
  const [minLength, setMinLength] = useState(3)
  const [maxLength, setMaxLength] = useState(6)
  const [diagonals, setDiagonals] = useState(true)

  const start = () => {
    const params = new URLSearchParams({
      lang,
      pages: String(pages),
      words: String(wordsPerPuzzle),
      minLength: String(minLength),
      maxLength: String(Math.max(maxLength, minLength)),
      diagonals: String(diagonals),
    })
    router.push(`/generate?${params.toString()}`)
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-5">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-600 font-mono text-sm font-bold text-white">
              WS
            </span>
            <span className="text-lg font-semibold tracking-tight">
              Word Search
            </span>
          </Link>
          <span className="text-sm text-slate-500">
            Step 1 of 2 · Configure
          </span>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-2xl font-bold tracking-tight">
          Configure your print run
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Each A4 page contains <strong>3 puzzles</strong>.
        </p>

        <div className="mt-8 space-y-8">
          <fieldset>
            <legend className="mb-3 font-medium">Language</legend>
            <div className="grid gap-3 sm:grid-cols-3">
              {LANGS.map((code) => (
                <label
                  key={code}
                  className={`flex cursor-pointer items-center gap-2.5 rounded-xl border-2 px-4 py-3 transition ${
                    lang === code
                      ? 'border-indigo-600 bg-indigo-50 font-semibold text-indigo-900'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="lang"
                    value={code}
                    checked={lang === code}
                    onChange={() => setLang(code)}
                    className="sr-only"
                  />
                  <span className="text-xl">{LANGUAGE_META[code].flag}</span>
                  <span>{LANGUAGE_META[code].label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <div className="mb-3 flex items-baseline justify-between">
              <legend className="font-medium">Pages</legend>
              <span className="text-sm text-slate-600">
                {pages} {pages === 1 ? 'page' : 'pages'} · {pages * 3} puzzles
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={20}
              value={pages}
              onChange={(e) => setPages(Number(e.target.value))}
              className="w-full accent-indigo-600"
            />
            <div className="mt-1 flex justify-between text-xs text-slate-400">
              <span>1</span>
              <span>20</span>
            </div>
          </fieldset>

          <fieldset>
            <div className="mb-3 flex items-baseline justify-between">
              <legend className="font-medium">Words per puzzle</legend>
              <span className="text-sm text-slate-600">{wordsPerPuzzle}</span>
            </div>
            <input
              type="range"
              min={20}
              max={100}
              step={5}
              value={wordsPerPuzzle}
              onChange={(e) => setWordsPerPuzzle(Number(e.target.value))}
              className="w-full accent-indigo-600"
            />
            <p className="mt-1 text-xs text-slate-500">
              20–100 words fit comfortably in the A4 13×9 grid.
              More hidden words = harder to spot the bonus solution word.
            </p>
          </fieldset>

          <fieldset className="grid gap-6 sm:grid-cols-2">
            <div>
              <legend className="mb-3 font-medium">
                Word length: {minLength}–{Math.max(maxLength, minLength)}{' '}
                letters
              </legend>
              <div className="space-y-4">
                <label className="block text-xs text-slate-600">
                  Min
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
                    className="mt-1 w-full accent-indigo-600"
                  />
                </label>
                <label className="block text-xs text-slate-600">
                  Max
                  <input
                    type="range"
                    min={3}
                    max={8}
                    value={Math.max(maxLength, minLength)}
                    onChange={(e) => setMaxLength(Number(e.target.value))}
                    className="mt-1 w-full accent-indigo-600"
                  />
                </label>
              </div>
            </div>
            <div>
              <legend className="mb-3 font-medium">Directions</legend>
              <label className="flex cursor-pointer items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={diagonals}
                  onChange={(e) => setDiagonals(e.target.checked)}
                  className="h-4 w-4 rounded accent-indigo-600"
                />
                Allow diagonals
              </label>
              <p className="mt-3 text-xs leading-relaxed text-slate-500">
                Without diagonals only horizontal and vertical words are placed.
              </p>
            </div>
          </fieldset>
        </div>

        <div className="mt-12 flex items-center justify-between">
          <Link
            href="/"
            className="text-sm text-slate-500 hover:text-slate-700"
          >
            ← Back
          </Link>
          <button
            type="button"
            onClick={start}
            className="rounded-lg bg-indigo-600 px-8 py-3 font-medium text-white shadow-sm transition hover:bg-indigo-500"
          >
            Generate {pages * 3} puzzles →
          </button>
        </div>
      </section>
    </main>
  )
}
