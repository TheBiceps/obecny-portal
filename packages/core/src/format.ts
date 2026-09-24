/* Slovenské formátovanie hodnôt pre celé rozhranie. */

const MESIACE = [
  'januára', 'februára', 'marca', 'apríla', 'mája', 'júna',
  'júla', 'augusta', 'septembra', 'októbra', 'novembra', 'decembra',
]

function toDate(v: string | Date): Date | null {
  const d = v instanceof Date ? v : new Date(v)
  return Number.isNaN(d.getTime()) ? null : d
}

/** Dátum v tvare 24. 09. 2026. */
export function formatDate(v: string | Date | undefined | null): string {
  if (!v) return ''
  const d = toDate(v)
  if (!d) return String(v)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  return `${dd}. ${mm}. ${d.getFullYear()}`
}

/** Dátum a čas v tvare 24. 09. 2026 o 14.05. */
export function formatDateTime(v: string | Date | undefined | null): string {
  if (!v) return ''
  const d = toDate(v)
  if (!d) return String(v)
  const hh = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${formatDate(d)} o ${hh}.${min}`
}

/** Dátum slovom, napríklad 24. septembra 2026. */
export function formatDateLong(v: string | Date | undefined | null): string {
  if (!v) return ''
  const d = toDate(v)
  if (!d) return String(v)
  return `${d.getDate()}. ${MESIACE[d.getMonth()]} ${d.getFullYear()}`
}

/** Suma v tvare 30 € alebo 12,50 €. */
export function formatEur(suma: number): string {
  const cele = Number.isInteger(suma)
  const text = cele
    ? String(suma)
    : suma.toFixed(2).replace('.', ',')
  return `${text} €`
}

/** Veľkosť súboru, napríklad 1,2 MB. */
export function formatVelkost(bajty: number): string {
  if (bajty < 1024) return `${bajty} B`
  if (bajty < 1024 * 1024) return `${(bajty / 1024).toFixed(0)} kB`
  return `${(bajty / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`
}

/** Číslo podania v tvare BER-2026-000123. */
export function buildCisloPodania(
  nazovKratky: string,
  rok: number,
  poradie: number,
): string {
  const predpona = nazovKratky
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^A-Za-z]/g, '')
    .slice(0, 3)
    .toUpperCase()
  return `${predpona}-${rok}-${String(poradie).padStart(6, '0')}`
}

export const STAV_LABEL: Record<string, string> = {
  prijate: 'Prijaté',
  v_rieseni: 'V riešení',
  vybavene: 'Vybavené',
  zamietnute: 'Zamietnuté',
}

export const TYP_NEHNUTELNOSTI_LABEL: Record<string, string> = {
  rodinny_dom: 'Rodinný dom',
  byt: 'Byt',
  pozemok: 'Pozemok',
  ina_stavba: 'Iná stavba',
}

export const VZTAH_LABEL: Record<string, string> = {
  vlastnik: 'Vlastník',
  spoluvlastnik: 'Spoluvlastník',
  najomca: 'Nájomca',
  ine: 'Iné',
}

export const ROLA_LABEL: Record<string, string> = {
  super_admin: 'Hlavný správca',
  referent: 'Referent',
  citatel: 'Čitateľ',
}

export const STAV_POUZIVATELA_LABEL: Record<string, string> = {
  aktivny: 'Aktívny',
  pozvany: 'Pozvaný',
  deaktivovany: 'Deaktivovaný',
}
