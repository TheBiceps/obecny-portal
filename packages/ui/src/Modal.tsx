import React, { useEffect, useId, useRef } from 'react'
import { X } from 'lucide-react'
import { cn } from './cn'
import { Button } from './Button'

export interface ModalProps {
  otvorene: boolean
  nazov: string
  popis?: string
  onZavriet: () => void
  children?: React.ReactNode
  akcie?: React.ReactNode
  className?: string
}

/** Dialóg s pascou na fokus, zatvorí sa klávesom Escape. */
export function Modal({
  otvorene,
  nazov,
  popis,
  onZavriet,
  children,
  akcie,
  className,
}: ModalProps) {
  const ref = useRef<HTMLDivElement>(null)
  const nazovId = useId()
  const popisId = useId()

  useEffect(() => {
    if (!otvorene) return
    const predtym = document.activeElement as HTMLElement | null
    const prvy = ref.current?.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    )
    prvy?.focus()

    function naKlaves(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onZavriet()
        return
      }
      if (e.key !== 'Tab' || !ref.current) return
      const prvky = Array.from(
        ref.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => el.offsetParent !== null)
      if (prvky.length === 0) return
      const prvyPrvok = prvky[0]
      const poslednyPrvok = prvky[prvky.length - 1]
      if (e.shiftKey && document.activeElement === prvyPrvok) {
        e.preventDefault()
        poslednyPrvok.focus()
      } else if (!e.shiftKey && document.activeElement === poslednyPrvok) {
        e.preventDefault()
        prvyPrvok.focus()
      }
    }

    document.addEventListener('keydown', naKlaves)
    const povodne = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', naKlaves)
      document.body.style.overflow = povodne
      predtym?.focus?.()
    }
  }, [otvorene, onZavriet])

  if (!otvorene) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4 netlacit">
      <div
        className="absolute inset-0 bg-ink/50"
        onClick={onZavriet}
        aria-hidden="true"
      />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={nazovId}
        aria-describedby={popis ? popisId : undefined}
        className={cn(
          'relative w-full max-w-lg rounded-t-card bg-surface p-5 shadow-pop sm:rounded-card',
          className,
        )}
      >
        <div className="mb-3 flex items-start justify-between gap-4">
          <h2 id={nazovId} className="text-lg font-semibold">
            {nazov}
          </h2>
          <button
            type="button"
            onClick={onZavriet}
            aria-label="Zavrieť okno"
            className="-mr-1 -mt-1 flex h-9 w-9 cursor-pointer items-center justify-center rounded-control text-ink-muted hover:bg-canvas"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        {popis ? (
          <p id={popisId} className="mb-4 text-sm text-ink-muted">
            {popis}
          </p>
        ) : null}
        {children}
        {akcie ? <div className="mt-5 flex flex-wrap justify-end gap-2">{akcie}</div> : null}
      </div>
    </div>
  )
}

export function ConfirmModal({
  otvorene,
  nazov,
  popis,
  potvrditText = 'Potvrdiť',
  zrusitText = 'Zrušiť',
  nebezpecne,
  onPotvrdit,
  onZavriet,
  children,
}: {
  otvorene: boolean
  nazov: string
  popis?: string
  potvrditText?: string
  zrusitText?: string
  nebezpecne?: boolean
  onPotvrdit: () => void
  onZavriet: () => void
  children?: React.ReactNode
}) {
  return (
    <Modal
      otvorene={otvorene}
      nazov={nazov}
      popis={popis}
      onZavriet={onZavriet}
      akcie={
        <>
          <Button variant="secondary" onClick={onZavriet}>
            {zrusitText}
          </Button>
          <Button variant={nebezpecne ? 'danger' : 'primary'} onClick={onPotvrdit}>
            {potvrditText}
          </Button>
        </>
      }
    >
      {children}
    </Modal>
  )
}
