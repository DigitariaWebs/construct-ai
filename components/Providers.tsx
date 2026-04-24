'use client'

import type { ReactNode } from 'react'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { AuthProvider } from '@/features/auth/AuthProvider'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <AuthProvider>{children}</AuthProvider>
    </LanguageProvider>
  )
}
