'use client'

import Link from 'next/link'
import { useI18n } from './i18n-provider'
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
            {t('brand')}
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

          <div className="grid grid-cols-4 gap-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <GridPreview />
            <div className="col-span-4 mt-2 flex flex-wrap gap-x-2 gap-y-1 font-mono text-[11px] text-slate-500">
              {['MOLO', 'SIEŇA', 'KVET', 'BRNA', 'HRA'].map((w) => (
                <span key={w}>{w}</span>
              ))}
            </div>
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

function Logo() {
  return (
    <div className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-600 font-mono text-sm font-bold text-white">
      WS
    </div>
  )
}

const previewLetters = 'AKVETBRSIENAHROMOLOKVETBRNAHRA'
  .repeat(4)
  .slice(0, 9 * 16)
const previewHighlights = new Set([2, 3, 4, 18, 19, 20, 36, 37, 38, 52, 53, 54])

function GridPreview() {
  return (
    <div className="col-span-4 grid grid-cols-16 gap-1" aria-hidden>
      {previewLetters.split('').map((letter, i) => (
        <span
          key={i}
          className={`flex aspect-square items-center justify-center rounded font-mono text-[10px] ${
            previewHighlights.has(i)
              ? 'bg-indigo-100 text-indigo-700'
              : 'bg-slate-50 text-slate-700'
          }`}
        >
          {letter}
        </span>
      ))}
    </div>
  )
}
