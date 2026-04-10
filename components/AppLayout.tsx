'use client'

import { ReactNode } from 'react'
import Navbar from '@/components/Navbar'
import MobileNav from '@/components/MobileNav'
import Footer from '@/components/Footer'

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-container-lowest text-on-surface flex flex-col md:flex-row">
      <Navbar />
      <div className="flex-1 pt-8 md:pt-20 flex flex-col min-h-[calc(100vh-80px)]">
        <main className="flex-1 max-w-screen-2xl mx-auto w-full pb-20 md:pb-8 pt-20 border-border px-4 md:px-8">
          {children}
        </main>
        <div className="hidden md:block">
          <Footer />
        </div>
      </div>
      <MobileNav />
    </div>
  )
}

