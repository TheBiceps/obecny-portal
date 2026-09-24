/* Slovenské formáty a ich kontrola. */

export function normalizePsc(vstup: string): string {
  return (vstup ?? '').replace(/\s/g, '')
}

export function isPscValid(vstup: string): boolean {
  return /^\d{5}$/.test(normalizePsc(vstup))
}

export function formatPsc(vstup: string): string {
  const cisto = normalizePsc(vstup)
  return cisto.length === 5 ? `${cisto.slice(0, 3)} ${cisto.slice(3)}` : vstup
}

export function normalizeTelefon(vstup: string): string {
  return (vstup ?? '').replace(/[\s()/.-]/g, '')
}

/** Prijíma tvary +4219xxxxxxxx aj 09xxxxxxxx vrátane pevných liniek. */
export function isTelefonValid(vstup: string): boolean {
  const cisto = normalizeTelefon(vstup)
  return /^(\+421\d{9}|0\d{9})$/.test(cisto)
}

/** Zjednotí telefón na tvar +421 9xx xxx xxx. */
export function formatTelefon(vstup: string): string {
  const cisto = normalizeTelefon(vstup)
  let narodne = ''
  if (/^\+421\d{9}$/.test(cisto)) narodne = cisto.slice(4)
  else if (/^0\d{9}$/.test(cisto)) narodne = cisto.slice(1)
  else return vstup
  return `+421 ${narodne.slice(0, 3)} ${narodne.slice(3, 6)} ${narodne.slice(6)}`
}

/** IČO má osem číslic a kontrolnú číslicu s váhami 8 až 2. */
export function isIcoValid(vstup: string): boolean {
  const cisto = (vstup ?? '').replace(/\s/g, '')
  if (!/^\d{8}$/.test(cisto)) return false
  const vahy = [8, 7, 6, 5, 4, 3, 2]
  const sucet = vahy.reduce((acc, v, i) => acc + v * Number(cisto[i]), 0)
  let kontrolna = 11 - (sucet % 11)
  if (kontrolna === 10) kontrolna = 0
  if (kontrolna === 11) kontrolna = 1
  return kontrolna === Number(cisto[7])
}

export function isEmailValid(vstup: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test((vstup ?? '').trim())
}

export interface SilaHesla {
  skore: 0 | 1 | 2 | 3 | 4
  popis: string
  dostatocne: boolean
}

export function vyhodnotHeslo(heslo: string): SilaHesla {
  const h = heslo ?? ''
  let skore = 0
  if (h.length >= 8) skore++
  if (h.length >= 12) skore++
  if (/[a-záäčďéíĺľňóôŕšťúýž]/i.test(h) && /\d/.test(h)) skore++
  if (/[^A-Za-z0-9]/.test(h)) skore++
  const popisy = ['Veľmi slabé', 'Slabé', 'Použiteľné', 'Silné', 'Veľmi silné']
  const dostatocne = h.length >= 8 && /[A-Za-zÀ-ž]/.test(h) && /\d/.test(h)
  return { skore: skore as 0 | 1 | 2 | 3 | 4, popis: popisy[skore], dostatocne }
}
