import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Download, Printer } from 'lucide-react'
import {
  Badge,
  Button,
  Card,
  ConfirmModal,
  DefinitionList,
  EmptyState,
  Field,
  Modal,
  Select,
  Spinner,
  StatusBadge,
  useToast,
} from '@obec/ui'
import {
  can,
  fieldOptions,
  formatDate,
  formatDateTime,
  formatRodneCislo,
  formatVelkost,
  getFormSchema,
  STAV_LABEL,
  TYP_NEHNUTELNOSTI_LABEL,
  visibleFields,
  visibleSections,
  VZTAH_LABEL,
  type AuditAction,
  type FormSchema,
  type Property,
  type Resident,
  type Submission,
  type SubmissionStatus,
} from '@obec/core'
import { useTenant } from '../app/tenant'
import { useAuth } from '../app/auth'
import { menoAktora } from '../app/auth'

/** Generátor PDF načítame až pri stiahnutí, aby sa nenačítaval pri štarte aplikácie. */
async function stiahniPdfPodania(
  ...argumenty: Parameters<typeof import('@obec/pdf').stiahniPdfPodania>
) {
  const modul = await import('@obec/pdf')
  return modul.stiahniPdfPodania(...argumenty)
}

const AUDIT_LABEL: Record<AuditAction, string> = {
  prijate: 'Podanie prijaté',
  zobrazene: 'Podanie zobrazené',
  zmena_stavu: 'Zmena stavu',
  stiahnute_pdf: 'Stiahnuté PDF',
  vymazane: 'Vymazané',
}

const STAVY: SubmissionStatus[] = ['prijate', 'v_rieseni', 'vybavene', 'zamietnute']

export function DetailPodania() {
  const { podanieId } = useParams<{ podanieId: string }>()
  const navigate = useNavigate()
  const { tenant, data } = useTenant()
  const { uzivatel } = useAuth()
  const { oznam } = useToast()

  const [podanie, setPodanie] = useState<Submission | null | undefined>(undefined)
  const [schema, setSchema] = useState<FormSchema | null>(null)
  const [obcan, setObcan] = useState<Resident | null>(null)
  const [nehnutelnost, setNehnutelnost] = useState<Property | null>(null)
  const [nacitavame, setNacitavame] = useState(true)

  const [stiahame, setStiahame] = useState(false)
  const [otvorenaZmenaStavu, setOtvorenaZmenaStavu] = useState(false)
  const [novyStav, setNovyStav] = useState<SubmissionStatus>('prijate')
  const [poznamkaStavu, setPoznamkaStavu] = useState('')
  const [ukladameStav, setUkladameStav] = useState(false)
  const [otvoreneVymazanie, setOtvoreneVymazanie] = useState(false)
  const [mazeme, setMazeme] = useState(false)

  const oznaceneAkoPrecitane = useRef<string | null>(null)

  const nacitajPodanie = useCallback(async () => {
    if (!podanieId) return
    const nacitane = await data.getSubmission(podanieId)
    setPodanie(nacitane)
    if (nacitane) {
      setSchema(getFormSchema(nacitane.formId) ?? null)
      setNovyStav(nacitane.status)
      if (nacitane.residentId) {
        const r = await data.getResident(nacitane.residentId)
        setObcan(r)
      } else {
        setObcan(null)
      }
      if (nacitane.propertyId) {
        const p = await data.getProperty(nacitane.propertyId)
        setNehnutelnost(p)
      } else {
        setNehnutelnost(null)
      }
    }
  }, [data, podanieId])

  useEffect(() => {
    let zrusene = false
    setNacitavame(true)
    nacitajPodanie().finally(() => {
      if (!zrusene) setNacitavame(false)
    })
    return () => {
      zrusene = true
    }
  }, [nacitajPodanie])

  useEffect(() => {
    if (!podanie) return
    if (oznaceneAkoPrecitane.current === podanie.id) return
    oznaceneAkoPrecitane.current = podanie.id
    data.markSubmissionRead(podanie.id, menoAktora(uzivatel))
  }, [podanie, data, uzivatel])

  async function stiahnutPdf() {
    if (!podanie || !schema) return
    setStiahame(true)
    try {
      await stiahniPdfPodania(
        { schema, podanie, tenant, zakladnaUrl: import.meta.env.BASE_URL },
        `${schema.pdfNazov}-${podanie.cisloPodania}`,
      )
      await data.logAudit(podanie.id, 'stiahnute_pdf', menoAktora(uzivatel))
      await nacitajPodanie()
      oznam('PDF podania bolo stiahnuté.', 'uspech')
    } catch {
      oznam('PDF sa nepodarilo vytvoriť. Skúste to prosím znova.', 'chyba')
    } finally {
      setStiahame(false)
    }
  }

  async function ulozitZmenuStavu() {
    if (!podanie) return
    setUkladameStav(true)
    try {
      await data.changeSubmissionStatus(
        podanie.id,
        novyStav,
        menoAktora(uzivatel),
        poznamkaStavu.trim() || undefined,
      )
      await nacitajPodanie()
      setOtvorenaZmenaStavu(false)
      setPoznamkaStavu('')
      oznam('Stav podania bol zmenený.', 'uspech')
    } catch {
      oznam('Stav sa nepodarilo zmeniť. Skúste to prosím znova.', 'chyba')
    } finally {
      setUkladameStav(false)
    }
  }

  async function vymazatPodanie() {
    if (!podanie) return
    setMazeme(true)
    try {
      await data.deleteSubmission(podanie.id, menoAktora(uzivatel))
      oznam('Podanie bolo vymazané.', 'uspech')
      navigate('/podania')
    } catch {
      oznam('Podanie sa nepodarilo vymazať. Skúste to prosím znova.', 'chyba')
      setMazeme(false)
    }
  }

  if (nacitavame) {
    return (
      <div className="flex justify-center py-16">
        <Spinner popis="Načítavame podanie" />
      </div>
    )
  }

  if (!podanie) {
    return (
      <EmptyState
        nadpis="Podanie sa nenašlo"
        popis="Toto podanie neexistuje alebo bolo vymazané."
        akcia={
          <Button variant="secondary" onClick={() => navigate('/podania')}>
            Späť na prijaté podania
          </Button>
        }
      />
    )
  }

  const sekcie = schema ? visibleSections(schema, podanie.data) : []

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <Link
          to="/podania"
          className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline netlacit"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Prijaté podania
        </Link>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium text-ink-muted">{podanie.cisloPodania}</p>
            <h1 className="text-2xl font-semibold sm:text-3xl">{podanie.formNazov}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <StatusBadge stav={podanie.status} label={STAV_LABEL[podanie.status] ?? podanie.status} />
              <span className="text-sm text-ink-muted">
                Prijaté {formatDateTime(podanie.prijateAt)}
              </span>
            </div>
          </div>
          <div className="flex flex-col flex-wrap gap-2 netlacit sm:flex-row">
            <Button variant="secondary" onClick={stiahnutPdf} pracuje={stiahame} pracujeText="Sťahujeme…">
              <Download className="h-4 w-4" aria-hidden="true" />
              Stiahnuť PDF
            </Button>
            <Button variant="secondary" onClick={() => window.print()}>
              <Printer className="h-4 w-4" aria-hidden="true" />
              Tlačiť
            </Button>
            {can(uzivatel?.role, 'podania.menit_stav') ? (
              <Button variant="secondary" onClick={() => setOtvorenaZmenaStavu(true)}>
                Zmeniť stav
              </Button>
            ) : null}
            {can(uzivatel?.role, 'podania.mazat') ? (
              <Button variant="danger" onClick={() => setOtvoreneVymazanie(true)}>
                Vymazať
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      <Card className="p-5">
        <h2 className="mb-3 text-lg font-semibold">Žiadateľ</h2>
        <DefinitionList
          polozky={[
            { label: 'Meno', hodnota: podanie.ziadatelMeno },
            { label: 'E-mail', hodnota: podanie.ziadatelEmail },
            {
              label: 'Registrácia',
              hodnota: podanie.residentId ? 'Registrovaný občan' : 'Neregistrovaný žiadateľ',
            },
            ...(obcan
              ? [
                  { label: 'Telefón', hodnota: obcan.telefon },
                  {
                    label: 'Trvalý pobyt',
                    hodnota: `${[obcan.trvalyPobyt.ulica, [obcan.trvalyPobyt.supisneCislo, obcan.trvalyPobyt.orientacneCislo].filter(Boolean).join('/')].filter(Boolean).join(' ')}, ${obcan.trvalyPobyt.psc} ${obcan.trvalyPobyt.obec}`,
                  },
                ]
              : []),
          ]}
        />
        {obcan ? (
          <div className="mt-4 rounded-control border border-line bg-canvas p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">
              Rodné číslo
            </p>
            <p className="mt-0.5 text-base font-medium text-ink">
              {formatRodneCislo(obcan.rodneCislo)}
            </p>
            <p className="mt-1 text-sm text-ink-muted">
              Tento údaj je chránený a slúži len na vyhotovenie úradných listín.
            </p>
          </div>
        ) : null}
      </Card>

      {podanie.propertyId && nehnutelnost ? (
        <Card className="p-5">
          <h2 className="mb-3 text-lg font-semibold">Nehnuteľnosť</h2>
          <DefinitionList
            polozky={[
              { label: 'Typ', hodnota: TYP_NEHNUTELNOSTI_LABEL[nehnutelnost.typ] ?? nehnutelnost.typ },
              { label: 'Vzťah', hodnota: VZTAH_LABEL[nehnutelnost.vztah] ?? nehnutelnost.vztah },
              {
                label: 'Adresa',
                hodnota: `${[nehnutelnost.adresa.ulica, [nehnutelnost.adresa.supisneCislo, nehnutelnost.adresa.orientacneCislo].filter(Boolean).join('/')].filter(Boolean).join(' ')}, ${nehnutelnost.adresa.psc} ${nehnutelnost.adresa.obec}`,
              },
              { label: 'Katastrálne územie', hodnota: nehnutelnost.katastralneUzemie },
              {
                label: 'Parcela',
                hodnota: `${nehnutelnost.parcelaCislo} (register ${nehnutelnost.parcelaRegister})`,
              },
              { label: 'Číslo LV', hodnota: nehnutelnost.cisloLv },
              ...(nehnutelnost.rokKolaudacie
                ? [{ label: 'Rok kolaudácie', hodnota: nehnutelnost.rokKolaudacie }]
                : []),
              ...(nehnutelnost.vymeraM2
                ? [{ label: 'Výmera', hodnota: `${nehnutelnost.vymeraM2} m²` }]
                : []),
            ]}
          />
        </Card>
      ) : null}

      {schema ? (
        <Card className="p-5">
          <h2 className="mb-3 text-lg font-semibold">Údaje zo žiadosti</h2>
          <div className="flex flex-col gap-5">
            {sekcie.map((sekcia) => {
              const polia = visibleFields(sekcia, podanie.data)
              return (
                <div key={sekcia.id} className="border-t border-line pt-4 first:border-t-0 first:pt-0">
                  <h3 className="mb-2 font-semibold text-ink">{sekcia.title}</h3>
                  <div className="flex flex-col gap-3">
                    {polia.map((pole) => {
                      if (pole.type === 'propertyPicker') return null
                      if (pole.type === 'info') {
                        return (
                          <p key={pole.id} className="text-xs text-ink-muted">
                            {pole.text}
                          </p>
                        )
                      }
                      return (
                        <DefinitionList
                          key={pole.id}
                          polozky={[
                            { label: pole.label, hodnota: hodnotaPola(pole.type, podanie.data[pole.id], tenant, pole) },
                          ]}
                          className="sm:grid-cols-1"
                        />
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      ) : null}

      <Card className="p-5">
        <h2 className="mb-3 text-lg font-semibold">Prílohy</h2>
        {podanie.prilohy.length === 0 ? (
          <p className="text-sm text-ink-muted">K podaniu nie sú priložené žiadne súbory.</p>
        ) : (
          <>
            <ul className="flex flex-col gap-3">
              {podanie.prilohy.map((p) => (
                <li key={p.id} className="flex items-center gap-3">
                  {p.nahlad ? (
                    <img
                      src={p.nahlad}
                      alt={`Náhľad súboru ${p.nazovSuboru}`}
                      className="h-12 w-12 shrink-0 rounded-control border border-line object-cover"
                    />
                  ) : null}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{p.nazovSuboru}</p>
                    <p className="text-xs text-ink-muted">{formatVelkost(p.velkostBajtov)}</p>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-sm text-ink-muted">
              V tejto ukážke sa priložené súbory nedajú stiahnuť.
            </p>
          </>
        )}
      </Card>

      <Card className="p-5">
        <h2 className="mb-3 text-lg font-semibold">História podania</h2>
        <ol className="flex flex-col gap-3">
          {podanie.audit.map((zaznam) => (
            <li key={zaznam.id} className="border-l-2 border-line pl-3">
              <p className="text-sm font-medium text-ink">
                {AUDIT_LABEL[zaznam.action] ?? zaznam.action}
              </p>
              <p className="text-xs text-ink-muted">
                {formatDateTime(zaznam.at)}, {zaznam.aktor}
                {zaznam.poznamka ? `, ${zaznam.poznamka}` : ''}
              </p>
            </li>
          ))}
        </ol>
      </Card>

      <Card className="p-5 netlacit">
        <h2 className="mb-3 text-lg font-semibold">Ďalšie akcie</h2>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" disabled className="gap-2">
            Pridať poznámku
            <Badge>Čoskoro</Badge>
          </Button>
          <Button variant="secondary" disabled className="gap-2">
            Priradiť referentovi
            <Badge>Čoskoro</Badge>
          </Button>
          <Button variant="secondary" disabled className="gap-2">
            Odpovedať občanovi
            <Badge>Čoskoro</Badge>
          </Button>
        </div>
      </Card>

      <Modal
        otvorene={otvorenaZmenaStavu}
        nazov="Zmeniť stav podania"
        onZavriet={() => setOtvorenaZmenaStavu(false)}
        akcie={
          <>
            <Button variant="secondary" onClick={() => setOtvorenaZmenaStavu(false)}>
              Zrušiť
            </Button>
            <Button onClick={ulozitZmenuStavu} pracuje={ukladameStav} pracujeText="Ukladáme…">
              Uložiť stav
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Nový stav" htmlFor="novy-stav">
            <Select
              id="novy-stav"
              value={novyStav}
              onChange={(e) => setNovyStav(e.target.value as SubmissionStatus)}
            >
              {STAVY.map((s) => (
                <option key={s} value={s}>
                  {STAV_LABEL[s]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Poznámka" helper="Nepovinná poznámka k zmene stavu." htmlFor="poznamka-stavu">
            <textarea
              id="poznamka-stavu"
              value={poznamkaStavu}
              onChange={(e) => setPoznamkaStavu(e.target.value)}
              rows={3}
              className="w-full rounded-control border border-line bg-surface px-3 py-2.5 text-base text-ink placeholder:text-ink-faint"
            />
          </Field>
        </div>
      </Modal>

      <ConfirmModal
        otvorene={otvoreneVymazanie}
        nazov="Vymazať podanie"
        popis={`Podanie ${podanie.cisloPodania} natrvalo vymažeme. Túto akciu nie je možné vrátiť späť.`}
        potvrditText="Áno, vymazať podanie"
        nebezpecne
        onPotvrdit={vymazatPodanie}
        onZavriet={() => setOtvoreneVymazanie(false)}
      >
        {mazeme ? <Spinner popis="Mažeme podanie" /> : null}
      </ConfirmModal>
    </div>
  )
}

function hodnotaPola(
  typ: string,
  hodnota: unknown,
  tenant: ReturnType<typeof useTenant>['tenant'],
  pole: ReturnType<typeof visibleFields>[number],
): React.ReactNode {
  if (hodnota === undefined || hodnota === null || hodnota === '') return 'Neuvedené'

  if (typ === 'consent' || typ === 'checkbox') return hodnota ? 'Áno' : 'Nie'
  // Rodné číslo vidí úrad v plnom tvare, zobrazíme ho však čitateľne s lomkou.
  if (pole.validate === 'rodneCislo') return formatRodneCislo(String(hodnota))
  if (typ === 'date') return formatDate(String(hodnota))
  if (typ === 'select' || typ === 'radio') {
    const moznosti = fieldOptions(pole, tenant)
    return moznosti.find((o) => o.value === hodnota)?.label ?? String(hodnota)
  }
  if (typ === 'address') {
    const a = hodnota as { ulica?: string; supisneCislo?: string; orientacneCislo?: string; psc?: string; obec?: string }
    const cislo = [a.supisneCislo, a.orientacneCislo].filter(Boolean).join('/')
    return [[a.ulica, cislo].filter(Boolean).join(' '), [a.psc, a.obec].filter(Boolean).join(' ')]
      .filter(Boolean)
      .join(', ')
  }
  if (typ === 'file') {
    const zoznam = Array.isArray(hodnota) ? hodnota : []
    if (zoznam.length === 0) return 'Bez príloh'
    return zoznam.map((s) => (s as { nazovSuboru?: string }).nazovSuboru ?? 'príloha').join(', ')
  }
  return String(hodnota)
}
