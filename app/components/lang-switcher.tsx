'use client'

import { UI_LANGS } from '@/lib/i18n'
import { useI18n } from '../i18n-provider'

const NAMES: Record<string, string> = {
  en: 'English',
  sk: 'Slovenčina',
  cz: 'Čeština',
}

const FLAGS: Record<string, string> = {
  en: '🇬🇧',
  sk: '🇸🇰',
  cz: '🇨🇿',
}

export function LangSwitcher() {
  const { lang, setLang } = useI18n()
  return (
    <div
      className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1"
      role="group"
      aria-label={NAMES[lang]}
    >
      {UI_LANGS.map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLang(code)}
          className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition ${
            lang === code
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
          title={NAMES[code]}
        >
          <span className="leading-none">{FLAGS[code]}</span>
          <span className="hidden sm:inline">{NAMES[code]}</span>
        </button>
      ))}
    </div>
  )
}
