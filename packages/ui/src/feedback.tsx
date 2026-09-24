import React from 'react'
import { cn } from './cn'
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  Loader2,
  XCircle,
} from 'lucide-react'

type Ton = 'info' | 'uspech' | 'varovanie' | 'chyba'

const TONY: Record<Ton, { box: string; ikona: React.ElementType; farba: string }> = {
  info: { box: 'bg-primary-soft border-primary/30', ikona: Info, farba: 'text-primary-dark' },
  uspech: { box: 'bg-success-soft border-success/30', ikona: CheckCircle2, farba: 'text-success' },
  varovanie: { box: 'bg-warning-soft border-warning/30', ikona: AlertTriangle, farba: 'text-warning' },
  chyba: { box: 'bg-danger-soft border-danger/30', ikona: XCircle, farba: 'text-danger' },
}

export function Alert({
  ton = 'info',
  nadpis,
  children,
  className,
  role,
}: {
  ton?: Ton
  nadpis?: string
  children?: React.ReactNode
  className?: string
  role?: 'alert' | 'status'
}) {
  const t = TONY[ton]
  const Ikona = t.ikona
  return (
    <div
      role={role ?? (ton === 'chyba' ? 'alert' : 'status')}
      className={cn('flex gap-3 rounded-card border p-4', t.box, className)}
    >
      <Ikona className={cn('mt-0.5 h-5 w-5 shrink-0', t.farba)} aria-hidden="true" />
      <div className="min-w-0 text-sm text-ink">
        {nadpis ? <p className="mb-0.5 font-semibold">{nadpis}</p> : null}
        {children}
      </div>
    </div>
  )
}

const STAV_TRIEDY: Record<string, string> = {
  prijate: 'bg-primary-soft text-primary-dark border-primary/30',
  v_rieseni: 'bg-warning-soft text-warning border-warning/30',
  vybavene: 'bg-success-soft text-success border-success/30',
  zamietnute: 'bg-danger-soft text-danger border-danger/30',
}

export function Badge({
  children,
  ton = 'neutral',
  className,
}: {
  children: React.ReactNode
  ton?: 'neutral' | 'primary' | 'uspech' | 'varovanie' | 'chyba'
  className?: string
}) {
  const triedy: Record<string, string> = {
    neutral: 'bg-canvas text-ink-muted border-line',
    primary: 'bg-primary-soft text-primary-dark border-primary/30',
    uspech: 'bg-success-soft text-success border-success/30',
    varovanie: 'bg-warning-soft text-warning border-warning/30',
    chyba: 'bg-danger-soft text-danger border-danger/30',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium',
        triedy[ton],
        className,
      )}
    >
      {children}
    </span>
  )
}

export function StatusBadge({ stav, label }: { stav: string; label: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium',
        STAV_TRIEDY[stav] ?? 'bg-canvas text-ink-muted border-line',
      )}
    >
      {label}
    </span>
  )
}

export function Spinner({ popis = 'Načítavame' }: { popis?: string }) {
  return (
    <span role="status" className="inline-flex items-center gap-2 text-sm text-ink-muted">
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      {popis}
    </span>
  )
}

export function EmptyState({
  nadpis,
  popis,
  akcia,
}: {
  nadpis: string
  popis?: string
  akcia?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-card border border-dashed border-line bg-surface px-6 py-12 text-center">
      <h3 className="text-lg font-semibold text-ink">{nadpis}</h3>
      {popis ? <p className="max-w-prose text-sm text-ink-muted">{popis}</p> : null}
      {akcia}
    </div>
  )
}

/** Súhrn chýb nad formulárom, odkazy vedú priamo na chybné pole. */
export function ErrorSummary({
  chyby,
  nadpis = 'Skontrolujte prosím tieto polia',
}: {
  chyby: { fieldId: string; label: string; sprava: string }[]
  nadpis?: string
}) {
  if (chyby.length === 0) return null
  return (
    <div
      role="alert"
      tabIndex={-1}
      id="suhrn-chyb"
      className="rounded-card border border-danger/40 bg-danger-soft p-4"
    >
      <p className="mb-2 font-semibold text-danger">{nadpis}</p>
      <ul className="list-inside list-disc space-y-1 text-sm">
        {chyby.map((ch) => (
          <li key={ch.fieldId}>
            <a
              href={`#pole-${ch.fieldId}`}
              className="text-danger underline underline-offset-2"
              onClick={(e) => {
                e.preventDefault()
                const el = document.getElementById(`pole-${ch.fieldId}`)
                el?.scrollIntoView({ block: 'center' })
                ;(el as HTMLElement | null)?.focus?.()
              }}
            >
              {ch.label}: {ch.sprava}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
