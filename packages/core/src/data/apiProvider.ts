import type { TenantConfig } from '../tenant/types'
import type { DataProvider } from './provider'

/**
 * Pripravené miesto pre skutočné rozhranie, napríklad Supabase
 * alebo vlastné API. Metódy sa doplnia pri prechode do produkcie,
 * obrazovky aplikácií sa meniť nebudú.
 */
export class ApiProvider implements Partial<DataProvider> {
  readonly tenantId: string
  private readonly zaklad: string

  constructor(tenant: TenantConfig, zakladnaUrl: string) {
    this.tenantId = tenant.id
    this.zaklad = zakladnaUrl.replace(/\/$/, '')
  }

  get endpoint(): string {
    return this.zaklad
  }
}
