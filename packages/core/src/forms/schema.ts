/**
 * Formát definície formulára.
 * Formuláre sú dáta, nie kód, takže ďalšia obec pridá vlastný formulár
 * jedným novým súborom bez zásahu do aplikácie.
 */

export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'date'
  | 'year'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'file'
  | 'address'
  | 'propertyPicker'
  | 'info'
  | 'consent'

export type ValidatorName =
  | 'email'
  | 'telefon'
  | 'psc'
  | 'ico'
  | 'rodneCislo'
  | 'rok'
  | 'cisloOp'

/** Zdroj pre predvyplnenie z profilu občana, z nehnuteľnosti alebo z obce. */
export type AutofillSource =
  | `resident.${string}`
  | `property.${string}`
  | `tenant.${string}`
  | 'dnes'

export interface Condition {
  /** id poľa, od ktorého závisí viditeľnosť */
  field: string
  equals?: unknown
  oneOf?: unknown[]
  /** pole je vyplnené alebo zaškrtnuté */
  isTruthy?: boolean
}

export type Visibility = Condition | { and: Condition[] } | { or: Condition[] }

export interface Option {
  value: string
  label: string
  helper?: string
}

export interface Field {
  id: string
  label: string
  type: FieldType
  required?: boolean
  helper?: string
  placeholder?: string
  /** pevný text pre typ info a pre právne znenie súhlasu */
  text?: string
  options?: Option[]
  /** zdroj hodnôt zo konfigurácie obce, napríklad katastralneUzemia */
  optionsFromTenant?: 'katastralneUzemia'
  validate?: ValidatorName
  min?: number
  max?: number
  maxLength?: number
  /** koľko súborov je možné nahrať pri type file */
  maxSuborov?: number
  maxVelkostMb?: number
  autofillFrom?: AutofillSource
  visibleIf?: Visibility
  /** šírka v mriežke sekcie, 1 je polovica, 2 je celý riadok */
  colSpan?: 1 | 2
  /** vlastný text chyby, ktorý sa zobrazí namiesto predvoleného */
  chybaText?: string
}

export interface Section {
  id: string
  title: string
  description?: string
  visibleIf?: Visibility
  fields: Field[]
}

export interface PrilohaInfo {
  id: string
  nazov: string
  povinna: boolean
  poznamka?: string
  visibleIf?: Visibility
}

export interface FormSchema {
  id: string
  nazov: string
  kratkyPopis: string
  kategoria: string
  /** poplatok v eurách, 0 znamená bez poplatku */
  poplatokEur: number
  poplatokPoznamka?: string
  odhadovanyCasMin: number
  pravnyZaklad: string
  /** komu je žiadosť adresovaná, dopĺňa sa z konfigurácie obce */
  adresat: string
  sections: Section[]
  prilohy: PrilohaInfo[]
  infoPoznamka?: string
  /** názov súboru pri stiahnutí PDF */
  pdfNazov: string
}
