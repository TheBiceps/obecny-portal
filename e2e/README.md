# Koncový test (Playwright)

Jeden priechodný test hlavného scenára ukážky: občan sa zaregistruje, pridá si
nehnuteľnosť, podá žiadosť o potvrdenie o veku stavby a úrad ju spracuje v CRM.

Test beží proti **zostavenej** aplikácii v priečinku `../dist`, nie proti dev
serveru, aby sa overilo aj to, čo sa skutočne nasadzuje.

## Pred testom: zostavte aplikáciu

```bash
pnpm install
pnpm build
```

Príkaz `pnpm build` (spustený v koreni projektu) zostaví portál aj CRM a spojí
ich do priečinka `dist` v koreni projektu. Test tento build sám nespúšťa,
treba ho spustiť ručne pred každým behom testu (ak sa zdrojový kód zmenil).

## Základná cesta aplikácie

Obe aplikácie (`apps/portal`, `apps/crm`) sa štandardne zostavujú so
základnou cestou `/obecny-portal/` (portál) a `/obecny-portal/crm/` (CRM),
presne tak, ako bežia po nasadení na GitHub Pages. Zostavené `index.html`
preto odkazuje na skripty a štýly absolútnou cestou začínajúcou
`/obecny-portal/`.

Namiesto prebudovania aplikácií s inou základnou cestou (čo by testovalo iný
build, než aký sa nasadzuje) tento test používa vlastný malý statický server
(`server.mjs`), ktorý obsah `../dist` sprístupní presne na ceste
`/obecny-portal/` na porte `4180`. Toto sa ukázalo ako spoľahlivejšie než
bežný nástroj `serve`, ktorý vie sprístupniť priečinok len na koreňovej ceste
domény, čo pre CRM v podpriečinku `crm/` s absolútnymi odkazmi nefunguje.

Server v `server.mjs` spúšťa Playwright sám (pozri `webServer` v
`playwright.config.ts`), netreba ho spúšťať ručne.

## Spustenie testu

Z koreňa projektu (odporúčané):

```bash
pnpm build
pnpm test:e2e
```

Alebo priamo z tohto priečinka:

```bash
pnpm --filter @obec/e2e exec playwright install chromium   # len pri prvom spustení
pnpm --filter @obec/e2e test
```

Prehliadač Chromium treba nainštalovať len raz (alebo po aktualizácii verzie
Playwrightu):

```bash
pnpm --filter @obec/e2e exec playwright install chromium
```

## Čo test overuje

1. Registrácia nového občana cez `/#/registracia` (nie demo konto).
2. Pridanie nehnuteľnosti v profile a jej výber vo formulári, vrátane
   overenia, že sa polia parcely, listu vlastníctva a súpisného čísla
   naozaj predvyplnili z uloženej nehnuteľnosti.
3. Vyplnenie a odoslanie žiadosti o potvrdenie o veku stavby (stavba daná do
   užívania pred rokom 1976, teda aj čestné prehlásenie), zobrazenie čísla
   podania v tvare `BER-<rok>-<šesť číslic>`.
4. Prihlásenie do CRM ako `starosta@demo.sk`, nájdenie rovnakého podania so
   štítkom „Nové“, kontrola žiadateľa a parcely v detaile.
5. Zmena stavu podania na „Vybavené“ a jeho následné vymazanie cez
   potvrdzovacie okno.

Test používa prístupné selektory (`getByRole`, `getByLabel`, `getByText`) a
automatické čakania Playwrightu namiesto pevných pauz.
