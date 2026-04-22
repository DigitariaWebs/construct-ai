'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { getSubscription, PLAN_LABELS, subscribeSubscription, type Plan } from '@/lib/subscription'
import {
  getCurrentUser,
  isImpersonating,
  resetToPrimaryOrg,
  ROLE_LABELS,
  SEED_USERS,
  setActiveOrg,
  subscribeCurrentUser,
  switchUser,
  type Role,
  type User,
} from '@/lib/currentUser'
import {
  getAllOrgs,
  getOrg,
  ORG_KIND_LABELS,
  subscribeOrgs,
  type Org,
} from '@/lib/orgs'

type NavLink = { href: string; labelKey: string; roles: readonly Role[] }

const baseLinks: NavLink[] = [
  { href: '/',          labelKey: 'home',     roles: ['admin', 'owner', 'member'] },
  { href: '/dashboard', labelKey: 'insights', roles: ['admin', 'owner', 'member'] },
  { href: '/projects',  labelKey: 'projects', roles: ['admin', 'owner', 'member'] },
  { href: '/catalog',   labelKey: 'catalog',  roles: ['admin', 'owner', 'member'] },
]

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { t, locale, setLocale } = useLanguage()

  const [menuOpen, setMenuOpen]   = useState(false)
  const [switchOpen, setSwitchOpen] = useState(false)
  const [plan, setPlan] = useState<Plan>('trial')
  // Initial state must match SSR output exactly. getCurrentUser() reads
  // localStorage on the client, which would diverge from the server's
  // DEFAULT_USER and cause a hydration mismatch. Seed with the same default
  // the server uses, then hydrate the real persona in useEffect.
  const [user, setUser] = useState<User>(SEED_USERS[0])
  const [orgs, setOrgs] = useState<Org[]>([])
  const [mounted, setMounted] = useState(false)
  const menuRef   = useRef<HTMLDivElement>(null)
  const switchRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    setPlan(getSubscription().plan)
    return subscribeSubscription(s => setPlan(s.plan))
  }, [])

  useEffect(() => {
    setUser(getCurrentUser())
    return subscribeCurrentUser(u => setUser({ ...u }))
  }, [])

  useEffect(() => {
    setOrgs(getAllOrgs())
    return subscribeOrgs(o => setOrgs([...o]))
  }, [])

  useEffect(() => { setMenuOpen(false); setSwitchOpen(false) }, [pathname])

  useEffect(() => {
    if (!menuOpen && !switchOpen) return
    const onDown = (e: MouseEvent) => {
      if (menuRef.current   && !menuRef.current.contains(e.target as Node))   setMenuOpen(false)
      if (switchRef.current && !switchRef.current.contains(e.target as Node)) setSwitchOpen(false)
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setMenuOpen(false); setSwitchOpen(false) } }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [menuOpen, switchOpen])

  const activeOrg    = getOrg(user.activeOrgId)
  const primaryOrg   = getOrg(user.primaryOrgId)
  const impersonating = isImpersonating(user)

  const navLinks = useMemo(() => {
    const links = baseLinks.filter(l => l.roles.includes(user.role))
    // Hide the service-desk link while the admin is impersonating a client —
    // the nav should mirror what that client would see.
    if (user.role === 'admin' && !isImpersonating(user)) {
      links.push({ href: '/service-clients', labelKey: 'serviceClients', roles: ['admin'] as const })
    }
    return links
  }, [user.role, user.activeOrgId, user.primaryOrgId])

  const menuItems: { href?: string; onClick?: () => void; icon: string; label: string; danger?: boolean }[] = [
    { href: '/profile',   icon: 'account_circle', label: t.nav.myProfile },
    { href: '/settings',  icon: 'tune',           label: t.nav.settings },
    { href: '/settings?tab=abonnement', icon: 'credit_card', label: t.nav.billing },
    { onClick: () => router.push('/auth'), icon: 'logout', label: t.nav.signOut, danger: true },
  ]

  const roleLabel = ROLE_LABELS[user.role]
  const serviceClientOrgs = orgs.filter(o => o.kind === 'service_client')

  return (
    <>
    <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 py-4 bg-black/60 backdrop-blur-xl border-b border-white/5 shadow-[0_4px_40px_rgba(212,255,58,0.08)]">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-3 group">
        <span className="material-symbols-outlined text-on-surface text-2xl">architecture</span>
        <span className="font-headline font-black text-on-surface tracking-tighter text-lg uppercase">
          PLOMBIA CHIFFRAGE
        </span>
      </Link>

      {/* Desktop nav */}
      <nav className="hidden md:flex flex-1 items-center justify-center gap-6">
        {navLinks.map(({ href, labelKey }) => {
          const active = href === '/' ? pathname === '/' : (pathname === href || pathname.startsWith(`${href}/`))
          const label = (t.nav as Record<string, string>)[labelKey] || labelKey
          return (
            <Link
              key={href}
              href={href}
              className={`relative font-headline font-bold text-[13px] tracking-[0.2em] uppercase transition-all duration-300 px-4 py-2 rounded-xl group/link ${
                active
                  ? 'text-primary bg-primary/10'
                  : 'text-on-surface-variant hover:bg-white/5 hover:text-on-surface'
              }`}
            >
              {label}
              {active && (
                <span className="absolute -bottom-[21px] left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_rgba(212,255,58,0.8)]" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Right cluster */}
      <div className="flex items-center gap-3">
        {/* Persona / role switcher pill */}
        <div ref={switchRef} className="relative">
          <button
            type="button"
            onClick={() => { setSwitchOpen(v => !v); setMenuOpen(false) }}
            aria-haspopup="menu"
            aria-expanded={switchOpen}
            className={`hidden sm:flex items-center gap-2 h-10 pl-3 pr-2.5 rounded-full border text-xs font-bold tracking-wider transition-all ${
              user.role === 'admin'
                ? 'border-primary/40 bg-primary/10 text-primary hover:shadow-[0_0_20px_rgba(212,255,58,0.2)]'
                : 'border-outline-variant/30 bg-surface-container-highest/70 text-on-surface hover:border-primary/40'
            }`}
            title={t.nav.switchIdentity}
          >
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
              {user.role === 'admin' ? 'admin_panel_settings' : user.role === 'owner' ? 'business_center' : 'person'}
            </span>
            <span className="hidden md:inline uppercase tracking-widest text-[10px]">{roleLabel}</span>
            <span className="material-symbols-outlined text-sm opacity-60">expand_more</span>
          </button>

          {switchOpen && (
            <div
              role="menu"
              className="absolute right-0 mt-3 w-80 origin-top-right rounded-2xl border border-white/5 bg-surface-container-low/95 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden animate-[fadeIn_0.15s_ease-out] z-50"
            >
              <div className="px-4 py-3 border-b border-white/5">
                <div className="text-[10px] font-black uppercase tracking-[0.25em] text-on-surface-variant">
                  {t.nav.switchPersonaTitle}
                </div>
                <div className="text-[11px] text-on-surface-variant/70 mt-1 leading-relaxed">
                  {t.nav.switchPersonaDesc}
                </div>
              </div>
              <nav className="p-2 space-y-1">
                {SEED_USERS.map(u => {
                  const org = getOrg(u.primaryOrgId)
                  const active = u.id === user.id
                  return (
                    <button
                      key={u.id}
                      onClick={() => { switchUser(u.id); setSwitchOpen(false); window.location.reload() }}
                      className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                        active
                          ? 'bg-primary/10 border border-primary/25'
                          : 'hover:bg-surface-container border border-transparent'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-headline font-black text-[10px] shrink-0 ${
                        active ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface'
                      }`}>{u.initials}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-bold text-on-surface truncate">{u.name}</div>
                          <span className={`shrink-0 text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-widest ${
                            u.role === 'admin' ? 'bg-primary/15 text-primary' : 'bg-white/5 text-on-surface-variant'
                          }`}>{ROLE_LABELS[u.role]}</span>
                        </div>
                        <div className="text-[10px] text-on-surface-variant mt-0.5 truncate">
                          {org?.name ?? '—'} · {u.email}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </nav>

              {user.role === 'admin' && serviceClientOrgs.length > 0 && (
                <>
                  <div className="px-4 pt-3 pb-2 border-t border-white/5">
                    <div className="text-[10px] font-black uppercase tracking-[0.25em] text-on-surface-variant">
                      {t.nav.viewAsClientHeader}
                    </div>
                  </div>
                  <nav className="p-2 pt-0 space-y-1 max-h-64 overflow-y-auto">
                    <button
                      onClick={() => { resetToPrimaryOrg(); setSwitchOpen(false); window.location.reload() }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-colors ${
                        !impersonating ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-surface-container'
                      }`}
                    >
                      <span className="material-symbols-outlined text-sm">home</span>
                      <span className="text-xs font-bold">{t.nav.adminWorkspace}</span>
                    </button>
                    {serviceClientOrgs.map(o => (
                      <button
                        key={o.id}
                        onClick={() => { setActiveOrg(o.id); setSwitchOpen(false); window.location.reload() }}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-colors ${
                          user.activeOrgId === o.id ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-surface-container'
                        }`}
                      >
                        <span className="material-symbols-outlined text-sm">handshake</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold truncate">{o.name}</div>
                          <div className="text-[10px] text-on-surface-variant/70 truncate">
                            {o.contactName ?? ORG_KIND_LABELS[o.kind]}
                          </div>
                        </div>
                      </button>
                    ))}
                  </nav>
                </>
              )}
            </div>
          )}
        </div>

        <button
          onClick={() => setLocale(locale === 'en' ? 'fr' : 'en')}
          className="h-10 px-3 rounded-full border border-outline-variant/30 bg-surface-container-highest/70 text-on-surface text-xs font-bold tracking-widest hover:border-primary/40 hover:text-primary transition-colors"
          aria-label={t.nav.switchLanguage}
        >
          {locale === 'en' ? 'FR' : 'EN'}
        </button>

        {/* Avatar + menu */}
        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={() => { setMenuOpen(v => !v); setSwitchOpen(false) }}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label={t.nav.openUserMenu}
            className={`h-10 w-10 rounded-full bg-surface-container-highest border border-outline-variant overflow-hidden cursor-pointer transition-all flex items-center justify-center font-headline font-black text-xs ${
              menuOpen ? 'ring-2 ring-primary ring-offset-2 ring-offset-black' : 'hover:ring-2 hover:ring-primary hover:ring-offset-2 hover:ring-offset-black'
            }`}
          >
            <span className="text-primary">{user.initials}</span>
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 mt-3 w-72 origin-top-right rounded-2xl border border-white/5 bg-surface-container-low/95 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden animate-[fadeIn_0.15s_ease-out]"
            >
              {/* Header */}
              <div className="p-4 border-b border-white/5 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center font-headline font-black text-sm text-primary flex-shrink-0">
                  {user.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-on-surface truncate">{user.name}</div>
                  <div className="text-[11px] text-on-surface-variant truncate">{user.email}</div>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${
                      user.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-white/5 text-on-surface-variant'
                    }`}>
                      <span className="w-1 h-1 rounded-full bg-current" /> {roleLabel}
                    </span>
                    {user.role !== 'admin' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest bg-primary/10 text-primary">
                        Plan {PLAN_LABELS[plan]}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Items */}
              <nav className="p-2">
                {menuItems.map(item => {
                  const cls = `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    item.danger
                      ? 'text-red-400 hover:bg-red-500/10'
                      : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                  }`
                  const body = (
                    <>
                      <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                      <span>{item.label}</span>
                    </>
                  )
                  return item.href
                    ? <Link key={item.label} href={item.href} role="menuitem" className={cls}>{body}</Link>
                    : <button key={item.label} type="button" role="menuitem" onClick={item.onClick} className={cls}>{body}</button>
                })}
              </nav>
            </div>
          )}
        </div>
      </div>
    </header>

    {/* Impersonation banner — only visible when an admin is "viewing as" a client. */}
    {mounted && impersonating && (
      <div className="fixed top-[72px] left-0 w-full z-40 bg-primary/10 border-b border-primary/30 backdrop-blur-xl">
        <div className="max-w-screen-2xl mx-auto px-6 py-2.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>visibility</span>
            <div className="min-w-0 text-xs">
              <span className="text-on-surface-variant">
                {t.nav.impersonationViewing}
              </span>{' '}
              <span className="font-bold text-primary truncate">{activeOrg?.name ?? user.activeOrgId}</span>
              <span className="text-on-surface-variant/70 mx-2">·</span>
              <span className="text-on-surface-variant">
                {t.nav.impersonationBackTo}{' '}
                <span className="text-on-surface">{primaryOrg?.name ?? 'admin'}</span>
              </span>
            </div>
          </div>
          <button
            onClick={() => { resetToPrimaryOrg(); window.location.reload() }}
            className="shrink-0 px-3 py-1.5 rounded-lg bg-primary text-on-primary text-[10px] font-black uppercase tracking-widest hover:shadow-[0_0_16px_rgba(212,255,58,0.4)] transition-all"
          >
            {t.nav.impersonationExit}
          </button>
        </div>
      </div>
    )}
    </>
  )
}
