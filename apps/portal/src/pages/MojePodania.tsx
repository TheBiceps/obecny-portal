import { Fragment, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, ChevronRight } from 'lucide-react'
import {
  Button,
  Card,
  EmptyState,
  Field,
  PageHeader,
  Select,
  Spinner,
  StatusBadge,
  Table,
  Td,
  Th,
  useToast,
} from '@obec/ui'
import {
  fieldOptions,
  formatDate,
  getFormSchema,
  STAV_LABEL,
  visibleFields,
  visibleSections,
  type Submission,
  type SubmissionStatus,
} from '@obec/core'
import { maskRodneCislo } from '@obec/core'
import { useTenant } from '../app/tenant'
import { useAuth } from '../app/auth'

/** Generátor PDF načítame až pri stiahnutí, aby sa nenačítaval pri štarte aplikácie. */
async function stiahniPdfPodania(
  ...argumenty: Parameters<typeof import('@obec/pdf').stiahniPdfPodania>
) {
  const modul = await import('@obec/pdf')
  return modul.stiahniPdfPodania(...argumenty)
}

const STAVY: SubmissionStatus[] = ['prijate', 'v_rieseni', 'vybavene', 'zamietnute']

export function MojePodania() {
  const { tenant, data } = useTenant()
  const { obcan } = useAuth()
  const navigate = useNavigate()
  const { oznam } = useToast()
  const [podania, setPodania] = useState<Submission[]>([])
  const [nacitavame, setNacitavame] = useState(true)
  const [stav, setStav] = useState<'' | SubmissionStatus>('')
  const [rozkliknute, setRozkliknute] = useState<string | null>(null)
  const [stahovaneId, setStahovaneId] = useState<string | null>(null)

  useEffect(() => {
    let zrusene = false
    if (!obcan) {
      setNacitavame(false)
      return
    }
    setNacitavame(true)
    data.listSubmissionsForResident(obcan.id).then((zoznam) => {
      if (!zrusene) {
        setPodania(zoznam)
        setNacitavame(false)
      }
    })
    return () => {
      zrusene = true
    }
  }, [data, obcan])

  const vyfiltrovane = useMemo(
    () => (stav ? podania.filter((p) => p.status === stav) : podania),
    [podania, stav],
  )

  async function stiahniPdf(podanie: Submission) {
    const schema = getFormSchema(podanie.formId)
    if (!schema) {
      oznam('Pre toto podanie sa nepodarilo nájsť formulár.', 'chyba')
      return
    }
    setStahovaneId(podanie.id)
    try {
      await stiahniPdfPodania(
        { schema, podanie, tenant, zakladnaUrl: import.meta.env.BASE_URL },
        `${schema.pdfNazov}-${podanie.cisloPodania}`,
      )
    } catch {
      oznam('PDF sa nepodarilo pripraviť. Skúste to prosím znova.', 'chyba')
    } finally {
      setStahovaneId(null)
    }
  }

  if (nacitavame) {
    return (
      <div className="py-16 text-center">
        <Spinner popis="Načítavame vaše podania" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader nadpis="Moje podania" popis="Prehľad všetkých vašich žiadostí na obecný úrad." />

      {podania.length > 0 ? (
        <div className="max-w-xs">
          <Field label="Stav podania" htmlFor="filter-stav">
            <Select
              id="filter-stav"
              value={stav}
              onChange={(e) => {
                setStav(e.target.value as '' | SubmissionStatus)
                setRozkliknute(null)
              }}
            >
              <option value="">Všetky stavy</option>
              {STAVY.map((s) => (
                <option key={s} value={s}>
                  {STAV_LABEL[s]}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      ) : null}

      {vyfiltrovane.length === 0 ? (
        <EmptyState
          nadpis={podania.length === 0 ? 'Zatiaľ nemáte žiadne podania' : 'Nenašli sme žiadne podanie'}
          popis={
            podania.length === 0
              ? 'Keď podáte prvú žiadosť, objaví sa tu spolu s číslom podania a jeho stavom.'
              : 'Skúste zmeniť filter stavu.'
          }
          akcia={<Button onClick={() => navigate('/formulare')}>Prejsť na formuláre</Button>}
        />
      ) : (
        <>
          <ul className="flex flex-col gap-3 sm:hidden">
            {vyfiltrovane.map((p) => (
              <li key={p.id}>
                <PodanieKarta
                  podanie={p}
                  rozkliknute={rozkliknute === p.id}
                  onRozkliknut={() => setRozkliknute(rozkliknute === p.id ? null : p.id)}
                  onStiahnut={() => stiahniPdf(p)}
                  stahujeme={stahovaneId === p.id}
                />
              </li>
            ))}
          </ul>

          <div className="hidden sm:block">
            <Table popis="Zoznam mojich podaní">
              <thead>
                <tr>
                  <Th>Číslo podania</Th>
                  <Th>Formulár</Th>
                  <Th>Dátum prijatia</Th>
                  <Th>Stav</Th>
                  <Th>
                    <span className="sr-only">Podrobnosti</span>
                  </Th>
                </tr>
              </thead>
              <tbody>
                {vyfiltrovane.map((p) => {
                  const otvorene = rozkliknute === p.id
                  return (
                    <Fragment key={p.id}>
                      <tr
                        className="cursor-pointer hover:bg-canvas"
                        onClick={() => setRozkliknute(otvorene ? null : p.id)}
                      >
                        <Td className="font-medium text-ink">{p.cisloPodania}</Td>
                        <Td>{p.formNazov}</Td>
                        <Td>{formatDate(p.prijateAt)}</Td>
                        <Td>
                          <StatusBadge stav={p.status} label={STAV_LABEL[p.status] ?? p.status} />
                        </Td>
                        <Td>
                          <button
                            type="button"
                            aria-expanded={otvorene}
                            aria-label={
                              otvorene
                                ? `Skryť podrobnosti podania ${p.cisloPodania}`
                                : `Zobraziť podrobnosti podania ${p.cisloPodania}`
                            }
                            onClick={(e) => {
                              e.stopPropagation()
                              setRozkliknute(otvorene ? null : p.id)
                            }}
                            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-control text-ink-muted hover:bg-primary-soft"
                          >
                            {otvorene ? (
                              <ChevronDown className="h-5 w-5" aria-hidden="true" />
                            ) : (
                              <ChevronRight className="h-5 w-5" aria-hidden="true" />
                            )}
                          </button>
                        </Td>
                      </tr>
                      {otvorene ? (
                        <tr>
                          <Td colSpan={5} className="bg-canvas/60">
                            <PodrobnostiPodania
                              podanie={p}
                              onStiahnut={() => stiahniPdf(p)}
                              stahujeme={stahovaneId === p.id}
                            />
                          </Td>
                        </tr>
                      ) : null}
                    </Fragment>
                  )
                })}
              </tbody>
            </Table>
          </div>
        </>
      )}
    </div>
  )
}

function PodanieKarta({
  podanie,
  rozkliknute,
  onRozkliknut,
  onStiahnut,
  stahujeme,
}: {
  podanie: Submission
  rozkliknute: boolean
  onRozkliknut: () => void
  onStiahnut: () => void
  stahujeme: boolean
}) {
  return (
    <Card className="p-4">
      <button
        type="button"
        onClick={onRozkliknut}
        aria-expanded={rozkliknute}
        className="flex w-full cursor-pointer items-center justify-between gap-3 text-left"
      >
        <div className="min-w-0">
          <p className="truncate font-semibold text-ink">{podanie.cisloPodania}</p>
          <p className="truncate text-sm text-ink-muted">{podanie.formNazov}</p>
          <p className="mt-1 text-sm text-ink-muted">{formatDate(podanie.prijateAt)}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <StatusBadge stav={podanie.status} label={STAV_LABEL[podanie.status] ?? podanie.status} />
          {rozkliknute ? (
            <ChevronDown className="h-5 w-5 text-ink-faint" aria-hidden="true" />
          ) : (
            <ChevronRight className="h-5 w-5 text-ink-faint" aria-hidden="true" />
          )}
        </div>
      </button>
      {rozkliknute ? (
        <div className="mt-4 border-t border-line pt-4">
          <PodrobnostiPodania podanie={podanie} onStiahnut={onStiahnut} stahujeme={stahujeme} />
        </div>
      ) : null}
    </Card>
  )
}

function PodrobnostiPodania({
  podanie,
  onStiahnut,
  stahujeme,
}: {
  podanie: Submission
  onStiahnut: () => void
  stahujeme: boolean
}) {
  const { tenant } = useTenant()
  const schema = getFormSchema(podanie.formId)

  return (
    <div className="flex flex-col gap-4">
      {schema ? (
        <div className="flex flex-col gap-4">
          {visibleSections(schema, podanie.data).map((sekcia) => (
            <div key={sekcia.id}>
              <p className="text-sm font-semibold text-ink">{sekcia.title}</p>
              <dl className="mt-1 grid gap-x-6 gap-y-2 sm:grid-cols-2">
                {visibleFields(sekcia, podanie.data)
                  .filter((pole) => pole.type !== 'info' && pole.type !== 'propertyPicker')
                  .map((pole) => (
                    <div key={pole.id} className="min-w-0">
                      <dt className="text-xs font-medium uppercase tracking-wide text-ink-faint">
                        {pole.label}
                      </dt>
                      <dd className="mt-0.5 break-words text-sm text-ink">
                        {hodnotaPola(pole.id, podanie.data, schema, tenant)}
                      </dd>
                    </div>
                  ))}
              </dl>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-ink-muted">Formulár pre toto podanie sa nepodarilo nájsť.</p>
      )}

      <div>
        <Button
          size="sm"
          pracuje={stahujeme}
          pracujeText="Pripravujeme PDF…"
          onClick={onStiahnut}
        >
          Stiahnuť PDF
        </Button>
      </div>
    </div>
  )
}

function hodnotaPola(
  fieldId: string,
  hodnoty: Record<string, unknown>,
  schema: ReturnType<typeof getFormSchema>,
  tenant: ReturnType<typeof useTenant>['tenant'],
): string {
  const pole = schema?.sections.flatMap((s) => s.fields).find((f) => f.id === fieldId)
  const v = hodnoty[fieldId]

  if (fieldId.includes('RodneCislo') && typeof v === 'string' && v) {
    return maskRodneCislo(v)
  }

  if (v === undefined || v === null || v === '') return 'Neuvedené'

  if (!pole) return String(v)

  if (pole.type === 'checkbox' || pole.type === 'consent') return v ? 'Áno' : 'Nie'
  if (pole.type === 'date') return formatDate(String(v))
  if (pole.type === 'address') {
    const a = v as Record<string, string>
    const cislo = [a.supisneCislo, a.orientacneCislo].filter(Boolean).join('/')
    return [
      [a.ulica, cislo].filter(Boolean).join(' '),
      [a.psc, a.obec].filter(Boolean).join(' '),
    ]
      .filter(Boolean)
      .join(', ')
  }
  if (pole.type === 'select' || pole.type === 'radio') {
    const moznosti = fieldOptions(pole, tenant)
    return moznosti.find((o) => o.value === v)?.label ?? String(v)
  }
  if (pole.type === 'file') {
    const zoznam = Array.isArray(v) ? v : []
    if (zoznam.length === 0) return 'Bez príloh'
    return zoznam
      .map((s) => (s as { nazovSuboru?: string }).nazovSuboru ?? 'príloha')
      .join(', ')
  }
  return String(v)
}
