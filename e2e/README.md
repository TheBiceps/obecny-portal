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

Predvolene sa obe aplikácie zostavujú do koreňa, portál na `/` a CRM na `/crm/`,
presne tak, ako bežia na Cloudflare Pages. Test preto používa vlastný malý
statický server (`server.mjs`), ktorý obsah `../dist` sprístupní na porte `4180`
v koreni. Server spúšťa Playwright sám (pozri `webServer` v `playwright.config.ts`),
netreba ho spúšťať ručne.

Pre nasadenie do podpriečinka, napríklad na GitHub Pages, sa cesty prepíšu
premennými `VITE_BASE_PORTAL` a `VITE_BASE_CRM` pri builde. Robí to
workflow `.github/workflows/deploy.yml`.

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
