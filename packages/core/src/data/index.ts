import type { TenantConfig } from '../tenant/types'
import type { DataProvider } from './provider'
import { LocalStorageProvider } from './localStorageProvider'

export * from './provider'
export * from './permissions'
export { LocalStorageProvider } from './localStorageProvider'
export { ApiProvider } from './apiProvider'
export { DEMO_UCTY, buildSeed, demoHash } from './seed'
export type { DemoDb } from './seed'

let instancia: LocalStorageProvider | null = null

/**
 * Vyberie zdroj dát podľa premennej prostredia.
 * VITE_DATA_PROVIDER = local (predvolené) alebo api.
 */
export function createDataProvider(tenant: TenantConfig): DataProvider {
  const rezim =
    (typeof import.meta !== 'undefined'
      ? (import.meta as { env?: Record<string, string> }).env?.VITE_DATA_PROVIDER
      : undefined) ?? 'local'

  if (rezim === 'api') {
    // ApiProvider zatiaľ nie je dokončený, demo pokračuje na lokálnom úložisku.
    console.warn('ApiProvider zatiaľ nie je dokončený, používa sa lokálne úložisko.')
  }

  if (!instancia || instancia.tenantId !== tenant.id) {
    instancia = new LocalStorageProvider(tenant)
  }
  return instancia
}

/** Rovnaká inštancia aj pre odber zmien z druhej aplikácie. */
export function getLocalProvider(tenant: TenantConfig): LocalStorageProvider {
  createDataProvider(tenant)
  return instancia as LocalStorageProvider
}
