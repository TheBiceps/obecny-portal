import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Alert,
  Button,
  Card,
  ErrorSummary,
  Steps,
} from '@obec/ui'
import {
  applyAutofill,
  emptyValues,
  fieldOptions,
  formatDate,
  formatEur,
  validateForm,
  visibleFields,
  visibleSections,
  type AttachmentMeta,
  type ChybaPola,
  type Field,
  type FormSchema,
  type FormValues,
  type Property,
  type Resident,
  type TenantConfig,
} from '@obec/core'
import { PoleFormulara } from './PoleFormulara'

const KROK_KONTROLA = 'kontrola'

export interface FormRendererProps {
  schema: FormSchema
  tenant: TenantConfig
  obcan: Resident | null
  nehnutelnosti: Property[]
  onOdoslat: (values: FormValues, prilohy: AttachmentMeta[], propertyId: string | null) => Promise<void>
}

function klucKoncept(formId: string) {
  return `obec.portal.koncept.${formId}`
}

export function FormRenderer({
  schema,
  tenant,
  obcan,
  nehnutelnosti,
  onOdoslat,
}: FormRendererProps) {
  const [values, setValues] = useState<FormValues>(() => emptyValues(schema))
  const [doplnene, setDoplnene] = useState<string[]>([])
  const [krok, setKrok] = useState(0)
  const [chyby, setChyby] = useState<ChybaPola[]>([])
  const [odosielame, setOdosielame] = useState(false)
  const [chybaOdoslania, setChybaOdoslania] = useState<string | null>(null)
  const suhrnRef = useRef<HTMLDivElement>(null)
  const prveNacitanie = useRef(true)

  /* koncept a predvyplnenie */
  useEffect(() => {
    const ulozeny = localStorage.getItem(klucKoncept(schema.id))
    let zaklad = emptyValues(schema)
    if (ulozeny) {
      try {
        zaklad = { ...zaklad, ...(JSON.parse(ulozeny) as FormValues) }
      } catch {
        localStorage.removeItem(klucKoncept(schema.id))
      }
    }
    const vysledok = applyAutofill(schema, zaklad, { resident: obcan, tenant })
    setValues(vysledok.values)
    setDoplnene(vysledok.doplnene)
    prveNacitanie.current = false
  }, [schema, obcan, tenant])

  /* automatické ukladanie konceptu */
  useEffect(() => {
    if (prveNacitanie.current) return
    const t = window.setTimeout(() => {
      const naUlozenie: FormValues = { ...values }
      // súbory sa do konceptu neukladajú, mohli by prekročiť veľkosť úložiska
      for (const s of schema.sections) {
        for (const f of s.fields) if (f.type === 'file') delete naUlozenie[f.id]
      }
      try {
        localStorage.setItem(klucKoncept(schema.id), JSON.stringify(naUlozenie))
      } catch {
        // úložisko je plné, koncept jednoducho neuložíme
      }
    }, 600)
    return () => window.clearTimeout(t)
  }, [values, schema])

  const sekcie = useMemo(() => visibleSections(schema, values), [schema, values])
  const kroky = useMemo(
    () => [
      ...sekcie.map((s) => ({ id: s.id, nazov: s.title })),
      { id: KROK_KONTROLA, nazov: 'Skontrolujte údaje' },
    ],
    [sekcie],
  )
  const bezpecnyKrok = Math.min(krok, kroky.length - 1)
  const jeKontrola = kroky[bezpecnyKrok]?.id === KROK_KONTROLA
  const aktualnaSekcia = jeKontrola ? null : sekcie[bezpecnyKrok]

  const nastavHodnotu = useCallback((id: string, v: unknown) => {
    setValues((s) => ({ ...s, [id]: v }))
    setDoplnene((d) => d.filter((x) => x !== id))
    setChyby((c) => c.filter((x) => x.fieldId !== id))
  }, [])

  const vyberNehnutelnost = useCallback(
    (id: string) => {
      const n = nehnutelnosti.find((x) => x.id === id) ?? null
      setValues((s) => {
        const zaklad = { ...s, nehnutelnost: id }
        const vysledok = applyAutofill(
          schema,
          zaklad,
          { resident: obcan, property: n, tenant },
          { prepisat: true, lenZdroj: 'property' },
        )
        setDoplnene((d) => Array.from(new Set([...d, ...vysledok.doplnene])))
        return vysledok.values
      })
      setChyby([])
    },
    [nehnutelnosti, schema, obcan, tenant],
  )

  /* kontrola jedného kroku */
  function skontrolujKrok(): boolean {
    if (!aktualnaSekcia) return true
    const polia = visibleFields(aktualnaSekcia, values).map((f) => f.id)
    const vsetky = validateForm(schema, values).filter((ch) => polia.includes(ch.fieldId))
    setChyby(vsetky)
    if (vsetky.length) {
      window.setTimeout(() => suhrnRef.current?.focus(), 50)
      return false
    }
    return true
  }

  function dalej() {
    if (!skontrolujKrok()) return
    setKrok((k) => Math.min(k + 1, kroky.length - 1))
    window.scrollTo({ top: 0 })
  }

  function spat() {
    setChyby([])
    setKrok((k) => Math.max(0, k - 1))
    window.scrollTo({ top: 0 })
  }

  async function odosli() {
    const vsetky = validateForm(schema, values)
    setChyby(vsetky)
    if (vsetky.length) {
      window.setTimeout(() => suhrnRef.current?.focus(), 50)
      return
    }
    setOdosielame(true)
    setChybaOdoslania(null)
    try {
      const prilohy: AttachmentMeta[] = []
      for (const s of schema.sections) {
        for (const f of s.fields) {
          if (f.type !== 'file') continue
          const zoznam = values[f.id]
          if (Array.isArray(zoznam)) prilohy.push(...(zoznam as AttachmentMeta[]))
        }
      }
      const propertyId = (values.nehnutelnost as string) || null
      await onOdoslat(values, prilohy, propertyId)
      localStorage.removeItem(klucKoncept(schema.id))
    } catch (e) {
      setChybaOdoslania(
        e instanceof Error ? e.message : 'Podanie sa nepodarilo odoslať. Skúste to prosím znova.',
      )
      setOdosielame(false)
    }
  }

  const chybaPre = (id: string) => chyby.find((c) => c.fieldId === id)?.sprava

  return (
    <div className="flex flex-col gap-6">
      <Steps kroky={kroky} aktivny={bezpecnyKrok} />

      {!obcan ? (
        <Alert ton="info" nadpis="Prihláste sa a údaje vyplníme za vás">
          <p>
            Po prihlásení doplníme vaše osobné údaje aj údaje o nehnuteľnosti.{' '}
            <Link to="/prihlasenie" className="font-medium text-primary underline underline-offset-4">
              Prihlásiť sa
            </Link>{' '}
            alebo{' '}
            <Link to="/registracia" className="font-medium text-primary underline underline-offset-4">
              vytvoriť konto
            </Link>
            .
          </p>
        </Alert>
      ) : null}

      <div ref={suhrnRef} tabIndex={-1}>
        <ErrorSummary chyby={chyby} />
      </div>

      {chybaOdoslania ? <Alert ton="chyba">{chybaOdoslania}</Alert> : null}

      {aktualnaSekcia ? (
        <Card className="p-5 sm:p-6">
          <h2 className="text-xl font-semibold">{aktualnaSekcia.title}</h2>
          {aktualnaSekcia.description ? (
            <p className="mt-1 text-ink-muted">{aktualnaSekcia.description}</p>
          ) : null}
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            {visibleFields(aktualnaSekcia, values).map((f) => (
              <div key={f.id} className={f.colSpan === 2 ? 'sm:col-span-2' : ''}>
                <PoleFormulara
                  pole={f}
                  hodnota={values[f.id]}
                  chyba={chybaPre(f.id)}
                  doplnene={doplnene.includes(f.id)}
                  tenant={tenant}
                  nehnutelnosti={nehnutelnosti}
                  onZmena={(v) => nastavHodnotu(f.id, v)}
                  onVyberNehnutelnosti={vyberNehnutelnost}
                />
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <Kontrola schema={schema} values={values} tenant={tenant} naKrok={setKrok} sekcie={sekcie} />
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="secondary" onClick={spat} disabled={bezpecnyKrok === 0}>
          Späť
        </Button>
        {jeKontrola ? (
          <Button onClick={odosli} pracuje={odosielame} pracujeText="Odosielame žiadosť…">
            Odoslať žiadosť
          </Button>
        ) : (
          <Button onClick={dalej}>Pokračovať</Button>
        )}
      </div>

      <p className="text-center text-sm text-ink-muted">
        Rozpracovanú žiadosť ukladáme do tohto prehliadača, môžete sa k nej vrátiť neskôr.
      </p>
    </div>
  )
}

/* ------------------------------------------------------------------ */

function Kontrola({
  schema,
  values,
  tenant,
  sekcie,
  naKrok,
}: {
  schema: FormSchema
  values: FormValues
  tenant: TenantConfig
  sekcie: ReturnType<typeof visibleSections>
  naKrok: (i: number) => void
}) {
  return (
    <div className="flex flex-col gap-4">
      <Card className="p-5 sm:p-6">
        <h2 className="text-xl font-semibold">Skontrolujte údaje</h2>
        <p className="mt-1 text-ink-muted">
          Prejdite si údaje pred odoslaním. Ktorúkoľvek časť môžete ešte upraviť.
        </p>
        {schema.poplatokEur > 0 ? (
          <p className="mt-3 rounded-control bg-canvas p-3 text-sm text-ink">
            Správny poplatok: <strong>{formatEur(schema.poplatokEur)}</strong>.{' '}
            {schema.poplatokPoznamka}
          </p>
        ) : null}
      </Card>

      {sekcie.map((s, i) => (
        <Card key={s.id} className="p-5 sm:p-6">
          <div className="mb-3 flex items-start justify-between gap-3">
            <h3 className="text-lg font-semibold">{s.title}</h3>
            <Button variant="link" onClick={() => naKrok(i)}>
              Upraviť
            </Button>
          </div>
          <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
            {visibleFields(s, values)
              .filter((f) => f.type !== 'info' && f.type !== 'propertyPicker')
              .map((f) => (
                <div key={f.id} className={f.type === 'address' ? 'sm:col-span-2' : ''}>
                  <dt className="text-xs font-medium uppercase tracking-wide text-ink-faint">
                    {f.label}
                  </dt>
                  <dd className="mt-0.5 break-words text-ink">
                    {zobrazHodnotu(f, values, tenant)}
                  </dd>
                </div>
              ))}
          </dl>
        </Card>
      ))}
    </div>
  )
}

function zobrazHodnotu(f: Field, values: FormValues, tenant: TenantConfig) {
  const v = values[f.id]
  if (f.type === 'checkbox' || f.type === 'consent') return v ? 'Áno' : 'Nie'
  if (v === undefined || v === null || v === '') {
    return <span className="text-ink-faint">Neuvedené</span>
  }
  if (f.type === 'date') return formatDate(String(v))
  if (f.type === 'file') {
    const zoznam = (Array.isArray(v) ? v : []) as AttachmentMeta[]
    return zoznam.length ? zoznam.map((s) => s.nazovSuboru).join(', ') : 'Bez príloh'
  }
  if (f.type === 'address') {
    const a = v as Record<string, string>
    const cislo = [a.supisneCislo, a.orientacneCislo].filter(Boolean).join('/')
    return `${[a.ulica, cislo].filter(Boolean).join(' ')}, ${a.psc ?? ''} ${a.obec ?? ''}`.trim()
  }
  if (f.type === 'select' || f.type === 'radio') {
    return fieldOptions(f, tenant).find((o) => o.value === v)?.label ?? String(v)
  }
  return String(v)
}
