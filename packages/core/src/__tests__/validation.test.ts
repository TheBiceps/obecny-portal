import { describe, expect, it } from 'vitest'
import {
  formatRodneCislo,
  maskRodneCislo,
  parseRodneCislo,
} from '../validation/rodneCislo'
import {
  formatPsc,
  formatTelefon,
  isEmailValid,
  isIcoValid,
  isPscValid,
  isTelefonValid,
  vyhodnotHeslo,
} from '../validation/formats'

describe('parseRodneCislo', () => {
  it('uzná platné desaťmiestne rodné číslo deliteľné jedenástimi', () => {
    const info = parseRodneCislo('8203151231')
    expect(info.platne).toBe(true)
    expect(info.datumNarodenia).toBe('15. 03. 1982')
  })

  it('rozpozná ženské pohlavie z mesiaca zvýšeného o 50', () => {
    const info = parseRodneCislo('8561072146')
    expect(info.platne).toBe(true)
    expect(info.pohlavie).toBe('zena')
    expect(info.datumNarodenia).toBe('07. 11. 1985')
  })

  it('odmietne neplatný mesiac narodenia', () => {
    const info = parseRodneCislo('8213151234')
    expect(info.platne).toBe(false)
    expect(info.chyba).toMatch(/mesiac/i)
  })

  it('odmietne neplatný dátum narodenia, napríklad 31. február', () => {
    const info = parseRodneCislo('8202311234')
    expect(info.platne).toBe(false)
    expect(info.chyba).toMatch(/dátum/i)
  })

  it('odmietne rodné číslo so zlou kontrolnou číslicou', () => {
    const info = parseRodneCislo('8203151230')
    expect(info.platne).toBe(false)
    expect(info.chyba).toMatch(/kontrol/i)
  })

  it('uzná deväťmiestne rodné číslo osoby narodenej pred rokom 1954', () => {
    const info = parseRodneCislo('300512123')
    expect(info.platne).toBe(true)
    expect(info.datumNarodenia).toBe('12. 05. 1930')
  })

  it('prijme tvar s lomkou', () => {
    const info = parseRodneCislo('820315/1231')
    expect(info.platne).toBe(true)
  })

  it('odmietne príliš krátky vstup', () => {
    const info = parseRodneCislo('12345')
    expect(info.platne).toBe(false)
  })
})

describe('maskRodneCislo a formatRodneCislo', () => {
  it('maskRodneCislo vráti tvar ******/1231', () => {
    expect(maskRodneCislo('8203151231')).toBe('******/1231')
  })

  it('formatRodneCislo vráti tvar 820315/1231', () => {
    expect(formatRodneCislo('8203151231')).toBe('820315/1231')
  })
})

describe('isPscValid a formatPsc', () => {
  it('90027 je platné PSČ a formátuje sa na 900 27', () => {
    expect(isPscValid('90027')).toBe(true)
    expect(formatPsc('90027')).toBe('900 27')
  })

  it('9002 je neplatné PSČ', () => {
    expect(isPscValid('9002')).toBe(false)
  })
})

describe('isTelefonValid a formatTelefon', () => {
  it('+421905123456 je platné číslo', () => {
    expect(isTelefonValid('+421905123456')).toBe(true)
    expect(formatTelefon('+421905123456')).toBe('+421 905 123 456')
  })

  it('0905123456 je platné číslo', () => {
    expect(isTelefonValid('0905123456')).toBe(true)
    expect(formatTelefon('0905123456')).toBe('+421 905 123 456')
  })

  it('12345 je neplatné číslo', () => {
    expect(isTelefonValid('12345')).toBe(false)
  })
})

describe('isIcoValid', () => {
  it('36123455 je platné IČO (kontrolná číslica sedí)', () => {
    expect(isIcoValid('36123455')).toBe(true)
  })

  it('50998811 je platné IČO (kontrolná číslica sedí)', () => {
    expect(isIcoValid('50998811')).toBe(true)
  })

  it('12345678 je neplatné IČO (kontrolná číslica nesedí)', () => {
    expect(isIcoValid('12345678')).toBe(false)
  })

  it('príliš krátky vstup je neplatný', () => {
    expect(isIcoValid('123')).toBe(false)
  })
})

describe('isEmailValid', () => {
  it('uzná platný e-mail', () => {
    expect(isEmailValid('meno@domena.sk')).toBe(true)
  })

  it('odmietne e-mail bez zavináča', () => {
    expect(isEmailValid('meno.domena.sk')).toBe(false)
  })
})

describe('vyhodnotHeslo', () => {
  it('krátke heslo nie je dostatočné', () => {
    const vysledok = vyhodnotHeslo('ab1')
    expect(vysledok.dostatocne).toBe(false)
  })

  it('Demo1234 je dostatočné heslo', () => {
    const vysledok = vyhodnotHeslo('Demo1234')
    expect(vysledok.dostatocne).toBe(true)
  })
})
