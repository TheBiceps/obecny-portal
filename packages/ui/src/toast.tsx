import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { cn } from './cn'

export interface Toast {
  id: string
  sprava: string
  ton?: 'info' | 'uspech' | 'chyba'
}

interface ToastCtx {
  oznam: (sprava: string, ton?: Toast['ton']) => void
}

const Ctx = createContext<ToastCtx>({ oznam: () => {} })

export function useToast() {
  return useContext(Ctx)
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [zoznam, setZoznam] = useState<Toast[]>([])

  const oznam = useCallback((sprava: string, ton: Toast['ton'] = 'info') => {
    const id = Math.random().toString(36).slice(2)
    setZoznam((z) => [...z, { id, sprava, ton }])
    window.setTimeout(() => {
      setZoznam((z) => z.filter((t) => t.id !== id))
    }, 5000)
  }, [])

  const hodnota = useMemo(() => ({ oznam }), [oznam])

  return (
    <Ctx.Provider value={hodnota}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4 netlacit"
      >
        {zoznam.map((t) => (
          <div
            key={t.id}
            className={cn(
              'pointer-events-auto w-full max-w-md rounded-card border px-4 py-3 text-sm shadow-pop',
              t.ton === 'uspech'
                ? 'border-success/30 bg-success-soft text-success'
                : t.ton === 'chyba'
                  ? 'border-danger/30 bg-danger-soft text-danger'
                  : 'border-line bg-surface text-ink',
            )}
          >
            {t.sprava}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  )
}
