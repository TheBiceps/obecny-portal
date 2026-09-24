import { PDFDocument, rgb, StandardFonts, type PDFFont, type PDFPage } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
import type {
  Field,
  FormSchema,
  Submission,
  TenantConfig,
} from '@obec/core'
import {
  fieldOptions,
  formatDate,
  formatEur,
  isVisible,
  visiblePrilohy,
  visibleSections,
} from '@obec/core'

const A4: [number, number] = [595.28, 841.89]
const OKRAJ = 56
const CIERNA = rgb(0.07, 0.09, 0.15)
const SEDA = rgb(0.42, 0.45, 0.5)
const MODRA = rgb(0.12, 0.25, 0.69)
const LINKA = rgb(0.82, 0.85, 0.89)

let cacheFonty: { normal: ArrayBuffer; tucne: ArrayBuffer } | null = null

/**
 * Načíta písmo s plnou podporou slovenskej diakritiky.
 * Bez vloženého písma by pdf-lib slovenské znaky nevykreslil.
 */
async function nacitajFonty(zakladnaUrl: string) {
  if (cacheFonty) return cacheFonty
  const [normal, tucne] = await Promise.all([
    fetch(`${zakladnaUrl}fonts/Roboto-Regular.ttf`).then((r) => r.arrayBuffer()),
    fetch(`${zakladnaUrl}fonts/Roboto-Bold.ttf`).then((r) => r.arrayBuffer()),
  ])
  cacheFonty = { normal, tucne }
  return cacheFonty
}

interface Kresliar {
  doc: PDFDocument
  strana: PDFPage
  y: number
  font: PDFFont
  fontB: PDFFont
}

function novaStrana(k: Kresliar) {
  k.strana = k.doc.addPage(A4)
  k.y = A4[1] - OKRAJ
}

function miesto(k: Kresliar, potrebne: number) {
  if (k.y - potrebne < OKRAJ + 24) novaStrana(k)
}

function zalom(text: string, font: PDFFont, velkost: number, sirka: number): string[] {
  const slova = String(text).split(/\s+/).filter(Boolean)
  const riadky: string[] = []
  let aktualny = ''
  for (const s of slova) {
    const skus = aktualny ? `${aktualny} ${s}` : s
    if (font.widthOfTextAtSize(skus, velkost) > sirka && aktualny) {
      riadky.push(aktualny)
      aktualny = s
    } else {
      aktualny = skus
    }
  }
  if (aktualny) riadky.push(aktualny)
  return riadky.length ? riadky : ['']
}

function text(
  k: Kresliar,
  obsah: string,
  moznosti: {
    velkost?: number
    tucne?: boolean
    farba?: ReturnType<typeof rgb>
    odsadenie?: number
    medzeraPo?: number
    sirka?: number
  } = {},
) {
  const velkost = moznosti.velkost ?? 10
  const font = moznosti.tucne ? k.fontB : k.font
  const odsadenie = moznosti.odsadenie ?? 0
  const sirka = moznosti.sirka ?? A4[0] - OKRAJ * 2 - odsadenie
  const riadky = zalom(obsah, font, velkost, sirka)
  for (const r of riadky) {
    miesto(k, velkost + 4)
    k.strana.drawText(r, {
      x: OKRAJ + odsadenie,
      y: k.y - velkost,
      size: velkost,
      font,
      color: moznosti.farba ?? CIERNA,
    })
    k.y -= velkost + 4
  }
  k.y -= moznosti.medzeraPo ?? 0
}

function ciara(k: Kresliar, medzeraPred = 6, medzeraPo = 8) {
  k.y -= medzeraPred
  miesto(k, 2)
  k.strana.drawLine({
    start: { x: OKRAJ, y: k.y },
    end: { x: A4[0] - OKRAJ, y: k.y },
    thickness: 0.7,
    color: LINKA,
  })
  k.y -= medzeraPo
}

/* ------------------------------------------------------------------ */
/* Hodnoty polí do čitateľnej podoby                                    */
/* ------------------------------------------------------------------ */

function hodnotaPola(
  f: Field,
  data: Record<string, unknown>,
  tenant: TenantConfig,
): string {
  const v = data[f.id]
  if (v === undefined || v === null || v === '') return 'Neuvedené'

  if (f.type === 'checkbox' || f.type === 'consent') return v ? 'Áno' : 'Nie'
  if (f.type === 'date') return formatDate(String(v))
  if (f.type === 'file') {
    const zoznam = Array.isArray(v) ? v : []
    if (zoznam.length === 0) return 'Bez príloh'
    return zoznam
      .map((s) => (s as { nazovSuboru?: string }).nazovSuboru ?? 'príloha')
      .join(', ')
  }
  if (f.type === 'address') {
    const a = v as Record<string, string>
    const cislo = [a.supisneCislo, a.orientacneCislo].filter(Boolean).join('/')
    return [
      [a.ulica, cislo].filter(Boolean).join(' '),
      [a.psc, a.obec].filter(Boolean).join(' '),
    ]
      .filter(Boolean)
      .join(', ')
  }
  if (f.type === 'select' || f.type === 'radio') {
    const moznosti = fieldOptions(f, tenant)
    return moznosti.find((o) => o.value === v)?.label ?? String(v)
  }
  return String(v)
}

/* ------------------------------------------------------------------ */

export interface PdfVstup {
  schema: FormSchema
  podanie: Submission
  tenant: TenantConfig
  /** import.meta.env.BASE_URL aplikácie, aby sa našlo písmo */
  zakladnaUrl: string
  /** logo obce ako dátová URL, nepovinné */
  erbDataUrl?: string
}

/** Vytvorí PDF vyplneného formulára s hlavičkou obce. */
export async function vytvorPdfPodania(vstup: PdfVstup): Promise<Uint8Array> {
  const { schema, podanie, tenant, zakladnaUrl } = vstup
  const doc = await PDFDocument.create()
  doc.registerFontkit(fontkit)

  let font: PDFFont
  let fontB: PDFFont
  try {
    const fonty = await nacitajFonty(zakladnaUrl)
    font = await doc.embedFont(fonty.normal, { subset: true })
    fontB = await doc.embedFont(fonty.tucne, { subset: true })
  } catch {
    // Núdzové riešenie, diakritika by v ňom nebola úplná.
    font = await doc.embedFont(StandardFonts.Helvetica)
    fontB = await doc.embedFont(StandardFonts.HelveticaBold)
  }

  doc.setTitle(`${schema.nazov} ${podanie.cisloPodania}`)
  doc.setAuthor(tenant.nazov)
  doc.setLanguage('sk-SK')

  const k: Kresliar = { doc, strana: doc.addPage(A4), y: A4[1] - OKRAJ, font, fontB }

  /* hlavička obce */
  text(k, tenant.nazov, { velkost: 15, tucne: true, farba: MODRA })
  text(k, `${tenant.urad.nazovUradu}, ${tenant.urad.ulica}`, { velkost: 9, farba: SEDA })
  text(k, `${tenant.urad.psc} ${tenant.urad.obec}`, { velkost: 9, farba: SEDA })
  ciara(k, 8, 14)

  /* názov žiadosti */
  text(k, schema.nazov, { velkost: 15, tucne: true })
  text(k, `Podľa ${schema.pravnyZaklad}`, { velkost: 9, farba: SEDA, medzeraPo: 6 })

  text(k, `Číslo podania: ${podanie.cisloPodania}`, { velkost: 10, tucne: true })
  text(k, `Dátum prijatia: ${formatDate(podanie.prijateAt)}`, { velkost: 10 })
  if (schema.poplatokEur > 0) {
    text(k, `Správny poplatok: ${formatEur(schema.poplatokEur)}`, { velkost: 10 })
  }
  ciara(k, 8, 12)

  /* sekcie */
  const sekcie = visibleSections(schema, podanie.data)
  sekcie.forEach((s, i) => {
    miesto(k, 60)
    text(k, `${i + 1}. ${s.title}`, { velkost: 12, tucne: true, medzeraPo: 4 })
    for (const f of s.fields) {
      if (!isVisible(f.visibleIf, podanie.data)) continue
      if (f.type === 'propertyPicker') continue
      if (f.type === 'info') {
        text(k, f.text ?? '', { velkost: 8.5, farba: SEDA, odsadenie: 8, medzeraPo: 4 })
        continue
      }
      const hodnota = hodnotaPola(f, podanie.data, tenant)
      if (f.type === 'consent') {
        text(k, `${hodnota === 'Áno' ? 'Áno' : 'Nie'}: ${f.label}`, {
          velkost: 9.5,
          odsadenie: 8,
        })
        if (f.text) {
          text(k, f.text, { velkost: 8, farba: SEDA, odsadenie: 8, medzeraPo: 4 })
        }
        continue
      }
      miesto(k, 26)
      text(k, f.label, { velkost: 8.5, farba: SEDA, odsadenie: 8 })
      text(k, hodnota, { velkost: 10.5, odsadenie: 8, medzeraPo: 4 })
    }
    ciara(k, 4, 10)
  })

  /* prílohy */
  const prilohy = visiblePrilohy(schema, podanie.data)
  if (prilohy.length) {
    miesto(k, 60)
    text(k, 'Prílohy', { velkost: 12, tucne: true, medzeraPo: 4 })
    prilohy.forEach((p, i) => {
      text(k, `${String.fromCharCode(97 + i)}) ${p.nazov}${p.povinna ? '' : ' (nepovinná)'}`, {
        velkost: 9.5,
        odsadenie: 8,
      })
      if (p.poznamka) {
        text(k, p.poznamka, { velkost: 8, farba: SEDA, odsadenie: 20, medzeraPo: 2 })
      }
    })
    const nahrate = podanie.prilohy ?? []
    if (nahrate.length) {
      k.y -= 4
      text(k, 'Nahraté súbory', { velkost: 9, tucne: true, odsadenie: 8 })
      for (const s of nahrate) {
        text(k, `${s.nazovSuboru}`, { velkost: 9, farba: SEDA, odsadenie: 20 })
      }
    }
    ciara(k, 6, 10)
  }

  if (schema.infoPoznamka) {
    text(k, schema.infoPoznamka, { velkost: 8.5, farba: SEDA, medzeraPo: 8 })
  }

  /* podpis */
  miesto(k, 70)
  k.y -= 20
  k.strana.drawLine({
    start: { x: A4[0] - OKRAJ - 200, y: k.y },
    end: { x: A4[0] - OKRAJ, y: k.y },
    thickness: 0.7,
    color: LINKA,
  })
  k.y -= 12
  k.strana.drawText('Podpis žiadateľa', {
    x: A4[0] - OKRAJ - 200,
    y: k.y,
    size: 8.5,
    font,
    color: SEDA,
  })
  k.y -= 12
  k.strana.drawText('Žiadosť bola podaná elektronicky a potvrdená v portáli obce.', {
    x: OKRAJ,
    y: k.y,
    size: 8,
    font,
    color: SEDA,
  })

  /* pätka na každej strane */
  const strany = doc.getPages()
  strany.forEach((s, i) => {
    s.drawText(
      `${tenant.nazov}  |  ${podanie.cisloPodania}  |  strana ${i + 1} z ${strany.length}`,
      { x: OKRAJ, y: OKRAJ - 24, size: 7.5, font, color: SEDA },
    )
  })

  return doc.save()
}

/** Stiahne PDF v prehliadači. */
export async function stiahniPdfPodania(vstup: PdfVstup, nazovSuboru: string) {
  const bajty = await vytvorPdfPodania(vstup)
  const blob = new Blob([bajty as BlobPart], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nazovSuboru.endsWith('.pdf') ? nazovSuboru : `${nazovSuboru}.pdf`
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}
