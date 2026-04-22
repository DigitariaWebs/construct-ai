// Who is using the app right now — role, primary org, and the org currently
// being viewed. Admins can impersonate any org for support/service work;
// owners and members stay in their own org.
//
// Visibility model:
//   admin  — sees all orgs, all quotes, all supplier accounts.
//            `activeOrgId` controls which org the admin is *acting as*.
//   owner  — sees everything inside their org (all employees' quotes).
//   member — sees only quotes they created.
//
// Persists the active persona in localStorage so role-switching demos
// survive reloads.

'use client'

import { ADMIN_ORG_ID, DEFAULT_SUBSCRIBER_ORG_ID } from './orgs'

const STORAGE_KEY = 'pc_current_user_v1'

export type Role = 'admin' | 'owner' | 'member'

export type User = {
  id: string
  name: string
  email: string
  initials: string
  role: Role
  /** The org this user belongs to by default. */
  primaryOrgId: string
  /**
   * The org the user is currently viewing. For admins this may be a
   * different org (impersonation). For non-admins it always equals
   * primaryOrgId.
   */
  activeOrgId: string
}

export const SEED_USERS: User[] = [
  {
    id: 'u-admin',
    name: 'Jean-Marc Bertrand',
    email: 'jm@plombia-chiffrage.fr',
    initials: 'JB',
    role: 'admin',
    primaryOrgId: ADMIN_ORG_ID,
    activeOrgId: ADMIN_ORG_ID,
  },
  {
    id: 'u-owner',
    name: 'Thomas Morel',
    email: 'thomas@morel-plomberie.fr',
    initials: 'TM',
    role: 'owner',
    primaryOrgId: DEFAULT_SUBSCRIBER_ORG_ID,
    activeOrgId: DEFAULT_SUBSCRIBER_ORG_ID,
  },
  {
    id: 'u-member',
    name: 'Lucie Benoît',
    email: 'lucie@morel-plomberie.fr',
    initials: 'LB',
    role: 'member',
    primaryOrgId: DEFAULT_SUBSCRIBER_ORG_ID,
    activeOrgId: DEFAULT_SUBSCRIBER_ORG_ID,
  },
]

const DEFAULT_USER = SEED_USERS[0]

type Listener = (u: User) => void
const listeners = new Set<Listener>()

function safeLoad(): User {
  if (typeof window === 'undefined') return DEFAULT_USER
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_USER))
      return DEFAULT_USER
    }
    const parsed = JSON.parse(raw) as User
    if (!parsed || !parsed.id) return DEFAULT_USER
    // If this id matches a demo seed, re-hydrate from the seed so renames
    // stay coherent. Otherwise trust what's stored — it's a real signup
    // (via registerSubscriberOwner) that won't appear in SEED_USERS.
    const seed = SEED_USERS.find(u => u.id === parsed.id)
    if (seed) return { ...seed, activeOrgId: parsed.activeOrgId || seed.primaryOrgId }
    return parsed
  } catch {
    return DEFAULT_USER
  }
}

function safeSave(u: User) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(u))
  } catch { /* ignore */ }
  listeners.forEach(fn => fn(u))
}

export function getCurrentUser(): User {
  return safeLoad()
}

export function getActiveOrgId(): string {
  return safeLoad().activeOrgId
}

export function subscribeCurrentUser(cb: Listener): () => void {
  listeners.add(cb)
  return () => { listeners.delete(cb) }
}

/** Swap identities (dev/demo role switcher). Resets activeOrgId to primary. */
export function switchUser(userId: string): User {
  const seed = SEED_USERS.find(u => u.id === userId) ?? DEFAULT_USER
  const next: User = { ...seed, activeOrgId: seed.primaryOrgId }
  safeSave(next)
  return next
}

/**
 * Admin-only: act as a different org (e.g. switch into a service-client
 * workspace). No-op for non-admins.
 */
export function setActiveOrg(orgId: string): User {
  const u = safeLoad()
  if (u.role !== 'admin' && orgId !== u.primaryOrgId) return u
  const next: User = { ...u, activeOrgId: orgId }
  safeSave(next)
  return next
}

export function resetToPrimaryOrg(): User {
  const u = safeLoad()
  return setActiveOrg(u.primaryOrgId)
}

/**
 * Signup path: mint a fresh owner user bound to the org just created in
 * `createSubscriberOrg`, and persist it as the current session. Unlike
 * `switchUser` this doesn't lean on SEED_USERS — the user is brand new.
 */
export function registerSubscriberOwner(input: {
  name: string
  email: string
  orgId: string
}): User {
  const trimmed = input.name.trim() || input.email.split('@')[0]
  const user: User = {
    id: `u-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    name: trimmed,
    email: input.email.trim(),
    initials: deriveInitials(trimmed),
    role: 'owner',
    primaryOrgId: input.orgId,
    activeOrgId: input.orgId,
  }
  safeSave(user)
  return user
}

function deriveInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '??'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

/** Is the admin currently impersonating a different org? */
export function isImpersonating(u: User): boolean {
  return u.role === 'admin' && u.activeOrgId !== u.primaryOrgId
}

export const ROLE_LABELS: Record<Role, string> = {
  admin:  'Opérateur',
  owner:  'Propriétaire',
  member: 'Collaborateur',
}
