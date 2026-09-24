/** Základné doménové typy. Každý záznam nesie tenantId, aby bol systém pripravený na viac obcí. */

export type Id = string

export interface TenantScoped {
  tenantId: string
}

/* ------------------------------------------------------------------ */
/* Občan a jeho profil                                                  */
/* ------------------------------------------------------------------ */

export type PropertyType = 'rodinny_dom' | 'byt' | 'pozemok' | 'ina_stavba'
export type PropertyRelation = 'vlastnik' | 'spoluvlastnik' | 'najomca' | 'ine'
export type ParcelRegister = 'C' | 'E'

export interface Address {
  ulica: string
  supisneCislo?: string
  orientacneCislo?: string
  obec: string
  psc: string
}

export interface Property extends TenantScoped {
  id: Id
  residentId: Id
  nazov?: string
  typ: PropertyType
  vztah: PropertyRelation
  adresa: Address
  katastralneUzemie: string
  parcelaCislo: string
  parcelaRegister: ParcelRegister
  cisloLv: string
  /* len byt */
  cisloBytu?: string
  vchod?: string
  poschodie?: string
  podielNaSpolocnychCastiach?: string
  /* voliteľné */
  nazovStavby?: string
  rokKolaudacie?: string
  vymeraM2?: string
  createdAt: string
}

export interface Resident extends TenantScoped {
  id: Id
  titul?: string
  meno: string
  priezvisko: string
  rodneCislo: string
  telefon: string
  email: string
  /** demo: heslo je uložené len lokálne a nie je to produkčné riešenie */
  passwordHash: string
  trvalyPobyt: Address
  gdprSuhlasAt: string
  createdAt: string
}

/* ------------------------------------------------------------------ */
/* Zamestnanci úradu                                                    */
/* ------------------------------------------------------------------ */

export type StaffRole = 'super_admin' | 'referent' | 'citatel'
export type StaffStatus = 'aktivny' | 'pozvany' | 'deaktivovany'

export interface StaffUser extends TenantScoped {
  id: Id
  meno: string
  priezvisko: string
  email: string
  role: StaffRole
  status: StaffStatus
  passwordHash?: string
  createdAt: string
}

/* ------------------------------------------------------------------ */
/* Podania                                                              */
/* ------------------------------------------------------------------ */

export type SubmissionStatus = 'prijate' | 'v_rieseni' | 'vybavene' | 'zamietnute'

export interface AttachmentMeta {
  id: Id
  fieldId: string
  nazovSuboru: string
  velkostBajtov: number
  typSuboru: string
  /** data URL, len pre demo a len pre malé súbory */
  nahlad?: string
}

export type AuditAction =
  | 'prijate'
  | 'zobrazene'
  | 'zmena_stavu'
  | 'stiahnute_pdf'
  | 'vymazane'

export interface AuditEntry {
  id: Id
  action: AuditAction
  at: string
  aktor: string
  poznamka?: string
}

export interface Submission extends TenantScoped {
  id: Id
  cisloPodania: string
  formId: string
  formNazov: string
  /** null pre neregistrovaného žiadateľa */
  residentId: Id | null
  ziadatelMeno: string
  ziadatelEmail: string
  propertyId?: Id | null
  data: Record<string, unknown>
  prilohy: AttachmentMeta[]
  status: SubmissionStatus
  precitane: boolean
  prijateAt: string
  aktualizovaneAt: string
  audit: AuditEntry[]
}

export interface SubmissionFilter {
  hladat?: string
  formId?: string
  status?: SubmissionStatus
  odDatumu?: string
  doDatumu?: string
  zoradit?: 'datum_desc' | 'datum_asc' | 'meno_asc' | 'stav'
  strana?: number
  naStranu?: number
}

export interface Page<T> {
  polozky: T[]
  spolu: number
  strana: number
  naStranu: number
}

export interface Session {
  kind: 'resident' | 'staff'
  userId: Id
  tenantId: string
}
