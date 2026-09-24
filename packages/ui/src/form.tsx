import React, { createContext, useContext, useId } from 'react'
import { cn } from './cn'

/* ------------------------------------------------------------------ */
/* Obal poľa: viditeľný popis, pomocný text a chyba                     */
/* ------------------------------------------------------------------ */

interface FieldCtx {
  inputId: string
  helperId?: string
  errorId?: string
  maChybu: boolean
}
const Ctx = createContext<FieldCtx | null>(null)

export interface FieldProps {
  label: string
  helper?: string
  error?: string
  required?: boolean
  /** pole bolo doplnené automaticky z profilu alebo z nehnuteľnosti */
  doplnene?: boolean
  className?: string
  children: React.ReactNode
  /** id, ktoré sa pripojí k ovládaciemu prvku */
  htmlFor?: string
}

export function Field({
  label,
  helper,
  error,
  required,
  doplnene,
  className,
  children,
  htmlFor,
}: FieldProps) {
  const auto = useId()
  const inputId = htmlFor ?? auto
  const helperId = helper ? `${inputId}-popis` : undefined
  const errorId = error ? `${inputId}-chyba` : undefined

  return (
    <Ctx.Provider value={{ inputId, helperId, errorId, maChybu: Boolean(error) }}>
      <div className={cn('flex flex-col gap-1.5', className)}>
        <label htmlFor={inputId} className="text-sm font-medium text-ink">
          {label}
          {required === true ? (
            <span className="ml-1 text-danger" aria-hidden="true">
              *
            </span>
          ) : null}
          {required === false ? (
            <span className="ml-2 text-xs font-normal text-ink-faint">nepovinné</span>
          ) : null}
          {doplnene ? (
            <span className="ml-2 rounded-full bg-primary-soft px-2 py-0.5 text-xs font-normal text-primary-dark">
              vyplnené za vás
            </span>
          ) : null}
        </label>
        {helper ? (
          <p id={helperId} className="text-sm text-ink-muted">
            {helper}
          </p>
        ) : null}
        {children}
        {error ? (
          <p id={errorId} className="text-sm font-medium text-danger" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </Ctx.Provider>
  )
}

function useField() {
  return useContext(Ctx)
}

function opisy(f: FieldCtx | null) {
  const ids = [f?.helperId, f?.errorId].filter(Boolean)
  return ids.length ? ids.join(' ') : undefined
}

const ZAKLAD =
  'w-full rounded-control border bg-surface px-3 py-2.5 text-base text-ink transition-colors duration-150 placeholder:text-ink-faint disabled:bg-canvas disabled:text-ink-faint'

function ramik(maChybu: boolean) {
  return maChybu
    ? 'border-danger focus:border-danger'
    : 'border-line hover:border-ink-faint'
}

/* ------------------------------------------------------------------ */

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { doplnene?: boolean }
>(function Input({ className, doplnene, ...rest }, ref) {
  const f = useField()
  return (
    <input
      ref={ref}
      id={rest.id ?? f?.inputId}
      aria-invalid={f?.maChybu || undefined}
      aria-describedby={opisy(f)}
      data-autofilled={doplnene ? 'true' : undefined}
      className={cn(ZAKLAD, 'min-h-[44px]', ramik(Boolean(f?.maChybu)), className)}
      {...rest}
    />
  )
})

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, rows = 4, ...rest }, ref) {
  const f = useField()
  return (
    <textarea
      ref={ref}
      rows={rows}
      id={rest.id ?? f?.inputId}
      aria-invalid={f?.maChybu || undefined}
      aria-describedby={opisy(f)}
      className={cn(ZAKLAD, ramik(Boolean(f?.maChybu)), className)}
      {...rest}
    />
  )
})

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement> & { doplnene?: boolean }
>(function Select({ className, children, doplnene, ...rest }, ref) {
  const f = useField()
  return (
    <select
      ref={ref}
      id={rest.id ?? f?.inputId}
      aria-invalid={f?.maChybu || undefined}
      aria-describedby={opisy(f)}
      data-autofilled={doplnene ? 'true' : undefined}
      className={cn(ZAKLAD, 'min-h-[44px] cursor-pointer', ramik(Boolean(f?.maChybu)), className)}
      {...rest}
    >
      {children}
    </select>
  )
})

/* ------------------------------------------------------------------ */

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: React.ReactNode
  helper?: string
  error?: string
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox({ label, helper, error, className, ...rest }, ref) {
    const auto = useId()
    const inputId = rest.id ?? auto
    const helperId = helper ? `${inputId}-popis` : undefined
    const errorId = error ? `${inputId}-chyba` : undefined
    return (
      <div className={cn('flex flex-col gap-1.5', className)}>
        <div className="flex items-start gap-3">
          <input
            ref={ref}
            id={inputId}
            type="checkbox"
            aria-invalid={Boolean(error) || undefined}
            aria-describedby={[helperId, errorId].filter(Boolean).join(' ') || undefined}
            className={cn(
              'mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded border-2 accent-primary',
              error ? 'border-danger' : 'border-line',
            )}
            {...rest}
          />
          <label htmlFor={inputId} className="cursor-pointer text-sm text-ink">
            {label}
          </label>
        </div>
        {helper ? (
          <p id={helperId} className="pl-8 text-sm text-ink-muted">
            {helper}
          </p>
        ) : null}
        {error ? (
          <p id={errorId} className="pl-8 text-sm font-medium text-danger" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    )
  },
)

export interface RadioOption {
  value: string
  label: string
  helper?: string
}

export interface RadioGroupProps {
  legend: string
  name: string
  options: RadioOption[]
  value?: string
  onChange: (v: string) => void
  error?: string
  helper?: string
  required?: boolean
}

export function RadioGroup({
  legend,
  name,
  options,
  value,
  onChange,
  error,
  helper,
  required,
}: RadioGroupProps) {
  const auto = useId()
  const helperId = helper ? `${auto}-popis` : undefined
  const errorId = error ? `${auto}-chyba` : undefined
  return (
    <fieldset
      className="flex flex-col gap-2"
      aria-describedby={[helperId, errorId].filter(Boolean).join(' ') || undefined}
    >
      <legend className="text-sm font-medium text-ink">
        {legend}
        {required ? (
          <span className="ml-1 text-danger" aria-hidden="true">
            *
          </span>
        ) : null}
      </legend>
      {helper ? (
        <p id={helperId} className="text-sm text-ink-muted">
          {helper}
        </p>
      ) : null}
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {options.map((o) => {
          const oid = `${auto}-${o.value}`
          const vybrane = value === o.value
          return (
            <label
              key={o.value}
              htmlFor={oid}
              className={cn(
                'flex min-h-[44px] flex-1 cursor-pointer items-start gap-3 rounded-control border p-3 transition-colors duration-150',
                vybrane
                  ? 'border-primary bg-primary-soft'
                  : 'border-line bg-surface hover:border-ink-faint',
                error && !vybrane ? 'border-danger' : '',
              )}
            >
              <input
                id={oid}
                type="radio"
                name={name}
                value={o.value}
                checked={vybrane}
                onChange={() => onChange(o.value)}
                className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-primary"
              />
              <span>
                <span className="block text-sm font-medium text-ink">{o.label}</span>
                {o.helper ? (
                  <span className="block text-sm text-ink-muted">{o.helper}</span>
                ) : null}
              </span>
            </label>
          )
        })}
      </div>
      {error ? (
        <p id={errorId} className="text-sm font-medium text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </fieldset>
  )
}
