export interface RodneCisloInfo {
  platne: boolean
  chyba?: string
  datumNarodenia?: string
  pohlavie?: 'muz' | 'zena'
}

/** Odstráni lomku a medzery. */
export function normalizeRodneCislo(vstup: string): string {
  return vstup.replace(/[\s/]/g, '')
}

/** Zobrazí rodné číslo zakryté, napríklad ******\/1234. */
export function maskRodneCislo(vstup: string): string {
  const cisto = normalizeRodneCislo(vstup)
  if (cisto.length < 4) return '**********'
  return '******/' + cisto.slice(-4)
}

/** Naformátuje rodné číslo do tvaru 940215/6789. */
export function formatRodneCislo(vstup: string): string {
  const cisto = normalizeRodneCislo(vstup)
  if (cisto.length < 7) return cisto
  return cisto.slice(0, 6) + '/' + cisto.slice(6)
}

export function parseRodneCislo(vstup: string): RodneCisloInfo {
  const cisto = normalizeRodneCislo(vstup ?? '')
  if (!/^\d{9,10}$/.test(cisto)) {
    return { platne: false, chyba: 'Rodné číslo musí mať 9 alebo 10 číslic.' }
  }

  const rr = Number(cisto.slice(0, 2))
  let mm = Number(cisto.slice(2, 4))
  const dd = Number(cisto.slice(4, 6))

  let pohlavie: 'muz' | 'zena' = 'muz'
  if (mm > 70) {
    mm -= 70
    pohlavie = 'zena'
  } else if (mm > 50) {
    mm -= 50
    pohlavie = 'zena'
  } else if (mm > 20) {
    mm -= 20
  }

  if (mm < 1 || mm > 12) {
    return { platne: false, chyba: 'Rodné číslo obsahuje neplatný mesiac narodenia.' }
  }

  // Deväťmiestne rodné čísla patria osobám narodeným pred 1. 1. 1954,
  // desaťmiestne sa prideľujú od roku 1954.
  const storocie =
    cisto.length === 9 ? (rr >= 54 ? 1800 : 1900) : rr < 54 ? 2000 : 1900

  const rok = storocie + rr
  const datum = new Date(Date.UTC(rok, mm - 1, dd))
  if (
    datum.getUTCFullYear() !== rok ||
    datum.getUTCMonth() !== mm - 1 ||
    datum.getUTCDate() !== dd
  ) {
    return { platne: false, chyba: 'Rodné číslo obsahuje neplatný dátum narodenia.' }
  }

  if (cisto.length === 10) {
    const cele = Number(cisto)
    const zvysok = Number(cisto.slice(0, 9)) % 11
    const kontrolna = Number(cisto[9])
    const okDelitelne = cele % 11 === 0
    // Historická výnimka: v rokoch 1954 až 1985 sa pripúšťal zvyšok 10 a kontrolná číslica 0.
    const okVynimka = zvysok === 10 && kontrolna === 0
    if (!okDelitelne && !okVynimka) {
      return { platne: false, chyba: 'Rodné číslo neprešlo kontrolou správnosti.' }
    }
  }

  const dvojmiestne = (n: number) => String(n).padStart(2, '0')
  return {
    platne: true,
    pohlavie,
    datumNarodenia: `${dvojmiestne(dd)}. ${dvojmiestne(mm)}. ${rok}`,
  }
}

export function isRodneCisloValid(vstup: string): boolean {
  return parseRodneCislo(vstup).platne
}
