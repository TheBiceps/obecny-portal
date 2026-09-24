# Build: Obecný portál (resident portal + municipal CRM), demo for Bernolákovo

## Goal
Build a clickable, working demo of a digital portal for Slovak municipalities. Residents submit municipal forms online instead of printing and delivering them. The office handles them in a CRM. The first tenant is **Obec Bernolákovo**, but the codebase must be **multi-tenant ready** so we can onboard other municipalities later through config only.

Two environments:
1. **Portál pre občanov** (resident portal)
2. **CRM obecného úradu** (admin CRM)

Create a new GitHub repo and deploy both to a temporary public URL on **GitHub Pages**. Demo first, scale later: no real backend yet, but architect it so a real one can be plugged in without rewrites.

## Language and copy rules (strict)
* The whole UI is in **Slovak only**, correct diacritics everywhere (ž, š, č, ť, ď, ľ, ĺ, ŕ, ô, ä, ň). No English strings visible to users, including validation errors, empty states, toasts, page titles, and `<html lang="sk">`.
* Dates `dd. mm. yyyy`, currency `30 €`, phone `+421 9xx xxx xxx`, PSČ `900 27`.
* **Never use dashes as punctuation in copy** (no em dash, en dash, or hyphen between words as a separator). Rewrite with a comma, colon, period, or two sentences. Hyphens required by grammar (e.g. "e-mail") are fine.
* Tone: clear, polite, official but human (vykanie). Short labels, helpful hints under fields.
* Use the **`/design:ux-copy`** skill for all UI copy (labels, helper texts, errors, empty states, success messages, buttons), then check it against the rules above.

## Design
* Use the **`/ui-ux-pro-max`** skill before building UI: pick a trustworthy public sector style (clean, accessible, calm palette, high contrast), font pairing with full Slovak diacritics support, spacing and component system.
* WCAG 2.1 AA (public sector accessibility is required in SK/EU): keyboard navigation, focus states, labels tied to inputs, error summaries, contrast.
* Mobile first. Many residents will use a phone.
* Tenant branding (name, coat of arms/logo, primary color, office address) comes from tenant config, never hardcoded.

## Tech stack (recommended, adjust only with good reason)
* Monorepo with pnpm workspaces:
  * `apps/portal` (resident portal)
  * `apps/crm` (admin CRM)
  * `packages/ui` (shared components, design tokens)
  * `packages/core` (types, form engine, validators, data layer, tenant config)
* Vite + React + TypeScript + Tailwind + shadcn/ui, React Hook Form + Zod.
* **HashRouter** (GitHub Pages friendly).
* PDF generation client side with `pdf-lib` or `@react-pdf/renderer` and an **embedded font with Slovak diacritics** (test "Žiadosť o vydanie potvrdenia o veku stavby" renders correctly).
* Deploy with a GitHub Actions workflow to Pages: portal at `https://<user>.github.io/<repo>/`, CRM at `https://<user>.github.io/<repo>/crm/`.

### Data layer (important for "scale later")
* Define a `DataProvider` interface in `packages/core` (auth, residents, properties, forms, submissions, staff users).
* Implement `LocalStorageProvider` for the demo. Because both apps are served from the same GitHub Pages origin, they share `localStorage`, so **a form submitted in the portal appears live in the CRM**. This is the key demo moment, make sure it works.
* Leave a stub `ApiProvider` (e.g. for Supabase or a custom API later) and pick the provider via env.
* Seed data on first load: 1 demo resident with 2 properties, 1 super-admin, ~8 realistic sample submissions. Add a hidden "Obnoviť demo dáta" action in the CRM.
* Every record has `tenantId`.

### Multi-tenant config
`packages/core/tenants/bernolakovo.ts` (and a template for new towns):
* Name: Obec Bernolákovo, office: Obecný úrad, Hlavná 111, 900 27 Bernolákovo
* Kód obce: 507814, okres Senec, kraj Bratislavský
* Katastrálne územia list (Bernolákovo), logo, colors, contact, enabled forms, fee info
Tenant is resolved from config (later from subdomain).

## Forms: config driven form engine
Forms must be defined as **JSON/TS schemas**, not hand coded pages, so other municipalities can add their own. Schema supports: sections, field types (text, textarea, number, date, year, select, radio, checkbox, file upload, address block, property picker), required flags, Zod validation, conditional visibility, helper text, `autofillFrom` mapping to the resident profile/property, attachments list, fee info, legal/consent text.

Source PDF: `docs/forms/formular_obec_Bernolakovo.pdf` (already in the project folder; read it to verify every field). Digitize these two forms:

### Form 1: Žiadosť o povolenie na vjazd podľa zák. č. 160/1996 Zb. v znení neskorších predpisov
Addressed to Obecný úrad v Bernolákove, Hlavná ul. č. 111, 900 27 Bernolákovo.
1. **Žiadateľ**: meno, priezvisko, titul, plná adresa (obec, ulica, PSČ), pri právnickej osobe aj IČO, telefón, e-mail. Add a toggle Fyzická osoba / Právnická osoba (shows názov firmy + IČO).
2. **Druh, účel stavby**: vjazd z parc. č. …, na MK (miestna komunikácia) parc. č. …, katastrálne územie …
3. **Narušenie povrchu**: rozmer narušenia vozovky (cestného telesa), rozmer narušenia zeleného pásu.
4. Consent: spracovanie osobných údajov podľa zákona č. 18/2018 Z. z. (required checkbox, text from the PDF).
5. Miesto a dátum (auto: Bernolákovo, today; editable).
6. **Prílohy**: a) projektová dokumentácia realizovanej stavby / zjazdu, spevnených plôch (2x), b) doklad o úhrade správneho poplatku 30 €.
7. Info note: povolenie sa vydáva do vlastných rúk žiadateľovi po predložení dokladu o uhradení správneho poplatku.

### Form 2: Žiadosť o vydanie potvrdenia o veku stavby (+ Čestné prehlásenie)
1. **Žiadateľ**: meno a priezvisko / názov firmy, adresa na doručenie, telefón (optionally splnomocnený zástupca).
2. Účel: pre vypracovanie znaleckého posudku / iný dôvod (text).
3. **Stavba**: názov stavby, ulica, katastrálne územie (Bernolákovo), parc. č., číslo LV, súpisné číslo, rok daná do užívania.
4. **Conditional**: daná do užívania po 01. 01. 1976 → require kolaudačné rozhodnutie upload. Pred 01. 01. 1976 → rok + show the **Čestné prehlásenie** section: meno a priezvisko, rodné číslo, č. OP, trvale bytom, rok daná do užívania, rekonštruovaná v roku, parc. č., k.ú. Bernolákovo, stavebníkom bol; with the legal text about § 39 ods. 3 zák. č. 71/1967 Zb. and a required confirmation checkbox.
5. Stavebníkom boli, vlastníkom je.
6. Miesto a dátum.
7. **Prílohy**: právoplatné kolaudačné rozhodnutie, geometrický plán ku stavbe, snímka z katastrálnej mapy, kúpnopredajná zmluva / osvedčenie o dedičstve / darovacia zmluva (only if applicant is not the builder, conditional).

Handwritten signature → replace with a required confirmation checkbox ("Potvrdzujem, že uvedené údaje sú pravdivé a úplné."). Leave a placeholder for future KEP / eID signing.

## Resident portal (apps/portal)

### Registrácia / Prihlásenie
* Email + heslo login, registration, "Zabudnuté heslo" (mock).
* OAuth buttons as **visual showcase only** (disabled, badge "Čoskoro"): Slovensko.sk (eID), Google, Apple.
* Show demo credentials in a small info box on the login page.

### Registration fields
* **Osobné údaje**: titul (optional), meno, priezvisko, rodné číslo, telefón, e-mail, heslo + potvrdenie hesla.
* **Trvalý pobyt**: ulica, súpisné číslo / orientačné číslo, obec, PSČ (default obec from tenant).
* **Moje nehnuteľnosti** (optional step, can add later in profile, can add multiple):
  * Typ: rodinný dom, byt, pozemok, iná stavba (garáž, chata…)
  * Vzťah k nehnuteľnosti: vlastník, spoluvlastník, nájomca, iné
  * Adresa: ulica, súpisné číslo, orientačné číslo, PSČ, obec
  * Katastrálne územie (select from tenant list)
  * Číslo parcely + register (C / E)
  * Číslo listu vlastníctva (LV)
  * Byt only: číslo bytu, vchod, poschodie, podiel na spoločných častiach (optional)
  * Optional: názov stavby, rok kolaudácie (daná do užívania), výmera (m²), vlastný názov ("Náš dom")
  * Link hint to katasterportal.sk for looking up LV and parcel numbers.
* GDPR consent checkbox + link to "Ochrana osobných údajov" page (placeholder).
* Validation:
  * Rodné číslo: format `######/####` (slash optional), 10 digits divisible by 11 (with the known 9 digit pre 1954 exception), valid date, month +50 for women, +20/+70 extension. Store it, but display masked (`******/1234`) everywhere except the resident's own profile and the full submission detail in CRM.
  * Phone SK format, PSČ 5 digits, e-mail, password strength.

### Zoznam formulárov
Cards/list with search and category filter: name, short description, fee, estimated time, required attachments. Works for logged in and anonymous users.

### Formulár
* Renders from schema, sections with progress indicator, inline validation, error summary on submit, draft autosave (local).
* **Anonymous user**: fills everything manually field by field. Show a soft banner: "Prihláste sa a údaje vyplníme za vás."
* **Logged in user**: applicant data auto-filled from profile (editable), and a **"Vyberte nehnuteľnosť"** picker that fills parcel, LV, súpisné číslo, k.ú., ulica, rok kolaudácie. Visually mark auto-filled fields.
* File uploads (demo: keep file name, size, small preview; limit size).
* Review step ("Skontrolujte údaje") → **Odoslať** → success screen with reference number (e.g. `BER-2026-000123`), summary, next steps (fee, where to pick up), button to download a PDF copy.
* Logged in: "Moje podania" page with status (Prijaté, V riešení, Vybavené, Zamietnuté).

## CRM (apps/crm)
* **Login only**, no registration. Seeded **super-admin** (me). Show demo credentials on login.
* Roles: implement a `role` field and a simple permission helper, only `super_admin` exists now, built so more roles can be added later.
* **Používatelia** page: super-admin can invite employees (name, e-mail, role) → mock invite with status "Pozvaný". No real e-mail.
* **Prijaté podania** (main page), table with:
  * ID občana (for anonymous submissions show "Neregistrovaný"), meno a priezvisko, názov formulára, dátum prijatia (plus status and reference number)
  * Search, filter by form / status / date range, sort, pagination, "Nové" badge for unread.
* **Detail podania**: all fields grouped by section as in the form, attachments list, applicant info, property info, audit trail (prijaté, zobrazené, zmena stavu).
  * Actions: **Stiahnuť PDF** (filled form laid out like the original municipal form, with tenant header), **Tlačiť** (print stylesheet), **Zmeniť stav**, **Vymazať** (confirm modal, red destructive button, explicit copy), placeholder for future actions (poznámka, priradiť referentovi, odpoveď občanovi).
* Simple dashboard header: counts of new / in progress / done this month.

## Agent and model strategy (save credits)
Act as the orchestrator and delegate with the Agent tool, setting `model` per task:
* **Opus (you, main thread)**: architecture, monorepo setup, `packages/core` (types, DataProvider, form engine, schema format), tenant config, integration, final decisions.
* **Sonnet subagents**: build individual pages/components in parallel once the core API is fixed (auth pages, registration + properties, form list, form renderer UI, CRM table, CRM detail + PDF, users page), writing both form schemas from the PDF, **all code reviews**, accessibility review, Slovak copy review (diacritics + no dash rule), writing tests.
* **Haiku subagents**: trivial work: seed data, README, GitHub Actions workflow, lint fixes, renaming, icon/asset wiring.
* Run independent subagents in parallel. Give each a tight brief with file boundaries so they do not collide. After each phase, one Sonnet reviewer checks the diff before you continue.

## Plan
1. Read the PDF, confirm field lists, write a short plan in `docs/PLAN.md`.
2. Run `/ui-ux-pro-max` → design tokens and components in `packages/ui`.
3. Core: types, validators (rodné číslo, PSČ, phone, IČO), form engine, LocalStorage provider, seed, tenant config.
4. Parallel build of portal and CRM pages (Sonnet).
5. `/design:ux-copy` pass over all strings, then Slovak copy review.
6. Tests: Vitest for validators and form engine; one Playwright happy path: register → add property → fill Form 2 with autofill → submit → login to CRM → see it → download PDF → delete with confirm.
7. The current folder (`~/dev/obecny-portal`) already contains `docs/forms/` and `docs/PROMPT.md`; `git init` here and create the GitHub repo from it with `gh repo create obecny-portal --public --source=. --push` (or private + Pages if my plan allows), set up Pages via Actions, verify both URLs load and the portal → CRM flow works on the live URL.
8. Report back: both URLs, demo credentials, what is mocked, next steps to go production.

## Out of scope for the demo (keep in mind, do not build)
Real backend and auth, real OAuth / Slovensko.sk eID, KEP signatures, e-mail sending, payments of správny poplatok, integration with ÚGKK kataster API for parcel lookup, ÚPVS / eDesk delivery, hosting of personal data (for production: EU hosting, encryption, rodné číslo processing only on a legal basis under zákon č. 18/2018 Z. z.).

## Definition of done
* Both apps live on GitHub Pages, no console errors, Lighthouse accessibility ≥ 95.
* A submission made in the portal shows up in the CRM on the live URL.
* PDF renders Slovak diacritics correctly.
* No English and no punctuation dashes in the UI.
* Adding a third form or a second municipality requires only new config files (document how in README).
