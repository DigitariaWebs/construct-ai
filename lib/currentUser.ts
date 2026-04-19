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
    email: 'jm@plombier-chiffrage.fr',
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
    // Defensive: find seed by id so any stale state (e.g. renamed) stays coherent.
    const seed = SEED_USERS.find(u => u.id === parsed.id)
    if (!seed) return DEFAULT_USER
    return { ...seed, activeOrgId: parsed.activeOrgId || seed.primaryOrgId }
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

/** Is the admin currently impersonating a different org? */
export function isImpersonating(u: User): boolean {
  return u.role === 'admin' && u.activeOrgId !== u.primaryOrgId
}

export const ROLE_LABELS: Record<Role, string> = {
  admin:  'Opérateur',
  owner:  'Propriétaire',
  member: 'Collaborateur',
}
