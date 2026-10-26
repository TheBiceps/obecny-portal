# Obecný portál

**Digitálne podávanie žiadostí pre obce a mestá.** Občan vybaví žiadosť z domu,
úrad ju dostane úplnú, čitateľnú a pridelenú správnemu referentovi.

---

## Čo dnes obec rieši

Tlačivá na webe obce sú spravidla naskenované PDF súbory. Občan si ich vytlačí,
vyplní perom, niečo preškrtne, niečo vynechá a prinesie ich na úrad. Referent
potom dopisuje chýbajúce údaje, telefonuje, vracia žiadosti na doplnenie
a prepisuje ich do vlastnej evidencie.

Výsledok pozná každý úrad: zbytočné návštevy, neúplné podania, papier, ktorý
sa hľadá, a občan, ktorý nevie, v akom stave jeho žiadosť je.

## Čo portál robí

Obecný portál má dve časti, ktoré spolu tvoria jeden celok.

### Portál pre občanov

* **Zoznam žiadostí obce** s vyhľadávaním, kategóriami, poplatkom
  a odhadom času na vyplnenie
* **Sprievodca vyplnením** krok za krokom, s kontrolou údajov hneď pri písaní
  a so zrozumiteľnou nápovedou pod každým poľom
* **Konto občana** s trvalým pobytom a zoznamom nehnuteľností. Pri ďalšej
  žiadosti sa údaje o žiadateľovi aj o parcele, liste vlastníctva a súpisnom
  čísle doplnia samy
* **Prílohy** sa nahrávajú priamo vo formulári
* **Potvrdenie o podaní** s číslom podania a možnosťou stiahnuť vyplnenú
  žiadosť v PDF
* **Prehľad Moje podania** so stavom vybavovania
* Žiadosť sa dá podať **aj bez registrácie**

### CRM obecného úradu

* **Prijaté podania** s vyhľadávaním, filtrami podľa formulára, stavu, agendy
  a dátumu, so zoradením a stránkovaním
* **Detail podania** so všetkými údajmi usporiadanými rovnako ako na papierovom
  tlačive, s prílohami, údajmi o žiadateľovi a jeho nehnuteľnosti
* **Automatické pridelenie** podania referentovi podľa agendy
* **Zmena stavu**, tlač, stiahnutie PDF s hlavičkou obce
* **História podania**: kedy prišlo, komu bolo pridelené, kto ho otvoril,
  kto zmenil stav
* **Správa používateľov** s prehľadom vyťaženia jednotlivých referentov

## Prideľovanie podľa agendy

Každé tlačivo patrí niektorému referátu. Keď občan odošle žiadosť, portál ju
okamžite pridelí referentovi tejto agendy, a to tomu, kto má práve najmenej
nevybavených podaní.

| Rola | Čo vidí |
| --- | --- |
| Hlavný správca | všetky podania, správa používateľov, prehľad vyťaženia |
| Referent stavebného úradu | len podania svojho referátu |
| Referent dopravy a komunikácií | len podania svojho referátu |
| Referent evidencie adries | len podania svojho referátu |
| Čitateľ | všetky podania, bez možnosti zasahovať |

Rozsah videnia nie je len vec zobrazenia. Vynucuje sa priamo v dátovej vrstve,
takže referent sa k podaniam iného referátu nedostane ani obídením rozhrania.

## Pre koho je portál

* **Obce a menšie mestá**, ktoré chcú občanom ponúknuť elektronické podanie
  bez toho, aby budovali vlastný informačný systém
* **Obecné úrady**, kde jeden referent pokrýva viac agend a potrebuje mať
  prehľad o tom, čo mu prišlo a v akom je to stave
* **Starostovia**, ktorí chcú vidieť, koľko podaní úrad dostáva, ako sú
  rozdelené a ako rýchlo sa vybavujú

Portál je stavaný tak, aby dával zmysel aj obci s tisíc obyvateľmi. Nevyžaduje
vlastného správcu systému ani školenie na niekoľko dní.

## Prínosy pre obec

**Menej návštev úradu.** Žiadosť sa podá večer z telefónu. Na úrad sa chodí až
po výsledok, nie kvôli tlačivu.

**Úplné podania.** Formulár nepustí žiadateľa ďalej s nezmyselným rodným číslom,
chybným IČO alebo prázdnym povinným poľom. Referent dostane žiadosť, s ktorou
sa dá hneď pracovať.

**Menej telefonátov.** Občan vidí stav svojej žiadosti sám.

**Rýchlejšie zapracovanie nového kolegu.** Referent vidí vo svojom zozname len
to, čo má riešiť.

**Prehľad pre vedenie.** Koľko podaní prišlo, koľko je v riešení, koľko sa
vybavilo tento mesiac a ako je rozdelená práca medzi referentmi.

**Dohľadateľnosť.** Pri každom podaní je zaznamenané, kedy prišlo, komu bolo
pridelené a kto s ním čo robil.

**Rovnaká podoba dokumentov.** Z každého podania vznikne PDF s hlavičkou obce,
usporiadané rovnako ako pôvodné tlačivo. Žiadne nečitateľné rukopisy.

## Prístupnosť a jazyk

Rozhranie je celé po slovensky, so správnou diakritikou vrátane generovaných
PDF súborov. Dátumy, sumy, telefónne čísla aj PSČ sú v slovenských tvaroch.

Portál je postavený podľa **WCAG 2.1 na úrovni AA**, teda podľa normy
EN 301 549, ktorú pre verejnú správu predpisuje
[zákon č. 95/2019 Z. z.](https://www.slov-lex.sk/pravne-predpisy/SK/ZZ/2019/95/)
a vyhláška č. 78/2020 Z. z. o štandardoch pre informačné technológie verejnej
správy. V praxi to znamená ovládanie klávesnicou, viditeľné označenie
zameraného prvku, dostatočný kontrast, popisy previazané s poliami, súhrn chýb
nad formulárom a zmysluplné texty pre čítačky obrazovky.

Rozhranie je navrhnuté pre mobil ako prvý, pretože veľká časť obyvateľov obce
používa na internet iba telefón.

## Čo je súčasťou dodávky

* Portál pre občanov a CRM úradu, obe v dizajne obce
* Digitalizácia existujúcich tlačív obce vrátane kontrol a príloh
* Nastavenie referátov a rolí podľa organizačnej štruktúry úradu
* Erb, farby, adresa úradu, stránkové hodiny a katastrálne územia
  z konfigurácie obce
* Zaškolenie zamestnancov úradu
* Odovzdanie zdrojového kódu

### Ako prebieha nasadenie

1. **Zber tlačív.** Obec odovzdá tlačivá, ktoré chce sprístupniť online.
2. **Digitalizácia.** Každé tlačivo prepíšeme do formulára vrátane podmienených
   častí, príloh a právneho základu.
3. **Nastavenie úradu.** Doplníme referáty, roly a údaje obce.
4. **Overenie.** Úrad si portál prejde na skúšobnej adrese a pripomienkuje
   texty aj poradie otázok.
5. **Spustenie.** Portál sa napojí na doménu obce.

Pridanie ďalšieho tlačiva je neskôr otázka jedného konfiguračného súboru,
nie prepisovania aplikácie. Rovnako je riešená aj ďalšia obec.

## Čo vieme doplniť

Tieto časti nie sú v základnom balíku, vieme ich však dodať na objednávku:

* prihlásenie cez **Slovensko.sk a eID**
* **kvalifikovaný elektronický podpis**
* **platbu správneho poplatku** online
* **napojenie na kataster** a automatické dopĺňanie údajov o parcele
* **doručovanie cez ÚPVS**
* e-mailové a SMS upozornenia na zmenu stavu
* ďalšie agendy úradu podľa potreby obce

## Technické poznámky

Portál je webová aplikácia, nič sa neinštaluje. Funguje v bežnom prehliadači
na počítači, tablete aj telefóne.

Formuláre sú riešené ako konfigurácia, nie ako napevno naprogramované stránky.
Z jednej definície tlačiva sa odvodzuje vypĺňanie, kontroly, kontrolná
obrazovka, PDF aj zobrazenie v CRM. Vďaka tomu je zmena textu otázky alebo
pridanie novej prílohy rýchla úprava.

Aplikácia je pripravená na viac obcí naraz. Každý záznam patrí konkrétnej obci
a údaje sa medzi obcami nemiešajú.

## Chcete vidieť, ako to funguje?

Pripravíme ukážku s tlačivami vašej obce a prejdeme si ju spoločne.
Prvé stretnutie trvá približne tridsať minút.
