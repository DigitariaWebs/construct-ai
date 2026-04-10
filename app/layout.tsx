import type { Metadata } from 'next'
import { Manrope, Inter } from 'next/font/google'
import { Providers } from '@/components/Providers'
import './globals.css'

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
})

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
})

export const metadata: Metadata = {
  title: 'Digital Foreman | CONSTRUCT.AI',
  description:
    'Turn construction PDFs into quotes in seconds. AI-powered takeoffs, live market pricing, and logistics forecasting.',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`dark ${manrope.variable} ${inter.variable}`}
    >
      <head>
        {/* Material Symbols icon font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body suppressHydrationWarning className="bg-background text-on-surface font-body selection:bg-primary/30">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
