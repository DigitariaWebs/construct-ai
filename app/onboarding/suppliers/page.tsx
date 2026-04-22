'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Animate from '@/components/Animate'
import Footer from '@/components/Footer'
import SupplierConnectModal from '@/components/SupplierConnectModal'
import { SUPPLIERS } from '@/lib/suppliers'
import { getAllAccounts, subscribeAccounts, type SupplierAccount } from '@/lib/supplierAccounts'

const CONNECTABLE = SUPPLIERS.filter(s => s.id !== 'auto')

export default function SupplierOnboardingPage() {
  const router = useRouter()
  const [modalId, setModalId] = useState<string | null>(null)
  const [openAll, setOpenAll] = useState(false)
  const [accounts, setAccounts] = useState<Record<string, SupplierAccount>>({})

  useEffect(() => {
    setAccounts(getAllAccounts())
    return subscribeAccounts(s => setAccounts({ ...s }))
  }, [])

  const connectedCount = useMemo(
    () => Object.values(accounts).filter(a => a.status === 'connected').length,
    [accounts],
  )

  const avgDiscount = useMemo(() => {
    const connected = Object.values(accounts).filter(a => a.status === 'connected')
    if (connected.length === 0) return 0
    const avg = connected.reduce((s, a) => {
      const vals = Object.values(a.discountByFamily)
      return s + (vals.length ? vals.reduce((t, v) => t + v, 0) / vals.length : 0)
    }, 0) / connected.length
    return Math.round(avg)
  }, [accounts])

  return (
    <>
    <main className="min-h-screen relative overflow-hidden bg-surface-container-lowest text-on-surface">
      {/* Ambient glows */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary-container/15 blur-[160px] rounded-full pointer-events-none animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-secondary-container/10 blur-[160px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-16">
        {/* Header */}
        <Animate variant="fade-up" delay={0}>
          <Link href="/dashboard" className="inline-flex items-center gap-3 mb-12 group">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/15 group-hover:bg-white/15 transition-colors">
              <span className="material-symbols-outlined text-on-surface text-xl">architecture</span>
            </div>
            <span className="font-headline font-bold text-xl tracking-tight text-white">
              Plombia Chiffrage
            </span>
          </Link>
        </Animate>

        {/* Step chip */}
        <Animate variant="fade-up" delay={100}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/25 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary">
              Étape finale · 1 min
            </span>
          </div>
        </Animate>

        {/* Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 items-start mb-12">
          <div>
            <Animate variant="fade-up" delay={150}>
              <h1 className="font-headline text-5xl md:text-6xl font-black leading-[1.02] tracking-tighter text-white mb-6">
                Vos prix, pas ceux du public.
              </h1>
            </Animate>

            <Animate variant="fade-up" delay={250}>
              <p className="text-on-surface-variant text-lg leading-relaxed max-w-xl mb-8">
                Connectez vos comptes distributeurs pour que vos <span className="text-white font-semibold">tarifs remisés</span> s'appliquent automatiquement à chaque chiffrage. Aucun prix public sur vos chantiers.
              </p>
            </Animate>

            <Animate variant="fade-up" delay={350}>
              <div className="flex flex-wrap items-center gap-3 mb-10">
                <button
                  onClick={() => setOpenAll(true)}
                  className="group flex items-center gap-2 px-6 py-3.5 bg-primary text-on-primary font-headline font-black uppercase tracking-[0.15em] text-sm rounded-xl hover:shadow-[0_0_30px_rgba(212,255,58,0.5)] active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined text-lg">link</span>
                  Connecter mes comptes
                </button>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="px-6 py-3.5 rounded-xl border border-outline-variant/20 bg-surface-container/60 backdrop-blur-md text-on-surface-variant hover:text-white hover:border-primary/30 text-sm font-bold uppercase tracking-widest transition-all"
                >
                  Passer pour le moment
                </button>
              </div>
            </Animate>

            {/* Trust strip */}
            <Animate variant="fade-up" delay={450}>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { icon: 'shield',   label: 'Chiffré',          sub: 'TLS 1.3 · AES-256'  },
                  { icon: 'visibility_off', label: 'Privé',       sub: 'Aucun partage tiers' },
                  { icon: 'hourglass_empty',    label: 'Réversible',       sub: 'Déconnexion 1 clic' },
                ].map(t => (
                  <div key={t.label} className="p-3 rounded-xl border border-white/5 bg-surface-container/30 backdrop-blur-md">
                    <span className="material-symbols-outlined text-primary text-base">{t.icon}</span>
                    <div className="text-[11px] font-bold text-on-surface mt-1">{t.label}</div>
                    <div className="text-[10px] text-on-surface-variant mt-0.5 font-mono">{t.sub}</div>
                  </div>
                ))}
              </div>
            </Animate>
          </div>

          {/* Visual summary card */}
          <Animate variant="fade-up" delay={300}>
            <div className="relative rounded-3xl overflow-hidden border border-outline-variant/15 bg-surface-container/40 backdrop-blur-2xl p-7">
              <div className="absolute inset-0 opacity-[0.08] bg-[radial-gradient(at_0%_0%,#d4ff3a_0px,transparent_60%),radial-gradient(at_100%_100%,#e8ff7a_0px,transparent_60%)] pointer-events-none" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-on-surface-variant">Tableau de bord comptes</span>
                  <span className="text-[10px] font-mono text-on-surface-variant">LIVE</span>
                </div>

                <div className="flex items-baseline gap-3 mb-1">
                  <div className="font-headline font-black text-6xl tracking-tighter text-white">{connectedCount}</div>
                  <div className="text-sm text-on-surface-variant">/ {CONNECTABLE.length} connectés</div>
                </div>
                {avgDiscount > 0 && (
                  <div className="text-sm font-mono text-primary font-bold">
                    −{avgDiscount}% remise moyenne
                  </div>
                )}

                <div className="mt-8 space-y-3">
                  {CONNECTABLE.map(s => {
                    const acc = accounts[s.id]
                    const isOn = acc?.status === 'connected'
                    return (
                      <button
                        key={s.id}
                        onClick={() => setModalId(s.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                          isOn
                            ? 'border-primary/30 bg-primary/[0.04]'
                            : 'border-white/5 bg-surface-container-low hover:border-primary/20'
                        }`}
                      >
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-headline font-black text-[10px] shrink-0 ${
                          isOn ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface'
                        }`}>
                          {s.initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-on-surface truncate">{s.name}</div>
                          <div className="text-[10px] text-on-surface-variant truncate">{s.sub}</div>
                        </div>
                        {isOn ? (() => {
                          const vals = Object.values(acc!.discountByFamily)
                          const avg  = vals.length ? Math.round(vals.reduce((s, v) => s + v, 0) / vals.length) : 0
                          return <span className="text-[10px] font-mono font-bold text-primary shrink-0">−{avg}%</span>
                        })() : (
                          <span className="material-symbols-outlined text-on-surface-variant/60 text-lg shrink-0">chevron_right</span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </Animate>
        </div>

        {/* Footer note */}
        <Animate variant="fade-up" delay={500}>
          <p className="text-center text-xs text-on-surface-variant/60">
            Vous pouvez connecter ou déconnecter vos comptes à tout moment depuis{' '}
            <Link href="/settings?tab=fournisseurs" className="underline hover:text-on-surface-variant transition-colors">
              Paramètres → Fournisseurs
            </Link>.
          </p>
        </Animate>
      </div>

      {(modalId || openAll) && (
        <SupplierConnectModal
          initialSupplierId={modalId ?? undefined}
          onClose={() => { setModalId(null); setOpenAll(false) }}
        />
      )}
    </main>
    <Footer />
    </>
  )
}
