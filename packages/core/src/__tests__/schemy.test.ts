import { describe, expect, it } from 'vitest'
import { formSchemas } from '../forms'
import type { Condition, Field, FormSchema, Visibility } from '../forms/schema'
import { bernolakovo } from '../tenant/bernolakovo'

function vsetkyPodmienky(rule: Visibility | undefined): Condition[] {
  if (!rule) return []
  if ('and' in rule) return rule.and
  if ('or' in rule) return rule.or
  return [rule]
}

function vsetkyPolia(schema: FormSchema): Field[] {
  return schema.sections.flatMap((s) => s.fields)
}

describe('celistvosť definícií formulárov', () => {
  it('každá schéma má jedinečné id v rámci formSchemas', () => {
    const ids = formSchemas.map((f) => f.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('v rámci jednej schémy sú id všetkých polí jedinečné naprieč sekciami', () => {
    for (const schema of formSchemas) {
      const ids = vsetkyPolia(schema).map((f) => f.id)
      const duplicity = ids.filter((id, i) => ids.indexOf(id) !== i)
      expect(duplicity, `schéma ${schema.id} má duplicitné id polí: ${duplicity.join(', ')}`).toEqual(
        [],
      )
    }
  })

  it('každé visibleIf odkazuje na field, ktoré v schéme existuje', () => {
    for (const schema of formSchemas) {
      const idPolia = new Set(vsetkyPolia(schema).map((f) => f.id))
      const miesta: { field: string; kde: string }[] = []

      for (const section of schema.sections) {
        for (const c of vsetkyPodmienky(section.visibleIf)) {
          miesta.push({ field: c.field, kde: `sekcia ${section.id}` })
        }
        for (const field of section.fields) {
          for (const c of vsetkyPodmienky(field.visibleIf)) {
            miesta.push({ field: c.field, kde: `pole ${field.id}` })
          }
        }
      }
      for (const priloha of schema.prilohy) {
        for (const c of vsetkyPodmienky(priloha.visibleIf)) {
          miesta.push({ field: c.field, kde: `príloha ${priloha.id}` })
        }
      }

      for (const m of miesta) {
        expect(
          idPolia.has(m.field),
          `schéma ${schema.id}: ${m.kde} odkazuje na neexistujúce pole "${m.field}"`,
        ).toBe(true)
      }
    }
  })

  it('každé autofillFrom začína na resident., property., tenant. alebo je dnes', () => {
    for (const schema of formSchemas) {
      for (const field of vsetkyPolia(schema)) {
        if (!field.autofillFrom) continue
        const platny =
          field.autofillFrom === 'dnes' ||
          field.autofillFrom.startsWith('resident.') ||
          field.autofillFrom.startsWith('property.') ||
          field.autofillFrom.startsWith('tenant.')
        expect(
          platny,
          `schéma ${schema.id}: pole ${field.id} má neplatné autofillFrom "${field.autofillFrom}"`,
        ).toBe(true)
      }
    }
  })

  it('každé pole typu select alebo radio má buď options, alebo optionsFromTenant', () => {
    for (const schema of formSchemas) {
      for (const field of vsetkyPolia(schema)) {
        if (field.type !== 'select' && field.type !== 'radio') continue
        const maOptions = Boolean(field.options && field.options.length > 0)
        const maOptionsFromTenant = Boolean(field.optionsFromTenant)
        expect(
          maOptions || maOptionsFromTenant,
          `schéma ${schema.id}: pole ${field.id} typu ${field.type} nemá options ani optionsFromTenant`,
        ).toBe(true)
      }
    }
  })

  it('všetky formuláre uvedené v bernolakovo.povoleneFormulare existujú v formSchemas', () => {
    const ids = new Set(formSchemas.map((f) => f.id))
    for (const povoleny of bernolakovo.povoleneFormulare) {
      expect(ids.has(povoleny), `formulár "${povoleny}" chýba v formSchemas`).toBe(true)
    }
  })

  it('žiadny text v schéme neobsahuje znak pomlčky — ani –', () => {
    const zakazane = /[—–]/
    const porusenia: string[] = []

    const skontroluj = (text: string | undefined, kde: string) => {
      if (text && zakazane.test(text)) porusenia.push(kde)
    }

    for (const schema of formSchemas) {
      skontroluj(schema.kratkyPopis, `${schema.id}: kratkyPopis`)
      skontroluj(schema.nazov, `${schema.id}: nazov`)
      skontroluj(schema.poplatokPoznamka, `${schema.id}: poplatokPoznamka`)
      skontroluj(schema.infoPoznamka, `${schema.id}: infoPoznamka`)

      for (const section of schema.sections) {
        for (const field of section.fields) {
          skontroluj(field.label, `${schema.id}: pole ${field.id} label`)
          skontroluj(field.helper, `${schema.id}: pole ${field.id} helper`)
          skontroluj(field.text, `${schema.id}: pole ${field.id} text`)
          skontroluj(field.placeholder, `${schema.id}: pole ${field.id} placeholder`)
          for (const option of field.options ?? []) {
            skontroluj(option.label, `${schema.id}: pole ${field.id} option ${option.value} label`)
            skontroluj(option.helper, `${schema.id}: pole ${field.id} option ${option.value} helper`)
          }
        }
      }

      for (const priloha of schema.prilohy) {
        skontroluj(priloha.nazov, `${schema.id}: príloha ${priloha.id} nazov`)
        skontroluj(priloha.poznamka, `${schema.id}: príloha ${priloha.id} poznamka`)
      }
    }

    expect(porusenia, `pravidlo bez pomlčky porušili: ${porusenia.join(', ')}`).toEqual([])
  })
})
