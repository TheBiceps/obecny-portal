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
pnpm typecheck    # kontrola typov vo všetkých balíkoch
pnpm test         # testy jadra vo Vitest
pnpm build        # zostavenie oboch aplikácií do priečinka dist
```

## Štruktúra

```
apps/portal      portál pre občanov
apps/crm         CRM obecného úradu
packages/core    typy, formulárový engine, kontroly, dátová vrstva, konfigurácia obcí
packages/ui      dizajnové tokeny a spoločné komponenty
packages/pdf     generovanie PDF s vloženým písmom pre slovenskú diakritiku
docs/            plán, brief pre agentov, zdrojové tlačivo obce
```

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

GitHub Actions (`.github/workflows/deploy.yml`) pri každom pushi do vetvy `main`
skontroluje typy, spustí testy, zostaví obe aplikácie, spojí ich skriptom
`scripts/merge-dist.mjs` do jedného priečinka `dist` a nasadí ho na GitHub Pages.

## Čo je v ukážke len naznačené

Skutočný server a prihlasovanie, Slovensko.sk a eID, kvalifikovaný elektronický
podpis, odosielanie e-mailov, platba správneho poplatku, napojenie na kataster
a doručovanie cez ÚPVS. Osobné údaje v deme neopúšťajú prehliadač.
