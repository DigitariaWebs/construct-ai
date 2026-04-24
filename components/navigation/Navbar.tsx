'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { getSubscription, PLAN_LABELS, subscribeSubscription, type Plan } from '@/features/subscription/store'
import { useAuth } from '@/features/auth/AuthProvider'
import { signOut } from '@/features/auth/api'

// Roles for visibility filtering. `admin` is platform-level (Jean); `owner`
// and `member` are per-account membership roles.
type Role = 'admin' | 'owner' | 'member'
type NavLink = { href: string; labelKey: string; roles: readonly Role[] }

const ROLE_LABELS: Record<Role, string> = {
  admin: 'Opérateur',
  owner: 'Propriétaire',
  member: 'Collaborateur',
}

const baseLinks: NavLink[] = [
  { href: '/',          labelKey: 'home',     roles: ['admin', 'owner', 'member'] },
  { href: '/dashboard', labelKey: 'insights', roles: ['admin', 'owner', 'member'] },
  { href: '/projects',  labelKey: 'projects', roles: ['admin', 'owner', 'member'] },
  { href: '/catalog',   labelKey: 'catalog',  roles: ['admin', 'owner', 'member'] },
]

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { t } = useLanguage()
  const { data: auth, isLoading } = useAuth()

  const [menuOpen, setMenuOpen] = useState(false)
  const [plan, setPlan] = useState<Plan>('trial')
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setPlan(getSubscription().plan)
    return subscribeSubscription((s) => setPlan(s.plan))
  }, [])

  useEffect(() => { setMenuOpen(false) }, [pathname])

  useEffect(() => {
    if (!menuOpen) return
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  // Derived display values. While `auth` is null (loading or anonymous),
  // role is null and nav links collapse to empty — the public landing page
  // shows the brand + sign-in button only.
  const user = auth?.user ?? null
  const memberships = auth?.memberships ?? []
  const role: Role | null = user
    ? (user.isPlatformAdmin ? 'admin' : (memberships[0]?.role ?? 'member'))
    : null
  const initials = user ? deriveInitials(user.name, user.email) : ''
  const displayName = user?.name?.trim() || user?.email?.split('@')[0] || ''

  const navLinks = useMemo(() => {
    if (!role) return []
    const links = baseLinks.filter((l) => l.roles.includes(role))
    if (role === 'admin') {
      links.push({ href: '/service-clients', labelKey: 'serviceClients', roles: ['admin'] as const })
    }
    return links
  }, [role])

  const handleSignOut = async () => {
    setMenuOpen(false)
    await signOut()
    router.push('/auth')
    router.refresh()
  }

  const menuItems: { href?: string; onClick?: () => void; icon: string; label: string; danger?: boolean }[] = [
    { href: '/profile',   icon: 'account_circle', label: t.nav.myProfile },
    { href: '/settings',  icon: 'tune',           label: t.nav.settings },
    { href: '/settings?tab=abonnement', icon: 'credit_card', label: t.nav.billing },
    { onClick: handleSignOut, icon: 'logout', label: t.nav.signOut, danger: true },
  ]

  const roleLabel = role ? ROLE_LABELS[role] : ''

  return (
    <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 py-4 bg-black/60 backdrop-blur-xl border-b border-white/5 shadow-[0_4px_40px_rgba(212,255,58,0.08)]">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-3 group">
        <span className="material-symbols-outlined text-on-surface text-2xl">architecture</span>
        <span className="font-headline font-black text-on-surface tracking-tighter text-lg uppercase">
          PLOMBIA CHIFFRAGE
        </span>
      </Link>

      {/* Desktop nav (only when signed in) */}
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
        {/* Avatar + menu (signed in) OR Sign-in button (anonymous) */}
        {user ? (
          <div ref={menuRef} className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-label={t.nav.openUserMenu}
              className={`h-10 w-10 rounded-full bg-surface-container-highest border border-outline-variant overflow-hidden cursor-pointer transition-all flex items-center justify-center font-headline font-black text-xs ${
                menuOpen ? 'ring-2 ring-primary ring-offset-2 ring-offset-black' : 'hover:ring-2 hover:ring-primary hover:ring-offset-2 hover:ring-offset-black'
              }`}
            >
              <span className="text-primary">{initials}</span>
            </button>

            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-3 w-72 origin-top-right rounded-2xl border border-white/5 bg-surface-container-low/95 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden animate-[fadeIn_0.15s_ease-out]"
              >
                {/* Header */}
                <div className="p-4 border-b border-white/5 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center font-headline font-black text-sm text-primary flex-shrink-0">
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-on-surface truncate">{displayName}</div>
                    <div className="text-[11px] text-on-surface-variant truncate">{user.email}</div>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${
                        role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-white/5 text-on-surface-variant'
                      }`}>
                        <span className="w-1 h-1 rounded-full bg-current" /> {roleLabel}
                      </span>
                      {role !== 'admin' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest bg-primary/10 text-primary">
                          Plan {PLAN_LABELS[plan]}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Items */}
                <nav className="p-2">
                  {menuItems.map((item) => {
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
        ) : (
          // Anonymous (or auth still loading): a single sign-in CTA. While
          // `isLoading` we render the same CTA to avoid layout shift; the
          // user lands on /auth either way.
          <Link
            href="/auth"
            className={`h-10 px-4 rounded-full border border-primary/40 bg-primary/10 text-primary text-xs font-bold tracking-widest hover:bg-primary/15 transition-colors flex items-center ${
              isLoading ? 'opacity-60' : ''
            }`}
          >
            {(t.nav as Record<string, string | undefined>).signIn ?? 'Sign in'}
          </Link>
        )}
      </div>
    </header>
  )
}

function deriveInitials(name: string | null, email: string): string {
  const source = (name?.trim() || email.split('@')[0])
  const parts = source.split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '??'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}
