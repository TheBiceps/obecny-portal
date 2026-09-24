import type { TenantConfig } from '../tenant/types'
import type {
  AuditAction,
  AuditEntry,
  Page,
  Property,
  Resident,
  StaffRole,
  StaffUser,
  Submission,
  SubmissionFilter,
  SubmissionStatus,
} from '../types'
import { buildCisloPodania } from '../format'
import { isEmailValid } from '../validation/formats'
import {
  DataError,
  type DataProvider,
  type PropertyInput,
  type RegistraciaInput,
  type Statistiky,
  type SubmissionInput,
} from './provider'
import { buildSeed, demoHash, type DemoDb } from './seed'

const VERZIA = 1

function kluc(tenantId: string) {
  return `obec.${tenantId}.db.v${VERZIA}`
}

function id(predpona: string): string {
  const c =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10)
  return `${predpona}-${c}`
}

/** Obe aplikácie bežia na rovnakom pôvode, takže zdieľajú rovnaký localStorage. */
export class LocalStorageProvider implements DataProvider {
  readonly tenantId: string
  private readonly tenant: TenantConfig
  private readonly kanal: BroadcastChannel | null

  constructor(tenant: TenantConfig) {
    this.tenant = tenant
    this.tenantId = tenant.id
    this.kanal =
      typeof BroadcastChannel !== 'undefined'
        ? new BroadcastChannel(`obec-${tenant.id}`)
        : null
    this.nacitaj()
  }

  /* ---------------------------------------------------------------- */

  private nacitaj(): DemoDb {
    if (typeof localStorage === 'undefined') return buildSeed(this.tenant)
    const surove = localStorage.getItem(kluc(this.tenantId))
    if (!surove) {
      const seed = buildSeed(this.tenant)
      this.uloz(seed, false)
      return seed
    }
    try {
      const db = JSON.parse(surove) as DemoDb
      if (db.verzia !== VERZIA) throw new Error('stará verzia')
      return db
    } catch {
      const seed = buildSeed(this.tenant)
      this.uloz(seed, false)
      return seed
    }
  }

  private uloz(db: DemoDb, oznam = true): void {
    if (typeof localStorage === 'undefined') return
    localStorage.setItem(kluc(this.tenantId), JSON.stringify(db))
    if (oznam) this.kanal?.postMessage({ typ: 'zmena' })
  }

  /** Upozorní na zmenu dát z druhej aplikácie alebo z iného panela. */
  onZmena(callback: () => void): () => void {
    const naSprava = () => callback()
    const naStorage = (e: StorageEvent) => {
      if (e.key === kluc(this.tenantId)) callback()
    }
    this.kanal?.addEventListener('message', naSprava)
    if (typeof window !== 'undefined') window.addEventListener('storage', naStorage)
    return () => {
      this.kanal?.removeEventListener('message', naSprava)
      if (typeof window !== 'undefined') window.removeEventListener('storage', naStorage)
    }
  }

  /* prihlásenie ------------------------------------------------------ */

  async prihlasitObcana(email: string, heslo: string): Promise<Resident> {
    const db = this.nacitaj()
    const r = db.residents.find(
      (x) => x.email.toLowerCase() === email.trim().toLowerCase(),
    )
    if (!r || r.passwordHash !== demoHash(heslo)) {
      throw new DataError(
        'E-mail alebo heslo nesedia. Skúste to prosím znova.',
        'nespravne_prihlasenie',
      )
    }
    return r
  }

  async registrovatObcana(vstup: RegistraciaInput): Promise<Resident> {
    const db = this.nacitaj()
    if (!isEmailValid(vstup.email)) {
      throw new DataError('Zadajte e-mail v tvare meno@domena.sk.')
    }
    if (
      db.residents.some(
        (x) => x.email.toLowerCase() === vstup.email.trim().toLowerCase(),
      )
    ) {
      throw new DataError(
        'Na tento e-mail už konto existuje. Prihláste sa prosím.',
        'email_obsadeny',
      )
    }
    const novy: Resident = {
      id: id('res'),
      tenantId: this.tenantId,
      titul: vstup.titul?.trim() || undefined,
      meno: vstup.meno.trim(),
      priezvisko: vstup.priezvisko.trim(),
      rodneCislo: vstup.rodneCislo.replace(/[\s/]/g, ''),
      telefon: vstup.telefon.trim(),
      email: vstup.email.trim(),
      passwordHash: demoHash(vstup.heslo),
      trvalyPobyt: vstup.trvalyPobyt,
      gdprSuhlasAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    }
    db.residents.push(novy)
    this.uloz(db)
    return novy
  }

  async poziadatOObnovuHesla(email: string): Promise<void> {
    // V deme e-mail neodosielame. Produkcia doplní odoslanie odkazu na obnovu.
    void email
  }

  async prihlasitZamestnanca(email: string, heslo: string): Promise<StaffUser> {
    const db = this.nacitaj()
    const s = db.staff.find(
      (x) => x.email.toLowerCase() === email.trim().toLowerCase(),
    )
    if (!s || s.status !== 'aktivny' || s.passwordHash !== demoHash(heslo)) {
      throw new DataError(
        'E-mail alebo heslo nesedia. Skúste to prosím znova.',
        'nespravne_prihlasenie',
      )
    }
    return s
  }

  /* občania ---------------------------------------------------------- */

  async getResident(idHladany: string): Promise<Resident | null> {
    return this.nacitaj().residents.find((r) => r.id === idHladany) ?? null
  }

  async updateResident(idHladany: string, zmeny: Partial<Resident>): Promise<Resident> {
    const db = this.nacitaj()
    const i = db.residents.findIndex((r) => r.id === idHladany)
    if (i < 0) throw new DataError('Konto sa nenašlo.', 'nenajdene')
    db.residents[i] = { ...db.residents[i], ...zmeny, id: idHladany }
    this.uloz(db)
    return db.residents[i]
  }

  /* nehnuteľnosti ---------------------------------------------------- */

  async listProperties(residentId: string): Promise<Property[]> {
    return this.nacitaj().properties.filter((p) => p.residentId === residentId)
  }

  async getProperty(idHladany: string): Promise<Property | null> {
    return this.nacitaj().properties.find((p) => p.id === idHladany) ?? null
  }

  async createProperty(residentId: string, vstup: PropertyInput): Promise<Property> {
    const db = this.nacitaj()
    const nova: Property = {
      ...vstup,
      id: id('prop'),
      tenantId: this.tenantId,
      residentId,
      createdAt: new Date().toISOString(),
    }
    db.properties.push(nova)
    this.uloz(db)
    return nova
  }

  async updateProperty(
    idHladany: string,
    zmeny: Partial<PropertyInput>,
  ): Promise<Property> {
    const db = this.nacitaj()
    const i = db.properties.findIndex((p) => p.id === idHladany)
    if (i < 0) throw new DataError('Nehnuteľnosť sa nenašla.', 'nenajdene')
    db.properties[i] = { ...db.properties[i], ...zmeny }
    this.uloz(db)
    return db.properties[i]
  }

  async deleteProperty(idHladany: string): Promise<void> {
    const db = this.nacitaj()
    db.properties = db.properties.filter((p) => p.id !== idHladany)
    this.uloz(db)
  }

  /* podania ----------------------------------------------------------- */

  async createSubmission(vstup: SubmissionInput): Promise<Submission> {
    const db = this.nacitaj()
    db.poradie += 1
    const teraz = new Date().toISOString()
    const podanie: Submission = {
      id: id('sub'),
      tenantId: this.tenantId,
      cisloPodania: buildCisloPodania(
        this.tenant.nazovKratky,
        new Date().getFullYear(),
        db.poradie,
      ),
      formId: vstup.formId,
      formNazov: vstup.formNazov,
      residentId: vstup.residentId,
      ziadatelMeno: vstup.ziadatelMeno,
      ziadatelEmail: vstup.ziadatelEmail,
      propertyId: vstup.propertyId ?? null,
      data: vstup.data,
      prilohy: vstup.prilohy,
      status: 'prijate',
      precitane: false,
      prijateAt: teraz,
      aktualizovaneAt: teraz,
      audit: [
        { id: id('aud'), action: 'prijate', at: teraz, aktor: vstup.ziadatelMeno },
      ],
    }
    db.submissions.unshift(podanie)
    this.uloz(db)
    return podanie
  }

  async listSubmissions(filter: SubmissionFilter = {}): Promise<Page<Submission>> {
    const db = this.nacitaj()
    let polozky = db.submissions.filter((s) => s.tenantId === this.tenantId)

    const hladat = filter.hladat?.trim().toLowerCase()
    if (hladat) {
      polozky = polozky.filter((s) =>
        [s.cisloPodania, s.ziadatelMeno, s.ziadatelEmail, s.formNazov]
          .join(' ')
          .toLowerCase()
          .includes(hladat),
      )
    }
    if (filter.formId) polozky = polozky.filter((s) => s.formId === filter.formId)
    if (filter.status) polozky = polozky.filter((s) => s.status === filter.status)
    if (filter.odDatumu) {
      polozky = polozky.filter((s) => s.prijateAt.slice(0, 10) >= filter.odDatumu!)
    }
    if (filter.doDatumu) {
      polozky = polozky.filter((s) => s.prijateAt.slice(0, 10) <= filter.doDatumu!)
    }

    const poradie = filter.zoradit ?? 'datum_desc'
    polozky = [...polozky].sort((a, b) => {
      if (poradie === 'datum_asc') return a.prijateAt.localeCompare(b.prijateAt)
      if (poradie === 'meno_asc')
        return a.ziadatelMeno.localeCompare(b.ziadatelMeno, 'sk')
      if (poradie === 'stav') return a.status.localeCompare(b.status, 'sk')
      return b.prijateAt.localeCompare(a.prijateAt)
    })

    const naStranu = filter.naStranu ?? 10
    const strana = filter.strana ?? 1
    const zaciatok = (strana - 1) * naStranu
    return {
      polozky: polozky.slice(zaciatok, zaciatok + naStranu),
      spolu: polozky.length,
      strana,
      naStranu,
    }
  }

  async listSubmissionsForResident(residentId: string): Promise<Submission[]> {
    return this.nacitaj()
      .submissions.filter((s) => s.residentId === residentId)
      .sort((a, b) => b.prijateAt.localeCompare(a.prijateAt))
  }

  async getSubmission(idHladany: string): Promise<Submission | null> {
    return this.nacitaj().submissions.find((s) => s.id === idHladany) ?? null
  }

  private zapisAudit(
    db: DemoDb,
    podanie: Submission,
    action: AuditAction,
    aktor: string,
    poznamka?: string,
  ): void {
    const zaznam: AuditEntry = {
      id: id('aud'),
      action,
      at: new Date().toISOString(),
      aktor,
      poznamka,
    }
    podanie.audit = [...podanie.audit, zaznam]
    void db
  }

  async markSubmissionRead(idHladany: string, aktor: string): Promise<void> {
    const db = this.nacitaj()
    const s = db.submissions.find((x) => x.id === idHladany)
    if (!s) return
    const uzPrecitane = s.precitane
    s.precitane = true
    if (!uzPrecitane) this.zapisAudit(db, s, 'zobrazene', aktor)
    this.uloz(db)
  }

  async changeSubmissionStatus(
    idHladany: string,
    stav: SubmissionStatus,
    aktor: string,
    poznamka?: string,
  ): Promise<Submission> {
    const db = this.nacitaj()
    const s = db.submissions.find((x) => x.id === idHladany)
    if (!s) throw new DataError('Podanie sa nenašlo.', 'nenajdene')
    s.status = stav
    s.aktualizovaneAt = new Date().toISOString()
    this.zapisAudit(db, s, 'zmena_stavu', aktor, poznamka)
    this.uloz(db)
    return s
  }

  async deleteSubmission(idHladany: string, aktor: string): Promise<void> {
    const db = this.nacitaj()
    const s = db.submissions.find((x) => x.id === idHladany)
    if (!s) return
    void aktor
    db.submissions = db.submissions.filter((x) => x.id !== idHladany)
    this.uloz(db)
  }

  async logAudit(
    idHladany: string,
    action: AuditAction,
    aktor: string,
    poznamka?: string,
  ): Promise<void> {
    const db = this.nacitaj()
    const s = db.submissions.find((x) => x.id === idHladany)
    if (!s) return
    this.zapisAudit(db, s, action, aktor, poznamka)
    this.uloz(db)
  }

  async statistiky(): Promise<Statistiky> {
    const db = this.nacitaj()
    const teraz = new Date()
    const zaciatokMesiaca = new Date(teraz.getFullYear(), teraz.getMonth(), 1)
    return {
      nove: db.submissions.filter((s) => !s.precitane).length,
      vRieseni: db.submissions.filter((s) => s.status === 'v_rieseni').length,
      vybaveneTentoMesiac: db.submissions.filter(
        (s) =>
          s.status === 'vybavene' && new Date(s.aktualizovaneAt) >= zaciatokMesiaca,
      ).length,
      spolu: db.submissions.length,
    }
  }

  /* zamestnanci ------------------------------------------------------- */

  async listStaff(): Promise<StaffUser[]> {
    return this.nacitaj().staff
  }

  async inviteStaff(vstup: {
    meno: string
    priezvisko: string
    email: string
    role: StaffRole
  }): Promise<StaffUser> {
    const db = this.nacitaj()
    if (
      db.staff.some((s) => s.email.toLowerCase() === vstup.email.trim().toLowerCase())
    ) {
      throw new DataError('Tento e-mail už v zozname je.', 'email_obsadeny')
    }
    const novy: StaffUser = {
      id: id('staff'),
      tenantId: this.tenantId,
      meno: vstup.meno.trim(),
      priezvisko: vstup.priezvisko.trim(),
      email: vstup.email.trim(),
      role: vstup.role,
      status: 'pozvany',
      createdAt: new Date().toISOString(),
    }
    db.staff.push(novy)
    this.uloz(db)
    return novy
  }

  async deleteStaff(idHladany: string): Promise<void> {
    const db = this.nacitaj()
    db.staff = db.staff.filter((s) => s.id !== idHladany)
    this.uloz(db)
  }

  /* demo -------------------------------------------------------------- */

  async resetDemoData(): Promise<void> {
    this.uloz(buildSeed(this.tenant))
  }
}
