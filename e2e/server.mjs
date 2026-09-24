/**
 * Malý statický server pre e2e testy.
 *
 * Obe aplikácie sa zostavujú so základnou cestou `/obecny-portal/`
 * (`apps/portal` na `/obecny-portal/`, `apps/crm` na `/obecny-portal/crm/`),
 * pretože presne takto bežia aj po nasadení na GitHub Pages. Namiesto
 * prebudovania aplikácií s inou základnou cestou preto tento server
 * sprístupní obsah priečinka `../dist` presne na ceste `/obecny-portal/`,
 * aby sedeli absolútne odkazy na skripty a štýly vo vygenerovanom `index.html`.
 */
import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'

const KOREN = fileURLToPath(new URL('../dist', import.meta.url))
const PREDPONA = '/obecny-portal/'
const PORT = 4180

const TYPY_OBSAHU = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.json': 'application/json; charset=utf-8',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.webmanifest': 'application/manifest+json',
}

async function najdiSubor(cestaBezPredpony) {
  const bezpecnaCesta = normalize(cestaBezPredpony).replace(/^(\.\.[/\\])+/, '')
  let plnaCesta = join(KOREN, bezpecnaCesta || 'index.html')

  try {
    const info = await stat(plnaCesta)
    if (info.isDirectory()) return join(plnaCesta, 'index.html')
    return plnaCesta
  } catch {
    // Neexistujúci súbor, HashRouter potrebuje len koreňový index.html
    // danej aplikácie (portál alebo CRM v podpriečinku crm/).
    return bezpecnaCesta.startsWith('crm/') || bezpecnaCesta === 'crm'
      ? join(KOREN, 'crm/index.html')
      : join(KOREN, 'index.html')
  }
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://localhost:${PORT}`)
  const cesta = decodeURIComponent(url.pathname)

  if (!cesta.startsWith(PREDPONA)) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end(`Nenájdené. Aplikácia beží na ceste ${PREDPONA}.`)
    return
  }

  const plnaCesta = await najdiSubor(cesta.slice(PREDPONA.length))

  try {
    const data = await readFile(plnaCesta)
    res.writeHead(200, {
      'Content-Type': TYPY_OBSAHU[extname(plnaCesta)] ?? 'application/octet-stream',
    })
    res.end(data)
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end('Súbor sa nenašiel. Spustili ste pred testom "pnpm build" v koreni projektu?')
  }
})

server.listen(PORT, () => {
  console.log(`e2e statický server beží na http://localhost:${PORT}${PREDPONA}`)
})
