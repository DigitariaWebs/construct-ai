// Admin-only "Service desk" — Jean-Marc's view of every non-subscriber he's
// running quotes for, with per-client billing status and a one-click
// "Start a quote for this client" flow.

'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import AppLayout from '@/components/AppLayout'
import Animate from '@/components/Animate'
import Modal from '@/components/Modal'
import Toast from '@/components/Toast'
import { useLanguage } from '@/contexts/LanguageContext'
import {
  createServiceClientOrg,
  deleteOrg,
  getAllOrgs,
  getOrg,
  subscribeOrgs,
  updateOrg,
  type Org,
} from '@/lib/orgs'
import {
  getCurrentUser,
  resetToPrimaryOrg,
  setActiveOrg,
  subscribeCurrentUser,
  type User,
} from '@/lib/currentUser'
import {
  getAllQuotes,
  getNextInvoiceNumber,
  subscribeQuotes,
  updateQuote,
  type Quote,
} from '@/lib/quoteRegistry'
import { generateInvoicePdf } from '@/lib/generateInvoicePdf'

function fmtEur(n: number, locale: 'fr' | 'en') {
  return n.toLocaleString(locale === 'fr' ? 'fr-FR' : 'en-US', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 })
}
function fmtDate(ts: number, locale: 'fr' | 'en') {
  return new Date(ts).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })
}

// Simple {token} interpolation helper — keeps translation strings readable.
function fill(tmpl: string, vars: Record<string, string>): string {
  return tmpl.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? `{${k}}`)
}

type ClientStats = {
  quoteCount: number
  totalVolumeHT: number
  totalBilled: number
  totalPending: number
  lastActivity: number | null
}

function computeStats(orgId: string, quotes: Quote[]): ClientStats {
  const forOrg = quotes.filter(q => q.orgId === orgId)
  let totalBilled = 0, totalPending = 0, lastActivity: number | null = null
  for (const q of forOrg) {
    const amount = q.billing?.amount ?? 0
    if (q.billing?.invoicedAt) totalBilled += amount
    else if (q.billing?.mode === 'per_quote') totalPending += amount
    const parsed = parseFrenchDate(q.date)
    if (parsed && (!lastActivity || parsed > lastActivity)) lastActivity = parsed
  }
  return {
    quoteCount: forOrg.length,
    totalVolumeHT: forOrg.reduce((s, q) => s + q.totalHT, 0),
    totalBilled,
    totalPending,
    lastActivity,
  }
}

function parseFrenchDate(s: string): number | null {
  // "10/04/2026" → timestamp
  const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!m) return null
  const [, d, mo, y] = m
  return Date.parse(`${y}-${mo}-${d}`)
}

export default function ServiceClientsPage() {
  const router = useRouter()
  const { t, locale } = useLanguage()
  const [user, setUser]   = useState<User>(() => getCurrentUser())
  const [orgs, setOrgs]   = useState<Org[]>([])
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Org | null>(null)
  const [editTarget,   setEditTarget]   = useState<Org | null>(null)
  const [invoiceTarget, setInvoiceTarget] = useState<Quote | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

  useEffect(() => {
    setUser(getCurrentUser())
    return subscribeCurrentUser(u => setUser({ ...u }))
  }, [])
  useEffect(() => {
    setOrgs(getAllOrgs())
    return subscribeOrgs(o => setOrgs([...o]))
  }, [])
  useEffect(() => {
    setQuotes(getAllQuotes())
    return subscribeQuotes(q => setQuotes([...q]))
  }, [])

  const clients = useMemo(() => orgs.filter(o => o.kind === 'service_client'), [orgs])

  const aggregate = useMemo(() => {
    const statsByClient = new Map<string, ClientStats>()
    for (const c of clients) statsByClient.set(c.id, computeStats(c.id, quotes))
    let totalBilled = 0, totalPending = 0, totalQuotes = 0
    for (const s of statsByClient.values()) {
      totalBilled += s.totalBilled
      totalPending += s.totalPending
      totalQuotes += s.quoteCount
    }
    return { statsByClient, totalBilled, totalPending, totalQuotes }
  }, [clients, quotes])

  // Non-admin guard. Navigate them back to /dashboard after a beat.
  if (user.role !== 'admin') {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto py-24 text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-red-400 text-3xl">lock</span>
          </div>
          <h1 className="font-headline font-black text-3xl text-on-surface mb-3">{t.serviceClients.accessRestrictedTitle}</h1>
          <p className="text-on-surface-variant">
            {t.serviceClients.accessRestrictedDesc}
          </p>
          <Link href="/dashboard" className="mt-6 inline-block px-5 py-2.5 rounded-xl bg-primary text-on-primary font-black uppercase tracking-widest text-xs">
            {t.serviceClients.backLink}
          </Link>
        </div>
      </AppLayout>
    )
  }

  const openAsClient = (orgId: string) => {
    setActiveOrg(orgId)
    router.push('/projects')
  }

  const startQuoteForClient = (orgId: string) => {
    setActiveOrg(orgId)
    router.push('/dashboard')
  }

  const issueInvoice = (q: Quote, input: { amountHT: number; vatRate: number; note?: string }) => {
    const org = getOrg(q.orgId)
    const invoiceNumber = getNextInvoiceNumber()
    const issuedAt = new Date()

    // Generate + download the PDF first; if it throws we don't mutate state.
    generateInvoicePdf({
      invoiceNumber,
      issuedAt,
      devisNumber: q.id,
      mission:   { projectName: q.projectName, lot: q.lot },
      amountHT:  input.amountHT,
      vatRate:   input.vatRate,
      note:      input.note,
      locale,
      labels:    t.invoice,
      billee: {
        name:         org?.name ?? q.orgId,
        contactName:  org?.contactName,
        contactEmail: org?.contactEmail,
      },
    })

    updateQuote(q.id, {
      billing: {
        mode:          'per_quote',
        amount:        input.amountHT,
        vatRate:       input.vatRate,
        note:          input.note,
        invoiceNumber,
        invoicedAt:    issuedAt.getTime(),
      },
    })
    setInvoiceTarget(null)
    setToast({
      message: fill(t.serviceClients.toastInvoiceIssued, { number: invoiceNumber, name: org?.name ?? '—' }),
      type: 'success',
    })
  }

  const onDelete = (o: Org) => {
    deleteOrg(o.id)
    setDeleteTarget(null)
    setToast({ message: fill(t.serviceClients.toastDeleted, { name: o.name }), type: 'info' })
  }

  return (
    <AppLayout>
      <div className="pb-32 space-y-8">
        {/* Header */}
        <Animate variant="fade-up" as="section" className="pt-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-primary font-headline font-bold tracking-widest text-[10px] uppercase">{t.serviceClients.kicker}</span>
              <h1 className="text-4xl md:text-5xl font-headline font-black tracking-tighter text-on-surface mt-1">
                {t.serviceClients.pageTitle}
              </h1>
              <p className="text-on-surface-variant mt-1 text-sm">
                {t.serviceClients.pageDesc}
              </p>
            </div>
            <button
              onClick={() => setShowCreate(true)}
              className="whitespace-nowrap bg-primary-container text-on-primary-container px-8 py-4 rounded-xl font-headline font-black uppercase tracking-widest shadow-lg shadow-primary-container/20 hover:scale-[1.02] active:scale-95 transition-all duration-300 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-xl">person_add</span>
              {t.serviceClients.newClient}
            </button>
          </div>
        </Animate>

        {/* Aggregate KPIs */}
        <Animate variant="fade-up" delay={60} as="section">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: t.serviceClients.kpiClients, value: clients.length.toString(),          icon: 'handshake',   color: 'text-primary'         },
              { label: t.serviceClients.kpiQuotes,  value: aggregate.totalQuotes.toString(),   icon: 'description', color: 'text-secondary'       },
              { label: t.serviceClients.kpiBilled,  value: fmtEur(aggregate.totalBilled, locale), icon: 'paid',     color: 'text-emerald-400'     },
              { label: t.serviceClients.kpiPending, value: fmtEur(aggregate.totalPending, locale), icon: 'pending', color: 'text-amber-400'       },
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

        {/* Client list */}
        <Animate variant="fade-up" delay={100} as="section">
          {clients.length === 0 ? (
            <div className="bg-surface-container-low rounded-2xl border border-white/5 p-16 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-primary text-3xl">handshake</span>
              </div>
              <h3 className="font-headline font-bold text-xl text-on-surface mb-2">{t.serviceClients.emptyTitle}</h3>
              <p className="text-on-surface-variant text-sm max-w-sm mb-6">
                {t.serviceClients.emptyDesc}
              </p>
              <button
                onClick={() => setShowCreate(true)}
                className="px-6 py-3 bg-primary-container text-on-primary-container font-bold rounded-xl hover:shadow-[0_0_20px_rgba(212,255,58,0.3)] transition-all"
              >
                {t.serviceClients.createClient}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {clients.map((c, i) => {
                const stats = aggregate.statsByClient.get(c.id)!
                const clientQuotes = quotes.filter(q => q.orgId === c.id)
                return (
                  <Animate key={c.id} variant="fade-up" delay={i * 60}>
                    <div className="bg-surface-container-low rounded-2xl border border-white/5 overflow-hidden hover:border-primary/25 transition-colors">
                      {/* Head */}
                      <div className="p-6 flex flex-col md:flex-row md:items-center gap-4 border-b border-white/5">
                        <div className="w-12 h-12 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>handshake</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h2 className="font-headline font-bold text-lg text-on-surface truncate">{c.name}</h2>
                          <div className="text-xs text-on-surface-variant mt-0.5 flex items-center gap-2 flex-wrap">
                            {c.contactName && <span>{c.contactName}</span>}
                            {c.contactEmail && (
                              <>
                                <span className="text-on-surface-variant/40">·</span>
                                <a href={`mailto:${c.contactEmail}`} className="text-primary hover:underline">{c.contactEmail}</a>
                              </>
                            )}
                            <span className="text-on-surface-variant/40">·</span>
                            <span>{t.serviceClients.createdOnPrefix} {fmtDate(c.createdAt, locale)}</span>
                          </div>
                          {c.notes && <p className="text-[11px] text-on-surface-variant/70 mt-1.5 italic">{c.notes}</p>}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          <button
                            onClick={() => startQuoteForClient(c.id)}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-on-primary text-[11px] font-black uppercase tracking-widest hover:shadow-[0_0_20px_rgba(212,255,58,0.35)] transition-all"
                          >
                            <span className="material-symbols-outlined text-sm">bolt</span>
                            {t.serviceClients.newQuote}
                          </button>
                          <button
                            onClick={() => openAsClient(c.id)}
                            className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-outline-variant/20 bg-surface-container text-on-surface-variant hover:text-on-surface hover:border-primary/30 text-[11px] font-bold uppercase tracking-widest transition-all"
                          >
                            <span className="material-symbols-outlined text-sm">visibility</span>
                            {t.serviceClients.viewAsClient}
                          </button>
                          <button
                            onClick={() => setEditTarget(c)}
                            className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-outline-variant/20 bg-surface-container text-on-surface-variant hover:text-on-surface hover:border-primary/30 text-[11px] font-bold uppercase tracking-widest transition-all"
                          >
                            <span className="material-symbols-outlined text-sm">edit</span>
                            {t.common.edit}
                          </button>
                          <button
                            onClick={() => setDeleteTarget(c)}
                            className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-outline-variant/20 bg-surface-container text-on-surface-variant hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/5 text-[11px] font-bold uppercase tracking-widest transition-all"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                            {t.common.delete}
                          </button>
                        </div>
                      </div>

                      {/* Stats strip */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-0">
                        {[
                          { label: t.serviceClients.colDevis,     value: stats.quoteCount.toString()                                              },
                          { label: t.serviceClients.colVolumeHT,  value: fmtEur(stats.totalVolumeHT, locale)                                      },
                          { label: t.serviceClients.colBilled,    value: fmtEur(stats.totalBilled, locale),   color: 'text-emerald-400' },
                          { label: t.serviceClients.colPending,   value: fmtEur(stats.totalPending, locale),  color: stats.totalPending > 0 ? 'text-amber-400' : 'text-on-surface-variant' },
                        ].map(s => (
                          <div key={s.label} className="p-4 border-r border-white/5 last:border-r-0 bg-surface-container/30">
                            <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{s.label}</div>
                            <div className={`text-sm font-mono font-bold mt-1 ${s.color ?? 'text-on-surface'}`}>{s.value}</div>
                          </div>
                        ))}
                      </div>

                      {/* Quotes */}
                      {clientQuotes.length > 0 && (
                        <div className="border-t border-white/5">
                          <div className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                            {t.serviceClients.quotesSectionLabel} ({clientQuotes.length})
                          </div>
                          <div className="divide-y divide-white/5">
                            {clientQuotes.map(q => (
                              <div key={q.id} className="px-6 py-3 flex items-center gap-4 hover:bg-surface-container transition-colors">
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-semibold text-on-surface truncate">{q.projectName}</div>
                                  <div className="text-[11px] text-on-surface-variant truncate">{q.lot} · {q.date}</div>
                                </div>
                                <div className="text-xs font-mono font-bold text-on-surface shrink-0">{fmtEur(q.totalHT, locale)}</div>
                                {q.billing?.mode === 'per_quote' ? (
                                  q.billing.invoicedAt ? (
                                    <span
                                      className="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-widest"
                                      title={q.billing.invoiceNumber ? `${q.billing.invoiceNumber}` : undefined}
                                    >
                                      <span className="w-1 h-1 rounded-full bg-emerald-400" />
                                      {q.billing.invoiceNumber ? `${q.billing.invoiceNumber} · ` : ''}
                                      {fmtEur(q.billing.amount ?? 0, locale)}
                                    </span>
                                  ) : (
                                    <button
                                      onClick={() => setInvoiceTarget(q)}
                                      className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 text-[10px] font-black uppercase tracking-widest transition-colors border border-amber-500/20"
                                    >
                                      <span className="material-symbols-outlined text-[12px]">receipt_long</span>
                                      {q.billing.amount
                                        ? fill(t.serviceClients.invoiceAmount, { amount: fmtEur(q.billing.amount, locale) })
                                        : t.serviceClients.issueInvoice}
                                    </button>
                                  )
                                ) : null}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </Animate>
                )
              })}
            </div>
          )}
        </Animate>

        {/* Hint */}
        <Animate variant="fade-up" delay={160} as="section">
          <div className="p-5 rounded-2xl bg-surface-container-low border border-white/5 flex items-start gap-3">
            <span className="material-symbols-outlined text-primary text-xl shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>lightbulb</span>
            <div className="text-xs text-on-surface-variant leading-relaxed">
              {t.serviceClients.hint}&nbsp;
              <span className="text-on-surface font-semibold">{t.serviceClients.hintHighlight}</span>&nbsp;
              {t.serviceClients.hintSuffix}
            </div>
          </div>
        </Animate>
      </div>

      {showCreate && (
        <CreateClientModal
          managedByUserId={user.id}
          onClose={() => setShowCreate(false)}
          onCreated={(o) => {
            setShowCreate(false)
            setToast({ message: fill(t.serviceClients.toastCreated, { name: o.name }), type: 'success' })
          }}
        />
      )}

      {editTarget && (
        <EditClientModal
          org={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={(o) => {
            setEditTarget(null)
            setToast({ message: fill(t.serviceClients.toastUpdated, { name: o.name }), type: 'success' })
          }}
        />
      )}

      {invoiceTarget && (
        <InvoiceIssueModal
          quote={invoiceTarget}
          clientName={getOrg(invoiceTarget.orgId)?.name ?? invoiceTarget.orgId}
          onClose={() => setInvoiceTarget(null)}
          onIssue={(input) => issueInvoice(invoiceTarget, input)}
        />
      )}

      {deleteTarget && (
        <Modal title={fill(t.serviceClients.deleteTitle, { name: deleteTarget.name })} onClose={() => setDeleteTarget(null)}>
          <div className="space-y-6">
            <p className="text-sm text-on-surface-variant">
              {t.serviceClients.deleteDesc}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 py-3 rounded-xl border border-outline-variant/20 text-on-surface-variant font-bold hover:bg-surface-container-high transition-all">{t.common.cancel}</button>
              <button onClick={() => onDelete(deleteTarget)} className="flex-1 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-bold hover:bg-red-500/20 transition-all">{t.common.delete}</button>
            </div>
          </div>
        </Modal>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </AppLayout>
  )
}

// ─── Create / Edit client modals ────────────────────────────────────────────

function CreateClientModal({ managedByUserId, onClose, onCreated }: {
  managedByUserId: string
  onClose: () => void
  onCreated: (o: Org) => void
}) {
  const { t } = useLanguage()
  const [form, setForm] = useState({ name: '', contactName: '', contactEmail: '', notes: '' })
  const [error, setError] = useState('')

  const submit = () => {
    if (form.name.trim().length < 2) return setError(t.serviceClients.errorNameRequired)
    if (form.contactEmail && !/^\S+@\S+\.\S+$/.test(form.contactEmail)) return setError(t.serviceClients.errorEmailInvalid)
    const o = createServiceClientOrg({ ...form, managedByUserId })
    onCreated(o)
  }

  return (
    <Modal title={t.serviceClients.modalCreateTitle} onClose={onClose}>
      <div className="space-y-4">
        <LabeledInput label={t.serviceClients.formCompanyName} value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder={t.serviceClients.placeholderCompany} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <LabeledInput label={t.serviceClients.formContact} value={form.contactName}  onChange={v => setForm(f => ({ ...f, contactName: v }))} placeholder={t.serviceClients.placeholderContact} />
          <LabeledInput label={t.serviceClients.formEmail}   value={form.contactEmail} onChange={v => setForm(f => ({ ...f, contactEmail: v }))} placeholder={t.serviceClients.placeholderEmail} type="email" />
        </div>
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">{t.serviceClients.formNotes}</label>
          <textarea
            value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            rows={3}
            placeholder={t.serviceClients.placeholderNotes}
            className="w-full bg-surface-container border border-outline-variant/20 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all"
          />
        </div>
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold">
            <span className="material-symbols-outlined text-sm">error</span>{error}
          </div>
        )}
        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-outline-variant/20 text-on-surface-variant font-bold hover:bg-surface-container-high transition-all">{t.common.cancel}</button>
          <button onClick={submit} className="flex-1 py-3 rounded-xl bg-primary text-on-primary font-black uppercase tracking-widest text-xs hover:shadow-[0_0_20px_rgba(212,255,58,0.35)] transition-all">
            {t.serviceClients.ctaCreateClient}
          </button>
        </div>
      </div>
    </Modal>
  )
}

function EditClientModal({ org, onClose, onSaved }: {
  org: Org
  onClose: () => void
  onSaved: (o: Org) => void
}) {
  const { t } = useLanguage()
  const [form, setForm] = useState({
    name:         org.name,
    contactName:  org.contactName ?? '',
    contactEmail: org.contactEmail ?? '',
    notes:        org.notes ?? '',
  })
  const [error, setError] = useState('')

  const submit = () => {
    if (form.name.trim().length < 2) return setError(t.serviceClients.errorNameRequired)
    if (form.contactEmail && !/^\S+@\S+\.\S+$/.test(form.contactEmail)) return setError(t.serviceClients.errorEmailInvalid)
    updateOrg(org.id, { ...form })
    onSaved({ ...org, ...form })
  }

  return (
    <Modal title={fill(t.serviceClients.modalEditTitle, { name: org.name })} onClose={onClose}>
      <div className="space-y-4">
        <LabeledInput label={t.serviceClients.formCompanyName} value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <LabeledInput label={t.serviceClients.formContact} value={form.contactName}  onChange={v => setForm(f => ({ ...f, contactName: v }))} />
          <LabeledInput label={t.serviceClients.formEmail}   value={form.contactEmail} onChange={v => setForm(f => ({ ...f, contactEmail: v }))} type="email" />
        </div>
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">{t.serviceClients.formNotes}</label>
          <textarea
            value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            rows={3}
            className="w-full bg-surface-container border border-outline-variant/20 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all"
          />
        </div>
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold">
            <span className="material-symbols-outlined text-sm">error</span>{error}
          </div>
        )}
        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-outline-variant/20 text-on-surface-variant font-bold hover:bg-surface-container-high transition-all">{t.common.cancel}</button>
          <button onClick={submit} className="flex-1 py-3 rounded-xl bg-primary text-on-primary font-black uppercase tracking-widest text-xs hover:shadow-[0_0_20px_rgba(212,255,58,0.35)] transition-all">
            {t.serviceClients.ctaSaveClient}
          </button>
        </div>
      </div>
    </Modal>
  )
}

function InvoiceIssueModal({ quote, clientName, onClose, onIssue }: {
  quote: Quote
  clientName: string
  onClose: () => void
  onIssue: (input: { amountHT: number; vatRate: number; note?: string }) => void
}) {
  const { t, locale } = useLanguage()
  const [amountStr, setAmountStr] = useState((quote.billing?.amount ?? 0).toString())
  const [vatStr,    setVatStr]    = useState((quote.billing?.vatRate ?? 20).toString())
  const [note,      setNote]      = useState(quote.billing?.note ?? '')
  const [error,     setError]     = useState('')

  // Preview the number that will be assigned so Jean-Marc sees it before emitting.
  const previewNumber = useMemo(() => getNextInvoiceNumber(), [])

  const amountHT = Number(amountStr.replace(',', '.'))
  const vatRate  = Number(vatStr.replace(',', '.'))
  const tva      = Number.isFinite(amountHT) && Number.isFinite(vatRate) ? amountHT * (vatRate / 100) : 0
  const ttc      = Number.isFinite(amountHT) ? amountHT + tva : 0

  const submit = () => {
    if (!Number.isFinite(amountHT) || amountHT <= 0) return setError(t.serviceClients.invoiceErrorAmount)
    if (!Number.isFinite(vatRate)  || vatRate < 0 || vatRate > 100) return setError(t.serviceClients.invoiceErrorVat)
    onIssue({ amountHT, vatRate, note: note.trim() || undefined })
  }

  return (
    <Modal title={t.serviceClients.invoiceModalTitle} onClose={onClose}>
      <div className="space-y-4">
        {/* Context banner */}
        <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/20">
          <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1.5">
            {t.serviceClients.invoiceBilledTo}
          </div>
          <div className="text-sm font-bold text-on-surface">{clientName}</div>
          <div className="text-[11px] text-on-surface-variant mt-0.5 truncate">{quote.projectName}</div>
          <div className="text-[11px] text-on-surface-variant/70 truncate">{quote.lot}</div>
          <div className="mt-2 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest">
              <span className="material-symbols-outlined text-[12px]">receipt_long</span>
              {t.serviceClients.invoiceNumberBadge} {previewNumber}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <LabeledInput
            label={t.serviceClients.invoiceAmountHTLabel}
            value={amountStr}
            onChange={setAmountStr}
            placeholder="650"
            type="text"
          />
          <LabeledInput
            label={t.serviceClients.invoiceVatLabel}
            value={vatStr}
            onChange={setVatStr}
            placeholder="20"
            type="text"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">
            {t.serviceClients.invoiceNoteLabel}
          </label>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            rows={2}
            placeholder={t.serviceClients.invoiceNotePlaceholder}
            className="w-full bg-surface-container border border-outline-variant/20 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all"
          />
        </div>

        {/* Totals preview */}
        <div className="p-4 rounded-xl bg-surface-container-low border border-white/5 space-y-1.5">
          <Row label={t.serviceClients.invoiceTotalHT} value={fmtEur(Number.isFinite(amountHT) ? amountHT : 0, locale)} />
          <Row label={`${t.serviceClients.invoiceTVA} (${Number.isFinite(vatRate) ? vatRate : 0} %)`} value={fmtEur(tva, locale)} />
          <div className="h-px bg-white/5 my-1" />
          <Row label={t.serviceClients.invoiceTotalTTC} value={fmtEur(ttc, locale)} bold />
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold">
            <span className="material-symbols-outlined text-sm">error</span>{error}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-outline-variant/20 text-on-surface-variant font-bold hover:bg-surface-container-high transition-all">
            {t.common.cancel}
          </button>
          <button onClick={submit} className="flex-1 py-3 rounded-xl bg-primary text-on-primary font-black uppercase tracking-widest text-xs hover:shadow-[0_0_20px_rgba(212,255,58,0.35)] transition-all inline-flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[14px]">download</span>
            {t.serviceClients.invoiceSubmit}
          </button>
        </div>
      </div>
    </Modal>
  )
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-xs ${bold ? 'font-black uppercase tracking-widest text-on-surface' : 'text-on-surface-variant'}`}>{label}</span>
      <span className={`font-mono ${bold ? 'text-sm font-black text-primary' : 'text-xs text-on-surface'}`}>{value}</span>
    </div>
  )
}

function LabeledInput({ label, value, onChange, placeholder, type = 'text' }: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
}) {
  return (
    <div>
      <label className="block text-[11px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-surface-container border border-outline-variant/20 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all"
      />
    </div>
  )
}

// Silence unused import warnings without breaking circular refs in dev:
void resetToPrimaryOrg
