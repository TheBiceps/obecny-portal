import { test, expect } from '@playwright/test'

/**
 * Jeden priechodný test hlavného scenára ukážky:
 * občan sa zaregistruje, pridá si nehnuteľnosť, podá žiadosť o potvrdenie
 * o veku stavby a úrad ju spracuje v CRM.
 *
 * Beží proti zostavenej aplikácii (priečinok ../dist), pozri e2e/README.md.
 */
test('Občan podá žiadosť a úrad ju uvidí v CRM', async ({ page }) => {
  const casovaPeciatka = Date.now()
  const meno = 'Zuzana'
  const priezvisko = `Testovacia${casovaPeciatka}`
  const celeMeno = `${meno} ${priezvisko}`
  const email = `zuzana.testovacia.${casovaPeciatka}@example.test`
  const heslo = 'Test1234'
  const rodneCislo = '7408024426'
  const telefon = '+421 905 111 222'

  /* --------------------------------------------------------------- */
  /* 1. Otvorenie portálu a vyčistenie localStorage                    */
  /* --------------------------------------------------------------- */
  await page.goto('./')
  await page.evaluate(() => window.localStorage.clear())
  await page.reload()

  /* --------------------------------------------------------------- */
  /* 2. Registrácia nového občana                                      */
  /* --------------------------------------------------------------- */
  await page.goto('#/registracia')

  // Krok 1: osobné údaje
  await page.getByLabel('Meno').fill(meno)
  await page.getByLabel('Priezvisko').fill(priezvisko)
  await page.getByLabel('Rodné číslo').fill(rodneCislo)
  await page.getByLabel('Telefón').fill(telefon)
  await page.getByLabel('E-mail').fill(email)
  await page.getByLabel('Heslo').fill(heslo)
  await page.getByLabel('Potvrdenie hesla').fill(heslo)
  await page.getByRole('button', { name: 'Pokračovať' }).click()

  // Krok 2: trvalý pobyt, obec a PSČ sú predvyplnené z konfigurácie obce
  await page.getByLabel('Ulica').fill('Lipová')
  await page.getByRole('button', { name: 'Pokračovať' }).click()

  // Krok 3: nehnuteľnosti, tento krok preskočíme, nehnuteľnosť pridáme v profile
  await page.getByRole('button', { name: 'Pokračovať' }).click()

  // Krok 4: súhlas a dokončenie
  await page.getByRole('checkbox', { name: 'Súhlasím so spracovaním osobných údajov' }).check()
  await page.getByRole('button', { name: 'Vytvoriť konto' }).click()

  await expect(page.getByRole('heading', { name: 'Môj profil' })).toBeVisible()

  /* --------------------------------------------------------------- */
  /* 3. Pridanie nehnuteľnosti v profile                                */
  /* --------------------------------------------------------------- */
  await page.getByRole('button', { name: 'Pridať nehnuteľnosť' }).first().click()

  const modalNehnutelnost = page.getByRole('dialog', { name: 'Pridať nehnuteľnosť' })
  await expect(modalNehnutelnost).toBeVisible()

  await modalNehnutelnost.getByRole('radio', { name: 'Rodinný dom' }).check()
  await modalNehnutelnost.getByRole('radio', { name: 'Vlastník', exact: true }).check()
  await modalNehnutelnost.getByLabel('Ulica').fill('Brezová')
  await modalNehnutelnost.getByLabel('Súpisné číslo').fill('15')
  await modalNehnutelnost.getByLabel('Katastrálne územie').selectOption('Bernolákovo')
  await modalNehnutelnost.getByLabel('Číslo parcely').fill('2211/4')
  await modalNehnutelnost.getByLabel('Register parcely').selectOption('C')
  await modalNehnutelnost.getByLabel('Číslo listu vlastníctva').fill('7788')
  await modalNehnutelnost.getByLabel('Rok kolaudácie').fill('1969')
  await modalNehnutelnost.getByRole('button', { name: 'Uložiť' }).click()

  await expect(modalNehnutelnost).toBeHidden()
  await expect(page.getByText('Brezová 15, Bernolákovo')).toBeVisible()

  /* --------------------------------------------------------------- */
  /* 4. Formulár Žiadosť o vydanie potvrdenia o veku stavby             */
  /* --------------------------------------------------------------- */
  await page.getByRole('link', { name: 'Formuláre' }).click()
  const kartaFormulara = page
    .getByRole('listitem')
    .filter({ hasText: 'Žiadosť o vydanie potvrdenia o veku stavby' })
  await kartaFormulara.getByRole('button', { name: 'Vyplniť žiadosť' }).click()

  await expect(
    page.getByRole('heading', { name: 'Žiadosť o vydanie potvrdenia o veku stavby' }),
  ).toBeVisible()

  // Sekcia Žiadateľ, ostatné polia sú predvyplnené z profilu
  await page.getByRole('radio', { name: 'Fyzická osoba' }).check()
  await page.getByRole('button', { name: 'Pokračovať' }).click()

  // Sekcia Účel potvrdenia
  await page.getByRole('radio', { name: 'Pre vypracovanie znaleckého posudku' }).check()
  await page.getByRole('button', { name: 'Pokračovať' }).click()

  // Sekcia Stavba: vyberieme nehnuteľnosť a overíme predvyplnenie
  await page.getByRole('radio', { name: 'Brezová 15, parcela 2211/4, LV 7788' }).check()

  await expect(page.getByLabel('Parcela č.')).toHaveValue('2211/4')
  await expect(page.getByLabel('Číslo listu vlastníctva')).toHaveValue('7788')
  await expect(page.getByLabel('Súpisné číslo')).toHaveValue('15')

  await page.getByLabel('Názov stavby').fill('Rodinný dom')
  await page.getByRole('button', { name: 'Pokračovať' }).click()

  // Sekcia Uvedenie do užívania: pred rokom 1976, otvorí sa čestné prehlásenie
  await page.getByRole('radio', { name: 'Pred 1. 1. 1976' }).check()
  await expect(page.getByLabel('Rok, v ktorom bola stavba daná do užívania')).toHaveValue('1969')
  await page.getByRole('button', { name: 'Pokračovať' }).click()

  // Sekcia Čestné prehlásenie
  await expect(page.getByLabel('Rodné číslo')).not.toHaveValue('')
  await page.getByLabel('Meno a priezvisko').fill(celeMeno)
  await page.getByLabel('Číslo občianskeho preukazu').fill('AB 123456')
  await page.getByLabel('Trvale bytom').fill('Brezová 15, Bernolákovo')
  await page.getByLabel('Stavba bola daná do užívania v roku').fill('1969')
  await page.getByLabel('Na pozemku parc. č.').fill('2211/4')
  await page.getByLabel('V katastrálnom území').selectOption('Bernolákovo')
  await page.getByLabel('Stavebníkom bol').fill(celeMeno)
  await page.getByRole('checkbox', { name: 'Potvrdzujem čestné prehlásenie v uvedenom znení.' }).check()
  await page.getByRole('button', { name: 'Pokračovať' }).click()

  // Sekcia Stavebník a vlastník
  await page.getByLabel('Stavebníkom boli').fill(celeMeno)
  await page.getByLabel('Vlastníkom je').fill(celeMeno)
  await page
    .getByRole('checkbox', { name: 'Žiadateľ je zároveň stavebníkom budovy' })
    .check()
  await page.getByRole('button', { name: 'Pokračovať' }).click()

  // Sekcia Prílohy, bez povinných príloh vďaka predošlému zaškrtnutiu
  await page.getByRole('button', { name: 'Pokračovať' }).click()

  // Sekcia Potvrdenie a dátum
  await page
    .getByRole('checkbox', { name: 'Potvrdzujem, že uvedené údaje sú pravdivé a úplné.' })
    .check()
  await page
    .getByRole('checkbox', { name: 'Súhlasím so spracovaním osobných údajov' })
    .check()
  await page.getByRole('button', { name: 'Pokračovať' }).click()

  // Kontrola a odoslanie
  await expect(page.getByRole('heading', { name: 'Skontrolujte údaje' })).toBeVisible()
  await page.getByRole('button', { name: 'Odoslať žiadosť' }).click()

  await expect(page.getByText('Žiadosť bola prijatá')).toBeVisible()
  const cisloPodania = (await page.locator('p.text-primary').first().textContent())?.trim() ?? ''
  expect(cisloPodania).toMatch(/^BER-\d{4}-\d{6}$/)

  /* --------------------------------------------------------------- */
  /* 5. CRM: prihlásenie a kontrola podania                            */
  /* --------------------------------------------------------------- */
  await page.goto('crm/#/prihlasenie')
  await page.getByLabel('E-mail').fill('starosta@demo.sk')
  await page.getByLabel('Heslo').fill('Urad1234')
  await page.getByRole('button', { name: 'Prihlásiť sa' }).click()

  await expect(page.getByRole('heading', { name: 'Prijaté podania' })).toBeVisible()

  const riadokPodania = page.getByRole('row', { name: new RegExp(cisloPodania) })
  await expect(riadokPodania).toBeVisible()
  await expect(riadokPodania.getByText('Nové')).toBeVisible()

  await riadokPodania.getByRole('link', { name: /Otvoriť detail/ }).click()

  /* --------------------------------------------------------------- */
  /* 6. Detail podania: kontrola údajov, zmena stavu, vymazanie        */
  /* --------------------------------------------------------------- */
  await expect(page.getByText(cisloPodania)).toBeVisible()
  await expect(page.getByText(celeMeno).first()).toBeVisible()
  await expect(page.getByText('2211/4 (register C)')).toBeVisible()

  await page.getByRole('button', { name: 'Zmeniť stav' }).click()
  const modalStav = page.getByRole('dialog', { name: 'Zmeniť stav podania' })
  await expect(modalStav).toBeVisible()
  await modalStav.getByLabel('Nový stav').selectOption('vybavene')
  await modalStav.getByRole('button', { name: 'Uložiť stav' }).click()
  await expect(modalStav).toBeHidden()

  await expect(page.getByText('Vybavené')).toBeVisible()

  await page.getByRole('button', { name: 'Vymazať' }).click()
  const modalVymazanie = page.getByRole('dialog', { name: 'Vymazať podanie' })
  await expect(modalVymazanie).toBeVisible()
  await modalVymazanie.getByRole('button', { name: 'Áno, vymazať podanie' }).click()

  await expect(page.getByRole('heading', { name: 'Prijaté podania' })).toBeVisible()
  await expect(page.getByText(cisloPodania)).toHaveCount(0)
})
