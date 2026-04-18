'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import AppLayout from '@/components/AppLayout'
import Modal from '@/components/Modal'
import Toast from '@/components/Toast'
import Animate from '@/components/Animate'
import UploadModal from '@/components/UploadModal'

type QuoteStatus = 'finalisé' | 'brouillon' | 'envoyé' | 'archivé'

type Quote = {
  id: string
  projectName: string
  lot: string
  date: string
  supplier: string
  supplierInitials: string
  status: QuoteStatus
  lineItems: number
  totalHT: number
  sector: string
}

const MOCK_QUOTES: Quote[] = [
  { id: 'q-001', projectName: 'Résidence Les Pins — Réhabilitation',  lot: 'Lot 09 — Plomberie · Chauffage · VMC', date: '10/04/2026', supplier: 'CDO',         supplierInitials: 'CDO', status: 'finalisé', lineItems: 24, totalHT: 28450,  sector: 'Plomberie' },
  { id: 'q-002', projectName: 'Copropriété Bellevue — Neuf',          lot: 'Lot 09 — Plomberie · Sanitaires',      date: '05/04/2026', supplier: 'Pim Plastic',  supplierInitials: 'PP',  status: 'envoyé',   lineItems: 31, totalHT: 42180,  sector: 'Plomberie' },
  { id: 'q-003', projectName: 'TERRALIA Verdun — 27 logements',       lot: 'Lot 09 — Plomberie · Chauffage · VMC', date: '28/03/2026', supplier: 'IA Optimisé',  supplierInitials: 'IA',  status: 'brouillon',lineItems: 47, totalHT: 89600,  sector: 'CVC'       },
  { id: 'q-004', projectName: 'Mont Saint Martin — 32 logements',     lot: 'Lot 09 — Plomberie · CVC',             date: '15/03/2026', supplier: 'CDO',         supplierInitials: 'CDO', status: 'finalisé', lineItems: 38, totalHT: 67340,  sector: 'Plomberie' },
  { id: 'q-005', projectName: 'HLM Quartier Nord — Remplacement',     lot: 'Lot 09 — Chauffage gaz individuel',    date: '20/02/2026', supplier: 'Marplin',     supplierInitials: 'MP',  status: 'archivé',  lineItems: 12, totalHT: 15200,  sector: 'CVC'       },
  { id: 'q-006', projectName: 'Bureaux SNC RCT-EST Jarny',            lot: 'Lot 09 — Plancher chauffant collectif',date: '08/02/2026', supplier: 'CDO',         supplierInitials: 'CDO', status: 'envoyé',   lineItems: 19, totalHT: 23760,  sector: 'CVC'       },
  { id: 'q-007', projectName: 'Résidence Miribel Verdun',             lot: 'Lot 09 — Plomberie · VMC hygro B',     date: '30/01/2026', supplier: 'Pim Plastic',  supplierInitials: 'PP',  status: 'finalisé', lineItems: 29, totalHT: 51890,  sector: 'Plomberie' },
  { id: 'q-008', projectName: 'Maison individuelle Pompey',           lot: 'Lot 09 — Plomberie neuf',              date: '15/01/2026', supplier: 'Richardson',  supplierInitials: 'RC',  status: 'brouillon',lineItems: 16, totalHT: 8940,   sector: 'Plomberie' },
]

const STATUS_CONFIG: Record<QuoteStatus, { label: string; classes: string; dot: string }> = {
  finalisé:  { label: 'Finalisé',  classes: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20', dot: 'bg-emerald-500'       },
  brouillon: { label: 'Brouillon', classes: 'bg-surface-container text-on-surface-variant border border-outline-variant/20', dot: 'bg-on-surface-variant' },
  envoyé:    { label: 'Envoyé',    classes: 'bg-primary/10 text-primary border border-primary/20',             dot: 'bg-primary'           },
  archivé:   { label: 'Archivé',   classes: 'bg-surface-container text-outline border border-outline-variant/10', dot: 'bg-outline'        },
}

function fmtEur(n: number) {
  return n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 })
}

export default function ProjectsPage() {
  const router = useRouter()
  const [quotes, setQuotes]             = useState<Quote[]>(MOCK_QUOTES)
  const [search, setSearch]             = useState('')
  const [filterStatus, setFilterStatus] = useState<QuoteStatus | 'tous'>('tous')
  const [filterSector, setFilterSector] = useState<'tous' | 'Plomberie' | 'CVC'>('tous')
  const [viewMode, setViewMode]         = useState<'table' | 'grid'>('table')
  const [deleteTarget, setDeleteTarget] = useState<Quote | null>(null)
  const [showUpload, setShowUpload]     = useState(false)
  const [toast, setToast]               = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

  const filtered = quotes.filter(q => {
    const matchSearch  = q.projectName.toLowerCase().includes(search.toLowerCase()) || q.lot.toLowerCase().includes(search.toLowerCase())
    const matchStatus  = filterStatus === 'tous' || q.status === filterStatus
    const matchSector  = filterSector === 'tous' || q.sector === filterSector
    return matchSearch && matchStatus && matchSector
  })

  const handleDelete    = (q: Quote) => { setQuotes(p => p.filter(x => x.id !== q.id)); setDeleteTarget(null); setToast({ message: `Devis "${q.projectName}" supprimé.`, type: 'info' }) }
  const handleDuplicate = (q: Quote) => { const copy = { ...q, id: `q-${Date.now()}`, projectName: `${q.projectName} (Copie)`, status: 'brouillon' as QuoteStatus, date: new Date().toLocaleDateString('fr-FR') }; setQuotes(p => [copy, ...p]); setToast({ message: 'Devis dupliqué.', type: 'success' }) }

  const totalHT    = quotes.reduce((s, q) => s + q.totalHT, 0)
  const finalisés  = quotes.filter(q => q.status === 'finalisé').length
  const brouillons = quotes.filter(q => q.status === 'brouillon').length

  return (
    <AppLayout>
      <div className="pb-32 space-y-8">

        <Animate variant="fade-up" as="section" className="pt-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-primary font-headline font-bold tracking-widest text-[10px] uppercase">Mes devis</span>
              <h1 className="text-4xl md:text-5xl font-headline font-black tracking-tighter text-on-surface mt-1">{quotes.length} devis</h1>
              <p className="text-on-surface-variant mt-1 text-sm">{finalisés} finalisés · {brouillons} brouillons</p>
            </div>
            <button onClick={() => setShowUpload(true)} className="whitespace-nowrap bg-primary-container text-on-primary-container px-8 py-4 rounded-xl font-headline font-black uppercase tracking-widest shadow-lg shadow-primary-container/20 hover:scale-[1.02] active:scale-95 transition-all duration-300 flex items-center gap-2">
              <span className="material-symbols-outlined text-xl">add</span>Nouveau devis
            </button>
          </div>
        </Animate>

        <Animate variant="fade-up" delay={60} as="section">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total devis',      value: quotes.length.toString(), icon: 'description',  color: 'text-primary'           },
              { label: 'Finalisés',        value: finalisés.toString(),     icon: 'check_circle',  color: 'text-emerald-400'       },
              { label: 'Brouillons',       value: brouillons.toString(),    icon: 'edit_note',     color: 'text-on-surface-variant' },
              { label: 'Montant total HT', value: fmtEur(totalHT),         icon: 'payments',      color: 'text-tertiary'          },
            ].map((s, i) => (
              <Animate key={s.label} variant="scale-up" delay={i * 60} className="bg-surface-container rounded-2xl p-5 border border-outline-variant/10">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{s.label}</span>
                  <span className={`material-symbols-outlined text-sm ${s.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
                </div>
                <div className={`text-2xl font-headline font-black tracking-tight ${s.color}`}>{s.value}</div>
              </Animate>
            ))}
          </div>
        </Animate>

        <Animate variant="fade-up" delay={80} as="section">
          <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
            <div className="relative flex-1 max-w-sm">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
              <input type="text" placeholder="Rechercher un projet…" value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-surface-container border border-outline-variant/20 rounded-xl pl-9 pr-4 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-on-surface-variant" />
            </div>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as QuoteStatus | 'tous')} className="bg-surface-container border border-outline-variant/20 rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary/40 transition-all">
              <option value="tous">Tous les statuts</option>
              <option value="finalisé">Finalisé</option>
              <option value="envoyé">Envoyé</option>
              <option value="brouillon">Brouillon</option>
              <option value="archivé">Archivé</option>
            </select>
            <select value={filterSector} onChange={e => setFilterSector(e.target.value as typeof filterSector)} className="bg-surface-container border border-outline-variant/20 rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary/40 transition-all">
              <option value="tous">Tous les secteurs</option>
              <option value="Plomberie">Plomberie</option>
              <option value="CVC">CVC / Chauffage</option>
            </select>
            <div className="ml-auto flex items-center gap-1 bg-surface-container rounded-xl p-1 border border-outline-variant/10">
              <button onClick={() => setViewMode('table')} className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}><span className="material-symbols-outlined text-sm">table_rows</span></button>
              <button onClick={() => setViewMode('grid')}  className={`p-2 rounded-lg transition-all ${viewMode === 'grid'  ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}><span className="material-symbols-outlined text-sm">grid_view</span></button>
            </div>
          </div>
        </Animate>

        {viewMode === 'table' && (
          <Animate variant="fade-up" delay={100} as="section">
            {filtered.length === 0 ? (
              <div className="bg-surface-container-low rounded-2xl border border-white/5 p-16 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4"><span className="material-symbols-outlined text-primary text-3xl">description</span></div>
                <h3 className="font-headline font-bold text-xl text-on-surface mb-2">{search ? 'Aucun résultat' : 'Aucun devis'}</h3>
                <p className="text-on-surface-variant text-sm max-w-xs mb-6">{search ? 'Essayez d\'autres termes.' : 'Créez votre premier devis en uploadant un CCTP.'}</p>
                {!search && <button onClick={() => setShowUpload(true)} className="px-6 py-3 bg-primary-container text-on-primary-container font-bold rounded-xl hover:shadow-[0_0_20px_rgba(212,255,58,0.3)] transition-all">Nouveau devis</button>}
              </div>
            ) : (
              <div className="bg-surface-container-low rounded-2xl border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-white/5 bg-surface-container">
                        <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">Projet</th>
                        <th className="px-4 py-4 text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">Date</th>
                        <th className="px-4 py-4 text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">Fournisseur</th>
                        <th className="px-4 py-4 text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">Postes</th>
                        <th className="px-4 py-4 text-[10px] uppercase tracking-widest font-bold text-on-surface-variant text-right">Total HT</th>
                        <th className="px-4 py-4 text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">Statut</th>
                        <th className="px-4 py-4 text-[10px] uppercase tracking-widest font-bold text-on-surface-variant text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filtered.map((q, i) => {
                        const sc = STATUS_CONFIG[q.status]
                        return (
                          <Animate key={q.id} as="tr" variant="fade-up" delay={i * 30} className="hover:bg-surface-container-high transition-colors group cursor-pointer" onClick={() => router.push('/quote')}>
                            <td className="px-6 py-4">
                              <div className="font-semibold text-sm text-on-surface group-hover:text-primary transition-colors">{q.projectName}</div>
                              <div className="text-[10px] text-on-surface-variant mt-0.5">{q.lot}</div>
                            </td>
                            <td className="px-4 py-4"><span className="text-sm font-mono text-on-surface-variant">{q.date}</span></td>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-lg bg-surface-container-high text-on-surface flex items-center justify-center font-headline font-black text-[8px]">{q.supplierInitials}</div>
                                <span className="text-sm text-on-surface-variant">{q.supplier}</span>
                              </div>
                            </td>
                            <td className="px-4 py-4"><span className="text-sm font-mono text-on-surface-variant">{q.lineItems}</span></td>
                            <td className="px-4 py-4 text-right"><span className="text-sm font-mono font-bold text-on-surface">{fmtEur(q.totalHT)}</span></td>
                            <td className="px-4 py-4" onClick={e => e.stopPropagation()}>
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${sc.classes}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />{sc.label}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-center" onClick={e => e.stopPropagation()}>
                              <div className="flex items-center justify-center gap-1">
                                <Link href="/quote" className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-all"><span className="material-symbols-outlined text-sm">visibility</span></Link>
                                <button onClick={() => handleDuplicate(q)} className="p-1.5 rounded-lg text-on-surface-variant hover:text-secondary hover:bg-secondary/10 transition-all"><span className="material-symbols-outlined text-sm">content_copy</span></button>
                                <button onClick={() => setDeleteTarget(q)} className="p-1.5 rounded-lg text-on-surface-variant hover:text-red-400 hover:bg-red-500/10 transition-all"><span className="material-symbols-outlined text-sm">delete</span></button>
                              </div>
                            </td>
                          </Animate>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </Animate>
        )}

        {viewMode === 'grid' && (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((q, i) => {
              const sc = STATUS_CONFIG[q.status]
              return (
                <Animate key={q.id} variant="fade-up" delay={i * 50}>
                  <div className="bg-surface-container rounded-2xl border border-outline-variant/10 p-6 hover:border-primary/30 hover:-translate-y-1 transition-all duration-300 cursor-pointer group" onClick={() => router.push('/quote')}>
                    <div className="flex justify-between items-start mb-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${sc.classes}`}><span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />{sc.label}</span>
                      <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                        <button onClick={() => handleDuplicate(q)} className="p-1 rounded-lg text-on-surface-variant hover:text-secondary transition-colors"><span className="material-symbols-outlined text-sm">content_copy</span></button>
                        <button onClick={() => setDeleteTarget(q)}  className="p-1 rounded-lg text-on-surface-variant hover:text-red-400 transition-colors"><span className="material-symbols-outlined text-sm">delete</span></button>
                      </div>
                    </div>
                    <h3 className="font-headline font-bold text-base text-on-surface group-hover:text-primary transition-colors mb-1">{q.projectName}</h3>
                    <p className="text-[11px] text-on-surface-variant mb-4">{q.lot}</p>
                    <div className="text-3xl font-headline font-black tracking-tight text-on-surface mb-1">{fmtEur(q.totalHT)}</div>
                    <p className="text-[10px] text-on-surface-variant mb-4">HT · {q.lineItems} postes</p>
                    <div className="flex items-center justify-between text-[10px] text-on-surface-variant border-t border-white/5 pt-4">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-md bg-surface-container-high flex items-center justify-center font-headline font-black text-[7px]">{q.supplierInitials}</div>
                        <span>{q.supplier}</span>
                      </div>
                      <span className="font-mono">{q.date}</span>
                    </div>
                  </div>
                </Animate>
              )
            })}
          </section>
        )}
      </div>

      {deleteTarget && (
        <Modal title="Supprimer ce devis ?" onClose={() => setDeleteTarget(null)}>
          <div className="space-y-6">
            <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-xl">
              <p className="text-sm text-on-surface font-semibold">{deleteTarget.projectName}</p>
              <p className="text-xs text-on-surface-variant mt-1">{deleteTarget.lot} · {fmtEur(deleteTarget.totalHT)} HT</p>
            </div>
            <p className="text-sm text-on-surface-variant">Cette action est irréversible. Le devis sera définitivement supprimé.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 py-3 rounded-xl border border-outline-variant/20 text-on-surface-variant font-bold hover:bg-surface-container-high transition-all">Annuler</button>
              <button onClick={() => handleDelete(deleteTarget)} className="flex-1 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-bold hover:bg-red-500/20 transition-all">Supprimer</button>
            </div>
          </div>
        </Modal>
      )}

      {showUpload && <UploadModal onClose={() => setShowUpload(false)} />}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </AppLayout>
  )
}
