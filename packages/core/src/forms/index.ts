export * from './schema'
export * from './engine'
export { vjazdForm } from './vjazd'
export { vekStavbyForm } from './vekStavby'
export { predlzenieUzemnehoRozhodnutiaForm } from './predlzenieUzemnehoRozhodnutia'
export { predlzenieStavebnehoPovoleniaForm } from './predlzenieStavebnehoPovolenia'
export { predlzenieTerminuDokonceniaForm } from './predlzenieTerminuDokoncenia'
export { supisneCisloForm } from './supisneCislo'
export { pasportStavbyForm } from './pasportStavby'

import type { FormSchema } from './schema'
import { vjazdForm } from './vjazd'
import { vekStavbyForm } from './vekStavby'
import { predlzenieUzemnehoRozhodnutiaForm } from './predlzenieUzemnehoRozhodnutia'
import { predlzenieStavebnehoPovoleniaForm } from './predlzenieStavebnehoPovolenia'
import { predlzenieTerminuDokonceniaForm } from './predlzenieTerminuDokoncenia'
import { supisneCisloForm } from './supisneCislo'
import { pasportStavbyForm } from './pasportStavby'

/** Register formulárov. Nový formulár pridáte jedným riadkom. */
export const formSchemas: FormSchema[] = [
  vjazdForm,
  vekStavbyForm,
  predlzenieUzemnehoRozhodnutiaForm,
  predlzenieStavebnehoPovoleniaForm,
  predlzenieTerminuDokonceniaForm,
  supisneCisloForm,
  pasportStavbyForm,
]

export function getFormSchema(id: string): FormSchema | undefined {
  return formSchemas.find((f) => f.id === id)
}

/** Formuláre, ktoré má obec zapnuté. */
export function formsForTenant(povolene: string[]): FormSchema[] {
  return formSchemas.filter((f) => povolene.includes(f.id))
}
