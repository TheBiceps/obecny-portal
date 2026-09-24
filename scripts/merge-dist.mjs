/**
 * Spojí výstupy oboch aplikácií do jedného priečinka `dist`,
 * ktorý sa nasadzuje na GitHub Pages.
 *
 *   dist/            portál pre občanov
 *   dist/crm/        CRM obecného úradu
 *
 * Obe aplikácie tak bežia na rovnakom pôvode a zdieľajú localStorage,
 * vďaka čomu sa podanie z portálu objaví v CRM.
 */
import { cp, mkdir, rm, copyFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const koren = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const ciel = resolve(koren, 'dist')
const portal = resolve(koren, 'apps/portal/dist')
const crm = resolve(koren, 'apps/crm/dist')

for (const [nazov, cesta] of [['portál', portal], ['CRM', crm]]) {
  if (!existsSync(cesta)) {
    console.error(`Chýba zostavený ${nazov} v ${cesta}. Spustite najprv build oboch aplikácií.`)
    process.exit(1)
  }
}

await rm(ciel, { recursive: true, force: true })
await mkdir(ciel, { recursive: true })
await cp(portal, ciel, { recursive: true })
await cp(crm, resolve(ciel, 'crm'), { recursive: true })

// Obe aplikácie používajú HashRouter, napriek tomu pridávame 404.html,
// aby priame otvorenie neznámej cesty skončilo na úvodnej stránke.
await copyFile(resolve(ciel, 'index.html'), resolve(ciel, '404.html'))
await copyFile(resolve(ciel, 'crm/index.html'), resolve(ciel, 'crm/404.html'))

// Bez tohto súboru by GitHub Pages spracoval výstup cez Jekyll.
await copyFile(resolve(koren, 'scripts/nojekyll'), resolve(ciel, '.nojekyll'))

console.log('Hotovo. Výstup je pripravený v priečinku dist.')
