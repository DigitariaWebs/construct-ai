// Shared supplier data — used by UploadModal (selection) and QuotePage (pricing)
// prices index: [Steel Beams, Concrete Mix, Glass Paneling, Electrical, Plumbing]

export type Supplier = {
  id: string
  name: string
  sub: string
  initials: string
  tier: string
  tierColor: string
  rating: number
  deliveryDays: number
  prices: [number, number, number, number, number]
}

export const SUPPLIERS: Supplier[] = [
  {
    id: 'auto',
    name: 'AI Optimized',
    sub: 'Best blended market rate',
    initials: 'AI',
    tier: 'AUTO',
    tierColor: 'text-primary bg-primary/10',
    rating: 4.9,
    deliveryDays: 3,
    prices: [1240, 115, 45.00, 8.40, 1010],
  },
  {
    id: 'atlas',
    name: 'Atlas Steel',
    sub: 'Structural specialist',
    initials: 'AS',
    tier: 'TIER 1',
    tierColor: 'text-emerald-400 bg-emerald-400/10',
    rating: 4.8,
    deliveryDays: 2,
    prices: [1185, 120, 46.00, 8.75, 1040],
  },
  {
    id: 'cdo',
    name: 'CDO Comptoir',
    sub: 'Full-range distributor',
    initials: 'CDO',
    tier: 'TIER 1',
    tierColor: 'text-emerald-400 bg-emerald-400/10',
    rating: 4.7,
    deliveryDays: 4,
    prices: [1260, 109, 43.50, 8.10, 975],
  },
  {
    id: 'corebuild',
    name: 'CoreBuild',
    sub: 'Concrete & civil works',
    initials: 'CB',
    tier: 'TIER 2',
    tierColor: 'text-secondary bg-secondary/10',
    rating: 4.5,
    deliveryDays: 5,
    prices: [1295, 96, 47.50, 9.05, 955],
  },
  {
    id: 'richardson',
    name: 'Richardson',
    sub: 'MEP & electrical',
    initials: 'RC',
    tier: 'TIER 1',
    tierColor: 'text-emerald-400 bg-emerald-400/10',
    rating: 4.6,
    deliveryDays: 3,
    prices: [1255, 117, 44.00, 7.65, 998],
  },
]

export const SESSION_KEY = 'df_selected_supplier'
