import { cookies, headers } from 'next/headers'
import './globals.css'
import './print.css'
import { I18nProvider } from './i18n-provider'
import { metadata } from './metadata'
import {
  LocaleCookie,
  detectFromAcceptLanguage,
  isUILangCode,
} from '@/lib/i18n'

export { metadata }

async function resolveInitialLang() {
  const [cookieStore, headerStore] = await Promise.all([cookies(), headers()])
  const cookie = cookieStore.get(LocaleCookie)?.value
  if (isUILangCode(cookie)) return cookie
  return detectFromAcceptLanguage(headerStore.get('accept-language'))
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const initialLang = await resolveInitialLang()
  return (
    <html lang={initialLang} className="antialiased">
      <body>
        <I18nProvider initialLang={initialLang}>{children}</I18nProvider>
      </body>
    </html>
  )
}
