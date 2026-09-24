import React from 'react'
import { cn } from './cn'

export function SkipLink({ cielId = 'obsah' }: { cielId?: string }) {
  return (
    <a href={`#${cielId}`} className="preskocit-odkaz">
      Preskočiť na hlavný obsah
    </a>
  )
}

export function Card({
  children,
  className,
  as: Tag = 'div',
}: {
  children: React.ReactNode
  className?: string
  as?: 'div' | 'section' | 'article' | 'li'
}) {
  return (
    <Tag
      className={cn(
        'rounded-card border border-line bg-surface shadow-card tlac-strana',
        className,
      )}
    >
      {children}
    </Tag>
  )
}

export function PageHeader({
  nadpis,
  popis,
  akcie,
  className,
}: {
  nadpis: string
  popis?: string
  akcie?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between', className)}>
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold sm:text-3xl">{nadpis}</h1>
        {popis ? <p className="mt-1 max-w-prose text-ink-muted">{popis}</p> : null}
      </div>
      {akcie ? <div className="flex shrink-0 flex-wrap gap-2 netlacit">{akcie}</div> : null}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Tabuľka                                                              */
/* ------------------------------------------------------------------ */

export function Table({
  popis,
  children,
  className,
}: {
  popis: string
  children: React.ReactNode
  className?: string
}) {
  return (
    // Oblasť sa dá posúvať aj klávesnicou, preto má tabIndex a vlastný popis.
    <div
      className="overflow-x-auto"
      tabIndex={0}
      role="region"
      aria-label={popis}
    >
      <table className={cn('w-full min-w-[680px] border-collapse text-sm', className)}>
        <caption className="sr-only">{popis}</caption>
        {children}
      </table>
    </div>
  )
}

export function Th({
  children,
  className,
  scope = 'col',
  ...rest
}: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      scope={scope}
      className={cn(
        'sticky top-0 z-10 border-b border-line bg-canvas px-3 py-2.5 text-left font-semibold text-ink-muted',
        className,
      )}
      {...rest}
    >
      {children}
    </th>
  )
}

export function Td({
  children,
  className,
  ...rest
}: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={cn('border-b border-line px-3 py-2.5 align-middle', className)} {...rest}>
      {children}
    </td>
  )
}

/* ------------------------------------------------------------------ */

export function Pagination({
  strana,
  naStranu,
  spolu,
  onZmena,
}: {
  strana: number
  naStranu: number
  spolu: number
  onZmena: (s: number) => void
}) {
  const stran = Math.max(1, Math.ceil(spolu / naStranu))
  if (spolu === 0) return null
  const od = (strana - 1) * naStranu + 1
  const do_ = Math.min(strana * naStranu, spolu)
  return (
    <nav
      aria-label="Stránkovanie"
      className="flex flex-wrap items-center justify-between gap-3 pt-3 text-sm netlacit"
    >
      <p className="text-ink-muted" aria-live="polite">
        Zobrazujeme {od} až {do_} z {spolu}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onZmena(strana - 1)}
          disabled={strana <= 1}
          className="min-h-[36px] cursor-pointer rounded-control border border-line px-3 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Predchádzajúca
        </button>
        <span className="text-ink-muted">
          Strana {strana} z {stran}
        </span>
        <button
          type="button"
          onClick={() => onZmena(strana + 1)}
          disabled={strana >= stran}
          className="min-h-[36px] cursor-pointer rounded-control border border-line px-3 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Ďalšia
        </button>
      </div>
    </nav>
  )
}

/* ------------------------------------------------------------------ */

export function Steps({
  kroky,
  aktivny,
}: {
  kroky: { id: string; nazov: string }[]
  aktivny: number
}) {
  return (
    <nav aria-label="Priebeh vypĺňania" className="netlacit">
      <p className="mb-2 text-sm font-medium text-ink-muted" aria-live="polite">
        Krok {aktivny + 1} z {kroky.length}: {kroky[aktivny]?.nazov}
      </p>
      <ol className="flex flex-wrap gap-1.5">
        {kroky.map((k, i) => {
          const hotovy = i < aktivny
          const teraz = i === aktivny
          return (
            <li key={k.id} className="flex-1 basis-16">
              <span
                className={cn(
                  'block h-1.5 rounded-full',
                  hotovy ? 'bg-primary' : teraz ? 'bg-primary/60' : 'bg-line',
                )}
              />
              <span className="sr-only">
                {k.nazov}
                {hotovy ? ', hotové' : teraz ? ', prebieha' : ', čaká'}
              </span>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export function DefinitionList({
  polozky,
  className,
}: {
  polozky: { label: string; hodnota: React.ReactNode }[]
  className?: string
}) {
  return (
    <dl className={cn('grid gap-x-6 gap-y-3 sm:grid-cols-2', className)}>
      {polozky.map((p, i) => (
        <div key={`${p.label}-${i}`} className="min-w-0">
          <dt className="text-xs font-medium uppercase tracking-wide text-ink-faint">
            {p.label}
          </dt>
          <dd className="mt-0.5 break-words text-ink">
            {p.hodnota === '' || p.hodnota === null || p.hodnota === undefined ? (
              <span className="text-ink-faint">Neuvedené</span>
            ) : (
              p.hodnota
            )}
          </dd>
        </div>
      ))}
    </dl>
  )
}
