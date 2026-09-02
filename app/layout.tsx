import { Roboto_Mono } from 'next/font/google'
import './globals.css'
import './print.css'
import { I18nProvider } from './i18n-provider'
import { metadata } from './metadata'

const robotoMono = Roboto_Mono({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-roboto-mono',
})

export { metadata }

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={robotoMono.variable}>
      <body className="antialiased">
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  )
}
