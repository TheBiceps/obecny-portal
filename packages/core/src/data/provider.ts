import type {
  AttachmentMeta,
  AuditAction,
  Address,
  Page,
  Property,
  Resident,
  StaffRole,
  StaffUser,
  Submission,
  SubmissionFilter,
  SubmissionStatus,
} from '../types'

export class DataError extends Error {
  constructor(
    message: string,
    public kod:
      | 'nespravne_prihlasenie'
      | 'email_obsadeny'
      | 'nenajdene'
      | 'bez_opravnenia'
      | 'neplatne_data' = 'neplatne_data',
  ) {
    super(message)
    this.name = 'DataError'
  }
}

export interface RegistraciaInput {
  titul?: string
  meno: string
  priezvisko: string
  rodneCislo: string
  telefon: string
  email: string
  heslo: string
  trvalyPobyt: Address
  gdprSuhlas: boolean
}

export type PropertyInput = Omit<
  Property,
  'id' | 'tenantId' | 'residentId' | 'createdAt'
>

export interface SubmissionInput {
  formId: string
  formNazov: string
  residentId: string | null
  ziadatelMeno: string
  ziadatelEmail: string
  propertyId?: string | null
  data: Record<string, unknown>
  prilohy: AttachmentMeta[]
}

export interface Statistiky {
  nove: number
  vRieseni: number
  vybaveneTentoMesiac: number
  spolu: number
}

/**
 * Jednotné rozhranie pre dáta.
 * Demo beží na LocalStorageProvider, produkcia dostane ApiProvider
 * bez zásahu do aplikačných obrazoviek.
 */
export interface DataProvider {
  readonly tenantId: string

  /* prihlásenie */
  prihlasitObcana(email: string, heslo: string): Promise<Resident>
  registrovatObcana(vstup: RegistraciaInput): Promise<Resident>
  poziadatOObnovuHesla(email: string): Promise<void>
  prihlasitZamestnanca(email: string, heslo: string): Promise<StaffUser>

  /* občania */
  getResident(id: string): Promise<Resident | null>
  updateResident(id: string, zmeny: Partial<Resident>): Promise<Resident>

  /* nehnuteľnosti */
  listProperties(residentId: string): Promise<Property[]>
  getProperty(id: string): Promise<Property | null>
  createProperty(residentId: string, vstup: PropertyInput): Promise<Property>
  updateProperty(id: string, zmeny: Partial<PropertyInput>): Promise<Property>
  deleteProperty(id: string): Promise<void>

  /* podania */
  createSubmission(vstup: SubmissionInput): Promise<Submission>
  listSubmissions(filter?: SubmissionFilter): Promise<Page<Submission>>
  listSubmissionsForResident(residentId: string): Promise<Submission[]>
  getSubmission(id: string): Promise<Submission | null>
  markSubmissionRead(id: string, aktor: string): Promise<void>
  changeSubmissionStatus(
    id: string,
    stav: SubmissionStatus,
    aktor: string,
    poznamka?: string,
  ): Promise<Submission>
  deleteSubmission(id: string, aktor: string): Promise<void>
  logAudit(
    id: string,
    action: AuditAction,
    aktor: string,
    poznamka?: string,
  ): Promise<void>
  statistiky(): Promise<Statistiky>

  /* zamestnanci úradu */
  listStaff(): Promise<StaffUser[]>
  inviteStaff(vstup: {
    meno: string
    priezvisko: string
    email: string
    role: StaffRole
  }): Promise<StaffUser>
  deleteStaff(id: string): Promise<void>

  /* demo */
  resetDemoData(): Promise<void>
}
