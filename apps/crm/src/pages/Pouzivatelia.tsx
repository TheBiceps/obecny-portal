import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { ListChecks, Trash2, UserPlus } from 'lucide-react'
import {
  Alert,
  Badge,
  Button,
  Card,
  ConfirmModal,
  EmptyState,
  ErrorSummary,
  Field,
  Input,
  Modal,
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
  DataError,
  ROLA_LABEL,
  STAV_LABEL,
  STAV_POUZIVATELA_LABEL,
  can,
  formatDate,
  type StaffRole,
  type StaffUser,
  type Submission,
} from '@obec/core'
import { useAuth } from '../app/auth'
import { useTenant } from '../app/tenant'
import { useZmenyDat } from '../app/zmeny'

const schema = z.object({
  meno: z.string().min(1, 'Zadajte meno.'),
  priezvisko: z.string().min(1, 'Zadajte priezvisko.'),
  email: z.string().min(1, 'Zadajte e-mail.').email('Zadajte e-mail v tvare meno@domena.sk.'),
  role: z.enum(
    ['super_admin', 'referent_stavebny', 'referent_dopravy', 'referent_adries', 'citatel'],
    { errorMap: () => ({ message: 'Vyberte rolu.' }) },
  ),
})

type Hodnoty = z.infer<typeof schema>

const POLOZKY_ROLI: { hodnota: StaffRole; label: string }[] = [
  { hodnota: 'super_admin', label: ROLA_LABEL.super_admin },
  { hodnota: 'referent_stavebny', label: ROLA_LABEL.referent_stavebny },
  { hodnota: 'referent_dopravy', label: ROLA_LABEL.referent_dopravy },
  { hodnota: 'referent_adries', label: ROLA_LABEL.referent_adries },
  { hodnota: 'citatel', label: ROLA_LABEL.citatel },
]

const NERIESI: StaffRole[] = ['super_admin', 'citatel']

type Pocty = Record<string, { spolu: number; nevybavene: number }>

const LABEL_POLA: Record<string, string> = {
  meno: 'Meno',
  priezvisko: 'Priezvisko',
  email: 'E-mail',
  role: 'Rola',
}

function textPoctu(p?: { spolu: number; nevybavene: number }) {
  const spolu = p?.spolu ?? 0
  const nevybavene = p?.nevybavene ?? 0
  const slovo = spolu === 1 ? 'podanie' : spolu >= 2 && spolu <= 4 ? 'podania' : 'podaní'
  return `${spolu} ${slovo}, z toho ${nevybavene} nevybavené`
}

export function Pouzivatelia() {
  const { uzivatel } = useAuth()
  const { data } = useTenant()
  const { oznam } = useToast()
  const zmenyDat = useZmenyDat()

  const maOpravnenie = can(uzivatel?.role, 'pouzivatelia.spravovat')

  const [zoznam, setZoznam] = useState<StaffUser[] | null>(null)
  const [nacitavame, setNacitavame] = useState(true)
  const [chybaNacitania, setChybaNacitania] = useState<string | null>(null)

  const [pocty, setPocty] = useState<Pocty>({})
  const [vybrany, setVybrany] = useState<StaffUser | null>(null)
  const [podaniaVybraneho, setPodaniaVybraneho] = useState<Submission[] | null>(null)
  const [chybaPodani, setChybaPodani] = useState(false)

  const [otvorenaPozvanka, setOtvorenaPozvanka] = useState(false)
  const [naOdstranenie, setNaOdstranenie] = useState<StaffUser | null>(null)
  const [odstranujeme, setOdstranujeme] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Hodnoty>({
    resolver: zodResolver(schema),
    defaultValues: { meno: '', priezvisko: '', email: '', role: 'referent_stavebny' },
  })

  const nacitatZoznam = useCallback(async () => {
    setNacitavame(true)
    setChybaNacitania(null)
    try {
      const zamestnanci = await data.listStaff()
      setZoznam(zamestnanci)
      if (uzivatel) {
        const vsetky = await data.listSubmissions({ naStranu: 1000 }, uzivatel)
        const vypocet: Pocty = {}
        for (const p of vsetky.polozky) {
          if (!p.riesitelId) continue
          const z = (vypocet[p.riesitelId] ??= { spolu: 0, nevybavene: 0 })
          z.spolu += 1
          if (p.status === 'prijate' || p.status === 'v_rieseni') z.nevybavene += 1
        }
        setPocty(vypocet)
      }
    } catch {
      setChybaNacitania('Zoznam používateľov sa nepodarilo načítať. Skúste to prosím znova.')
    } finally {
      setNacitavame(false)
    }
  }, [data, uzivatel])

  useEffect(() => {
    if (!maOpravnenie) return
    nacitatZoznam()
  }, [nacitatZoznam, zmenyDat, maOpravnenie])

  useEffect(() => {
    if (!vybrany || !uzivatel) return
    let zrusene = false
    setPodaniaVybraneho(null)
    setChybaPodani(false)
    data
      .listSubmissions({ riesitelId: vybrany.id, naStranu: 100 }, uzivatel)
      .then((strana) => {
        if (!zrusene) setPodaniaVybraneho(strana.polozky)
      })
      .catch(() => {
        if (!zrusene) {
          setPodaniaVybraneho([])
          setChybaPodani(true)
        }
      })
    return () => {
      zrusene = true
    }
  }, [vybrany, data, uzivatel, zmenyDat])

  const chyby = Object.entries(errors).map(([kluc, chyba]) => ({
    fieldId: kluc,
    label: LABEL_POLA[kluc] ?? kluc,
    sprava: (chyba?.message as string) ?? 'Skontrolujte pole.',
  }))

  function zavriePozvanku() {
    setOtvorenaPozvanka(false)
    reset({ meno: '', priezvisko: '', email: '', role: 'referent_stavebny' })
  }

  const onOdoslatPozvanku = handleSubmit(async (hodnoty) => {
    try {
      await data.inviteStaff(hodnoty)
      zavriePozvanku()
      await nacitatZoznam()
      oznam('Pozvánku sme pripravili.', 'uspech')
    } catch (e) {
      if (e instanceof DataError && e.kod === 'email_obsadeny') {
        setError('email', { message: e.message })
      } else {
        setError('email', { message: 'Pozvánku sa nepodarilo odoslať. Skúste to prosím znova.' })
      }
    }
  })

  async function potvrditOdstranenie() {
    if (!naOdstranenie) return
    setOdstranujeme(true)
    try {
      await data.deleteStaff(naOdstranenie.id)
      setNaOdstranenie(null)
      await nacitatZoznam()
      oznam('Používateľa sme odstránili zo zoznamu.', 'uspech')
    } catch {
      oznam('Používateľa sa nepodarilo odstrániť. Skúste to prosím znova.', 'chyba')
    } finally {
      setOdstranujeme(false)
    }
  }

  if (!maOpravnenie) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader nadpis="Používatelia" />
        <Alert ton="varovanie">
          <p>Správa používateľov patrí hlavnému správcovi. Vaša rola k nej nemá prístup.</p>
        </Alert>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        nadpis="Používatelia"
        popis="Hlavný správca môže pozvať zamestnancov úradu do CRM a spravovať ich prístup."
        akcie={
          <Button onClick={() => setOtvorenaPozvanka(true)}>
            <UserPlus className="h-4 w-4" aria-hidden="true" />
            Pozvať zamestnanca
          </Button>
        }
      />

      {chybaNacitania ? (
        <Alert ton="chyba">
          <p>{chybaNacitania}</p>
        </Alert>
      ) : null}

      <p className="sr-only" aria-live="polite">
        {nacitavame
          ? 'Načítavame zoznam používateľov.'
          : `Počet používateľov: ${zoznam?.length ?? 0}.`}
      </p>

      {nacitavame ? (
        <p className="text-sm text-ink-muted">Načítavame zoznam používateľov…</p>
      ) : zoznam && zoznam.length > 0 ? (
        <Table popis="Zoznam zamestnancov úradu s rolou, stavom a dátumom vytvorenia">
          <thead>
            <tr>
              <Th>Meno a priezvisko</Th>
              <Th>E-mail</Th>
              <Th>Rola</Th>
              <Th>Stav</Th>
              <Th>Pridelené podania</Th>
              <Th>Vytvorené</Th>
              <Th>
                <span className="sr-only">Akcie</span>
              </Th>
            </tr>
          </thead>
          <tbody>
            {zoznam.map((s) => {
              const jeVlastneKonto = s.id === uzivatel?.id
              return (
                <tr
                  key={s.id}
                  className="cursor-pointer transition-colors duration-150 hover:bg-canvas"
                  onClick={() => setVybrany(s)}
                >
                  <Td>
                    {s.meno} {s.priezvisko}
                  </Td>
                  <Td>{s.email}</Td>
                  <Td>{ROLA_LABEL[s.role] ?? s.role}</Td>
                  <Td>
                    <Badge
                      ton={
                        s.status === 'pozvany'
                          ? 'varovanie'
                          : s.status === 'aktivny'
                            ? 'uspech'
                            : 'neutral'
                      }
                    >
                      {STAV_POUZIVATELA_LABEL[s.status] ?? s.status}
                    </Badge>
                  </Td>
                  <Td>
                    {NERIESI.includes(s.role) ? (
                      <span className="text-ink-muted">Nerieši podania</span>
                    ) : (
                      textPoctu(pocty[s.id])
                    )}
                  </Td>
                  <Td>{formatDate(s.createdAt)}</Td>
                  <Td>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          setVybrany(s)
                        }}
                        aria-label={`Zobraziť podania zamestnanca ${s.meno} ${s.priezvisko}`}
                      >
                        <ListChecks className="h-4 w-4" aria-hidden="true" />
                        Zobraziť podania
                      </Button>
                      {jeVlastneKonto ? (
                        <span className="text-sm text-ink-muted">Vaše konto</span>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            setNaOdstranenie(s)
                          }}
                          aria-label={`Odstrániť používateľa ${s.meno} ${s.priezvisko}`}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                          Odstrániť
                        </Button>
                      )}
                    </div>
                  </Td>
                </tr>
              )
            })}
          </tbody>
        </Table>
      ) : (
        <EmptyState
          nadpis="Zatiaľ žiadni používatelia"
          popis="Pozvite prvého zamestnanca úradu pomocou tlačidla vyššie."
        />
      )}

      <Card className="p-5">
        <p className="mb-2 font-semibold text-ink">Oprávnenia podľa role</p>
        <ul className="list-inside list-disc space-y-1 text-sm text-ink-muted">
          <li>
            <span className="font-medium text-ink">{ROLA_LABEL.super_admin}</span>: číta podania,
            mení ich stav, maže podania, spravuje používateľov a obnovuje ukážkové dáta.
          </li>
          <li>
            <span className="font-medium text-ink">Referenti</span> ({ROLA_LABEL.referent_stavebny},{' '}
            {ROLA_LABEL.referent_dopravy}, {ROLA_LABEL.referent_adries}): čítajú podania a menia
            ich stav.
          </li>
          <li>
            <span className="font-medium text-ink">{ROLA_LABEL.citatel}</span>: podania si len
            prezerá.
          </li>
        </ul>
        <p className="mt-3 text-sm text-ink-muted">
          Referent vidí iba podania svojej agendy, zatiaľ čo hlavný správca a čitateľ vidia všetky.
        </p>
      </Card>

      <Modal
        otvorene={otvorenaPozvanka}
        nazov="Pozvať zamestnanca"
        onZavriet={zavriePozvanku}
        akcie={
          <>
            <Button variant="secondary" onClick={zavriePozvanku}>
              Zrušiť
            </Button>
            <Button onClick={onOdoslatPozvanku} pracuje={isSubmitting}>
              Odoslať pozvánku
            </Button>
          </>
        }
      >
        <form className="flex flex-col gap-4" onSubmit={onOdoslatPozvanku} noValidate>
          <ErrorSummary chyby={chyby} />

          <div id="pole-meno">
            <Field label="Meno" required error={errors.meno?.message}>
              <Input autoComplete="given-name" {...register('meno')} />
            </Field>
          </div>

          <div id="pole-priezvisko">
            <Field label="Priezvisko" required error={errors.priezvisko?.message}>
              <Input autoComplete="family-name" {...register('priezvisko')} />
            </Field>
          </div>

          <div id="pole-email">
            <Field label="E-mail" required error={errors.email?.message}>
              <Input type="email" autoComplete="email" {...register('email')} />
            </Field>
          </div>

          <div id="pole-role">
            <Field label="Rola" required error={errors.role?.message}>
              <Select {...register('role')}>
                {POLOZKY_ROLI.map((r) => (
                  <option key={r.hodnota} value={r.hodnota}>
                    {r.label}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <p className="text-sm text-ink-muted">
            V ukážkovej verzii sa e-mail s pozvánkou neodosiela, používateľ ostáva v stave
            {' '}
            {STAV_POUZIVATELA_LABEL.pozvany}.
          </p>
        </form>
      </Modal>

      <Modal
        otvorene={vybrany !== null}
        nazov="Podania zamestnanca"
        popis={
          vybrany
            ? `${vybrany.meno} ${vybrany.priezvisko}, ${ROLA_LABEL[vybrany.role] ?? vybrany.role}`
            : undefined
        }
        onZavriet={() => setVybrany(null)}
        akcie={
          <Button variant="secondary" onClick={() => setVybrany(null)}>
            Zavrieť
          </Button>
        }
      >
        {podaniaVybraneho === null ? (
          <Spinner popis="Načítavame podania zamestnanca" />
        ) : chybaPodani ? (
          <Alert ton="chyba">
            <p>Podania zamestnanca sa nepodarilo načítať. Skúste to prosím znova.</p>
          </Alert>
        ) : podaniaVybraneho.length === 0 ? (
          <EmptyState
            nadpis="Žiadne pridelené podania"
            popis="Tomuto zamestnancovi zatiaľ nebolo pridelené žiadne podanie."
          />
        ) : (
          <ul className="flex flex-col gap-2">
            {podaniaVybraneho.map((p) => (
              <li key={p.id}>
                <Link
                  to={`/podania/${p.id}`}
                  onClick={() => setVybrany(null)}
                  className="flex min-h-[44px] flex-col gap-1 rounded-card border border-line p-3 transition-colors duration-150 hover:bg-canvas"
                >
                  <span className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium text-ink">{p.cisloPodania}</span>
                    <StatusBadge stav={p.status} label={STAV_LABEL[p.status] ?? p.status} />
                  </span>
                  <span className="text-sm text-ink">{p.formNazov}</span>
                  <span className="text-sm text-ink-muted">
                    {p.ziadatelMeno}, prijaté {formatDate(p.prijateAt)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Modal>

      <ConfirmModal
        otvorene={naOdstranenie !== null}
        nazov="Odstrániť používateľa"
        popis={
          naOdstranenie
            ? `Používateľa ${naOdstranenie.meno} ${naOdstranenie.priezvisko} odstránime zo zoznamu.`
            : undefined
        }
        potvrditText="Odstrániť"
        zrusitText="Zrušiť"
        nebezpecne
        onPotvrdit={potvrditOdstranenie}
        onZavriet={() => setNaOdstranenie(null)}
      >
        <p className="text-sm text-ink-muted">
          {odstranujeme ? 'Odstraňujeme používateľa…' : 'Túto akciu nemožno vrátiť späť.'}
        </p>
      </ConfirmModal>
    </div>
  )
}
