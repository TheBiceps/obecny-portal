import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowDown, ArrowUp, ArrowUpDown, FileText, Inbox, RotateCcw } from 'lucide-react'
import {
  Badge,
  Button,
  Card,
  ConfirmModal,
  EmptyState,
  Field,
  Input,
  PageHeader,
  Pagination,
  Select,
  Spinner,
  StatusBadge,
  Table,
  Td,
  Th,
  useToast,
} from '@obec/ui'
import {
  can,
  formatDate,
  formsForTenant,
  STAV_LABEL,
  type Page,
  type Submission,
  type SubmissionFilter,
  type SubmissionStatus,
} from '@obec/core'
import { useAuth } from '../app/auth'
import { useTenant } from '../app/tenant'
import { useZmenyDat } from '../app/zmeny'

const PREDVOLENY_FILTER: SubmissionFilter = {
  hladat: '',
  formId: undefined,
  status: undefined,
  odDatumu: undefined,
  doDatumu: undefined,
  zoradit: 'datum_desc',
  strana: 1,
  naStranu: 10,
}

interface StlpecZoradenia {
  kluc: SubmissionFilter['zoradit']
  aria: 'ascending' | 'descending' | 'other'
}

const STAVY: SubmissionStatus[] = ['prijate', 'v_rieseni', 'vybavene', 'zamietnute']

export function Podania() {
  const { uzivatel } = useAuth()
  const { tenant, data } = useTenant()
  const { oznam } = useToast()
  const navigate = useNavigate()
  const zmenaVerzie = useZmenyDat()

  const [filter, setFilter] = useState<SubmissionFilter>(PREDVOLENY_FILTER)
  const [hladatVstup, setHladatVstup] = useState('')
  const [stranka, setStranka] = useState<Page<Submission> | null>(null)
  const [nacitavame, setNacitavame] = useState(true)
  const [statistiky, setStatistiky] = useState<{
    nove: number
    vRieseni: number
    vybaveneTentoMesiac: number
  } | null>(null)
  const [obnovaOtvorena, setObnovaOtvorena] = useState(false)
  const [obnovujeme, setObnovujeme] = useState(false)

  const formulare = useMemo(() => formsForTenant(tenant.povoleneFormulare), [tenant.povoleneFormulare])

  useEffect(() => {
    const id = window.setTimeout(() => {
      setFilter((f) => ({ ...f, hladat: hladatVstup, strana: 1 }))
    }, 300)
    return () => window.clearTimeout(id)
  }, [hladatVstup])

  useEffect(() => {
    let zrusene = false
    setNacitavame(true)
    data
      .listSubmissions(filter)
      .then((vysledok) => {
        if (!zrusene) setStranka(vysledok)
      })
      .finally(() => {
        if (!zrusene) setNacitavame(false)
      })
    return () => {
      zrusene = true
    }
  }, [data, filter, zmenaVerzie])

  useEffect(() => {
    let zrusene = false
    data.statistiky().then((s) => {
      if (!zrusene) setStatistiky(s)
    })
    return () => {
      zrusene = true
    }
  }, [data, zmenaVerzie])

  const filtreAktivne =
    Boolean(filter.hladat) ||
    Boolean(filter.formId) ||
    Boolean(filter.status) ||
    Boolean(filter.odDatumu) ||
    Boolean(filter.doDatumu)

  function zrusitFiltre() {
    setHladatVstup('')
    setFilter(PREDVOLENY_FILTER)
  }

  const nastavZoradenie = useCallback((zoradit: SubmissionFilter['zoradit']) => {
    setFilter((f) => ({ ...f, zoradit, strana: 1 }))
  }, [])

  function zoradenieDatumu(): StlpecZoradenia {
    if (filter.zoradit === 'datum_asc') return { kluc: 'datum_asc', aria: 'ascending' }
    return { kluc: 'datum_desc', aria: 'descending' }
  }

  function klikDatum() {
    nastavZoradenie(filter.zoradit === 'datum_desc' ? 'datum_asc' : 'datum_desc')
  }

  function ikonaDatum() {
    if (filter.zoradit === 'datum_desc') return <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
    if (filter.zoradit === 'datum_asc') return <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
    return <ArrowUpDown className="h-3.5 w-3.5 text-ink-faint" aria-hidden="true" />
  }

  async function potvrditObnovu() {
    setObnovujeme(true)
    try {
      await data.resetDemoData()
      setObnovaOtvorena(false)
      oznam('Ukážkové dáta boli vrátené do pôvodného stavu.', 'uspech')
    } catch {
      oznam('Obnovenie demo dát sa nepodarilo.', 'chyba')
    } finally {
      setObnovujeme(false)
    }
  }

  const polozky = stranka?.polozky ?? []

  return (
    <div className="flex flex-col gap-6">
      <PageHeader nadpis="Prijaté podania" popis="Prehľad podaní doručených od občanov cez portál." />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <p className="text-3xl font-semibold text-ink">{statistiky?.nove ?? '…'}</p>
          <p className="mt-1 text-sm text-ink-muted">Nové, neprečítané podania</p>
        </Card>
        <Card className="p-5">
          <p className="text-3xl font-semibold text-ink">{statistiky?.vRieseni ?? '…'}</p>
          <p className="mt-1 text-sm text-ink-muted">Podania v riešení</p>
        </Card>
        <Card className="p-5">
          <p className="text-3xl font-semibold text-ink">{statistiky?.vybaveneTentoMesiac ?? '…'}</p>
          <p className="mt-1 text-sm text-ink-muted">Vybavené tento mesiac</p>
        </Card>
      </div>

      <Card className="p-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Vyhľadávanie" htmlFor="filter-hladat">
            <Input
              id="filter-hladat"
              type="search"
              placeholder="Meno, e-mail alebo číslo podania"
              value={hladatVstup}
              onChange={(e) => setHladatVstup(e.target.value)}
            />
          </Field>

          <Field label="Formulár" htmlFor="filter-form">
            <Select
              id="filter-form"
              value={filter.formId ?? ''}
              onChange={(e) =>
                setFilter((f) => ({ ...f, formId: e.target.value || undefined, strana: 1 }))
              }
            >
              <option value="">Všetky formuláre</option>
              {formulare.map((fs) => (
                <option key={fs.id} value={fs.id}>
                  {fs.nazov}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Stav" htmlFor="filter-stav">
            <Select
              id="filter-stav"
              value={filter.status ?? ''}
              onChange={(e) =>
                setFilter((f) => ({
                  ...f,
                  status: (e.target.value || undefined) as SubmissionStatus | undefined,
                  strana: 1,
                }))
              }
            >
              <option value="">Všetky stavy</option>
              {STAVY.map((s) => (
                <option key={s} value={s}>
                  {STAV_LABEL[s]}
                </option>
              ))}
            </Select>
          </Field>

          <div className="grid grid-cols-2 gap-2">
            <Field label="Dátum od" htmlFor="filter-od">
              <Input
                id="filter-od"
                type="date"
                value={filter.odDatumu ?? ''}
                onChange={(e) =>
                  setFilter((f) => ({ ...f, odDatumu: e.target.value || undefined, strana: 1 }))
                }
              />
            </Field>
            <Field label="Dátum do" htmlFor="filter-do">
              <Input
                id="filter-do"
                type="date"
                value={filter.doDatumu ?? ''}
                onChange={(e) =>
                  setFilter((f) => ({ ...f, doDatumu: e.target.value || undefined, strana: 1 }))
                }
              />
            </Field>
          </div>
        </div>

        {filtreAktivne ? (
          <div className="mt-4">
            <Button variant="ghost" size="sm" onClick={zrusitFiltre}>
              Zrušiť filtre
            </Button>
          </div>
        ) : null}
      </Card>

      <p aria-live="polite" className="sr-only" role="status">
        {nacitavame
          ? 'Načítavame podania.'
          : `Nájdených podaní: ${stranka?.spolu ?? 0}.`}
      </p>

      <Card className="p-0">
        {nacitavame ? (
          <div className="p-10 text-center">
            <Spinner popis="Načítavame podania" />
          </div>
        ) : polozky.length === 0 ? (
          <div className="p-6">
            <EmptyState
              nadpis="Nenašli sme žiadne podania"
              popis={
                filtreAktivne
                  ? 'Skúste zmeniť alebo zrušiť filtre.'
                  : 'Zatiaľ neboli doručené žiadne podania.'
              }
              akcia={
                filtreAktivne ? (
                  <Button variant="secondary" onClick={zrusitFiltre}>
                    Zrušiť filtre
                  </Button>
                ) : (
                  <Inbox className="h-8 w-8 text-ink-faint" aria-hidden="true" />
                )
              }
            />
          </div>
        ) : (
          <div className="p-2">
            <Table popis="Zoznam prijatých podaní">
              <thead>
                <tr>
                  <Th>ID občana</Th>
                  <Th>
                    <button
                      type="button"
                      className="flex cursor-pointer items-center gap-1 font-semibold text-ink-muted"
                      onClick={() => nastavZoradenie('meno_asc')}
                    >
                      Meno a priezvisko
                    </button>
                  </Th>
                  <Th>Názov formulára</Th>
                  <Th aria-sort={zoradenieDatumu().aria}>
                    <button
                      type="button"
                      className="flex cursor-pointer items-center gap-1 font-semibold text-ink-muted"
                      onClick={klikDatum}
                    >
                      Dátum prijatia
                      {ikonaDatum()}
                    </button>
                  </Th>
                  <Th>Číslo podania</Th>
                  <Th aria-sort={filter.zoradit === 'stav' ? 'other' : 'none'}>
                    <button
                      type="button"
                      className="flex cursor-pointer items-center gap-1 font-semibold text-ink-muted"
                      onClick={() => nastavZoradenie('stav')}
                    >
                      Stav
                      {filter.zoradit === 'stav' ? (
                        <ArrowUpDown className="h-3.5 w-3.5" aria-hidden="true" />
                      ) : null}
                    </button>
                  </Th>
                  <Th>
                    <span className="sr-only">Akcie</span>
                  </Th>
                </tr>
              </thead>
              <tbody>
                {polozky.map((s) => (
                  <tr
                    key={s.id}
                    onClick={() => navigate(`/podania/${s.id}`)}
                    className={
                      s.precitane
                        ? 'cursor-pointer hover:bg-canvas'
                        : 'cursor-pointer bg-primary-soft/40 hover:bg-primary-soft/60'
                    }
                  >
                    <Td>
                      {s.residentId ? (
                        <span className="flex flex-col items-start gap-1">
                          <Badge ton="neutral">Registrovaný</Badge>
                          <span
                            className="font-mono text-xs text-ink-faint"
                            title={`Identifikátor občana ${s.residentId}`}
                          >
                            {s.residentId.slice(0, 8)}
                          </span>
                        </span>
                      ) : (
                        <Badge ton="neutral">Neregistrovaný</Badge>
                      )}
                    </Td>
                    <Td>
                      <span className="flex items-center gap-2">
                        {!s.precitane ? <Badge ton="primary">Nové</Badge> : null}
                        <span className="font-medium text-ink">{s.ziadatelMeno}</span>
                      </span>
                    </Td>
                    <Td>
                      <span className="inline-flex items-center gap-1.5 text-ink">
                        <FileText className="h-4 w-4 text-ink-faint" aria-hidden="true" />
                        {s.formNazov}
                      </span>
                    </Td>
                    <Td>{formatDate(s.prijateAt)}</Td>
                    <Td>{s.cisloPodania}</Td>
                    <Td>
                      <StatusBadge stav={s.status} label={STAV_LABEL[s.status] ?? s.status} />
                    </Td>
                    <Td>
                      <a
                        href={`#/podania/${s.id}`}
                        onClick={(e) => {
                          e.stopPropagation()
                          e.preventDefault()
                          navigate(`/podania/${s.id}`)
                        }}
                        className="font-medium text-primary underline underline-offset-4"
                      >
                        Otvoriť detail
                        <span className="sr-only"> podania od {s.ziadatelMeno}</span>
                      </a>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>

            <div className="px-3 pb-2">
              <Pagination
                strana={filter.strana ?? 1}
                naStranu={filter.naStranu ?? 10}
                spolu={stranka?.spolu ?? 0}
                onZmena={(s) => setFilter((f) => ({ ...f, strana: s }))}
              />
            </div>
          </div>
        )}
      </Card>

      {can(uzivatel?.role, 'demo.obnovit') ? (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            className="inline-flex cursor-pointer items-center gap-1.5 text-xs text-ink-faint underline underline-offset-4 hover:text-ink-muted"
            onClick={() => setObnovaOtvorena(true)}
          >
            <RotateCcw className="h-3 w-3" aria-hidden="true" />
            Obnoviť demo dáta
          </button>
        </div>
      ) : null}

      <ConfirmModal
        otvorene={obnovaOtvorena}
        nazov="Obnoviť demo dáta"
        popis="Týmto sa všetky ukážkové dáta vrátia do pôvodného stavu. Rozpracované zmeny, ktoré ste vykonali, sa nenávratne stratia."
        potvrditText={obnovujeme ? 'Obnovujeme…' : 'Obnoviť dáta'}
        nebezpecne
        onPotvrdit={potvrditObnovu}
        onZavriet={() => setObnovaOtvorena(false)}
      />
    </div>
  )
}
