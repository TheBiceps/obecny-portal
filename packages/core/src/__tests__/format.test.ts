import { describe, expect, it } from 'vitest'
import {
  buildCisloPodania,
  formatDate,
  formatDateLong,
  formatDateTime,
  formatEur,
  formatVelkost,
} from '../format'

describe('formatDate', () => {
  it('vráti 24. 09. 2026 pre 2026-09-24', () => {
    expect(formatDate('2026-09-24')).toBe('24. 09. 2026')
  })

  it('prázdny vstup vráti prázdny reťazec', () => {
    expect(formatDate('')).toBe('')
    expect(formatDate(undefined)).toBe('')
    expect(formatDate(null)).toBe('')
  })
})

describe('formatDateTime', () => {
  it('naformátuje dátum a čas', () => {
    const d = new Date(2026, 8, 24, 14, 5)
    expect(formatDateTime(d)).toBe('24. 09. 2026 o 14.05')
  })

  it('prázdny vstup vráti prázdny reťazec', () => {
    expect(formatDateTime('')).toBe('')
  })
})

describe('formatDateLong', () => {
  it('naformátuje dátum slovom', () => {
    const d = new Date(2026, 8, 24)
    expect(formatDateLong(d)).toBe('24. septembra 2026')
  })

  it('prázdny vstup vráti prázdny reťazec', () => {
    expect(formatDateLong('')).toBe('')
  })
})

describe('formatEur', () => {
  it('30 sa naformátuje na 30 €', () => {
    expect(formatEur(30)).toBe('30 €')
  })

  it('12.5 sa naformátuje na 12,50 €', () => {
    expect(formatEur(12.5)).toBe('12,50 €')
  })
})

describe('formatVelkost', () => {
  it('naformátuje bajty', () => {
    expect(formatVelkost(500)).toBe('500 B')
  })

  it('naformátuje kilobajty', () => {
    expect(formatVelkost(2048)).toBe('2 kB')
  })

  it('naformátuje megabajty', () => {
    expect(formatVelkost(5 * 1024 * 1024)).toBe('5,0 MB')
  })
})

describe('buildCisloPodania', () => {
  it('vráti tvar BER-2026-000123 a odstráni diakritiku', () => {
    expect(buildCisloPodania('Bernolákovo', 2026, 123)).toBe('BER-2026-000123')
  })
})
