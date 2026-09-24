import {
  Field,
  Input,
  RadioGroup,
  Select,
} from '@obec/ui'
import {
  isPscValid,
  TYP_NEHNUTELNOSTI_LABEL,
  VZTAH_LABEL,
  type ParcelRegister,
  type Property,
  type PropertyRelation,
  type PropertyType,
  type TenantConfig,
} from '@obec/core'
import { useTenant } from '../app/tenant'

/** Hodnoty formulára jednej nehnuteľnosti, zodpovedá PropertyInput z @obec/core. */
export interface NehnutelnostHodnoty {
  nazov?: string
  typ: PropertyType
  vztah: PropertyRelation
  adresa: Property['adresa']
  katastralneUzemie: string
  parcelaCislo: string
  parcelaRegister: ParcelRegister
  cisloLv: string
  cisloBytu?: string
  vchod?: string
  poschodie?: string
  podielNaSpolocnychCastiach?: string
  nazovStavby?: string
  rokKolaudacie?: string
  vymeraM2?: string
}

const TYP_OPTIONS = (Object.keys(TYP_NEHNUTELNOSTI_LABEL) as PropertyType[]).map((v) => ({
  value: v,
  label: TYP_NEHNUTELNOSTI_LABEL[v],
}))

const VZTAH_OPTIONS = (Object.keys(VZTAH_LABEL) as PropertyRelation[]).map((v) => ({
  value: v,
  label: VZTAH_LABEL[v],
}))

/** Prázdne hodnoty nehnuteľnosti, obec a PSČ predvyplnené z konfigurácie obce. */
export function prazdnaNehnutelnost(tenant: TenantConfig): NehnutelnostHodnoty {
  return {
    nazov: '',
    typ: 'rodinny_dom',
    vztah: 'vlastnik',
    adresa: {
      ulica: '',
      supisneCislo: '',
      orientacneCislo: '',
      obec: tenant.predvolenaAdresa.obec,
      psc: tenant.predvolenaAdresa.psc,
    },
    katastralneUzemie: tenant.katastralneUzemia[0] ?? '',
    parcelaCislo: '',
    parcelaRegister: 'C',
    cisloLv: '',
    cisloBytu: '',
    vchod: '',
    poschodie: '',
    podielNaSpolocnychCastiach: '',
    nazovStavby: '',
    rokKolaudacie: '',
    vymeraM2: '',
  }
}

/** Skontroluje povinné polia a vráti mapu chýb podľa identifikátora poľa. */
export function skontrolujNehnutelnost(h: NehnutelnostHodnoty): Record<string, string> {
  const chyby: Record<string, string> = {}
  if (!h.typ) chyby.typ = 'Vyberte typ nehnuteľnosti.'
  if (!h.vztah) chyby.vztah = 'Vyberte vzťah k nehnuteľnosti.'
  if (!h.adresa.ulica.trim()) chyby.ulica = 'Zadajte ulicu.'
  if (!h.adresa.obec.trim()) chyby.obec = 'Zadajte obec.'
  if (!isPscValid(h.adresa.psc)) chyby.psc = 'Zadajte platné päťmiestne PSČ.'
  if (!h.katastralneUzemie.trim()) chyby.katastralneUzemie = 'Vyberte katastrálne územie.'
  if (!h.parcelaCislo.trim()) chyby.parcelaCislo = 'Zadajte číslo parcely.'
  if (!h.parcelaRegister) chyby.parcelaRegister = 'Vyberte register parcely.'
  if (!h.cisloLv.trim()) chyby.cisloLv = 'Zadajte číslo listu vlastníctva.'
  return chyby
}

/** Znovupoužiteľný formulár jednej nehnuteľnosti, používa sa v registrácii aj v profile. */
export function NehnutelnostFormular({
  hodnoty,
  onZmena,
  chyby,
}: {
  hodnoty: NehnutelnostHodnoty
  onZmena: (h: NehnutelnostHodnoty) => void
  chyby?: Record<string, string>
}) {
  const { tenant } = useTenant()
  const ch = chyby ?? {}

  function zmenPole<K extends keyof NehnutelnostHodnoty>(kluc: K, hodnota: NehnutelnostHodnoty[K]) {
    onZmena({ ...hodnoty, [kluc]: hodnota })
  }

  function zmenAdresu<K extends keyof Property['adresa']>(kluc: K, hodnota: string) {
    onZmena({ ...hodnoty, adresa: { ...hodnoty.adresa, [kluc]: hodnota } })
  }

  return (
    <div className="flex flex-col gap-5">
      <RadioGroup
        legend="Typ nehnuteľnosti"
        name="typ-nehnutelnosti"
        options={TYP_OPTIONS}
        value={hodnoty.typ}
        onChange={(v) => zmenPole('typ', v as PropertyType)}
        error={ch.typ}
        required
      />

      <RadioGroup
        legend="Váš vzťah k nehnuteľnosti"
        name="vztah-nehnutelnosti"
        options={VZTAH_OPTIONS}
        value={hodnoty.vztah}
        onChange={(v) => zmenPole('vztah', v as PropertyRelation)}
        error={ch.vztah}
        required
      />

      <div id="pole-nazov">
        <Field label="Vlastný názov nehnuteľnosti" helper="Napríklad Náš dom, pomôže vám ju rozlíšiť v zozname.">
          <Input
            value={hodnoty.nazov ?? ''}
            onChange={(e) => zmenPole('nazov', e.target.value)}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div id="pole-ulica">
          <Field label="Ulica" required error={ch.ulica}>
            <Input
              value={hodnoty.adresa.ulica}
              onChange={(e) => zmenAdresu('ulica', e.target.value)}
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div id="pole-supisneCislo">
            <Field label="Súpisné číslo">
              <Input
                value={hodnoty.adresa.supisneCislo ?? ''}
                onChange={(e) => zmenAdresu('supisneCislo', e.target.value)}
              />
            </Field>
          </div>
          <div id="pole-orientacneCislo">
            <Field label="Orientačné číslo">
              <Input
                value={hodnoty.adresa.orientacneCislo ?? ''}
                onChange={(e) => zmenAdresu('orientacneCislo', e.target.value)}
              />
            </Field>
          </div>
        </div>
        <div id="pole-obec">
          <Field label="Obec" required error={ch.obec} doplnene>
            <Input
              value={hodnoty.adresa.obec}
              onChange={(e) => zmenAdresu('obec', e.target.value)}
            />
          </Field>
        </div>
        <div id="pole-psc">
          <Field label="PSČ" required error={ch.psc} helper="Napríklad 900 27." doplnene>
            <Input
              value={hodnoty.adresa.psc}
              onChange={(e) => zmenAdresu('psc', e.target.value)}
              inputMode="numeric"
            />
          </Field>
        </div>
      </div>

      <div id="pole-katastralneUzemie">
        <Field label="Katastrálne územie" required error={ch.katastralneUzemie}>
          <Select
            value={hodnoty.katastralneUzemie}
            onChange={(e) => zmenPole('katastralneUzemie', e.target.value)}
          >
            <option value="">Vyberte katastrálne územie</option>
            {tenant.katastralneUzemia.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div id="pole-parcelaCislo">
          <Field label="Číslo parcely" required error={ch.parcelaCislo}>
            <Input
              value={hodnoty.parcelaCislo}
              onChange={(e) => zmenPole('parcelaCislo', e.target.value)}
            />
          </Field>
        </div>
        <div id="pole-parcelaRegister">
          <Field label="Register parcely" required error={ch.parcelaRegister}>
            <Select
              value={hodnoty.parcelaRegister}
              onChange={(e) => zmenPole('parcelaRegister', e.target.value as ParcelRegister)}
            >
              <option value="C">Register C</option>
              <option value="E">Register E</option>
            </Select>
          </Field>
        </div>
        <div id="pole-cisloLv">
          <Field label="Číslo listu vlastníctva" required error={ch.cisloLv}>
            <Input
              value={hodnoty.cisloLv}
              onChange={(e) => zmenPole('cisloLv', e.target.value)}
            />
          </Field>
        </div>
      </div>

      <p className="text-sm text-ink-muted">
        Číslo parcely, register aj číslo listu vlastníctva si viete overiť na{' '}
        <a
          href="https://www.katasterportal.sk"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-primary underline underline-offset-4"
        >
          katastrálnom portáli (odkaz sa otvorí v novom okne)
        </a>
        .
      </p>

      {hodnoty.typ === 'byt' ? (
        <div className="grid gap-4 rounded-card border border-line bg-canvas p-4 sm:grid-cols-2">
          <div id="pole-cisloBytu">
            <Field label="Číslo bytu">
              <Input
                value={hodnoty.cisloBytu ?? ''}
                onChange={(e) => zmenPole('cisloBytu', e.target.value)}
              />
            </Field>
          </div>
          <div id="pole-vchod">
            <Field label="Vchod">
              <Input
                value={hodnoty.vchod ?? ''}
                onChange={(e) => zmenPole('vchod', e.target.value)}
              />
            </Field>
          </div>
          <div id="pole-poschodie">
            <Field label="Poschodie">
              <Input
                value={hodnoty.poschodie ?? ''}
                onChange={(e) => zmenPole('poschodie', e.target.value)}
              />
            </Field>
          </div>
          <div id="pole-podielNaSpolocnychCastiach">
            <Field label="Podiel na spoločných častiach">
              <Input
                value={hodnoty.podielNaSpolocnychCastiach ?? ''}
                onChange={(e) => zmenPole('podielNaSpolocnychCastiach', e.target.value)}
              />
            </Field>
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <div id="pole-nazovStavby">
          <Field label="Názov stavby">
            <Input
              value={hodnoty.nazovStavby ?? ''}
              onChange={(e) => zmenPole('nazovStavby', e.target.value)}
            />
          </Field>
        </div>
        <div id="pole-rokKolaudacie">
          <Field label="Rok kolaudácie" helper="Rok, kedy bola stavba daná do užívania.">
            <Input
              value={hodnoty.rokKolaudacie ?? ''}
              onChange={(e) => zmenPole('rokKolaudacie', e.target.value)}
              inputMode="numeric"
            />
          </Field>
        </div>
        <div id="pole-vymeraM2">
          <Field label="Výmera v m²">
            <Input
              value={hodnoty.vymeraM2 ?? ''}
              onChange={(e) => zmenPole('vymeraM2', e.target.value)}
              inputMode="decimal"
            />
          </Field>
        </div>
      </div>
    </div>
  )
}
