// Shared supplier data — used by UploadModal (selection) and QuotePage (pricing)
// prices index: [PER Ø32mm/ml, PVC Ø100/ml, WC suspendu/U, Chaudière gaz/U, VMC hygro B/U]

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
    name: 'IA Optimisé',
    sub: 'Meilleur prix marché combiné',
    initials: 'IA',
    tier: 'AUTO',
    tierColor: 'text-primary bg-primary/10',
    rating: 4.9,
    deliveryDays: 3,
    prices: [16.80, 10.20, 370.00, 1820.00, 285.00],
  },
  {
    id: 'cdo',
    name: 'CEDEO',
    sub: 'Plomberie & sanitaires',
    initials: 'CED',
    tier: 'TIER 1',
    tierColor: 'text-emerald-400 bg-emerald-400/10',
    rating: 4.8,
    deliveryDays: 2,
    prices: [17.20, 10.50, 385.00, 1850.00, 295.00],
  },
  {
    id: 'pim',
    name: 'Pum Plastique',
    sub: 'Raccords et tubes PVC',
    initials: 'PP',
    tier: 'TIER 1',
    tierColor: 'text-emerald-400 bg-emerald-400/10',
    rating: 4.7,
    deliveryDays: 3,
    prices: [16.50, 9.80, 365.00, 1795.00, 279.00],
  },
  {
    id: 'richardson',
    name: 'Richardson',
    sub: 'Fournitures multi-secteurs',
    initials: 'RC',
    tier: 'TIER 1',
    tierColor: 'text-emerald-400 bg-emerald-400/10',
    rating: 4.6,
    deliveryDays: 4,
    prices: [16.90, 10.10, 375.00, 1830.00, 289.00],
  },
  {
    id: 'marplin',
    name: 'Marplin',
    sub: 'Plomberie & CVC',
    initials: 'MP',
    tier: 'TIER 2',
    tierColor: 'text-secondary bg-secondary/10',
    rating: 4.5,
    deliveryDays: 5,
    prices: [15.90, 9.60, 355.00, 1770.00, 270.00],
  },
]

export const SESSION_KEY = 'df_selected_supplier'
