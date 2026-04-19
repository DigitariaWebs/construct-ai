// Client-side trial + subscription store.
//
// The product gives every new account one free quote. Beyond that,
// the UI gates new quote creation behind a paywall until the user
// activates a paid plan. Persistence is localStorage-only — matches
// the rest of this demo (see lib/supplierAccounts.ts).

'use client'

const STORAGE_KEY = 'pc_subscription_v1'

export type Plan = 'trial' | 'pro' | 'team' | 'enterprise'

export type Subscription = {
  plan: Plan
  quotesUsed: number
  trialQuotesAllowed: number
  activatedAt: number
}

export const DEFAULT_TRIAL: Subscription = {
  plan: 'trial',
  quotesUsed: 0,
  trialQuotesAllowed: 1,
  activatedAt: 0,
}

type Listener = (s: Subscription) => void
const listeners = new Set<Listener>()

function safeLoad(): Subscription {
  if (typeof window === 'undefined') return DEFAULT_TRIAL
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_TRIAL
    const parsed = JSON.parse(raw) as Partial<Subscription>
    return { ...DEFAULT_TRIAL, ...parsed }
  } catch {
    return DEFAULT_TRIAL
  }
}

function safeSave(s: Subscription) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
  } catch { /* quota or privacy mode — ignore */ }
  listeners.forEach(fn => fn(s))
}

export function getSubscription(): Subscription {
  return safeLoad()
}

export function subscribeSubscription(cb: Listener): () => void {
  listeners.add(cb)
  return () => { listeners.delete(cb) }
}

export function canCreateQuote(): boolean {
  const s = safeLoad()
  if (s.plan !== 'trial') return true
  return s.quotesUsed < s.trialQuotesAllowed
}

export function remainingTrialQuotes(): number {
  const s = safeLoad()
  if (s.plan !== 'trial') return Infinity
  return Math.max(0, s.trialQuotesAllowed - s.quotesUsed)
}

export function recordQuoteUsed(): void {
  const s = safeLoad()
  safeSave({ ...s, quotesUsed: s.quotesUsed + 1 })
}

export function activatePlan(plan: Exclude<Plan, 'trial'>): Subscription {
  const s = safeLoad()
  const next: Subscription = { ...s, plan, activatedAt: Date.now() }
  safeSave(next)
  return next
}

export function downgradeToTrial(): void {
  const s = safeLoad()
  safeSave({ ...s, plan: 'trial' })
}

export function initTrial(): void {
  safeSave({ ...DEFAULT_TRIAL, activatedAt: Date.now() })
}

export const PLAN_LABELS: Record<Plan, string> = {
  trial:      'Essai',
  pro:        'Pro',
  team:       'Team',
  enterprise: 'Enterprise',
}

export const PAID_PLANS: {
  id: Exclude<Plan, 'trial'>
  name: string
  price: string
  per: string
  tag: string
  features: string[]
  featured?: boolean
}[] = [
  {
    id: 'pro',
    name: 'Pro',
    price: '49 €',
    per: '/ mois',
    tag: 'Pour les indépendants',
    features: [
      'Devis illimités',
      '4 fournisseurs inclus',
      'Export PDF',
      'Analyse CCTP automatique',
    ],
    featured: true,
  },
  {
    id: 'team',
    name: 'Team',
    price: '129 €',
    per: '/ mois',
    tag: 'Pour les équipes',
    features: [
      'Tout le plan Pro',
      'Jusqu\u2019à 5 utilisateurs',
      'Comptes fournisseurs partagés',
      'Support prioritaire',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Sur devis',
    per: '',
    tag: 'Organisations',
    features: [
      'Utilisateurs illimités',
      'SSO + SLA',
      'Onboarding dédié',
      'Prix fournisseurs sur mesure',
    ],
  },
]
