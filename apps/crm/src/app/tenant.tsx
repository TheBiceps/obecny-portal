import React, { createContext, useContext, useMemo } from 'react'
import {
  createDataProvider,
  getLocalProvider,
  resolveTenant,
  type DataProvider,
  type TenantConfig,
} from '@obec/core'
import type { LocalStorageProvider } from '@obec/core'

interface Ctx {
  tenant: TenantConfig
  data: DataProvider
  lokalny: LocalStorageProvider
}

const TenantCtx = createContext<Ctx | null>(null)

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const hodnota = useMemo<Ctx>(() => {
    const tenant = resolveTenant()
    return {
      tenant,
      data: createDataProvider(tenant),
      lokalny: getLocalProvider(tenant),
    }
  }, [])

  React.useEffect(() => {
    const b = hodnota.tenant.branding
    const koren = document.documentElement
    koren.style.setProperty('--c-primary', hexNaRgb(b.primary))
    koren.style.setProperty('--c-primary-dark', hexNaRgb(b.primaryDark))
    koren.style.setProperty('--c-accent', hexNaRgb(b.accent))
  }, [hodnota.tenant])

  return <TenantCtx.Provider value={hodnota}>{children}</TenantCtx.Provider>
}

function hexNaRgb(hex: string): string {
  const h = hex.replace('#', '')
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16)
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`
}

export function useTenant(): Ctx {
  const c = useContext(TenantCtx)
  if (!c) throw new Error('useTenant treba použiť vnútri TenantProvider.')
  return c
}
