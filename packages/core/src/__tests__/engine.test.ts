import { describe, expect, it } from 'vitest'
import {
  applyAutofill,
  buildZodSchema,
  emptyValues,
  fieldOptions,
  isVisible,
  validateForm,
  visibleFields,
  visiblePrilohy,
  visibleSections,
} from '../forms/engine'
import { vjazdForm } from '../forms/vjazd'
import { vekStavbyForm } from '../forms/vekStavby'
import { bernolakovo } from '../tenant/bernolakovo'
import type { Property, Resident } from '../types'

const resident: Resident = {
  tenantId: 'bernolakovo',
  id: 'r1',
  titul: 'Ing.',
  meno: 'Peter',
  priezvisko: 'Horák',
  rodneCislo: '8203151231',
  telefon: '+421905123456',
  email: 'peter@example.sk',
  passwordHash: 'x',
  trvalyPobyt: { ulica: 'Hlavná', obec: 'Bernolákovo', psc: '900 27' },
  gdprSuhlasAt: '2026-01-01',
  createdAt: '2026-01-01',
}

const property: Property = {
  tenantId: 'bernolakovo',
  id: 'p1',
  residentId: 'r1',
  typ: 'rodinny_dom',
  vztah: 'vlastnik',
  adresa: { ulica: 'Hlavná', obec: 'Bernolákovo', psc: '900 27' },
  katastralneUzemie: 'Bernolákovo',
  parcelaCislo: '1234/5',
  parcelaRegister: 'C',
  cisloLv: '123',
  createdAt: '2026-01-01',
}

describe('isVisible', () => {
  it('vyhodnotí jednoduchú podmienku equals', () => {
    expect(isVisible({ field: 'typOsoby', equals: 'pravnicka' }, { typOsoby: 'pravnicka' })).toBe(
      true,
    )
    expect(isVisible({ field: 'typOsoby', equals: 'pravnicka' }, { typOsoby: 'fyzicka' })).toBe(
      false,
    )
  })

  it('vyhodnotí podmienku isTruthy: false', () => {
    expect(isVisible({ field: 'suhlas', isTruthy: false }, { suhlas: false })).toBe(true)
    expect(isVisible({ field: 'suhlas', isTruthy: false }, { suhlas: true })).toBe(false)
  })

  it('vyhodnotí podmienku oneOf', () => {
    const rule = { field: 'obdobieUzivania', oneOf: ['pred_1976', 'po_1976'] }
    expect(isVisible(rule, { obdobieUzivania: 'pred_1976' })).toBe(true)
    expect(isVisible(rule, { obdobieUzivania: 'ine' })).toBe(false)
  })

  it('vyhodnotí variant and', () => {
    const rule = {
      and: [
        { field: 'typOsoby', equals: 'pravnicka' },
        { field: 'maZastupcu', isTruthy: true },
      ],
    }
    expect(isVisible(rule, { typOsoby: 'pravnicka', maZastupcu: true })).toBe(true)
    expect(isVisible(rule, { typOsoby: 'pravnicka', maZastupcu: false })).toBe(false)
    expect(isVisible(rule, { typOsoby: 'fyzicka', maZastupcu: true })).toBe(false)
  })

  it('vyhodnotí variant or', () => {
    const rule = {
      or: [
        { field: 'typOsoby', equals: 'pravnicka' },
        { field: 'maZastupcu', isTruthy: true },
      ],
    }
    expect(isVisible(rule, { typOsoby: 'fyzicka', maZastupcu: true })).toBe(true)
    expect(isVisible(rule, { typOsoby: 'pravnicka', maZastupcu: false })).toBe(true)
    expect(isVisible(rule, { typOsoby: 'fyzicka', maZastupcu: false })).toBe(false)
  })
})

describe('visibleSections', () => {
  it('sekcia cestnePrehlasenie je viditeľná pri obdobieUzivania = pred_1976', () => {
    const sekcie = visibleSections(vekStavbyForm, { obdobieUzivania: 'pred_1976' })
    expect(sekcie.some((s) => s.id === 'cestnePrehlasenie')).toBe(true)
  })

  it('sekcia cestnePrehlasenie nie je viditeľná pri obdobieUzivania = po_1976', () => {
    const sekcie = visibleSections(vekStavbyForm, { obdobieUzivania: 'po_1976' })
    expect(sekcie.some((s) => s.id === 'cestnePrehlasenie')).toBe(false)
  })
})

describe('visibleFields', () => {
  const uzivanieSekcia = vekStavbyForm.sections.find((s) => s.id === 'uzivanie')!

  it('pole kolaudacneRozhodnutie je viditeľné len pri obdobieUzivania = po_1976', () => {
    const poPoliach = visibleFields(uzivanieSekcia, { obdobieUzivania: 'po_1976' })
    expect(poPoliach.some((f) => f.id === 'kolaudacneRozhodnutie')).toBe(true)

    const predPoliach = visibleFields(uzivanieSekcia, { obdobieUzivania: 'pred_1976' })
    expect(predPoliach.some((f) => f.id === 'kolaudacneRozhodnutie')).toBe(false)
  })

  it('pri typOsoby = pravnicka sú viditeľné nazovFirmy a ico', () => {
    const ziadatelSekcia = vjazdForm.sections.find((s) => s.id === 'ziadatel')!
    const poliaPravnicka = visibleFields(ziadatelSekcia, { typOsoby: 'pravnicka' })
    expect(poliaPravnicka.some((f) => f.id === 'nazovFirmy')).toBe(true)
    expect(poliaPravnicka.some((f) => f.id === 'ico')).toBe(true)

    const poliaFyzicka = visibleFields(ziadatelSekcia, { typOsoby: 'fyzicka' })
    expect(poliaFyzicka.some((f) => f.id === 'nazovFirmy')).toBe(false)
    expect(poliaFyzicka.some((f) => f.id === 'ico')).toBe(false)
  })
})

describe('visiblePrilohy', () => {
  it('nadobudaci-doklad je v zozname, keď ziadatelJeStavebnik nie je zaškrtnuté', () => {
    const prilohy = visiblePrilohy(vekStavbyForm, { ziadatelJeStavebnik: false })
    expect(prilohy.some((p) => p.id === 'nadobudaci-doklad')).toBe(true)
  })

  it('nadobudaci-doklad mizne, keď je ziadatelJeStavebnik zaškrtnuté', () => {
    const prilohy = visiblePrilohy(vekStavbyForm, { ziadatelJeStavebnik: true })
    expect(prilohy.some((p) => p.id === 'nadobudaci-doklad')).toBe(false)
  })
})

const platneHodnotyVjazd = {
  typOsoby: 'fyzicka',
  titul: '',
  meno: 'Ján',
  priezvisko: 'Novák',
  adresa: {
    ulica: 'Hlavná',
    supisneCislo: '1',
    orientacneCislo: '',
    obec: 'Bernolákovo',
    psc: '900 27',
  },
  telefon: '+421905123456',
  email: 'jan@example.sk',
  nehnutelnost: '',
  vjazdZParcely: '1234/5',
  katastralneUzemie: 'Bernolákovo',
  nazovMk: 'Hlavná ulica',
  mkParcela: '2100/1',
  ucelStavby: 'Vjazd k rodinnému domu vrátane spevnenej plochy.',
  rozmerVozovky: '4,0 m x 1,5 m',
  rozmerZelenehoPasu: '4,0 m x 2,0 m',
  projektovaDokumentacia: [{ nazov: 'a.pdf' }],
  dokladOUhrade: [{ nazov: 'b.pdf' }],
  suhlasOsobneUdaje: true,
  potvrdeniePravdivosti: true,
  miesto: 'Bernolákovo',
  datum: '2026-09-24',
}

describe('buildZodSchema a validateForm', () => {
  it('prázdny formulár vráti chyby na povinných poliach', () => {
    const chyby = validateForm(vjazdForm, emptyValues(vjazdForm))
    expect(chyby.length).toBeGreaterThan(0)
    expect(chyby.some((c) => c.fieldId === 'meno')).toBe(true)
    expect(chyby.some((c) => c.fieldId === 'priezvisko')).toBe(true)
  })

  it('vyplnený platný formulár vráti prázdne pole chýb', () => {
    const schema = buildZodSchema(vjazdForm, platneHodnotyVjazd)
    expect(schema.safeParse(platneHodnotyVjazd).success).toBe(true)
    expect(validateForm(vjazdForm, platneHodnotyVjazd)).toEqual([])
  })

  it('neplatné IČO a neplatný telefón vrátia chybu s vetou po slovensky', () => {
    const hodnoty = {
      ...platneHodnotyVjazd,
      typOsoby: 'pravnicka',
      nazovFirmy: 'Firma s. r. o.',
      ico: '12345678',
      telefon: '12345',
    }
    const chyby = validateForm(vjazdForm, hodnoty)
    const icoChyba = chyby.find((c) => c.fieldId === 'ico')
    const telefonChyba = chyby.find((c) => c.fieldId === 'telefon')
    expect(icoChyba?.sprava).toBe('IČO má osem číslic a musí prejsť kontrolou.')
    expect(telefonChyba?.sprava).toBe('Zadajte telefón v tvare +421 9xx xxx xxx.')
  })

  it('nezaškrtnutý povinný súhlas vráti chybu', () => {
    const hodnoty = { ...platneHodnotyVjazd, suhlasOsobneUdaje: false }
    const chyby = validateForm(vjazdForm, hodnoty)
    const suhlasChyba = chyby.find((c) => c.fieldId === 'suhlasOsobneUdaje')
    expect(suhlasChyba?.sprava).toBe(
      'Bez súhlasu so spracovaním osobných údajov žiadosť odoslať nevieme.',
    )
  })
})

describe('applyAutofill', () => {
  it('doplní meno a priezvisko z objektu občana', () => {
    const zaklad = emptyValues(vjazdForm)
    const vysledok = applyAutofill(vjazdForm, zaklad, {
      resident,
      property,
      tenant: bernolakovo,
      dnes: '2026-09-24',
    })
    expect(vysledok.values.meno).toBe('Peter')
    expect(vysledok.values.priezvisko).toBe('Horák')
    expect(vysledok.doplnene).toContain('meno')
    expect(vysledok.doplnene).toContain('priezvisko')
  })

  it('neprepíše už vyplnenú hodnotu', () => {
    const zaklad = { ...emptyValues(vjazdForm), meno: 'Existujúce meno' }
    const vysledok = applyAutofill(vjazdForm, zaklad, {
      resident,
      property,
      tenant: bernolakovo,
      dnes: '2026-09-24',
    })
    expect(vysledok.values.meno).toBe('Existujúce meno')
    expect(vysledok.doplnene).not.toContain('meno')
  })

  it('s prepisat: true prepíše už vyplnenú hodnotu', () => {
    const zaklad = { ...emptyValues(vjazdForm), meno: 'Existujúce meno' }
    const vysledok = applyAutofill(
      vjazdForm,
      zaklad,
      { resident, property, tenant: bernolakovo, dnes: '2026-09-24' },
      { prepisat: true },
    )
    expect(vysledok.values.meno).toBe('Peter')
    expect(vysledok.doplnene).toContain('meno')
  })

  it('s lenZdroj: property doplní len polia z nehnuteľnosti', () => {
    const zaklad = emptyValues(vjazdForm)
    const vysledok = applyAutofill(
      vjazdForm,
      zaklad,
      { resident, property, tenant: bernolakovo, dnes: '2026-09-24' },
      { lenZdroj: 'property' },
    )
    expect(vysledok.values.vjazdZParcely).toBe('1234/5')
    expect(vysledok.values.katastralneUzemie).toBe('Bernolákovo')
    expect(vysledok.values.meno).toBe('')
    expect(vysledok.doplnene.sort()).toEqual(['katastralneUzemie', 'vjazdZParcely'].sort())
  })
})

describe('emptyValues', () => {
  const values = emptyValues(vjazdForm)

  it('checkbox a consent sú false', () => {
    expect(values.suhlasOsobneUdaje).toBe(false)
    expect(values.potvrdeniePravdivosti).toBe(false)
  })

  it('file je prázdne pole', () => {
    expect(values.projektovaDokumentacia).toEqual([])
    expect(values.dokladOUhrade).toEqual([])
  })

  it('address je objekt s prázdnymi reťazcami', () => {
    expect(values.adresa).toEqual({
      ulica: '',
      supisneCislo: '',
      orientacneCislo: '',
      obec: '',
      psc: '',
    })
  })
})

describe('fieldOptions', () => {
  it('pole s optionsFromTenant: katastralneUzemia vráti možnosti z konfigurácie obce', () => {
    const sekcia = vjazdForm.sections.find((s) => s.id === 'stavba')!
    const pole = sekcia.fields.find((f) => f.id === 'katastralneUzemie')!
    expect(fieldOptions(pole, bernolakovo)).toEqual([{ value: 'Bernolákovo', label: 'Bernolákovo' }])
  })
})
