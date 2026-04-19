'use client'

import { useEffect, type ReactNode } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'

export type ModalProps = {
  title?: ReactNode
  onClose: () => void
  children: ReactNode
  /** Max width tier for the dialog. */
  size?: 'sm' | 'md' | 'lg'
}

const SIZE_CLASS: Record<NonNullable<ModalProps['size']>, string> = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-3xl',
}

export default function Modal({ title, onClose, children, size = 'md' }: ModalProps) {
  const { t } = useLanguage()
  // Escape key + body scroll lock while open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={typeof title === 'string' ? title : undefined}
      className="fixed inset-0 z-[100] flex items-start md:items-center justify-center p-4 md:p-8 overflow-y-auto"
    >
      {/* Backdrop: click to dismiss */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]"
        onClick={onClose}
      />

      {/* Dialog panel: stops propagation so clicks inside never dismiss */}
      <div
        onClick={e => e.stopPropagation()}
        className={`relative w-full ${SIZE_CLASS[size]} my-auto rounded-2xl border border-white/10 bg-surface-container-low shadow-[0_20px_60px_rgba(0,0,0,0.6)] animate-[fadeIn_0.2s_ease-out]`}
      >
        {(title !== undefined) && (
          <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-white/5">
            <h2 className="font-headline font-black text-on-surface text-lg truncate">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label={t.common.close}
              className="shrink-0 w-9 h-9 rounded-full border border-outline-variant/20 flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}
