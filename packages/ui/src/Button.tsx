import React from 'react'
import { cn } from './cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'link'
type Size = 'sm' | 'md' | 'lg'

const VARIANTY: Record<Variant, string> = {
  primary:
    'bg-primary text-white hover:bg-primary-dark active:bg-primary-dark border border-transparent',
  secondary:
    'bg-surface text-primary border border-primary/40 hover:bg-primary-soft',
  ghost: 'bg-transparent text-ink-muted border border-transparent hover:bg-primary-soft hover:text-primary',
  danger: 'bg-danger text-white hover:brightness-90 border border-transparent',
  link: 'bg-transparent text-primary underline underline-offset-4 hover:text-primary-dark border-0 px-0',
}

const VELKOSTI: Record<Size, string> = {
  sm: 'min-h-[36px] px-3 text-sm gap-1.5',
  md: 'min-h-[44px] px-4 text-base gap-2',
  lg: 'min-h-[52px] px-6 text-base gap-2',
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  /** zobrazí text o priebehu a zablokuje tlačidlo */
  pracuje?: boolean
  pracujeText?: string
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { variant = 'primary', size = 'md', pracuje, pracujeText, className, children, disabled, ...rest },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={rest.type ?? 'button'}
        disabled={disabled || pracuje}
        aria-busy={pracuje || undefined}
        className={cn(
          'inline-flex cursor-pointer items-center justify-center rounded-control font-medium transition-colors duration-200',
          'disabled:cursor-not-allowed disabled:opacity-55',
          VARIANTY[variant],
          variant === 'link' ? 'min-h-0' : VELKOSTI[size],
          className,
        )}
        {...rest}
      >
        {pracuje ? (pracujeText ?? 'Pracujeme…') : children}
      </button>
    )
  },
)
