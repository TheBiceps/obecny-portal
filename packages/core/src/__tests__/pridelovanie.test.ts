import { beforeEach, describe, expect, it } from 'vitest'
import { LocalStorageProvider } from '../data/localStorageProvider'
import { bernolakovo } from '../tenant/bernolakovo'
import { formSchemas, getFormSchema } from '../forms'
import { ROLY_RIESITELOV, type RolaRiesitela } from '../types'
import { can } from '../data/permissions'

/** Jednoduchá náhrada localStorage, aby sa dal provider otestovať mimo prehliadača. */
const pamat = new Map<string, string>()
;(globalThis as unknown as { localStorage: Storage }).localStorage = {
  getItem: (k: string) => pamat.get(k) ?? null,
  setItem: (k: string, v: string) => void pamat.set(k, v),
  removeItem: (k: string) => void pamat.delete(k),
  clear: () => pamat.clear(),
  key: () => null,
  length: 0,
} as unknown as Storage

function novyProvider() {
  pamat.clear()
  return new LocalStorageProvider(bernolakovo)
}

const SPRAVCA = { id: 'staff-demo-1', role: 'super_admin' as const }
const STAVEBNY = { id: 'staff-stavebny', role: 'referent_stavebny' as const }
const DOPRAVA = { id: 'staff-doprava', role: 'referent_dopravy' as const }

function podanieVstup(formId: string) {
  const schema = getFormSchema(formId)!
  return {
    formId: schema.id,
    formNazov: schema.nazov,
    rolaRiesitela: schema.rolaRiesitela,
    residentId: null,
    ziadatelMeno: 'Testovací Žiadateľ',
    ziadatelEmail: 'test@example.sk',
    data: {},
    prilohy: [],
  }
}

describe('agenda formulárov', () => {
  it('každý formulár má platnú agendu riešiteľa', () => {
    for (const f of formSchemas) {
      expect(ROLY_RIESITELOV).toContain(f.rolaRiesitela as RolaRiesitela)
    }
  })

  it('stavebné tlačivá patria stavebnému úradu', () => {
    const stavebne = [
      'potvrdenie-vek-stavby',
      'predlzenie-uzemneho-rozhodnutia',
      'predlzenie-stavebneho-povolenia',
      'predlzenie-terminu-dokoncenia',
      'pasport-stavby',
    ]
    for (const id of stavebne) {
      expect(getFormSchema(id)?.rolaRiesitela).toBe('referent_stavebny')
    }
    expect(getFormSchema('vjazd-160-1996')?.rolaRiesitela).toBe('referent_dopravy')
    expect(getFormSchema('supisne-orientacne-cislo')?.rolaRiesitela).toBe(
      'referent_adries',
    )
  })
})

describe('pridelenie podania', () => {
  let p: LocalStorageProvider

  beforeEach(() => {
    p = novyProvider()
  })

  it('nové podanie dostane referenta správnej agendy', async () => {
    const podanie = await p.createSubmission(podanieVstup('predlzenie-stavebneho-povolenia'))
    expect(podanie.rolaRiesitela).toBe('referent_stavebny')
    expect(podanie.riesitelId).toBe('staff-stavebny')
  })

  it('podanie o vjazd ide na dopravu, nie na stavebný úrad', async () => {
    const podanie = await p.createSubmission(podanieVstup('vjazd-160-1996'))
    expect(podanie.riesitelId).toBe('staff-doprava')
  })

  it('pridelenie sa zapíše do histórie podania', async () => {
    const podanie = await p.createSubmission(podanieVstup('pasport-stavby'))
    expect(podanie.audit.map((a) => a.action)).toContain('pridelene')
  })

  it('bez aktívneho referenta zostane podanie nepridelené', async () => {
    const zamestnanci = await p.listStaff()
    for (const z of zamestnanci.filter((x) => x.role === 'referent_adries')) {
      await p.deleteStaff(z.id)
    }
    const podanie = await p.createSubmission(podanieVstup('supisne-orientacne-cislo'))
    expect(podanie.riesitelId).toBeNull()
    expect(podanie.rolaRiesitela).toBe('referent_adries')
  })

  it('listRiesitelia vráti len aktívnych zamestnancov danej agendy', async () => {
    const riesitelia = await p.listRiesitelia('referent_stavebny')
    expect(riesitelia.length).toBeGreaterThan(0)
    for (const r of riesitelia) {
      expect(r.role).toBe('referent_stavebny')
      expect(r.status).toBe('aktivny')
    }
  })
})

describe('viditeľnosť podaní', () => {
  let p: LocalStorageProvider

  beforeEach(() => {
    p = novyProvider()
  })

  it('hlavný správca vidí podania všetkých agend', async () => {
    const vysledok = await p.listSubmissions({ naStranu: 500 }, SPRAVCA)
    const agendy = new Set(vysledok.polozky.map((s) => s.rolaRiesitela))
    expect(agendy.size).toBeGreaterThan(1)
  })

  it('referent vidí len podania svojej agendy', async () => {
    const vysledok = await p.listSubmissions({ naStranu: 500 }, STAVEBNY)
    expect(vysledok.polozky.length).toBeGreaterThan(0)
    for (const s of vysledok.polozky) {
      expect(s.rolaRiesitela).toBe('referent_stavebny')
    }
  })

  it('referent dopravy nevidí stavebné podania', async () => {
    const vysledok = await p.listSubmissions({ naStranu: 500 }, DOPRAVA)
    for (const s of vysledok.polozky) {
      expect(s.rolaRiesitela).toBe('referent_dopravy')
    }
  })

  it('štatistiky sa počítajú len z viditeľných podaní', async () => {
    const vsetko = await p.statistiky(SPRAVCA)
    const stavebne = await p.statistiky(STAVEBNY)
    expect(stavebne.spolu).toBeLessThan(vsetko.spolu)
  })

  it('filter podľa riešiteľa vráti úlohy konkrétneho zamestnanca', async () => {
    const vysledok = await p.listSubmissions(
      { riesitelId: 'staff-stavebny', naStranu: 500 },
      SPRAVCA,
    )
    expect(vysledok.polozky.length).toBeGreaterThan(0)
    for (const s of vysledok.polozky) {
      expect(s.riesitelId).toBe('staff-stavebny')
    }
  })

  it('odchod zamestnanca podania nezmaže, len ich nechá nepridelené', async () => {
    const pred = await p.listSubmissions({ naStranu: 500 }, SPRAVCA)
    await p.deleteStaff('staff-stavebny')
    const po = await p.listSubmissions({ naStranu: 500 }, SPRAVCA)
    expect(po.spolu).toBe(pred.spolu)
    expect(po.polozky.every((s) => s.riesitelId !== 'staff-stavebny')).toBe(true)
  })
})

describe('oprávnenia rolí', () => {
  it('podania všetkých agend vidí správca a čitateľ, referent nie', () => {
    expect(can('super_admin', 'podania.vidiet_vsetky')).toBe(true)
    expect(can('citatel', 'podania.vidiet_vsetky')).toBe(true)
    expect(can('referent_stavebny', 'podania.vidiet_vsetky')).toBe(false)
  })

  it('referent môže meniť stav, ale nesmie mazať ani spravovať používateľov', () => {
    expect(can('referent_stavebny', 'podania.menit_stav')).toBe(true)
    expect(can('referent_stavebny', 'podania.mazat')).toBe(false)
    expect(can('referent_stavebny', 'pouzivatelia.spravovat')).toBe(false)
  })
})
