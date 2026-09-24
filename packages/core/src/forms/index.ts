export * from './schema'
export * from './engine'
export { vjazdForm } from './vjazd'
export { vekStavbyForm } from './vekStavby'

import type { FormSchema } from './schema'
import { vjazdForm } from './vjazd'
import { vekStavbyForm } from './vekStavby'

/** Register formulárov. Nový formulár pridáte jedným riadkom. */
export const formSchemas: FormSchema[] = [vjazdForm, vekStavbyForm]

export function getFormSchema(id: string): FormSchema | undefined {
  return formSchemas.find((f) => f.id === id)
}

/** Formuláre, ktoré má obec zapnuté. */
export function formsForTenant(povolene: string[]): FormSchema[] {
  return formSchemas.filter((f) => povolene.includes(f.id))
}
