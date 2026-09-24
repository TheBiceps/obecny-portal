import type { TenantConfig } from './types'
import { bernolakovo } from './bernolakovo'

export type { TenantConfig, TenantBranding, TenantOffice } from './types'
export { bernolakovo }

/** Register všetkých obcí. Novú obec pridáte jedným riadkom. */
export const tenants: Record<string, TenantConfig> = {
  [bernolakovo.id]: bernolakovo,
}

export const DEFAULT_TENANT_ID = 'bernolakovo'

/**
 * Vyhľadá obec. Zdroj je zatiaľ konfigurácia a premenná prostredia,
 * v produkcii sa doplní rozpoznanie podľa subdomény.
 */
export function resolveTenant(hint?: string): TenantConfig {
  const fromEnv =
    typeof import.meta !== 'undefined'
      ? (import.meta as { env?: Record<string, string> }).env?.VITE_TENANT_ID
      : undefined
  const id = hint ?? fromEnv ?? DEFAULT_TENANT_ID
  return tenants[id] ?? tenants[DEFAULT_TENANT_ID]
}
