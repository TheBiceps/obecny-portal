import { z } from 'zod'
import type {
  Condition,
  Field,
  FormSchema,
  PrilohaInfo,
  Section,
  Visibility,
} from './schema'
import type { Property, Resident } from '../types'
import type { TenantConfig } from '../tenant/types'
import {
  isEmailValid,
  isIcoValid,
  isPscValid,
  isTelefonValid,
} from '../validation/formats'
import { isRodneCisloValid } from '../validation/rodneCislo'

export type FormValues = Record<string, unknown>

/* ------------------------------------------------------------------ */
/* Viditeľnosť                                                          */
/* ------------------------------------------------------------------ */

function evalCondition(c: Condition, values: FormValues): boolean {
  const v = values[c.field]
  if (c.isTruthy !== undefined) return c.isTruthy ? Boolean(v) : !v
  if (c.oneOf) return c.oneOf.some((o) => o === v)
  if ('equals' in c) return v === c.equals
  return Boolean(v)
}

export function isVisible(rule: Visibility | undefined, values: FormValues): boolean {
  if (!rule) return true
  if ('and' in rule) return rule.and.every((c) => evalCondition(c, values))
  if ('or' in rule) return rule.or.some((c) => evalCondition(c, values))
  return evalCondition(rule, values)
}

export function visibleSections(schema: FormSchema, values: FormValues): Section[] {
  return schema.sections.filter((s) => isVisible(s.visibleIf, values))
}

export function visibleFields(section: Section, values: FormValues): Field[] {
  return section.fields.filter((f) => isVisible(f.visibleIf, values))
}

export function visiblePrilohy(schema: FormSchema, values: FormValues): PrilohaInfo[] {
  return schema.prilohy.filter((p) => isVisible(p.visibleIf, values))
}

/** Všetky viditeľné polia formulára v poradí sekcií. */
export function allVisibleFields(schema: FormSchema, values: FormValues): Field[] {
  return visibleSections(schema, values).flatMap((s) => visibleFields(s, values))
}

/* ------------------------------------------------------------------ */
/* Kontrola hodnôt                                                      */
/* ------------------------------------------------------------------ */

const NAMED_VALIDATORS: Record<
  string,
  { test: (v: string) => boolean; sprava: string }
> = {
  email: { test: isEmailValid, sprava: 'Zadajte e-mail v tvare meno@domena.sk.' },
  telefon: {
    test: isTelefonValid,
    sprava: 'Zadajte telefón v tvare +421 9xx xxx xxx.',
  },
  psc: { test: isPscValid, sprava: 'PSČ má päť číslic, napríklad 900 27.' },
  ico: { test: isIcoValid, sprava: 'IČO má osem číslic a musí prejsť kontrolou.' },
  rodneCislo: {
    test: isRodneCisloValid,
    sprava: 'Zadajte platné rodné číslo v tvare 940215/6789.',
  },
  rok: {
    test: (v) => /^\d{4}$/.test(v) && Number(v) >= 1800 && Number(v) <= 2100,
    sprava: 'Zadajte rok ako štyri číslice, napríklad 1974.',
  },
  cisloOp: {
    test: (v) => /^[A-Za-z]{2}\s?\d{6}$/.test(v.trim()),
    sprava: 'Číslo občianskeho preukazu má tvar AB 123456.',
  },
}

const POVINNE = 'Toto pole je povinné.'

function fieldSchema(f: Field): z.ZodTypeAny {
  if (f.type === 'info') return z.any().optional()

  if (f.type === 'checkbox' || f.type === 'consent') {
    return f.required
      ? z.literal(true, {
          errorMap: () => ({ message: f.chybaText ?? 'Zaškrtnutie je povinné.' }),
        })
      : z.boolean().optional()
  }

  if (f.type === 'file') {
    const pole = z.array(z.any())
    return f.required
      ? pole.min(1, { message: f.chybaText ?? 'Nahrajte aspoň jeden súbor.' })
      : pole.optional()
  }

  if (f.type === 'address') {
    const cast = (povinne: boolean, sprava: string) =>
      povinne ? z.string().trim().min(1, { message: sprava }) : z.string().optional()
    return z.object({
      ulica: cast(Boolean(f.required), POVINNE),
      supisneCislo: z.string().optional(),
      orientacneCislo: z.string().optional(),
      obec: cast(Boolean(f.required), POVINNE),
      psc: z
        .string()
        .optional()
        .refine((v) => !f.required || isPscValid(v ?? ''), {
          message: 'PSČ má päť číslic, napríklad 900 27.',
        }),
    })
  }

  let s = z.string({ invalid_type_error: POVINNE }).trim()

  if (f.maxLength) {
    s = s.max(f.maxLength, {
      message: `Zadajte najviac ${f.maxLength} znakov.`,
    })
  }

  const base: z.ZodTypeAny = f.required
    ? s.min(1, { message: f.chybaText ?? POVINNE })
    : s.optional()

  const validator = f.validate ? NAMED_VALIDATORS[f.validate] : undefined
  if (!validator) return base

  return base.refine(
    (v: unknown) => {
      const text = typeof v === 'string' ? v.trim() : ''
      if (!text) return !f.required
      return validator.test(text)
    },
    { message: f.chybaText ?? validator.sprava },
  )
}

/** Zostaví Zod schému len z polí, ktoré sú pri daných hodnotách viditeľné. */
export function buildZodSchema(schema: FormSchema, values: FormValues) {
  const shape: Record<string, z.ZodTypeAny> = {}
  for (const f of allVisibleFields(schema, values)) {
    shape[f.id] = fieldSchema(f)
  }
  return z.object(shape)
}

export interface ChybaPola {
  fieldId: string
  label: string
  sprava: string
}

/** Skontroluje celý formulár a vráti zoznam chýb pre súhrn nad formulárom. */
export function validateForm(schema: FormSchema, values: FormValues): ChybaPola[] {
  const zod = buildZodSchema(schema, values)
  const vysledok = zod.safeParse(values)
  if (vysledok.success) return []
  const popisy = new Map(
    allVisibleFields(schema, values).map((f) => [f.id, f.label] as const),
  )
  const chyby: ChybaPola[] = []
  const videne = new Set<string>()
  for (const issue of vysledok.error.issues) {
    const id = String(issue.path[0] ?? '')
    if (!id || videne.has(id)) continue
    videne.add(id)
    chyby.push({ fieldId: id, label: popisy.get(id) ?? id, sprava: issue.message })
  }
  return chyby
}

/* ------------------------------------------------------------------ */
/* Predvyplnenie                                                        */
/* ------------------------------------------------------------------ */

function hodnotaZCesty(zdroj: unknown, cesta: string): unknown {
  return cesta
    .split('.')
    .reduce<unknown>(
      (acc, kluc) =>
        acc && typeof acc === 'object'
          ? (acc as Record<string, unknown>)[kluc]
          : undefined,
      zdroj,
    )
}

export interface AutofillContext {
  resident?: Resident | null
  property?: Property | null
  tenant: TenantConfig
  dnes?: string
}

/** Vráti hodnotu pre jedno pole podľa jeho autofillFrom. */
export function autofillValue(f: Field, ctx: AutofillContext): unknown {
  if (!f.autofillFrom) return undefined
  if (f.autofillFrom === 'dnes') return ctx.dnes ?? new Date().toISOString().slice(0, 10)
  const [koren, ...zvysok] = f.autofillFrom.split('.')
  const cesta = zvysok.join('.')
  if (koren === 'resident') return ctx.resident ? hodnotaZCesty(ctx.resident, cesta) : undefined
  if (koren === 'property') return ctx.property ? hodnotaZCesty(ctx.property, cesta) : undefined
  if (koren === 'tenant') return hodnotaZCesty(ctx.tenant, cesta)
  return undefined
}

/** Prázdne je nevyplnené pole aj adresný blok, ktorý nemá ani jednu vyplnenú časť. */
function jePrazdnaHodnota(v: unknown): boolean {
  if (v === undefined || v === null || v === '') return true
  if (Array.isArray(v)) return v.length === 0
  if (typeof v === 'object') {
    return Object.values(v as Record<string, unknown>).every(
      (x) => x === undefined || x === null || x === '',
    )
  }
  return false
}

export interface AutofillResult {
  values: FormValues
  /** id polí, ktoré boli doplnené automaticky */
  doplnene: string[]
}

/**
 * Doplní hodnoty zo zdrojov. Predvolene neprepisuje to, čo už človek vyplnil.
 * Pri zmene nehnuteľnosti sa volá s prepisat = true.
 */
export function applyAutofill(
  schema: FormSchema,
  values: FormValues,
  ctx: AutofillContext,
  moznosti: { prepisat?: boolean; lenZdroj?: 'resident' | 'property' | 'tenant' } = {},
): AutofillResult {
  const nove: FormValues = { ...values }
  const doplnene: string[] = []
  for (const section of schema.sections) {
    for (const f of section.fields) {
      if (!f.autofillFrom) continue
      if (moznosti.lenZdroj && !f.autofillFrom.startsWith(moznosti.lenZdroj)) continue
      const existuje = nove[f.id]
      if (!jePrazdnaHodnota(existuje) && !moznosti.prepisat) continue
      const v = autofillValue(f, ctx)
      if (v === undefined || v === null || v === '') continue
      nove[f.id] = v
      doplnene.push(f.id)
    }
  }
  return { values: nove, doplnene }
}

/** Prázdne hodnoty pre celý formulár, aby boli polia riadené od začiatku. */
export function emptyValues(schema: FormSchema): FormValues {
  const v: FormValues = {}
  for (const s of schema.sections) {
    for (const f of s.fields) {
      if (f.type === 'checkbox' || f.type === 'consent') v[f.id] = false
      else if (f.type === 'file') v[f.id] = []
      else if (f.type === 'address')
        v[f.id] = { ulica: '', supisneCislo: '', orientacneCislo: '', obec: '', psc: '' }
      else if (f.type === 'info') continue
      else v[f.id] = ''
    }
  }
  return v
}

/** Možnosti pre select, ktorý berie hodnoty z konfigurácie obce. */
export function fieldOptions(f: Field, tenant: TenantConfig) {
  if (f.optionsFromTenant === 'katastralneUzemia') {
    return tenant.katastralneUzemia.map((k) => ({ value: k, label: k }))
  }
  return f.options ?? []
}
