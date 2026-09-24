import type { TenantConfig } from '../tenant/types'
import type { Property, Resident, StaffUser, Submission } from '../types'
import { buildCisloPodania } from '../format'

/** Demo heslo sa neukladá v čitateľnej podobe, ale nejde o produkčné riešenie. */
export function demoHash(heslo: string): string {
  let h = 0
  for (let i = 0; i < heslo.length; i++) {
    h = (h << 5) - h + heslo.charCodeAt(i)
    h |= 0
  }
  return `demo$${Math.abs(h).toString(36)}`
}

export const DEMO_UCTY = {
  obcan: { email: 'obcan@demo.sk', heslo: 'Demo1234' },
  urad: { email: 'starosta@demo.sk', heslo: 'Urad1234' },
}

export interface DemoDb {
  verzia: number
  residents: Resident[]
  properties: Property[]
  staff: StaffUser[]
  submissions: Submission[]
  poradie: number
}

const ROK = 2026

function d(dni: number): string {
  const t = new Date()
  t.setDate(t.getDate() - dni)
  return t.toISOString()
}

export function buildSeed(tenant: TenantConfig): DemoDb {
  const tenantId = tenant.id

  const obcan: Resident = {
    id: 'res-demo-1',
    tenantId,
    titul: 'Ing.',
    meno: 'Peter',
    priezvisko: 'Novák',
    rodneCislo: '8203151231',
    telefon: '+421 905 123 456',
    email: DEMO_UCTY.obcan.email,
    passwordHash: demoHash(DEMO_UCTY.obcan.heslo),
    trvalyPobyt: {
      ulica: 'Lipová',
      supisneCislo: '482',
      orientacneCislo: '12',
      obec: tenant.predvolenaAdresa.obec,
      psc: tenant.predvolenaAdresa.psc,
    },
    gdprSuhlasAt: d(120),
    createdAt: d(120),
  }

  const properties: Property[] = [
    {
      id: 'prop-demo-1',
      tenantId,
      residentId: obcan.id,
      nazov: 'Náš dom',
      typ: 'rodinny_dom',
      vztah: 'vlastnik',
      adresa: {
        ulica: 'Lipová',
        supisneCislo: '482',
        orientacneCislo: '12',
        obec: tenant.predvolenaAdresa.obec,
        psc: tenant.predvolenaAdresa.psc,
      },
      katastralneUzemie: tenant.katastralneUzemia[0],
      parcelaCislo: '1847/23',
      parcelaRegister: 'C',
      cisloLv: '3921',
      nazovStavby: 'Rodinný dom',
      rokKolaudacie: '1974',
      vymeraM2: '142',
      createdAt: d(120),
    },
    {
      id: 'prop-demo-2',
      tenantId,
      residentId: obcan.id,
      nazov: 'Záhrada za domom',
      typ: 'pozemok',
      vztah: 'spoluvlastnik',
      adresa: {
        ulica: 'Lipová',
        obec: tenant.predvolenaAdresa.obec,
        psc: tenant.predvolenaAdresa.psc,
      },
      katastralneUzemie: tenant.katastralneUzemia[0],
      parcelaCislo: '1847/24',
      parcelaRegister: 'E',
      cisloLv: '4102',
      vymeraM2: '620',
      createdAt: d(90),
    },
  ]

  const staff: StaffUser[] = [
    {
      id: 'staff-demo-1',
      tenantId,
      meno: 'Zuzana',
      priezvisko: 'Horváthová',
      email: DEMO_UCTY.urad.email,
      role: 'super_admin',
      status: 'aktivny',
      passwordHash: demoHash(DEMO_UCTY.urad.heslo),
      createdAt: d(200),
    },
  ]

  type Zaznam = {
    id: string
    formId: string
    formNazov: string
    meno: string
    email: string
    residentId: string | null
    stav: Submission['status']
    dniDozadu: number
    precitane: boolean
    data: Record<string, unknown>
  }

  const zaznamy: Zaznam[] = [
    {
      id: 'sub-demo-1',
      formId: 'vjazd-160-1996',
      formNazov: 'Žiadosť o povolenie na vjazd',
      meno: 'Ing. Peter Novák',
      email: DEMO_UCTY.obcan.email,
      residentId: obcan.id,
      stav: 'vybavene',
      dniDozadu: 42,
      precitane: true,
      data: {
        typOsoby: 'fyzicka',
        titul: 'Ing.',
        meno: 'Peter',
        priezvisko: 'Novák',
        adresa: {
          ulica: 'Lipová',
          supisneCislo: '482',
          orientacneCislo: '12',
          obec: tenant.predvolenaAdresa.obec,
          psc: tenant.predvolenaAdresa.psc,
        },
        telefon: '+421 905 123 456',
        email: DEMO_UCTY.obcan.email,
        vjazdZParcely: '1847/23',
        katastralneUzemie: tenant.katastralneUzemia[0],
        nazovMk: 'Lipová ulica',
        mkParcela: '2100/1',
        ucelStavby: 'Vjazd k rodinnému domu vrátane spevnenej plochy pre osobné vozidlo.',
        rozmerVozovky: '4,0 m x 1,2 m',
        rozmerZelenehoPasu: '4,0 m x 2,0 m',
        suhlasOsobneUdaje: true,
        potvrdeniePravdivosti: true,
        miesto: tenant.nazovKratky,
        datum: new Date(Date.now() - 42 * 86400000).toISOString().slice(0, 10),
      },
    },
    {
      id: 'sub-demo-2',
      formId: 'potvrdenie-vek-stavby',
      formNazov: 'Žiadosť o vydanie potvrdenia o veku stavby',
      meno: 'Mgr. Elena Kováčová',
      email: 'elena.kovacova@example.sk',
      residentId: null,
      stav: 'v_rieseni',
      dniDozadu: 9,
      precitane: true,
      data: {
        typOsoby: 'fyzicka',
        titul: 'Mgr.',
        meno: 'Elena',
        priezvisko: 'Kováčová',
        adresaDorucenia: {
          ulica: 'Svätoplukova',
          supisneCislo: '17',
          obec: tenant.predvolenaAdresa.obec,
          psc: tenant.predvolenaAdresa.psc,
        },
        telefon: '+421 911 887 220',
        email: 'elena.kovacova@example.sk',
        ucel: 'znalecky_posudok',
        nazovStavby: 'Rodinný dom',
        ulica: 'Svätoplukova',
        katastralneUzemie: tenant.katastralneUzemia[0],
        parcelaCislo: '905/4',
        cisloLv: '2218',
        supisneCislo: '17',
        obdobieUzivania: 'pred_1976',
        rokUzivania: '1968',
        cpMenoPriezvisko: 'Elena Kováčová',
        cpRodneCislo: '8561072146',
        cpCisloOp: 'EA 884120',
        cpTrvaleBytom: `Svätoplukova 17, ${tenant.predvolenaAdresa.psc} ${tenant.predvolenaAdresa.obec}`,
        cpRokUzivania: '1968',
        cpRokRekonstrukcie: '2004',
        cpParcela: '905/4',
        cpKatastralneUzemie: tenant.katastralneUzemia[0],
        cpStavebnikomBol: 'Jozef Kováč',
        cpPotvrdenie: true,
        stavebnikomBoli: 'Jozef Kováč a Anna Kováčová',
        vlastnikomJe: 'Elena Kováčová',
        ziadatelJeStavebnik: false,
        potvrdeniePravdivosti: true,
        suhlasOsobneUdaje: true,
        miesto: tenant.nazovKratky,
        datum: new Date(Date.now() - 9 * 86400000).toISOString().slice(0, 10),
      },
    },
    {
      id: 'sub-demo-3',
      formId: 'vjazd-160-1996',
      formNazov: 'Žiadosť o povolenie na vjazd',
      meno: 'STAVOMONT s. r. o.',
      email: 'kancelaria@stavomont.sk',
      residentId: null,
      stav: 'prijate',
      dniDozadu: 2,
      precitane: false,
      data: {
        typOsoby: 'pravnicka',
        nazovFirmy: 'STAVOMONT s. r. o.',
        ico: '36123455',
        meno: 'Marek',
        priezvisko: 'Tóth',
        adresa: {
          ulica: 'Priemyselná',
          supisneCislo: '9',
          obec: 'Senec',
          psc: '903 01',
        },
        telefon: '+421 902 554 019',
        email: 'kancelaria@stavomont.sk',
        vjazdZParcely: '3312/8',
        katastralneUzemie: tenant.katastralneUzemia[0],
        nazovMk: 'Poľná ulica',
        mkParcela: '3300/2',
        ucelStavby: 'Vjazd na pozemok pre stavebnú techniku počas výstavby skladovej haly.',
        rozmerVozovky: '6,0 m x 2,0 m',
        rozmerZelenehoPasu: '6,0 m x 1,5 m',
        suhlasOsobneUdaje: true,
        potvrdeniePravdivosti: true,
        miesto: tenant.nazovKratky,
        datum: new Date(Date.now() - 2 * 86400000).toISOString().slice(0, 10),
      },
    },
    {
      id: 'sub-demo-4',
      formId: 'potvrdenie-vek-stavby',
      formNazov: 'Žiadosť o vydanie potvrdenia o veku stavby',
      meno: 'Ján Belan',
      email: 'jan.belan@example.sk',
      residentId: null,
      stav: 'prijate',
      dniDozadu: 1,
      precitane: false,
      data: {
        typOsoby: 'fyzicka',
        meno: 'Ján',
        priezvisko: 'Belan',
        adresaDorucenia: {
          ulica: 'Krátka',
          supisneCislo: '3',
          obec: tenant.predvolenaAdresa.obec,
          psc: tenant.predvolenaAdresa.psc,
        },
        telefon: '+421 918 220 441',
        email: 'jan.belan@example.sk',
        ucel: 'iny',
        inyDovod: 'Pre potreby banky pri vybavovaní hypotekárneho úveru.',
        nazovStavby: 'Garáž',
        ulica: 'Krátka',
        katastralneUzemie: tenant.katastralneUzemia[0],
        parcelaCislo: '612/11',
        cisloLv: '1780',
        supisneCislo: '3',
        obdobieUzivania: 'po_1976',
        rokUzivania: '1998',
        stavebnikomBoli: 'Ján Belan',
        vlastnikomJe: 'Ján Belan',
        ziadatelJeStavebnik: true,
        potvrdeniePravdivosti: true,
        suhlasOsobneUdaje: true,
        miesto: tenant.nazovKratky,
        datum: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
      },
    },
    {
      id: 'sub-demo-5',
      formId: 'vjazd-160-1996',
      formNazov: 'Žiadosť o povolenie na vjazd',
      meno: 'Katarína Ďuricová',
      email: 'k.duricova@example.sk',
      residentId: null,
      stav: 'zamietnute',
      dniDozadu: 63,
      precitane: true,
      data: {
        typOsoby: 'fyzicka',
        meno: 'Katarína',
        priezvisko: 'Ďuricová',
        adresa: {
          ulica: 'Nová',
          supisneCislo: '27',
          obec: tenant.predvolenaAdresa.obec,
          psc: tenant.predvolenaAdresa.psc,
        },
        telefon: '+421 903 771 208',
        email: 'k.duricova@example.sk',
        vjazdZParcely: '744/2',
        katastralneUzemie: tenant.katastralneUzemia[0],
        nazovMk: 'Nová ulica',
        mkParcela: '740/1',
        ucelStavby: 'Druhý vjazd na pozemok z bočnej strany.',
        rozmerVozovky: '3,0 m x 1,0 m',
        rozmerZelenehoPasu: '3,0 m x 1,8 m',
        suhlasOsobneUdaje: true,
        potvrdeniePravdivosti: true,
        miesto: tenant.nazovKratky,
        datum: new Date(Date.now() - 63 * 86400000).toISOString().slice(0, 10),
      },
    },
    {
      id: 'sub-demo-6',
      formId: 'potvrdenie-vek-stavby',
      formNazov: 'Žiadosť o vydanie potvrdenia o veku stavby',
      meno: 'Ing. Peter Novák',
      email: DEMO_UCTY.obcan.email,
      residentId: obcan.id,
      stav: 'v_rieseni',
      dniDozadu: 5,
      precitane: true,
      data: {
        typOsoby: 'fyzicka',
        titul: 'Ing.',
        meno: 'Peter',
        priezvisko: 'Novák',
        adresaDorucenia: {
          ulica: 'Lipová',
          supisneCislo: '482',
          orientacneCislo: '12',
          obec: tenant.predvolenaAdresa.obec,
          psc: tenant.predvolenaAdresa.psc,
        },
        telefon: '+421 905 123 456',
        email: DEMO_UCTY.obcan.email,
        ucel: 'znalecky_posudok',
        nazovStavby: 'Rodinný dom',
        ulica: 'Lipová',
        katastralneUzemie: tenant.katastralneUzemia[0],
        parcelaCislo: '1847/23',
        cisloLv: '3921',
        supisneCislo: '482',
        obdobieUzivania: 'pred_1976',
        rokUzivania: '1974',
        cpMenoPriezvisko: 'Peter Novák',
        cpRodneCislo: '8203151231',
        cpCisloOp: 'AB 123456',
        cpTrvaleBytom: `Lipová 482/12, ${tenant.predvolenaAdresa.psc} ${tenant.predvolenaAdresa.obec}`,
        cpRokUzivania: '1974',
        cpParcela: '1847/23',
        cpKatastralneUzemie: tenant.katastralneUzemia[0],
        cpStavebnikomBol: 'Štefan Novák',
        cpPotvrdenie: true,
        stavebnikomBoli: 'Štefan Novák',
        vlastnikomJe: 'Peter Novák',
        ziadatelJeStavebnik: false,
        potvrdeniePravdivosti: true,
        suhlasOsobneUdaje: true,
        miesto: tenant.nazovKratky,
        datum: new Date(Date.now() - 5 * 86400000).toISOString().slice(0, 10),
      },
    },
    {
      id: 'sub-demo-7',
      formId: 'vjazd-160-1996',
      formNazov: 'Žiadosť o povolenie na vjazd',
      meno: 'Ľubomír Šimko',
      email: 'l.simko@example.sk',
      residentId: null,
      stav: 'vybavene',
      dniDozadu: 16,
      precitane: true,
      data: {
        typOsoby: 'fyzicka',
        meno: 'Ľubomír',
        priezvisko: 'Šimko',
        adresa: {
          ulica: 'Záhradná',
          supisneCislo: '55',
          obec: tenant.predvolenaAdresa.obec,
          psc: tenant.predvolenaAdresa.psc,
        },
        telefon: '+421 907 330 115',
        email: 'l.simko@example.sk',
        vjazdZParcely: '2210/6',
        katastralneUzemie: tenant.katastralneUzemia[0],
        nazovMk: 'Záhradná ulica',
        mkParcela: '2200/3',
        ucelStavby: 'Rozšírenie existujúceho vjazdu k rodinnému domu.',
        rozmerVozovky: '3,5 m x 1,0 m',
        rozmerZelenehoPasu: '3,5 m x 1,5 m',
        suhlasOsobneUdaje: true,
        potvrdeniePravdivosti: true,
        miesto: tenant.nazovKratky,
        datum: new Date(Date.now() - 16 * 86400000).toISOString().slice(0, 10),
      },
    },
    {
      id: 'sub-demo-8',
      formId: 'potvrdenie-vek-stavby',
      formNazov: 'Žiadosť o vydanie potvrdenia o veku stavby',
      meno: 'AGROFARMA Senec a. s.',
      email: 'sekretariat@agrofarma-senec.sk',
      residentId: null,
      stav: 'prijate',
      dniDozadu: 0,
      precitane: false,
      data: {
        typOsoby: 'pravnicka',
        nazovFirmy: 'AGROFARMA Senec a. s.',
        ico: '50998811',
        meno: 'Dana',
        priezvisko: 'Michalcová',
        adresaDorucenia: {
          ulica: 'Hospodárska',
          supisneCislo: '2',
          obec: 'Senec',
          psc: '903 01',
        },
        telefon: '+421 902 118 664',
        email: 'sekretariat@agrofarma-senec.sk',
        maZastupcu: true,
        zastupca: 'JUDr. Michal Baláž',
        ucel: 'znalecky_posudok',
        nazovStavby: 'Skladová hala',
        ulica: 'Hospodárska',
        katastralneUzemie: tenant.katastralneUzemia[0],
        parcelaCislo: '4410/2',
        cisloLv: '5566',
        supisneCislo: '2',
        obdobieUzivania: 'po_1976',
        rokUzivania: '1989',
        stavebnikomBoli: 'Poľnohospodárske družstvo Bernolákovo',
        vlastnikomJe: 'AGROFARMA Senec a. s.',
        ziadatelJeStavebnik: false,
        potvrdeniePravdivosti: true,
        suhlasOsobneUdaje: true,
        miesto: tenant.nazovKratky,
        datum: new Date().toISOString().slice(0, 10),
      },
    },
  ]

  const submissions: Submission[] = zaznamy.map((z, i) => {
    const prijate = d(z.dniDozadu)
    return {
      id: z.id,
      tenantId,
      cisloPodania: buildCisloPodania(tenant.nazovKratky, ROK, i + 1),
      formId: z.formId,
      formNazov: z.formNazov,
      residentId: z.residentId,
      ziadatelMeno: z.meno,
      ziadatelEmail: z.email,
      propertyId: z.residentId ? properties[0].id : null,
      data: z.data,
      prilohy: [],
      status: z.stav,
      precitane: z.precitane,
      prijateAt: prijate,
      aktualizovaneAt: prijate,
      audit: [
        {
          id: `${z.id}-a1`,
          action: 'prijate',
          at: prijate,
          aktor: z.meno,
        },
        ...(z.stav === 'prijate'
          ? []
          : [
              {
                id: `${z.id}-a2`,
                action: 'zmena_stavu' as const,
                at: d(Math.max(0, z.dniDozadu - 1)),
                aktor: 'Zuzana Horváthová',
                poznamka: `Stav zmenený na ${z.stav}`,
              },
            ]),
      ],
    }
  })

  return {
    verzia: 1,
    residents: [obcan],
    properties,
    staff,
    submissions,
    poradie: submissions.length,
  }
}
