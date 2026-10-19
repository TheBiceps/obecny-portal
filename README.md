# Obecný portál

Ukážka digitálneho portálu pre slovenské obce. Občan vyplní žiadosť online,
úrad ju spracuje v CRM. Prvá obec je **Bernolákovo**, kód je pripravený na viac obcí.

| Aplikácia | Adresa v deme | Prístup |
| --- | --- | --- |
| Portál pre občanov | `/` | verejný, prihlásenie je nepovinné |
| CRM obecného úradu | `/crm/` | len na prihlásenie |

Obe aplikácie bežia na rovnakom pôvode, takže zdieľajú `localStorage`.
Žiadosť odoslaná v portáli sa preto objaví v CRM naživo, bez obnovenia stránky.

## Demo prístupy

| Rola | E-mail | Heslo |
| --- | --- | --- |
| Občan | `obcan@demo.sk` | `Demo1234` |
| Hlavný správca úradu | `starosta@demo.sk` | `Urad1234` |
| Referent stavebného úradu | `stavebny@demo.sk` | `Urad1234` |
| Referent dopravy | `doprava@demo.sk` | `Urad1234` |
| Referent evidencie adries | `adresy@demo.sk` | `Urad1234` |

V CRM je dole na stránke Prijaté podania skryté tlačidlo **Obnoviť demo dáta**,
ktoré vráti ukážkové záznamy do pôvodného stavu.

## Spustenie lokálne

```bash
pnpm install
pnpm dev:portal   # http://localhost:5173
pnpm dev:crm      # http://localhost:5174
```

Ďalšie príkazy:

```bash
pnpm typecheck    # kontrola typov v aplikáciách a balíkoch
pnpm test         # testy jadra vo Vitest
pnpm build        # zostavenie oboch aplikácií do priečinka dist
pnpm test:e2e     # priechodný test v Playwrighte, vyžaduje predchádzajúci build
```

Pri prvom spustení koncového testu doinštalujte prehliadač:

```bash
pnpm --filter @obec/e2e exec playwright install chromium
```

Koncový test prejde celý hlavný scenár: registrácia občana, pridanie
nehnuteľnosti, vyplnenie žiadosti s predvyplnením údajov, odoslanie,
prihlásenie do CRM, nájdenie podania, zmena stavu a vymazanie.
Podrobnosti sú v `e2e/README.md`.

## Štruktúra

```
apps/portal      portál pre občanov
apps/crm         CRM obecného úradu
packages/core    typy, formulárový engine, kontroly, dátová vrstva, konfigurácia obcí
packages/ui      dizajnové tokeny a spoločné komponenty
packages/pdf     generovanie PDF s vloženým písmom pre slovenskú diakritiku
docs/            plán, brief pre agentov, zdrojové tlačivo obce
```

## Formuláre obce

Portál má zapnutých sedem formulárov v troch kategóriách:

| Formulár | Kategória | Poplatok |
| --- | --- | --- |
| Žiadosť o povolenie na vjazd | Doprava a komunikácie | 30 € |
| Žiadosť o vydanie potvrdenia o veku stavby | Stavby a pozemky | bez poplatku |
| Návrh na predĺženie platnosti územného rozhodnutia o umiestnení stavby | Stavby a pozemky | 20 € |
| Žiadosť o predĺženie platnosti stavebného povolenia | Stavby a pozemky | určí úrad |
| Žiadosť o predĺženie termínu dokončenia stavby | Stavby a pozemky | určí úrad |
| Žiadosť o potvrdenie pasportu stavby | Stavby a pozemky | určí úrad |
| Žiadosť o určenie súpisného a orientačného čísla a zápis adresného bodu | Adresy a súpisné čísla | určí úrad |

Niektoré tlačivá majú na papieri sumu poplatku prázdnu, dopĺňa ju pokladňa obce
podľa sadzobníka. Schéma to zachytáva príznakom `poplatokUrcujeUrad: true`
a portál potom píše „Poplatok určí úrad“ namiesto „Bez poplatku“.

## Prideľovanie podaní podľa agendy

Každý formulár patrí jednej agende úradu, zapisuje sa to v schéme ako
`rolaRiesitela`. Keď občan odošle žiadosť, dátová vrstva ju hneď pridelí
aktívnemu referentovi tejto agendy, a to tomu, kto má práve najmenej
nevybavených podaní.

| Rola | Vidí | Agenda |
| --- | --- | --- |
| Hlavný správca | všetky podania | riadi úrad, podania nerieši |
| Referent stavebného úradu | len svoju agendu | vek stavby, predĺženia, pasport stavby |
| Referent dopravy a komunikácií | len svoju agendu | povolenie na vjazd |
| Referent evidencie adries | len svoju agendu | súpisné a orientačné číslo |
| Čitateľ | všetky podania | len na čítanie |

Rozsah videnia určuje oprávnenie `podania.vidiet_vsetky`. Nevynucuje sa len
v rozhraní, ale priamo v dátovej vrstve: `listSubmissions(filter, aktor)`
aj `statistiky(aktor)` dostávajú prihláseného zamestnanca a samy odfiltrujú
cudziu agendu.

Hlavný správca má v časti Používatelia prehľad o vyťažení kolegov a po kliknutí
na zamestnanca uvidí zoznam jeho podaní.

### Ako pridať nový referát

1. Doplňte rolu do `StaffRole` a do zoznamu `ROLY_RIESITELOV`
   v `packages/core/src/types.ts`.
2. Pridajte jej popisky do `ROLA_LABEL` a `AGENDA_LABEL`
   v `packages/core/src/format.ts`.
3. Priraďte jej oprávnenia v matici v `packages/core/src/data/permissions.ts`.
4. Pri formulároch, ktoré má referát vybavovať, nastavte `rolaRiesitela`.

Keď pre agendu nie je aktívny zamestnanec, podanie sa uloží ako nepridelené
a správca ho v zozname vidí s odznakom „Nepridelené“.

## Ako pridať ďalší formulár

Formuláre sú dáta, nie kód. Nová žiadosť je jeden nový súbor.

1. Vytvorte `packages/core/src/forms/<nazov>.ts` a exportujte objekt typu `FormSchema`.
   Vzorom sú `vjazd.ts` a `vekStavby.ts`.
2. Popíšte sekcie a polia. K dispozícii sú typy polí
   `text, textarea, number, date, year, select, radio, checkbox, file, address,
   propertyPicker, info, consent`.
   Pole môže mať:
   * `required`, `helper`, `placeholder`, `maxLength`, `colSpan`
   * `validate`: `email | telefon | psc | ico | rodneCislo | rok | cisloOp`
   * poplatok: `poplatokEur` pre pevnú sumu, prípadne `poplatokUrcujeUrad: true`,
     keď sumu dopĺňa úrad
   * `rolaRiesitela`: agenda úradu, ktorá podanie vybavuje
   * `visibleIf`: podmienka `{ field, equals | oneOf | isTruthy }`, prípadne `{ and: [...] }` alebo `{ or: [...] }`
   * `autofillFrom`: `resident.<cesta>`, `property.<cesta>`, `tenant.<cesta>` alebo `dnes`
   * `optionsFromTenant: 'katastralneUzemia'` pre zoznam z konfigurácie obce
3. Pridajte formulár do registra v `packages/core/src/forms/index.ts`.
4. Doplňte jeho `id` do `povoleneFormulare` v konfigurácii obce.

Nič viac. Zoznam formulárov, vypĺňanie, kontroly, kontrolná obrazovka, PDF,
tabuľka v CRM aj detail podania sa riadia schémou.

## Ako pridať ďalšiu obec

1. Skopírujte `packages/core/src/tenant/_sablona.ts` na `packages/core/src/tenant/<obec>.ts`
   a vyplňte názov, kód obce, okres, kraj, adresu úradu, kontakt, stránkové hodiny,
   katastrálne územia, farby a erb.
2. Zaregistrujte obec v `packages/core/src/tenant/index.ts` v objekte `tenants`.
3. Erb uložte do `apps/portal/public/` a `apps/crm/public/` pod názvom,
   ktorý uvádza `branding.erbSrc`.
4. Obec vyberiete premennou prostredia `VITE_TENANT_ID=<id>`.
   V produkcii sa na tomto mieste doplní rozpoznanie podľa subdomény,
   funkcia `resolveTenant` je na to pripravená.

Žiadna obrazovka neobsahuje údaje obce natvrdo, všetko číta z `TenantConfig`.

## Dátová vrstva

`DataProvider` (`packages/core/src/data/provider.ts`) je jediné rozhranie medzi
obrazovkami a dátami. Demo používa `LocalStorageProvider`, pre skutočný server
je pripravený `ApiProvider`. Zdroj sa vyberá premennou `VITE_DATA_PROVIDER`
(`local` alebo `api`). Každý záznam nesie `tenantId`.

## Prístupnosť

Rozhranie cieli na WCAG 2.1 AA: viditeľné popisy polí previazané cez `htmlFor`,
súhrn chýb nad formulárom s odkazmi priamo na chybné pole, viditeľný focus,
dotykové ciele od 44 px, kontrast textu najmenej 4.5:1, rešpektovanie
`prefers-reduced-motion`, `lang="sk"` a ovládanie klávesnicou.

## Nasadenie

Ukážka beží na dvoch miestach a obe sa aktualizujú pri pushi do vetvy `main`.

**Cloudflare Pages** (hlavná adresa ukážky) stavia projekt priamo z repozitára,
príkazom `pnpm build` s výstupom v priečinku `dist`. Portál je v koreni,
CRM v podpriečinku `/crm/`.

Keby sa napojenie na Git pokazilo, obsah sa dá nasadiť aj ručne:

```bash
pnpm build
npx wrangler pages deploy dist --project-name=bernolakovo-demo --branch=main
```

**GitHub Pages** slúži ako záloha. Workflow `.github/workflows/deploy.yml`
skontroluje typy, spustí testy, zostaví obe aplikácie, spojí ich skriptom
`scripts/merge-dist.mjs` do jedného priečinka `dist` a nasadí ho.
Základné cesty si prepíše premennými `VITE_BASE_PORTAL` a `VITE_BASE_CRM`,
pretože Pages servíruje projekt v podpriečinku.

## Čo je v ukážke len naznačené

Skutočný server a prihlasovanie, Slovensko.sk a eID, kvalifikovaný elektronický
podpis, odosielanie e-mailov, platba správneho poplatku, napojenie na kataster
a doručovanie cez ÚPVS. Osobné údaje v deme neopúšťajú prehliadač.
