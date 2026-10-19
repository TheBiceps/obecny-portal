import type { FormSchema } from './schema'

/**
 * Návrh na predĺženie platnosti územného rozhodnutia o umiestnení stavby.
 */
export const predlzenieUzemnehoRozhodnutiaForm: FormSchema = {
  id: 'predlzenie-uzemneho-rozhodnutia',
  nazov: 'Návrh na predĺženie platnosti územného rozhodnutia o umiestnení stavby',
  kratkyPopis: 'Predĺženie platnosti už vydaného územného rozhodnutia o umiestnení stavby.',
  kategoria: 'Stavby a pozemky',
  poplatokEur: 20,
  poplatokPoznamka: 'Správny poplatok 20 € uhradíte pri podaní. Doklad o úhrade priložíte k návrhu.',
  odhadovanyCasMin: 10,
  pravnyZaklad: 'stavebného zákona a zákona č. 71/1967 Zb. o správnom konaní',
  adresat: 'Obecný úrad',
  rolaRiesitela: 'referent_stavebny',
  pdfNazov: 'navrh-na-predlzenie-platnosti-uzemneho-rozhodnutia',
  infoPoznamka: 'Návrh je potrebné podať pred uplynutím platnosti územného rozhodnutia.',
  sections: [
    {
      id: 'ziadatel',
      title: 'Navrhovateľ',
      description: 'Uveďte údaje osoby, ktorá návrh podáva.',
      fields: [
        {
          id: 'typOsoby',
          label: 'Žiadam ako',
          type: 'radio',
          required: true,
          colSpan: 2,
          options: [
            { value: 'fyzicka', label: 'Fyzická osoba' },
            { value: 'pravnicka', label: 'Právnická osoba' }
          ]
        },
        {
          id: 'nazovFirmy',
          label: 'Názov firmy',
          type: 'text',
          required: true,
          colSpan: 2,
          visibleIf: { field: 'typOsoby', equals: 'pravnicka' }
        },
        {
          id: 'ico',
          label: 'IČO',
          type: 'text',
          required: true,
          validate: 'ico',
          visibleIf: { field: 'typOsoby', equals: 'pravnicka' }
        },
        { id: 'titul', label: 'Titul', type: 'text', autofillFrom: 'resident.titul' },
        {
          id: 'meno',
          label: 'Meno',
          type: 'text',
          required: true,
          autofillFrom: 'resident.meno'
        },
        {
          id: 'priezvisko',
          label: 'Priezvisko',
          type: 'text',
          required: true,
          autofillFrom: 'resident.priezvisko'
        },
        {
          id: 'adresa',
          label: 'Adresa, prípadne sídlo',
          type: 'address',
          required: true,
          colSpan: 2,
          autofillFrom: 'resident.trvalyPobyt'
        },
        {
          id: 'maInuKorespondencnuAdresu',
          label: 'Korešpondenčná adresa je iná ako adresa vyššie',
          type: 'checkbox',
          colSpan: 2
        },
        {
          id: 'korespondencnaAdresa',
          label: 'Korešpondenčná adresa',
          type: 'address',
          required: true,
          colSpan: 2,
          visibleIf: { field: 'maInuKorespondencnuAdresu', isTruthy: true }
        },
        {
          id: 'poverenaOsoba',
          label: 'Meno poverenej osoby',
          type: 'text',
          colSpan: 2,
          helper: 'Osoba, s ktorou bude úrad komunikovať.'
        },
        {
          id: 'telefon',
          label: 'Telefón',
          type: 'text',
          required: true,
          validate: 'telefon',
          autofillFrom: 'resident.telefon'
        },
        {
          id: 'email',
          label: 'E-mail',
          type: 'text',
          required: true,
          validate: 'email',
          autofillFrom: 'resident.email'
        }
      ]
    },
    {
      id: 'zastupca',
      title: 'Splnomocnená organizácia alebo osoba',
      description: 'Vyplňte, ak vás v konaní zastupuje iná osoba na základe plnej moci.',
      fields: [
        {
          id: 'maZastupcu',
          label: 'V konaní ma zastupuje splnomocnená organizácia alebo osoba',
          type: 'checkbox',
          colSpan: 2
        },
        {
          id: 'zastupcaNazov',
          label: 'Meno alebo názov firmy',
          type: 'text',
          required: true,
          colSpan: 2,
          visibleIf: { field: 'maZastupcu', isTruthy: true }
        },
        {
          id: 'zastupcaAdresa',
          label: 'Adresa, prípadne sídlo',
          type: 'address',
          required: true,
          colSpan: 2,
          visibleIf: { field: 'maZastupcu', isTruthy: true }
        },
        {
          id: 'zastupcaKorespondencnaAdresa',
          label: 'Korešpondenčná adresa',
          type: 'text',
          colSpan: 2,
          visibleIf: { field: 'maZastupcu', isTruthy: true }
        },
        {
          id: 'zastupcaPoverenaOsoba',
          label: 'Meno poverenej osoby',
          type: 'text',
          colSpan: 2,
          visibleIf: { field: 'maZastupcu', isTruthy: true }
        },
        {
          id: 'zastupcaTelefon',
          label: 'Telefón',
          type: 'text',
          required: true,
          validate: 'telefon',
          visibleIf: { field: 'maZastupcu', isTruthy: true }
        },
        {
          id: 'zastupcaEmail',
          label: 'E-mail',
          type: 'text',
          required: true,
          validate: 'email',
          visibleIf: { field: 'maZastupcu', isTruthy: true }
        }
      ]
    },
    {
      id: 'stavba',
      title: 'Označenie a miesto umiestnenej stavby',
      fields: [
        {
          id: 'nehnutelnost',
          label: 'Vyberte nehnuteľnosť',
          type: 'propertyPicker',
          colSpan: 2,
          helper: 'Údaje o pozemku doplníme z vašej nehnuteľnosti. Môžete ich upraviť.'
        },
        {
          id: 'nazovStavby',
          label: 'Názov stavby',
          type: 'text',
          required: true,
          colSpan: 2,
          autofillFrom: 'property.nazovStavby'
        },
        {
          id: 'stavebneObjekty',
          label: 'Členenie na stavebné objekty',
          type: 'textarea',
          colSpan: 2,
          maxLength: 800,
          helper: 'Každý stavebný objekt uveďte na nový riadok.'
        },
        {
          id: 'parcelyCislo',
          label: 'Pozemok alebo pozemky parc. č.',
          type: 'text',
          required: true,
          colSpan: 2,
          autofillFrom: 'property.parcelaCislo'
        },
        {
          id: 'katastralneUzemie',
          label: 'Katastrálne územie',
          type: 'select',
          required: true,
          optionsFromTenant: 'katastralneUzemia',
          autofillFrom: 'property.katastralneUzemie'
        },
        {
          id: 'ulica',
          label: 'Ulica',
          type: 'text',
          required: true,
          autofillFrom: 'property.adresa.ulica'
        }
      ]
    },
    {
      id: 'rozhodnutie',
      title: 'Územné rozhodnutie',
      description: 'Dátum a číslo územného rozhodnutia o umiestnení stavby.',
      fields: [
        {
          id: 'uzemneRozhodnutieCislo',
          label: 'Územné rozhodnutie č. j.',
          type: 'text',
          required: true
        },
        { id: 'uzemneRozhodnutieDatum', label: 'Zo dňa', type: 'date', required: true },
        {
          id: 'predlzeniePlatnostiCislo',
          label: 'Rozhodnutie o predĺžení jeho platnosti č. j.',
          type: 'text'
        },
        { id: 'predlzeniePlatnostiDatum', label: 'Zo dňa', type: 'date' },
        {
          id: 'dovodNavrhu',
          label: 'Dôvod návrhu',
          type: 'textarea',
          required: true,
          colSpan: 2,
          maxLength: 1000
        }
      ]
    },
    {
      id: 'ucastnici',
      title: 'Účastníci konania',
      fields: [
        {
          id: 'ucastniciKonania',
          label: 'Aktuálny zoznam všetkých známych účastníkov konania',
          type: 'textarea',
          required: true,
          colSpan: 2,
          maxLength: 1500,
          helper: 'Uveďte mená a adresy, každého účastníka na nový riadok.'
        }
      ]
    },
    {
      id: 'prilohy',
      title: 'Prílohy',
      description: 'Nahrajte doklady k návrhu. Prijímame formáty PDF, JPG a PNG.',
      fields: [
        {
          id: 'dokladOUhrade',
          label: 'Doklad o zaplatení správneho poplatku',
          type: 'file',
          required: true,
          colSpan: 2,
          maxSuborov: 3,
          maxVelkostMb: 5
        },
        {
          id: 'splnomocnenie',
          label: 'Splnomocnenie na zastupovanie',
          type: 'file',
          colSpan: 2,
          maxSuborov: 3,
          maxVelkostMb: 5
        },
        {
          id: 'kopiaUzemnehoRozhodnutia',
          label: 'Fotokópia právoplatného územného rozhodnutia',
          type: 'file',
          required: true,
          colSpan: 2,
          maxSuborov: 3,
          maxVelkostMb: 5
        },
        {
          id: 'ineRozhodnutia',
          label: 'Fotokópia iných právoplatných rozhodnutí súvisiacich so stavbou',
          type: 'file',
          colSpan: 2,
          maxSuborov: 3,
          maxVelkostMb: 5
        },
        {
          id: 'listyVlastnictva',
          label: 'Listy vlastníctva dotknutých pozemkov a stavieb vrátane susediacich pozemkov a stavieb',
          type: 'file',
          required: true,
          colSpan: 2,
          maxSuborov: 3,
          maxVelkostMb: 5
        }
      ]
    },
    {
      id: 'suhlasy',
      title: 'Súhlasy a potvrdenie',
      fields: [
        {
          id: 'suhlasOsobneUdaje',
          label: 'Súhlasím so spracovaním osobných údajov',
          type: 'consent',
          required: true,
          colSpan: 2,
          text: 'Súhlasím so spracovaním uvedených osobných údajov v zmysle zákona č. 18/2018 Z. z. o ochrane osobných údajov a o zmene a doplnení niektorých zákonov na účel spracovania tohto návrhu v rozsahu poskytnutých údajov.',
          chybaText: 'Bez súhlasu so spracovaním osobných údajov žiadosť odoslať nevieme.'
        },
        {
          id: 'spristupnenieInformacii',
          label: 'Sprístupnenie informácií tretím osobám',
          type: 'radio',
          required: true,
          colSpan: 2,
          helper: 'Ide o informácie z administratívneho spisu vedeného na stavebnom úrade vo veci navrhovaného konania, podľa zákona č. 211/2000 Z. z. o slobodnom prístupe k informáciám v platnom znení.',
          options: [
            { value: 'suhlasim', label: 'Súhlasím so sprístupnením' },
            { value: 'nesuhlasim', label: 'Nesúhlasím so sprístupnením' }
          ]
        },
        {
          id: 'potvrdeniePravdivosti',
          label: 'Potvrdzujem, že uvedené údaje sú pravdivé a úplné.',
          type: 'consent',
          required: true,
          colSpan: 2,
          helper: 'Potvrdenie nahrádza vlastnoručný podpis na papierovom tlačive.',
          chybaText: 'Potvrďte prosím pravdivosť údajov.'
        },
        {
          id: 'miesto',
          label: 'Miesto',
          type: 'text',
          required: true,
          autofillFrom: 'tenant.nazovKratky'
        },
        { id: 'datum', label: 'Dátum', type: 'date', required: true, autofillFrom: 'dnes' }
      ]
    }
  ],
  prilohy: [
    {
      id: 'doklad-o-uhrade',
      nazov: 'Doklad o zaplatení správneho poplatku',
      povinna: true,
      poznamka: 'Pri platbe bankovým prevodom alebo poštovou poukážkou.'
    },
    {
      id: 'splnomocnenie',
      nazov: 'Splnomocnenie na zastupovanie',
      povinna: false,
      poznamka: 'Ak návrh podáva navrhovateľ prostredníctvom svojho zástupcu.'
    },
    {
      id: 'kopia-uzemneho-rozhodnutia',
      nazov: 'Fotokópia právoplatného územného rozhodnutia',
      povinna: true
    },
    {
      id: 'ine-rozhodnutia',
      nazov: 'Fotokópia iných právoplatných rozhodnutí súvisiacich so stavbou',
      povinna: false
    },
    {
      id: 'listy-vlastnictva',
      nazov: 'Listy vlastníctva dotknutých pozemkov a stavieb vrátane susediacich pozemkov a stavieb',
      povinna: true,
      poznamka: 'Získate ich na katasterportal.sk alebo geoportal.sk.'
    }
  ]
}
