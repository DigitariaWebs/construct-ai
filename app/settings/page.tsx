'use client'

import { useEffect, useState } from 'react'
import AppLayout from '@/components/AppLayout'
import Toast from '@/components/Toast'
import Animate from '@/components/Animate'
import { SUPPLIERS } from '@/lib/suppliers'
import SupplierConnectModal from '@/components/SupplierConnectModal'
import PaywallModal from '@/components/PaywallModal'
import { disconnectSupplier, getAllAccounts, subscribeAccounts, type SupplierAccount } from '@/lib/supplierAccounts'
import {
  downgradeToTrial,
  getSubscription,
  PAID_PLANS,
  remainingTrialQuotes,
  subscribeSubscription,
  type Subscription,
} from '@/lib/subscription'
import { useLanguage } from '@/contexts/LanguageContext'

type Tab = 'profil' | 'fournisseurs' | 'abonnement' | 'securite' | 'notifications'

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'profil',        label: 'Profil',        icon: 'person'        },
  { id: 'fournisseurs',  label: 'Fournisseurs',  icon: 'storefront'    },
  { id: 'abonnement',    label: 'Abonnement',    icon: 'credit_card'   },
  { id: 'securite',      label: 'Sécurité',      icon: 'lock'          },
  { id: 'notifications', label: 'Notifications', icon: 'notifications' },
]

const TAB_IDS = TABS.map(t => t.id)
const isTab = (v: string | null): v is Tab => !!v && (TAB_IDS as string[]).includes(v)

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${checked ? 'bg-primary' : 'bg-surface-container-highest'}`}>
      <span className={`inline-block h-4 w-4 rounded-full bg-white shadow-md transform transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  )
}

export default function SettingsPage() {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState<Tab>('profil')
  const [toast, setToast]         = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

  // Sync tab ↔ ?tab= in URL (supports deep links like /settings?tab=abonnement)
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get('tab')
    if (isTab(fromUrl)) setActiveTab(fromUrl)
  }, [])

  const selectTab = (tab: Tab) => {
    setActiveTab(tab)
    const url = new URL(window.location.href)
    url.searchParams.set('tab', tab)
    window.history.replaceState(null, '', url)
  }

  const [profil, setProfil] = useState({ firstName: 'Jean-Marc', lastName: 'Bertrand', email: 'jm.bertrand@plomberie-bertrand.fr', phone: '06 12 34 56 78', company: 'Plomberie Bertrand', sector: 'Plomberie' })
  const [defaultSupplier, setDefaultSupplier] = useState('cdo')
  const [supplierAccounts, setSupplierAccounts] = useState<Record<string, SupplierAccount>>({})
  const [connectModalId, setConnectModalId] = useState<string | null>(null)
  const [connectModalOpen, setConnectModalOpen] = useState(false)

  useEffect(() => {
    setSupplierAccounts(getAllAccounts())
    return subscribeAccounts(s => setSupplierAccounts({ ...s }))
  }, [])

  const [sub, setSub] = useState<Subscription | null>(null)
  const [showPaywall, setShowPaywall] = useState(false)

  useEffect(() => {
    setSub(getSubscription())
    return subscribeSubscription(s => setSub({ ...s }))
  }, [])
  const [twoFactor,   setTwoFactor]   = useState(false)
  const [auditLog,    setAuditLog]    = useState(true)
  const [ipWhitelist, setIpWhitelist] = useState(false)
  const [sessionTimeout, setSessionTimeout] = useState(60)
  const [notifs, setNotifs] = useState({ devisGenere: true, erreurAnalyse: true, renouvellement: true, nouvelles: false, conseils: false })

  const handleSave = () => setToast({ message: 'Paramètres enregistrés.', type: 'success' })

  return (
    <AppLayout>
      <div className="pb-32 space-y-8">

        <Animate variant="fade-up" as="section" className="pt-4">
          <span className="text-primary font-headline font-bold tracking-widest text-[10px] uppercase">Configuration</span>
          <h1 className="text-4xl md:text-5xl font-headline font-black tracking-tighter text-on-surface mt-1">Paramètres</h1>
          <p className="text-on-surface-variant mt-1 text-sm">Gérez votre compte et vos préférences.</p>
        </Animate>

        <div className="flex flex-col lg:flex-row gap-8">

          <Animate variant="slide-left" className="lg:w-52 flex-shrink-0">
            <nav className="bg-surface-container-low rounded-2xl border border-white/5 p-2 space-y-1">
              {TABS.map(tab => (
                <button key={tab.id} onClick={() => selectTab(tab.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === tab.id ? 'bg-primary/10 text-primary border-l-2 border-primary pl-3' : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'}`}>
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: activeTab === tab.id ? "'FILL' 1" : "'FILL' 0" }}>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </Animate>

          <Animate variant="fade-up" delay={60} className="flex-1 min-w-0">

            {activeTab === 'profil' && (
              <div className="bg-surface-container-low rounded-2xl border border-white/5 p-8 space-y-8">
                <div>
                  <h2 className="font-headline font-bold text-xl text-on-surface mb-1">Profil</h2>
                  <p className="text-sm text-on-surface-variant">Informations de votre compte et de votre entreprise.</p>
                </div>
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center font-headline font-black text-xl text-primary">JB</div>
                  <div>
                    <button onClick={() => setToast({ message: "Upload de photo bientôt disponible.", type: 'info' })} className="text-sm font-semibold text-primary hover:text-white transition-colors">Changer la photo</button>
                    <p className="text-xs text-on-surface-variant mt-0.5">JPG, PNG · max 2 Mo</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {[
                    { label: 'Prénom',    key: 'firstName', type: 'text'  },
                    { label: 'Nom',       key: 'lastName',  type: 'text'  },
                    { label: 'Email',     key: 'email',     type: 'email' },
                    { label: 'Téléphone', key: 'phone',     type: 'tel'   },
                    { label: 'Société',   key: 'company',   type: 'text'  },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="block text-[11px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">{f.label}</label>
                      <input type={f.type} value={profil[f.key as keyof typeof profil]} onChange={e => setProfil(p => ({ ...p, [f.key]: e.target.value }))} className="w-full bg-surface-container border border-outline-variant/20 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all" />
                    </div>
                  ))}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Secteur</label>
                    <select value={profil.sector} onChange={e => setProfil(p => ({ ...p, sector: e.target.value }))} className="w-full bg-surface-container border border-outline-variant/20 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary/40 transition-all">
                      <option>Plomberie</option>
                      <option>CVC / Chauffage</option>
                      <option>Électricité</option>
                      <option>Multi-secteur</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-on-surface-variant mb-3">{t.settings.logoLabel}</label>
                  <button onClick={() => setToast({ message: t.settings.toastLogoSoon, type: 'info' })} className="w-full md:w-64 h-20 rounded-xl border-2 border-dashed border-outline-variant/30 flex flex-col items-center justify-center gap-1 hover:border-primary/50 transition-colors group">
                    <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">upload</span>
                    <span className="text-xs text-on-surface-variant">{t.settings.uploadLogo}</span>
                  </button>
                </div>
                <div className="flex gap-3 pt-4 border-t border-white/5">
                  <button onClick={handleSave} className="px-6 py-3 bg-primary-container text-on-primary-container font-bold rounded-xl hover:shadow-[0_0_20px_rgba(212,255,58,0.3)] transition-all">{t.settings.saveButton}</button>
                </div>
              </div>
            )}

            {activeTab === 'fournisseurs' && (
              <div className="space-y-6">
                <div className="bg-surface-container-low rounded-2xl border border-white/5 p-8">
                  <h2 className="font-headline font-bold text-xl text-on-surface mb-1">{t.settings.defaultSupplierTitle}</h2>
                  <p className="text-sm text-on-surface-variant mb-6">{t.settings.defaultSupplierDesc}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {SUPPLIERS.filter(s => s.id !== 'auto').map(s => (
                      <button key={s.id} onClick={() => setDefaultSupplier(s.id)} className={`p-4 rounded-2xl border text-left transition-all duration-300 ${defaultSupplier === s.id ? 'border-primary bg-primary/10 shadow-[0_0_20px_rgba(212,255,58,0.15)]' : 'border-white/5 bg-surface-container hover:border-primary/30'}`}>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 font-headline font-black text-xs ${defaultSupplier === s.id ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface'}`}>{s.initials}</div>
                        <div className="font-bold text-sm text-on-surface">{s.name}</div>
                        <div className="text-[10px] text-on-surface-variant mt-0.5">{s.sub}</div>
                        {defaultSupplier === s.id && <div className="mt-2 text-[9px] font-bold text-primary uppercase tracking-widest">{t.settings.activeMarker}</div>}
                      </button>
                    ))}
                  </div>
                  <button onClick={handleSave} className="mt-6 px-6 py-3 bg-primary-container text-on-primary-container font-bold rounded-xl hover:shadow-[0_0_20px_rgba(212,255,58,0.3)] transition-all">{t.settings.saveButton}</button>
                </div>
                <div className="bg-surface-container-low rounded-2xl border border-outline-variant/10 p-8">
                  {(() => {
                    const connectable = SUPPLIERS.filter(s => s.id !== 'auto')
                    const connected   = connectable.filter(s => supplierAccounts[s.id]?.status === 'connected')
                    const avgDiscountFor = (a: SupplierAccount | undefined) => {
                      if (!a) return 0
                      const vals = Object.values(a.discountByFamily)
                      return vals.length ? Math.round(vals.reduce((s, v) => s + v, 0) / vals.length) : 0
                    }
                    const avgDiscount = connected.length
                      ? Math.round(connected.reduce((sum, s) => sum + avgDiscountFor(supplierAccounts[s.id]), 0) / connected.length)
                      : 0
                    return (
                      <>
                        <div className="flex items-start justify-between mb-6 gap-4">
                          <div>
                            <h2 className="font-headline font-bold text-xl text-on-surface mb-1">Comptes fournisseurs</h2>
                            <p className="text-sm text-on-surface-variant">Connectez vos comptes pour appliquer automatiquement vos prix remisés.</p>
                          </div>
                          {connected.length > 0 && (
                            <div className="px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-right shrink-0">
                              <div className="text-[10px] font-bold uppercase tracking-widest text-primary">Connectés</div>
                              <div className="text-sm font-headline font-bold text-on-surface">
                                {connected.length}/{connectable.length}
                                <span className="ml-2 text-[11px] font-mono text-primary">−{avgDiscount}% moy.</span>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {connectable.map(s => {
                            const acc = supplierAccounts[s.id]
                            const isOn = acc?.status === 'connected'
                            return (
                              <div
                                key={s.id}
                                className={`group p-4 rounded-xl border transition-all ${
                                  isOn
                                    ? 'border-primary/30 bg-primary/[0.04]'
                                    : 'border-outline-variant/10 bg-surface-container hover:border-primary/20'
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-headline font-black text-[10px] shrink-0 ${
                                    isOn ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface'
                                  }`}>
                                    {s.initials}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <div className="text-sm font-bold text-on-surface truncate">{s.name}</div>
                                      {isOn && (
                                        <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-widest bg-primary/10 text-primary">
                                          <span className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                                          Actif
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-[10px] text-on-surface-variant truncate">
                                      {isOn
                                        ? `${acc!.channel === 'fabdis' ? 'Catalogue FAB-DIS' : acc!.channel === 'invoice_ocr' ? 'Factures OCR' : 'Remise'} · −${avgDiscountFor(acc)}% moy.`
                                        : s.sub}
                                    </div>
                                  </div>
                                </div>
                                <div className="mt-3 flex items-center gap-2">
                                  {isOn ? (
                                    <>
                                      <button
                                        onClick={() => { setConnectModalId(s.id); setConnectModalOpen(true) }}
                                        className="flex-1 px-3 py-1.5 rounded-lg border border-outline-variant/20 bg-surface-container text-on-surface-variant hover:text-on-surface hover:border-primary/30 text-[10px] font-bold uppercase tracking-widest transition-all"
                                      >
                                        Modifier
                                      </button>
                                      <button
                                        onClick={() => { disconnectSupplier(s.id); setToast({ message: `Compte ${s.name} déconnecté.`, type: 'info' }) }}
                                        className="px-3 py-1.5 rounded-lg border border-outline-variant/20 bg-surface-container text-on-surface-variant hover:text-red-400 hover:border-red-500/30 text-[10px] font-bold uppercase tracking-widest transition-all"
                                      >
                                        Déconnecter
                                      </button>
                                    </>
                                  ) : (
                                    <button
                                      onClick={() => { setConnectModalId(s.id); setConnectModalOpen(true) }}
                                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-container text-on-primary-container text-[10px] font-black uppercase tracking-widest hover:shadow-[0_0_16px_rgba(212,255,58,0.3)] transition-all"
                                    >
                                      <span className="material-symbols-outlined text-sm">link</span>
                                      Connecter
                                    </button>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                        <div className="mt-5 flex items-center gap-2 text-xs text-on-surface-variant">
                          <span className="material-symbols-outlined text-sm">shield</span>
                          <span>Chiffré de bout en bout. Vos identifiants restent sur votre espace sécurisé.</span>
                        </div>
                      </>
                    )
                  })()}
                </div>
              </div>
            )}

            {activeTab === 'abonnement' && sub && (() => {
              const onTrial   = sub.plan === 'trial'
              const trialLeft = remainingTrialQuotes()
              const activePaid = PAID_PLANS.find(p => p.id === sub.plan)
              const activatedDate = sub.activatedAt
                ? new Date(sub.activatedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
                : null

              return (
                <div className="space-y-6">
                  {onTrial ? (
                    <div className="bg-surface-container-low rounded-2xl border border-primary/30 shadow-[0_0_40px_rgba(212,255,58,0.08)] p-8">
                      <div className="flex items-start justify-between mb-6">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                            <span className="text-amber-400 text-[10px] font-bold uppercase tracking-widest">Essai</span>
                          </div>
                          <h2 className="font-headline font-black text-3xl text-on-surface">Plan d&rsquo;essai gratuit</h2>
                          <p className="text-sm text-on-surface-variant mt-1">
                            {trialLeft > 0
                              ? `Il vous reste ${trialLeft} devis gratuit${trialLeft > 1 ? 's' : ''}.`
                              : 'Votre devis gratuit est utilisé — passez à un plan payant pour continuer.'}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-headline font-black text-white">0 €</div>
                          <div className="text-xs text-on-surface-variant mt-1">Sans carte de crédit</div>
                        </div>
                      </div>
                      <ul className="space-y-3 mb-6">
                        {['1 devis gratuit', 'Analyse CCTP automatique', 'Export PDF'].map(f => (
                          <li key={f} className="flex items-center gap-2 text-sm text-on-surface-variant">
                            <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>{f}
                          </li>
                        ))}
                      </ul>
                      <button
                        onClick={() => setShowPaywall(true)}
                        className="px-6 py-3 bg-primary text-on-primary font-headline font-black uppercase tracking-[0.15em] text-sm rounded-xl hover:shadow-[0_0_30px_rgba(212,255,58,0.45)] transition-all"
                      >
                        Choisir un plan
                      </button>
                    </div>
                  ) : (
                    <div className="bg-surface-container-low rounded-2xl border border-primary/30 shadow-[0_0_40px_rgba(212,255,58,0.08)] p-8">
                      <div className="flex items-start justify-between mb-6">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest">Actif</span>
                          </div>
                          <h2 className="font-headline font-black text-3xl text-on-surface">
                            Plan {activePaid?.name ?? sub.plan}
                          </h2>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-headline font-black text-white">
                            {activePaid?.price ?? '—'}
                            {activePaid?.per && <span className="text-lg text-on-surface-variant"> {activePaid.per}</span>}
                          </div>
                          {activatedDate && (
                            <div className="text-xs text-on-surface-variant mt-1">Actif depuis le {activatedDate}</div>
                          )}
                        </div>
                      </div>
                      <ul className="space-y-3 mb-6">
                        {(activePaid?.features ?? ['Devis illimités']).map(f => (
                          <li key={f} className="flex items-center gap-2 text-sm text-on-surface-variant">
                            <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>{f}
                          </li>
                        ))}
                      </ul>
                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={() => setShowPaywall(true)}
                          className="px-6 py-3 border border-outline-variant/20 bg-surface-container text-on-surface font-bold rounded-xl hover:bg-surface-container-high transition-all text-sm"
                        >
                          Changer de plan
                        </button>
                        <button
                          onClick={() => { downgradeToTrial(); setToast({ message: 'Abonnement annulé. Retour à l\u2019essai.', type: 'info' }) }}
                          className="px-6 py-3 border border-red-500/30 text-red-400 font-bold rounded-xl hover:bg-red-500/10 transition-all text-sm"
                        >
                          Annuler l&rsquo;abonnement
                        </button>
                      </div>
                    </div>
                  )}

                  {!onTrial && (
                    <div className="bg-surface-container-low rounded-2xl border border-white/5 p-8">
                      <h3 className="font-headline font-bold text-lg mb-5">Historique de facturation</h3>
                      <div className="space-y-3">
                        {[{ date: activatedDate ?? '—', amount: activePaid?.price ?? '—' }].map((b, i) => (
                          <div key={i} className="flex items-center justify-between p-4 bg-surface-container rounded-xl border border-outline-variant/10">
                            <div>
                              <span className="text-sm text-on-surface font-medium">{b.date}</span>
                              <span className="ml-3 text-[10px] text-emerald-400 font-bold">Payé</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-mono text-on-surface">{b.amount}</span>
                              <button
                                onClick={() => setToast({ message: 'Facture téléchargée.', type: 'success' })}
                                className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary transition-colors"
                              >
                                <span className="material-symbols-outlined text-sm">download</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })()}

            {activeTab === 'securite' && (
              <div className="space-y-6">
                <div className="bg-surface-container-low rounded-2xl border border-white/5 p-8 space-y-6">
                  <div>
                    <h2 className="font-headline font-bold text-xl text-on-surface mb-1">Sécurité</h2>
                    <p className="text-sm text-on-surface-variant">Gérez l'accès et la sécurité de votre compte.</p>
                  </div>
                  <div className="space-y-0 divide-y divide-white/5">
                    {[
                      { label: 'Authentification à deux facteurs', desc: 'Exiger un code supplémentaire à chaque connexion.', value: twoFactor,   set: setTwoFactor   },
                      { label: "Journal d'audit",                   desc: 'Enregistrer tous les accès et modifications.',     value: auditLog,    set: setAuditLog    },
                      { label: "Liste blanche d'IP",                desc: "Limiter l'accès aux adresses IP approuvées.",      value: ipWhitelist, set: setIpWhitelist },
                    ].map(item => (
                      <div key={item.label} className="flex items-start justify-between gap-4 py-5">
                        <div><div className="text-sm font-semibold text-on-surface">{item.label}</div><div className="text-xs text-on-surface-variant mt-0.5">{item.desc}</div></div>
                        <Toggle checked={item.value} onChange={item.set} />
                      </div>
                    ))}
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Délai de session (minutes)</label>
                    <div className="flex items-center gap-3">
                      <input type="number" min="5" max="480" value={sessionTimeout} onChange={e => setSessionTimeout(Number(e.target.value))} className="w-28 bg-surface-container border border-outline-variant/20 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary/40 transition-all" />
                      <span className="text-sm text-on-surface-variant">minutes</span>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-white/5">
                    <button onClick={() => setToast({ message: 'Lien de réinitialisation envoyé.', type: 'success' })} className="px-6 py-3 border border-outline-variant/20 bg-surface-container text-on-surface font-bold rounded-xl hover:bg-surface-container-high transition-all text-sm">Changer le mot de passe</button>
                  </div>
                </div>
                <div className="bg-surface-container-low rounded-2xl border border-red-500/20 p-8">
                  <h3 className="font-headline font-bold text-lg text-red-400 mb-1">Zone dangereuse</h3>
                  <p className="text-sm text-on-surface-variant mb-5">La suppression de votre compte est irréversible. Tous vos devis seront définitivement perdus.</p>
                  <button onClick={() => setToast({ message: 'Contactez le support pour supprimer votre compte.', type: 'info' })} className="px-6 py-3 border border-red-500/30 text-red-400 font-bold rounded-xl hover:bg-red-500/10 transition-all text-sm">Supprimer mon compte</button>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="bg-surface-container-low rounded-2xl border border-white/5 p-8 space-y-6">
                <div>
                  <h2 className="font-headline font-bold text-xl text-on-surface mb-1">Notifications</h2>
                  <p className="text-sm text-on-surface-variant">Choisissez les emails que vous souhaitez recevoir.</p>
                </div>
                <div className="space-y-0 divide-y divide-white/5">
                  {[
                    { key: 'devisGenere',    label: 'Devis généré avec succès',               desc: 'Reçu à chaque nouveau devis créé.'              },
                    { key: 'erreurAnalyse',  label: "Erreur lors de l'analyse",               desc: "Si l'IA ne parvient pas à lire votre CCTP."     },
                    { key: 'renouvellement', label: "Rappel de renouvellement d'abonnement",  desc: "14 jours avant l'expiration."                   },
                    { key: 'nouvelles',      label: 'Nouvelles fonctionnalités',              desc: 'Mises à jour et nouvelles versions.'             },
                    { key: 'conseils',       label: 'Conseils et bonnes pratiques',           desc: 'Astuces pour optimiser vos devis.'              },
                  ].map(item => (
                    <div key={item.key} className="flex items-center justify-between gap-4 py-5">
                      <div><div className="text-sm font-semibold text-on-surface">{item.label}</div><div className="text-xs text-on-surface-variant mt-0.5">{item.desc}</div></div>
                      <Toggle checked={notifs[item.key as keyof typeof notifs]} onChange={v => setNotifs(n => ({ ...n, [item.key]: v }))} />
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t border-white/5">
                  <button onClick={handleSave} className="px-6 py-3 bg-primary-container text-on-primary-container font-bold rounded-xl hover:shadow-[0_0_20px_rgba(212,255,58,0.3)] transition-all">Enregistrer les préférences</button>
                </div>
              </div>
            )}

          </Animate>
        </div>
      </div>

      {connectModalOpen && (
        <SupplierConnectModal
          initialSupplierId={connectModalId ?? undefined}
          onClose={() => { setConnectModalOpen(false); setConnectModalId(null) }}
        />
      )}

      {showPaywall && (
        <PaywallModal
          onClose={() => setShowPaywall(false)}
          onSubscribed={() => setToast({ message: 'Abonnement activé.', type: 'success' })}
          reason={sub?.plan === 'trial' ? 'trial-used' : 'upgrade'}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </AppLayout>
  )
}
