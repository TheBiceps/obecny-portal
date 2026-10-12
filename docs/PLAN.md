# Plán: Obecný portál pre Bernolákovo

Ukážka digitálneho portálu pre slovenské obce. Prvá obec je Bernolákovo,
kód je však pripravený na viac obcí cez konfiguráciu.

## Čo vzniká

| Aplikácia | Cesta | Pre koho |
| --- | --- | --- |
| Portál pre občanov | `/` | obyvatelia obce, aj neprihlásení |
| CRM obecného úradu | `/crm/` | zamestnanci úradu, len na prihlásenie |

Obe aplikácie bežia na rovnakom pôvode, takže zdieľajú `localStorage`.
Podanie odoslané v portáli sa preto objaví v CRM naživo.

## Overenie zdrojových tlačív

Zdroje:

* `docs/forms/formular_obec_Bernolakovo.pdf`, tri naskenované strany, prvá dávka
* `docs/forms/formulare_obec_Bernolakovo_davka2.pdf`, jedenásť naskenovaných strán, druhá dávka

Text bol v oboch prípadoch prečítaný zo skenu, PDF neobsahujú textovú vrstvu.
Jedenásta strana druhej dávky je opakovane tlačivo Žiadosť o povolenie na vjazd,
ktoré je už digitalizované z prvej dávky, preto z nej nevznikol nový formulár.

### Strana 1: Žiadosť o povolenie na vjazd podľa zák. č. 160/1996 Zb.

Adresát: Obecný úrad v Bernolákove, Hlavná ul. č. 111, 900 27 Bernolákovo.

| Bod tlačiva | Polia v digitálnej podobe |
| --- | --- |
| 1. Žiadateľ | typ osoby (fyzická, právnická), názov firmy, IČO, titul, meno, priezvisko, adresa (obec, ulica, súpisné a orientačné číslo, PSČ), telefón, e-mail |
| 2. Druh, účel stavby | vjazd z parcely č., názov miestnej komunikácie, parcela č. miestnej komunikácie, katastrálne územie, účel stavby |
| 3. Narušenie povrchu | rozmer narušenia vozovky, teda cestného telesa; rozmer narušenia zeleného pásu |
| Súhlas | spracovanie osobných údajov podľa zákona č. 18/2018 Z. z., povinné zaškrtnutie, znenie prevzaté z tlačiva |
| Miesto a dátum | miesto predvyplnené z konfigurácie obce, dátum na dnešok, obe upraviteľné |
| Podpis žiadateľa | nahradené povinným potvrdením „Potvrdzujem, že uvedené údaje sú pravdivé a úplné.“ |
| Prílohy | a) projektová dokumentácia realizovanej stavby a zjazdu, spevnených plôch, predkladá sa v dvoch vyhotoveniach, b) doklad o úhrade správneho poplatku 30 € |
| Poznámka | povolenie sa vydáva do vlastných rúk žiadateľovi po predložení dokladu o uhradení poplatku |

### Strana 2: Žiadosť o vydanie potvrdenia o veku stavby

| Bod tlačiva | Polia v digitálnej podobe |
| --- | --- |
| Hlavička | meno a priezvisko, názov firmy, adresa na doručenie, splnomocnený zástupca v zmysle plnej moci, telefón |
| Účel | pre vypracovanie znaleckého posudku alebo iný dôvod s voľným textom |
| Stavba | názov stavby, ulica, katastrálne územie Bernolákovo, parcela č., číslo LV, súpisné číslo, rok uvedenia do užívania |
| Uvedenie do užívania | po 1. 1. 1976 vyžaduje kolaudačné rozhodnutie, pred 1. 1. 1976 otvára čestné prehlásenie |
| Stavebník a vlastník | stavebníkom boli, vlastníkom je, príznak či je žiadateľ zároveň stavebníkom |
| Miesto a dátum | rovnako ako pri prvom tlačive |
| Prílohy | právoplatné kolaudačné rozhodnutie, geometrický plán ku stavbe, snímka z katastrálnej mapy, nadobúdací doklad (kúpnopredajná zmluva, osvedčenie o dedičstve, darovacia zmluva) ak žiadateľ nie je stavebníkom |

### Strana 3: Čestné prehlásenie

Zobrazí sa len pri stavbe danej do užívania pred 1. 1. 1976.
Polia: meno a priezvisko, rodné číslo, číslo občianskeho preukazu, trvale bytom,
rok uvedenia do užívania, rok rekonštrukcie, parcela č., katastrálne územie, stavebníkom bol.
Právne poučenie podľa § 39 ods. 3 zák. č. 71/1967 Zb. je prevzaté doslovne a potvrdzuje sa
povinným zaškrtnutím namiesto vlastnoručného podpisu.

### Druhá dávka tlačív

| Tlačivo | Strany | Identifikátor formulára | Poplatok |
| --- | --- | --- | --- |
| Návrh na predĺženie platnosti územného rozhodnutia o umiestnení stavby | 1 a 2 | `predlzenie-uzemneho-rozhodnutia` | 20 € |
| Žiadosť o predĺženie platnosti stavebného povolenia | 3 a 4 | `predlzenie-stavebneho-povolenia` | určí úrad |
| Žiadosť o predĺženie termínu dokončenia stavby | 5 a 6 | `predlzenie-terminu-dokoncenia` | určí úrad |
| Žiadosť o určenie súpisného a orientačného čísla a zápis adresného bodu | 7 a 8 | `supisne-orientacne-cislo` | určí úrad |
| Žiadosť o potvrdenie pasportu stavby | 9 a 10 | `pasport-stavby` | určí úrad |

Spoločné pre tlačivá druhej dávky:

* blok navrhovateľa alebo stavebníka s adresou, korešpondenčnou adresou,
  poverenou osobou, telefónom a e-mailom
* voliteľná splnomocnená organizácia alebo osoba, otvára sa zaškrtnutím
* označenie a miesto stavby vrátane členenia na stavebné objekty
* zoznam známych účastníkov konania
* súhlas so spracovaním osobných údajov podľa zákona č. 18/2018 Z. z.
* voľba súhlasím alebo nesúhlasím so sprístupnením informácií podľa
  zákona č. 211/2000 Z. z., na papieri sa nehodiace škrtá, v portáli je to voľba
* vlastnoručný podpis nahrádza povinné potvrdenie pravdivosti údajov

Štyri z piatich tlačív majú na papieri sumu poplatku prázdnu, dopĺňa ju pokladňa
obce podľa sadzobníka. Schéma to zachytáva príznakom `poplatokUrcujeUrad`,
aby portál netvrdil, že podanie je bez poplatku.

## Architektúra

```
apps/portal      portál pre občanov
apps/crm         CRM obecného úradu
packages/core    typy, formulárový engine, kontroly, dátová vrstva, konfigurácia obcí
packages/ui      dizajnové tokeny a spoločné komponenty
packages/pdf     generovanie PDF s vloženým písmom pre slovenskú diakritiku
```

### Dátová vrstva

`DataProvider` je jediné rozhranie medzi obrazovkami a dátami.
Demo používa `LocalStorageProvider`, pre produkciu je pripravený `ApiProvider`.
Zdroj sa vyberá premennou `VITE_DATA_PROVIDER`. Každý záznam nesie `tenantId`.

### Formulárový engine

Formuláre sú dáta, nie kód. Schéma popisuje sekcie, polia, podmienenú viditeľnosť,
kontroly, predvyplnenie z profilu a z nehnuteľnosti, prílohy, poplatok a právny základ.
Zod schéma sa skladá vždy len z práve viditeľných polí, takže skryté povinné pole
odoslanie neblokuje.

## Postup prác

1. Prečítanie tlačiva a overenie zoznamu polí. Hotové.
2. Dizajnový systém a komponenty v `packages/ui`. Hotové.
3. Jadro: typy, kontroly, engine, lokálne úložisko, ukážkové dáta, konfigurácia obce. Hotové.
4. Súbežná výstavba obrazoviek portálu a CRM.
5. Kontrola textov a prístupnosti.
6. Testy jadra vo Vitest a jeden priechod v Playwrighte.
7. Nasadenie na GitHub Pages cez GitHub Actions.

## Čo demo zámerne nerieši

Skutočný server a prihlasovanie, Slovensko.sk a eID, kvalifikovaný elektronický podpis,
odosielanie e-mailov, platba správneho poplatku, napojenie na kataster,
doručovanie cez ÚPVS. Osobné údaje zostávajú len v prehliadači.
