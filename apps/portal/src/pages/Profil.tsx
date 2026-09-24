import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import {
  Alert,
  Button,
  Card,
  ConfirmModal,
  DefinitionList,
  EmptyState,
  ErrorSummary,
  Field,
  Input,
  Modal,
  PageHeader,
  Spinner,
  useToast,
} from '@obec/ui'
import {
  DataError,
  formatRodneCislo,
  isEmailValid,
  isPscValid,
  isTelefonValid,
  TYP_NEHNUTELNOSTI_LABEL,
  VZTAH_LABEL,
  type Property,
} from '@obec/core'
import { useTenant } from '../app/tenant'
import { useAuth } from '../app/auth'
import {
  NehnutelnostFormular,
  prazdnaNehnutelnost,
  skontrolujNehnutelnost,
  type NehnutelnostHodnoty,
} from '../components/NehnutelnostFormular'

/* ------------------------------------------------------------------ */
/* Karta osobných údajov                                                */
/* ------------------------------------------------------------------ */

const osobneSchema = z.object({
  titul: z.string().optional(),
  meno: z.string().min(1, 'Zadajte meno.'),
  priezvisko: z.string().min(1, 'Zadajte priezvisko.'),
  telefon: z
    .string()
    .min(1, 'Zadajte telefón.')
    .refine((v) => isTelefonValid(v), 'Zadajte platné telefónne číslo, napríklad +421 9xx xxx xxx.'),
  email: z
    .string()
    .min(1, 'Zadajte e-mail.')
    .refine((v) => isEmailValid(v), 'Zadajte e-mail v tvare meno@domena.sk.'),
})

type OsobneHodnoty = z.infer<typeof osobneSchema>

function KartaOsobneUdaje() {
  const { data } = useTenant()
  const { obcan, obnovit } = useAuth()
  const { oznam } = useToast()
  const [editacia, setEditacia] = useState(false)
  const [ukladame, setUkladame] = useState(false)
  const [chyba, setChyba] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<OsobneHodnoty>({
    resolver: zodResolver(osobneSchema),
    defaultValues: {
      titul: obcan?.titul ?? '',
      meno: obcan?.meno ?? '',
      priezvisko: obcan?.priezvisko ?? '',
      telefon: obcan?.telefon ?? '',
      email: obcan?.email ?? '',
    },
  })

  if (!obcan) return null

  const chybyZhrnutie = Object.entries(errors).map(([kluc, ch]) => ({
    fieldId: `osobne-${kluc}`,
    label: OSOBNE_LABEL[kluc] ?? kluc,
    sprava: (ch?.message as string) ?? 'Skontrolujte pole.',
  }))

  function zacatEditaciu() {
    reset({
      titul: obcan!.titul ?? '',
      meno: obcan!.meno,
      priezvisko: obcan!.priezvisko,
      telefon: obcan!.telefon,
      email: obcan!.email,
    })
    setChyba(null)
    setEditacia(true)
  }

  const onUlozit = handleSubmit(async (hodnoty) => {
    setUkladame(true)
    setChyba(null)
    try {
      await data.updateResident(obcan.id, hodnoty)
      await obnovit()
      setEditacia(false)
      oznam('Osobné údaje sme uložili.', 'uspech')
    } catch (e) {
      if (e instanceof DataError && e.kod === 'email_obsadeny') {
        setChyba('Tento e-mail už používa iné konto.')
      } else {
        setChyba('Uloženie sa nepodarilo. Skúste to prosím znova.')
      }
    } finally {
      setUkladame(false)
    }
  })

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-lg font-semibold text-ink">Osobné údaje</h2>
        {!editacia ? (
          <Button variant="secondary" size="sm" onClick={zacatEditaciu}>
            <Pencil className="h-4 w-4" aria-hidden="true" />
            Upraviť
          </Button>
        ) : null}
      </div>

      {!editacia ? (
        <>
          <DefinitionList
            className="mt-4"
            polozky={[
              { label: 'Meno a priezvisko', hodnota: [obcan.titul, obcan.meno, obcan.priezvisko].filter(Boolean).join(' ') },
              { label: 'Telefón', hodnota: obcan.telefon },
              { label: 'E-mail', hodnota: obcan.email },
              { label: 'Rodné číslo', hodnota: formatRodneCislo(obcan.rodneCislo) },
            ]}
          />
          <p className="mt-3 text-sm text-ink-muted">
            Toto je váš vlastný profil, preto tu vidíte rodné číslo v plnom tvare. V ostatných častiach
            portálu ho zobrazujeme zakryté.
          </p>
        </>
      ) : (
        <form className="mt-4 flex flex-col gap-4" onSubmit={onUlozit} noValidate>
          <ErrorSummary chyby={chybyZhrnutie} />

          {chyba ? (
            <Alert ton="chyba">
              <p>{chyba}</p>
            </Alert>
          ) : null}

          <div id="pole-osobne-titul">
            <Field label="Titul">
              <Input {...register('titul')} />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div id="pole-osobne-meno">
              <Field label="Meno" required error={errors.meno?.message}>
                <Input {...register('meno')} />
              </Field>
            </div>
            <div id="pole-osobne-priezvisko">
              <Field label="Priezvisko" required error={errors.priezvisko?.message}>
                <Input {...register('priezvisko')} />
              </Field>
            </div>
          </div>

          <div id="pole-osobne-telefon">
            <Field label="Telefón" required error={errors.telefon?.message}>
              <Input type="tel" {...register('telefon')} />
            </Field>
          </div>

          <div id="pole-osobne-email">
            <Field label="E-mail" required error={errors.email?.message}>
              <Input type="email" {...register('email')} />
            </Field>
          </div>

          <div className="flex flex-wrap justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setEditacia(false)}>
              Zrušiť
            </Button>
            <Button type="submit" pracuje={ukladame}>
              Uložiť zmeny
            </Button>
          </div>
        </form>
      )}
    </Card>
  )
}

const OSOBNE_LABEL: Record<string, string> = {
  titul: 'Titul',
  meno: 'Meno',
  priezvisko: 'Priezvisko',
  telefon: 'Telefón',
  email: 'E-mail',
}

/* ------------------------------------------------------------------ */
/* Karta trvalého pobytu                                                */
/* ------------------------------------------------------------------ */

const pobytSchema = z.object({
  ulica: z.string().min(1, 'Zadajte ulicu.'),
  supisneCislo: z.string().optional(),
  orientacneCislo: z.string().optional(),
  obec: z.string().min(1, 'Zadajte obec.'),
  psc: z.string().min(1, 'Zadajte PSČ.').refine((v) => isPscValid(v), 'Zadajte platné päťmiestne PSČ.'),
})

type PobytHodnoty = z.infer<typeof pobytSchema>

function KartaTrvalyPobyt() {
  const { data } = useTenant()
  const { obcan, obnovit } = useAuth()
  const { oznam } = useToast()
  const [editacia, setEditacia] = useState(false)
  const [ukladame, setUkladame] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PobytHodnoty>({
    resolver: zodResolver(pobytSchema),
    defaultValues: {
      ulica: obcan?.trvalyPobyt.ulica ?? '',
      supisneCislo: obcan?.trvalyPobyt.supisneCislo ?? '',
      orientacneCislo: obcan?.trvalyPobyt.orientacneCislo ?? '',
      obec: obcan?.trvalyPobyt.obec ?? '',
      psc: obcan?.trvalyPobyt.psc ?? '',
    },
  })

  if (!obcan) return null

  const chybyZhrnutie = Object.entries(errors).map(([kluc, ch]) => ({
    fieldId: `pobyt-${kluc}`,
    label: POBYT_LABEL[kluc] ?? kluc,
    sprava: (ch?.message as string) ?? 'Skontrolujte pole.',
  }))

  function zacatEditaciu() {
    reset({
      ulica: obcan!.trvalyPobyt.ulica,
      supisneCislo: obcan!.trvalyPobyt.supisneCislo ?? '',
      orientacneCislo: obcan!.trvalyPobyt.orientacneCislo ?? '',
      obec: obcan!.trvalyPobyt.obec,
      psc: obcan!.trvalyPobyt.psc,
    })
    setEditacia(true)
  }

  const onUlozit = handleSubmit(async (hodnoty) => {
    setUkladame(true)
    try {
      await data.updateResident(obcan.id, { trvalyPobyt: hodnoty })
      await obnovit()
      setEditacia(false)
      oznam('Trvalý pobyt sme uložili.', 'uspech')
    } finally {
      setUkladame(false)
    }
  })

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-lg font-semibold text-ink">Trvalý pobyt</h2>
        {!editacia ? (
          <Button variant="secondary" size="sm" onClick={zacatEditaciu}>
            <Pencil className="h-4 w-4" aria-hidden="true" />
            Upraviť
          </Button>
        ) : null}
      </div>

      {!editacia ? (
        <DefinitionList
          className="mt-4"
          polozky={[
            {
              label: 'Adresa',
              hodnota: `${obcan.trvalyPobyt.ulica}${obcan.trvalyPobyt.supisneCislo ? ` ${obcan.trvalyPobyt.supisneCislo}` : ''}${obcan.trvalyPobyt.orientacneCislo ? `/${obcan.trvalyPobyt.orientacneCislo}` : ''}`,
            },
            { label: 'Obec', hodnota: obcan.trvalyPobyt.obec },
            { label: 'PSČ', hodnota: obcan.trvalyPobyt.psc },
          ]}
        />
      ) : (
        <form className="mt-4 flex flex-col gap-4" onSubmit={onUlozit} noValidate>
          <ErrorSummary chyby={chybyZhrnutie} />

          <div className="grid gap-4 sm:grid-cols-2">
            <div id="pole-pobyt-ulica">
              <Field label="Ulica" required error={errors.ulica?.message}>
                <Input {...register('ulica')} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div id="pole-pobyt-supisneCislo">
                <Field label="Súpisné číslo">
                  <Input {...register('supisneCislo')} />
                </Field>
              </div>
              <div id="pole-pobyt-orientacneCislo">
                <Field label="Orientačné číslo">
                  <Input {...register('orientacneCislo')} />
                </Field>
              </div>
            </div>
            <div id="pole-pobyt-obec">
              <Field label="Obec" required error={errors.obec?.message}>
                <Input {...register('obec')} />
              </Field>
            </div>
            <div id="pole-pobyt-psc">
              <Field label="PSČ" required error={errors.psc?.message}>
                <Input {...register('psc')} inputMode="numeric" />
              </Field>
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setEditacia(false)}>
              Zrušiť
            </Button>
            <Button type="submit" pracuje={ukladame}>
              Uložiť zmeny
            </Button>
          </div>
        </form>
      )}
    </Card>
  )
}

const POBYT_LABEL: Record<string, string> = {
  ulica: 'Ulica',
  supisneCislo: 'Súpisné číslo',
  orientacneCislo: 'Orientačné číslo',
  obec: 'Obec',
  psc: 'PSČ',
}

/* ------------------------------------------------------------------ */
/* Karta nehnuteľností                                                  */
/* ------------------------------------------------------------------ */

function KartaNehnutelnosti() {
  const { tenant, data } = useTenant()
  const { obcan } = useAuth()
  const { oznam } = useToast()

  const [nehnutelnosti, setNehnutelnosti] = useState<Property[]>([])
  const [nacitavame, setNacitavame] = useState(true)

  const [modalOtvoreny, setModalOtvoreny] = useState(false)
  const [upravovanaId, setUpravovanaId] = useState<string | null>(null)
  const [rozpracovana, setRozpracovana] = useState<NehnutelnostHodnoty | null>(null)
  const [chybyFormulara, setChybyFormulara] = useState<Record<string, string>>({})
  const [ukladame, setUkladame] = useState(false)

  const [mazanaId, setMazanaId] = useState<string | null>(null)
  const [mazeme, setMazeme] = useState(false)

  useEffect(() => {
    if (!obcan) return
    let zrusene = false
    setNacitavame(true)
    data.listProperties(obcan.id).then((zoznam) => {
      if (!zrusene) {
        setNehnutelnosti(zoznam)
        setNacitavame(false)
      }
    })
    return () => {
      zrusene = true
    }
  }, [data, obcan])

  if (!obcan) return null

  function otvoritPridanie() {
    setUpravovanaId(null)
    setRozpracovana(prazdnaNehnutelnost(tenant))
    setChybyFormulara({})
    setModalOtvoreny(true)
  }

  function otvoritUpravu(n: Property) {
    setUpravovanaId(n.id)
    setRozpracovana({
      nazov: n.nazov,
      typ: n.typ,
      vztah: n.vztah,
      adresa: n.adresa,
      katastralneUzemie: n.katastralneUzemie,
      parcelaCislo: n.parcelaCislo,
      parcelaRegister: n.parcelaRegister,
      cisloLv: n.cisloLv,
      cisloBytu: n.cisloBytu,
      vchod: n.vchod,
      poschodie: n.poschodie,
      podielNaSpolocnychCastiach: n.podielNaSpolocnychCastiach,
      nazovStavby: n.nazovStavby,
      rokKolaudacie: n.rokKolaudacie,
      vymeraM2: n.vymeraM2,
    })
    setChybyFormulara({})
    setModalOtvoreny(true)
  }

  async function ulozitNehnutelnost() {
    if (!rozpracovana || !obcan) return
    const ch = skontrolujNehnutelnost(rozpracovana)
    if (Object.keys(ch).length > 0) {
      setChybyFormulara(ch)
      return
    }
    setUkladame(true)
    try {
      if (upravovanaId) {
        const upravena = await data.updateProperty(upravovanaId, rozpracovana)
        setNehnutelnosti((zoznam) => zoznam.map((n) => (n.id === upravovanaId ? upravena : n)))
        oznam('Nehnuteľnosť sme upravili.', 'uspech')
      } else {
        const nova = await data.createProperty(obcan.id, rozpracovana)
        setNehnutelnosti((zoznam) => [...zoznam, nova])
        oznam('Nehnuteľnosť sme pridali.', 'uspech')
      }
      setModalOtvoreny(false)
      setRozpracovana(null)
    } finally {
      setUkladame(false)
    }
  }

  async function potvrditVymazanie() {
    if (!mazanaId) return
    setMazeme(true)
    try {
      await data.deleteProperty(mazanaId)
      setNehnutelnosti((zoznam) => zoznam.filter((n) => n.id !== mazanaId))
      oznam('Nehnuteľnosť sme vymazali.', 'uspech')
    } finally {
      setMazeme(false)
      setMazanaId(null)
    }
  }

  const mazana = nehnutelnosti.find((n) => n.id === mazanaId) ?? null

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-lg font-semibold text-ink">Moje nehnuteľnosti</h2>
        <Button variant="secondary" size="sm" onClick={otvoritPridanie}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Pridať nehnuteľnosť
        </Button>
      </div>

      <div className="mt-4">
        {nacitavame ? (
          <Spinner popis="Načítavame nehnuteľnosti" />
        ) : nehnutelnosti.length === 0 ? (
          <EmptyState
            nadpis="Zatiaľ nemáte pridanú žiadnu nehnuteľnosť"
            popis="Pridajte svoju nehnuteľnosť, aby ste ju mohli vybrať priamo pri podávaní žiadosti."
            akcia={
              <Button onClick={otvoritPridanie}>
                <Plus className="h-4 w-4" aria-hidden="true" />
                Pridať nehnuteľnosť
              </Button>
            }
          />
        ) : (
          <ul className="flex flex-col gap-3">
            {nehnutelnosti.map((n) => (
              <li
                key={n.id}
                className="flex flex-col gap-3 rounded-control border border-line p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-medium text-ink">
                    {n.nazov?.trim() || TYP_NEHNUTELNOSTI_LABEL[n.typ]}
                  </p>
                  <p className="text-sm text-ink-muted">
                    {TYP_NEHNUTELNOSTI_LABEL[n.typ]}, {VZTAH_LABEL[n.vztah]}
                  </p>
                  <p className="text-sm text-ink-muted">
                    {n.adresa.ulica}
                    {n.adresa.supisneCislo ? ` ${n.adresa.supisneCislo}` : ''}, {n.adresa.obec}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button variant="secondary" size="sm" onClick={() => otvoritUpravu(n)}>
                    <Pencil className="h-4 w-4" aria-hidden="true" />
                    Upraviť
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => setMazanaId(n.id)}>
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    Vymazať
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Modal
        otvorene={modalOtvoreny}
        nazov={upravovanaId ? 'Upraviť nehnuteľnosť' : 'Pridať nehnuteľnosť'}
        onZavriet={() => setModalOtvoreny(false)}
        akcie={
          <>
            <Button variant="secondary" onClick={() => setModalOtvoreny(false)}>
              Zrušiť
            </Button>
            <Button pracuje={ukladame} onClick={ulozitNehnutelnost}>
              Uložiť
            </Button>
          </>
        }
      >
        {rozpracovana ? (
          <NehnutelnostFormular
            hodnoty={rozpracovana}
            onZmena={setRozpracovana}
            chyby={chybyFormulara}
          />
        ) : null}
      </Modal>

      <ConfirmModal
        otvorene={mazanaId !== null}
        nazov="Vymazať nehnuteľnosť"
        popis={
          mazana
            ? `Naozaj chcete natrvalo vymazať nehnuteľnosť ${mazana.nazov?.trim() || TYP_NEHNUTELNOSTI_LABEL[mazana.typ]}? Táto akcia sa nedá vrátiť späť.`
            : undefined
        }
        potvrditText="Vymazať"
        nebezpecne
        onPotvrdit={potvrditVymazanie}
        onZavriet={() => setMazanaId(null)}
      />
    </Card>
  )
}

/* ------------------------------------------------------------------ */

export function Profil() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader nadpis="Môj profil" popis="Spravujte svoje osobné údaje, trvalý pobyt a nehnuteľnosti." />
      <KartaOsobneUdaje />
      <KartaTrvalyPobyt />
      <KartaNehnutelnosti />
    </div>
  )
}
