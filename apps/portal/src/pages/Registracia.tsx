import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Trash2 } from 'lucide-react'
import {
  Alert,
  Button,
  Card,
  Checkbox,
  ErrorSummary,
  Field,
  Input,
  Modal,
  Steps,
  useToast,
} from '@obec/ui'
import {
  DataError,
  formatRodneCislo,
  isEmailValid,
  isPscValid,
  isTelefonValid,
  maskRodneCislo,
  parseRodneCislo,
  TYP_NEHNUTELNOSTI_LABEL,
  vyhodnotHeslo,
  type Address,
} from '@obec/core'
import { useTenant } from '../app/tenant'
import { useAuth } from '../app/auth'
import {
  NehnutelnostFormular,
  prazdnaNehnutelnost,
  skontrolujNehnutelnost,
  type NehnutelnostHodnoty,
} from '../components/NehnutelnostFormular'

const KROKY = [
  { id: 'osobne', nazov: 'Osobné údaje' },
  { id: 'pobyt', nazov: 'Trvalý pobyt' },
  { id: 'nehnutelnosti', nazov: 'Moje nehnuteľnosti' },
  { id: 'suhlas', nazov: 'Súhlas a dokončenie' },
]

/* ------------------------------------------------------------------ */
/* Krok 1: osobné údaje                                                 */
/* ------------------------------------------------------------------ */

const osobneSchema = z
  .object({
    titul: z.string().optional(),
    meno: z.string().min(1, 'Zadajte meno.'),
    priezvisko: z.string().min(1, 'Zadajte priezvisko.'),
    rodneCislo: z
      .string()
      .min(1, 'Zadajte rodné číslo.')
      .refine((v) => parseRodneCislo(v).platne, 'Zadajte platné rodné číslo.'),
    telefon: z
      .string()
      .min(1, 'Zadajte telefón.')
      .refine((v) => isTelefonValid(v), 'Zadajte platné telefónne číslo, napríklad +421 9xx xxx xxx.'),
    email: z
      .string()
      .min(1, 'Zadajte e-mail.')
      .refine((v) => isEmailValid(v), 'Zadajte e-mail v tvare meno@domena.sk.'),
    heslo: z.string().min(8, 'Heslo musí mať aspoň 8 znakov.'),
    potvrdenieHesla: z.string().min(1, 'Zopakujte heslo.'),
  })
  .refine((v) => v.heslo === v.potvrdenieHesla, {
    message: 'Heslá sa nezhodujú.',
    path: ['potvrdenieHesla'],
  })

type OsobneHodnoty = z.infer<typeof osobneSchema>

/* ------------------------------------------------------------------ */
/* Krok 2: trvalý pobyt                                                 */
/* ------------------------------------------------------------------ */

const pobytSchema = z.object({
  ulica: z.string().min(1, 'Zadajte ulicu.'),
  supisneCislo: z.string().optional(),
  orientacneCislo: z.string().optional(),
  obec: z.string().min(1, 'Zadajte obec.'),
  psc: z.string().min(1, 'Zadajte PSČ.').refine((v) => isPscValid(v), 'Zadajte platné päťmiestne PSČ.'),
})

type PobytHodnoty = z.infer<typeof pobytSchema>

export function Registracia() {
  const { tenant, data } = useTenant()
  const { nastavObcana } = useAuth()
  const { oznam } = useToast()
  const navigate = useNavigate()

  const [krok, setKrok] = useState(0)
  const [osobne, setOsobne] = useState<OsobneHodnoty | null>(null)
  const [pobyt, setPobyt] = useState<PobytHodnoty | null>(null)
  const [nehnutelnosti, setNehnutelnosti] = useState<NehnutelnostHodnoty[]>([])
  const [modalOtvoreny, setModalOtvoreny] = useState(false)
  const [rozpracovanaNehnutelnost, setRozpracovanaNehnutelnost] = useState<NehnutelnostHodnoty | null>(null)
  const [chybyNehnutelnosti, setChybyNehnutelnosti] = useState<Record<string, string>>({})
  const [suhlas, setSuhlas] = useState(false)
  const [chybaSuhlasu, setChybaSuhlasu] = useState<string | null>(null)
  const [chybaOdoslania, setChybaOdoslania] = useState<string | null>(null)
  const [odosielame, setOdosielame] = useState(false)

  /* --- krok 1 --- */
  const {
    register: registerOsobne,
    handleSubmit: handleSubmitOsobne,
    watch: watchOsobne,
    setError: setErrorOsobne,
    formState: { errors: errorsOsobne },
  } = useForm<OsobneHodnoty>({
    resolver: zodResolver(osobneSchema),
    defaultValues: osobne ?? {
      titul: '',
      meno: '',
      priezvisko: '',
      rodneCislo: '',
      telefon: '',
      email: '',
      heslo: '',
      potvrdenieHesla: '',
    },
  })

  const rodneCisloSledovane = watchOsobne('rodneCislo')
  const hesloSledovane = watchOsobne('heslo')
  const infoRodneCislo = rodneCisloSledovane ? parseRodneCislo(rodneCisloSledovane) : null
  const silaHesla = vyhodnotHeslo(hesloSledovane ?? '')

  const chybyOsobne = Object.entries(errorsOsobne).map(([kluc, chyba]) => ({
    fieldId: kluc,
    label: OSOBNE_LABEL[kluc] ?? kluc,
    sprava: (chyba?.message as string) ?? 'Skontrolujte pole.',
  }))

  const onOsobneDalej = handleSubmitOsobne((hodnoty) => {
    setOsobne(hodnoty)
    setKrok(1)
  })

  /* --- krok 2 --- */
  const {
    register: registerPobyt,
    handleSubmit: handleSubmitPobyt,
    formState: { errors: errorsPobyt },
  } = useForm<PobytHodnoty>({
    resolver: zodResolver(pobytSchema),
    defaultValues: pobyt ?? {
      ulica: '',
      supisneCislo: '',
      orientacneCislo: '',
      obec: tenant.predvolenaAdresa.obec,
      psc: tenant.predvolenaAdresa.psc,
    },
  })

  const chybyPobyt = Object.entries(errorsPobyt).map(([kluc, chyba]) => ({
    fieldId: kluc,
    label: POBYT_LABEL[kluc] ?? kluc,
    sprava: (chyba?.message as string) ?? 'Skontrolujte pole.',
  }))

  const onPobytDalej = handleSubmitPobyt(async (hodnoty) => {
    setPobyt(hodnoty)
    setKrok(2)
  })

  /* --- krok 3: nehnuteľnosti --- */
  function otvoritPridanie() {
    setRozpracovanaNehnutelnost(prazdnaNehnutelnost(tenant))
    setChybyNehnutelnosti({})
    setModalOtvoreny(true)
  }

  function ulozitNehnutelnost() {
    if (!rozpracovanaNehnutelnost) return
    const ch = skontrolujNehnutelnost(rozpracovanaNehnutelnost)
    if (Object.keys(ch).length > 0) {
      setChybyNehnutelnosti(ch)
      return
    }
    setNehnutelnosti((zoznam) => [...zoznam, rozpracovanaNehnutelnost])
    setModalOtvoreny(false)
    setRozpracovanaNehnutelnost(null)
  }

  function odobratNehnutelnost(index: number) {
    setNehnutelnosti((zoznam) => zoznam.filter((_, i) => i !== index))
  }

  /* --- krok 4: súhlas a dokončenie --- */
  async function dokoncitRegistraciu() {
    if (!suhlas) {
      setChybaSuhlasu('Na dokončenie registrácie musíte súhlasiť so spracovaním osobných údajov.')
      return
    }
    if (!osobne || !pobyt) return
    setChybaSuhlasu(null)
    setChybaOdoslania(null)
    setOdosielame(true)
    try {
      const trvalyPobyt: Address = {
        ulica: pobyt.ulica,
        supisneCislo: pobyt.supisneCislo,
        orientacneCislo: pobyt.orientacneCislo,
        obec: pobyt.obec,
        psc: pobyt.psc,
      }
      const obcan = await data.registrovatObcana({
        titul: osobne.titul,
        meno: osobne.meno,
        priezvisko: osobne.priezvisko,
        rodneCislo: osobne.rodneCislo,
        telefon: osobne.telefon,
        email: osobne.email,
        heslo: osobne.heslo,
        trvalyPobyt,
        gdprSuhlas: suhlas,
      })
      for (const n of nehnutelnosti) {
        await data.createProperty(obcan.id, n)
      }
      nastavObcana(obcan)
      oznam('Konto sme vytvorili.', 'uspech')
      navigate('/profil')
    } catch (e) {
      if (e instanceof DataError && e.kod === 'email_obsadeny') {
        setKrok(0)
        setErrorOsobne('email', { message: 'Tento e-mail už je zaregistrovaný, prihláste sa prosím.' })
      } else if (e instanceof DataError) {
        setChybaOdoslania(e.message)
      } else {
        setChybaOdoslania('Registráciu sa nepodarilo dokončiť. Skúste to prosím znova.')
      }
    } finally {
      setOdosielame(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold sm:text-3xl">Registrácia</h1>
        <p className="mt-1 text-ink-muted">
          Vytvorte si konto, aby ste mohli podávať žiadosti a sledovať ich stav.
        </p>
      </div>

      <Steps kroky={KROKY} aktivny={krok} />

      <Card className="p-6 sm:p-8">
        {krok === 0 ? (
          <form className="flex flex-col gap-4" onSubmit={onOsobneDalej} noValidate>
            <ErrorSummary chyby={chybyOsobne} />

            <div id="pole-titul">
              <Field label="Titul">
                <Input {...registerOsobne('titul')} />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div id="pole-meno">
                <Field label="Meno" required error={errorsOsobne.meno?.message}>
                  <Input {...registerOsobne('meno')} />
                </Field>
              </div>
              <div id="pole-priezvisko">
                <Field label="Priezvisko" required error={errorsOsobne.priezvisko?.message}>
                  <Input {...registerOsobne('priezvisko')} />
                </Field>
              </div>
            </div>

            <div id="pole-rodneCislo">
              <Field
                label="Rodné číslo"
                required
                error={errorsOsobne.rodneCislo?.message}
                helper={
                  infoRodneCislo?.platne
                    ? `Rozpoznaný dátum narodenia: ${infoRodneCislo.datumNarodenia}.`
                    : 'Zadajte v tvare 940215/6789.'
                }
              >
                <Input {...registerOsobne('rodneCislo')} inputMode="numeric" />
              </Field>
            </div>

            <div id="pole-telefon">
              <Field
                label="Telefón"
                required
                error={errorsOsobne.telefon?.message}
                helper="Napríklad +421 9xx xxx xxx."
              >
                <Input type="tel" {...registerOsobne('telefon')} />
              </Field>
            </div>

            <div id="pole-email">
              <Field label="E-mail" required error={errorsOsobne.email?.message}>
                <Input type="email" autoComplete="email" {...registerOsobne('email')} />
              </Field>
            </div>

            <div id="pole-heslo">
              <Field
                label="Heslo"
                required
                error={errorsOsobne.heslo?.message}
                helper={`Sila hesla: ${silaHesla.popis}.`}
              >
                <Input type="password" autoComplete="new-password" {...registerOsobne('heslo')} />
              </Field>
              <div className="mt-2 flex gap-1" aria-hidden="true">
                {[0, 1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className={
                      'h-1.5 flex-1 rounded-full ' +
                      (i < silaHesla.skore ? 'bg-primary' : 'bg-line')
                    }
                  />
                ))}
              </div>
            </div>

            <div id="pole-potvrdenieHesla">
              <Field label="Potvrdenie hesla" required error={errorsOsobne.potvrdenieHesla?.message}>
                <Input type="password" autoComplete="new-password" {...registerOsobne('potvrdenieHesla')} />
              </Field>
            </div>

            <Button type="submit" className="mt-2 w-full">
              Pokračovať
            </Button>
          </form>
        ) : null}

        {krok === 1 ? (
          <form className="flex flex-col gap-4" onSubmit={onPobytDalej} noValidate>
            <ErrorSummary chyby={chybyPobyt} />

            <div className="grid gap-4 sm:grid-cols-2">
              <div id="pole-ulica">
                <Field label="Ulica" required error={errorsPobyt.ulica?.message}>
                  <Input {...registerPobyt('ulica')} />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div id="pole-supisneCislo">
                  <Field label="Súpisné číslo">
                    <Input {...registerPobyt('supisneCislo')} />
                  </Field>
                </div>
                <div id="pole-orientacneCislo">
                  <Field label="Orientačné číslo">
                    <Input {...registerPobyt('orientacneCislo')} />
                  </Field>
                </div>
              </div>
              <div id="pole-obec">
                <Field label="Obec" required error={errorsPobyt.obec?.message} doplnene>
                  <Input {...registerPobyt('obec')} />
                </Field>
              </div>
              <div id="pole-psc">
                <Field label="PSČ" required error={errorsPobyt.psc?.message} doplnene>
                  <Input {...registerPobyt('psc')} inputMode="numeric" />
                </Field>
              </div>
            </div>

            <div className="mt-2 flex flex-wrap justify-between gap-2">
              <Button type="button" variant="secondary" onClick={() => setKrok(0)}>
                Späť
              </Button>
              <Button type="submit">Pokračovať</Button>
            </div>
          </form>
        ) : null}

        {krok === 2 ? (
          <div className="flex flex-col gap-4">
            <Alert ton="info">
              <p>
                Tento krok môžete preskočiť. Nehnuteľnosti si viete pridať aj neskôr vo svojom profile.
              </p>
            </Alert>

            {nehnutelnosti.length === 0 ? (
              <p className="text-sm text-ink-muted">Zatiaľ ste nepridali žiadnu nehnuteľnosť.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {nehnutelnosti.map((n, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between gap-3 rounded-control border border-line bg-canvas px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-ink">
                        {n.nazov?.trim() || TYP_NEHNUTELNOSTI_LABEL[n.typ]}
                      </p>
                      <p className="truncate text-sm text-ink-muted">
                        {n.adresa.ulica}
                        {n.adresa.supisneCislo ? ` ${n.adresa.supisneCislo}` : ''}, {n.adresa.obec}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label={`Odobrať nehnuteľnosť ${n.nazov?.trim() || TYP_NEHNUTELNOSTI_LABEL[n.typ]}`}
                      onClick={() => odobratNehnutelnost(i)}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}

            <Button variant="secondary" onClick={otvoritPridanie} className="self-start">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Pridať nehnuteľnosť
            </Button>

            <div className="mt-2 flex flex-wrap justify-between gap-2">
              <Button type="button" variant="secondary" onClick={() => setKrok(1)}>
                Späť
              </Button>
              <Button type="button" onClick={() => setKrok(3)}>
                Pokračovať
              </Button>
            </div>
          </div>
        ) : null}

        {krok === 3 ? (
          <div className="flex flex-col gap-4">
            {chybaOdoslania ? (
              <Alert ton="chyba">
                <p>{chybaOdoslania}</p>
              </Alert>
            ) : null}

            <div>
              <h2 className="text-lg font-semibold text-ink">Súhrn zadaných údajov</h2>
              <dl className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-ink-faint">Meno</dt>
                  <dd className="mt-0.5 text-ink">
                    {[osobne?.titul, osobne?.meno, osobne?.priezvisko].filter(Boolean).join(' ')}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-ink-faint">Rodné číslo</dt>
                  <dd className="mt-0.5 text-ink">{maskRodneCislo(osobne?.rodneCislo ?? '')}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-ink-faint">Telefón</dt>
                  <dd className="mt-0.5 text-ink">{osobne?.telefon}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-ink-faint">E-mail</dt>
                  <dd className="mt-0.5 text-ink">{osobne?.email}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs font-medium uppercase tracking-wide text-ink-faint">Trvalý pobyt</dt>
                  <dd className="mt-0.5 text-ink">
                    {pobyt?.ulica}
                    {pobyt?.supisneCislo ? ` ${pobyt.supisneCislo}` : ''}
                    {pobyt?.orientacneCislo ? `/${pobyt.orientacneCislo}` : ''}, {pobyt?.psc} {pobyt?.obec}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs font-medium uppercase tracking-wide text-ink-faint">
                    Nehnuteľnosti
                  </dt>
                  <dd className="mt-0.5 text-ink">
                    {nehnutelnosti.length === 0
                      ? 'Žiadne'
                      : nehnutelnosti
                          .map((n) => n.nazov?.trim() || TYP_NEHNUTELNOSTI_LABEL[n.typ])
                          .join(', ')}
                  </dd>
                </div>
              </dl>
            </div>

            <Checkbox
              label={
                <>
                  Súhlasím so{' '}
                  <a
                    href="#/ochrana-udajov"
                    className="font-medium text-primary underline underline-offset-4"
                  >
                    spracovaním osobných údajov
                  </a>
                  .
                </>
              }
              checked={suhlas}
              onChange={(e) => {
                setSuhlas(e.target.checked)
                if (e.target.checked) setChybaSuhlasu(null)
              }}
              error={chybaSuhlasu ?? undefined}
            />

            <div className="mt-2 flex flex-wrap justify-between gap-2">
              <Button type="button" variant="secondary" onClick={() => setKrok(2)}>
                Späť
              </Button>
              <Button type="button" pracuje={odosielame} onClick={dokoncitRegistraciu}>
                Vytvoriť konto
              </Button>
            </div>
          </div>
        ) : null}
      </Card>

      <Modal
        otvorene={modalOtvoreny}
        nazov="Pridať nehnuteľnosť"
        onZavriet={() => setModalOtvoreny(false)}
        akcie={
          <>
            <Button variant="secondary" onClick={() => setModalOtvoreny(false)}>
              Zrušiť
            </Button>
            <Button onClick={ulozitNehnutelnost}>Pridať</Button>
          </>
        }
      >
        {rozpracovanaNehnutelnost ? (
          <NehnutelnostFormular
            hodnoty={rozpracovanaNehnutelnost}
            onZmena={setRozpracovanaNehnutelnost}
            chyby={chybyNehnutelnosti}
          />
        ) : null}
      </Modal>
    </div>
  )
}

const OSOBNE_LABEL: Record<string, string> = {
  titul: 'Titul',
  meno: 'Meno',
  priezvisko: 'Priezvisko',
  rodneCislo: 'Rodné číslo',
  telefon: 'Telefón',
  email: 'E-mail',
  heslo: 'Heslo',
  potvrdenieHesla: 'Potvrdenie hesla',
}

const POBYT_LABEL: Record<string, string> = {
  ulica: 'Ulica',
  supisneCislo: 'Súpisné číslo',
  orientacneCislo: 'Orientačné číslo',
  obec: 'Obec',
  psc: 'PSČ',
}
