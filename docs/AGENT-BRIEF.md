# Spoločný brief pre všetkých agentov

Projekt: `~/dev/obecny-portal`. Monorepo pnpm, Vite + React 18 + TypeScript + Tailwind v3.
Dve aplikácie: `apps/portal` (portál pre občanov) a `apps/crm` (CRM úradu).

## Pravidlá jazyka a textov (nesmú sa porušiť)

1. Celé rozhranie je **po slovensky** so správnou diakritikou (ž š č ť ď ľ ĺ ŕ ô ä ň).
   Žiadne anglické reťazce viditeľné používateľovi: ani v chybách, prázdnych stavoch,
   toastoch, `aria-label`, `alt`, `title`.
2. **Nikdy nepoužívaj pomlčku ani spojovník ako interpunkciu** (žiadne `—`, `–`, ani `-`
   medzi slovami vo význame oddeľovača). Prepíš vetu čiarkou, dvojbodkou, bodkou alebo
   dvoma vetami. Spojovník vyžadovaný pravopisom (`e-mail`) je v poriadku.
   Ani ako zástupný znak pre prázdnu hodnotu: použi slovo `Neuvedené`.
3. Dátum `24. 09. 2026`, suma `30 €`, telefón `+421 9xx xxx xxx`, PSČ `900 27`.
4. Tón: zdvorilé vykanie, krátke popisky, pod poľom stručná pomocná veta.
5. Identifikátory v kóde píš tiež po slovensky bez diakritiky, ako v existujúcich súboroch
   (`nacitavame`, `onZmena`, `chyba`).

## Dizajn a prístupnosť

* WCAG 2.1 AA. Každý vstup má viditeľný `<label>` previazaný cez `htmlFor`, chyba je pri poli
  a zároveň v súhrne chýb nad formulárom, kontrast najmenej 4.5:1, focus ring nechaj tak,
  ako ho definuje `packages/ui/src/styles.css`.
* Mobile first, dotykové ciele najmenej 44x44 px, žiadne vodorovné rolovanie pri 375 px.
* Ikony len `lucide-react`, nikdy emoji.
* Farby a rozostupy len cez tokeny Tailwindu z `@obec/ui/preset`
  (`bg-surface`, `text-ink-muted`, `border-line`, `bg-primary`, `rounded-card`, `shadow-card`…).
  Nikdy priamy hex v komponente.
* Prechody 150 až 300 ms, `cursor-pointer` na klikateľných prvkoch.

## Čo používať, nič nevymýšľaj nanovo

Komponenty z `@obec/ui`:
`Button, Field, Input, Textarea, Select, Checkbox, RadioGroup, Alert, Badge, StatusBadge,
Spinner, EmptyState, ErrorSummary, Card, PageHeader, Table, Th, Td, Pagination, Steps,
DefinitionList, Modal, ConfirmModal, ToastProvider, useToast, SkipLink, cn`

Dáta a logika z `@obec/core`:
`createDataProvider, DataProvider, DataError, formSchemas, getFormSchema, formsForTenant,
formatDate, formatDateTime, formatEur, formatVelkost, STAV_LABEL, TYP_NEHNUTELNOSTI_LABEL,
VZTAH_LABEL, ROLA_LABEL, STAV_POUZIVATELA_LABEL, can, DEMO_UCTY,
isPscValid, isTelefonValid, isEmailValid, isIcoValid, parseRodneCislo, isRodneCisloValid,
maskRodneCislo, formatRodneCislo, vyhodnotHeslo, visibleSections, visibleFields, isVisible,
fieldOptions` a typy `Resident, Property, Submission, StaffUser, TenantConfig, …`

Kontexty aplikácie:
* portál: `../app/tenant` → `useTenant()` vracia `{ tenant, data, lokalny }`,
  `../app/auth` → `useAuth()` vracia `{ obcan, nacitavame, prihlasit, odhlasit, obnovit, nastavObcana }`
* CRM: `../app/tenant` → `useTenant()`, `../app/auth` → `useAuth()` vracia
  `{ uzivatel, nacitavame, prihlasit, odhlasit }` a `menoAktora(uzivatel)`,
  `../app/zmeny` → `useZmenyDat()` vracia číslo, ktoré sa zvýši, keď druhá aplikácia zmení dáta.
  Pridaj `useZmenyDat()` do závislostí `useEffect`, ktorý načítava zoznamy, aby sa nové podanie
  z portálu objavilo bez obnovenia stránky.

Údaje o obci ber vždy z `tenant`, nikdy natvrdo (`tenant.nazov`, `tenant.urad.ulica`,
`tenant.katastralneUzemia`, `tenant.predvolenaAdresa`, `tenant.branding`).

## Formuláre

Na formuláre pre občanov sa používa `FormRenderer` (`apps/portal/src/form/FormRenderer.tsx`),
už je hotový. Na vlastné formuláre (prihlásenie, registrácia, pozvánka) použi
`react-hook-form` so `zodResolver` a schémami zo `zod`, chyby zobraz cez `Field error=...`
a `ErrorSummary` nad formulárom.

## Pravidlá práce

* Meň len súbory, ktoré máš pridelené. Nikdy nemeň `packages/*`, `App.tsx`, `main.tsx`,
  `components/Layout.tsx`, `app/*` ani cudzie stránky.
* Názvy exportov stránok nechaj tak, ako ich očakáva `App.tsx`.
* Na konci spusti `pnpm --filter @obec/portal exec tsc --noEmit`
  (respektíve `@obec/crm`) a oprav všetky chyby, ktoré si spôsobil.
* Demo prihlasovacie údaje: občan `obcan@demo.sk` / `Demo1234`,
  úrad `starosta@demo.sk` / `Urad1234` (ber ich z `DEMO_UCTY`).
