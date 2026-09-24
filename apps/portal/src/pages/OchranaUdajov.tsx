import { Alert, PageHeader } from '@obec/ui'
import { useTenant } from '../app/tenant'

export function OchranaUdajov() {
  const { tenant } = useTenant()

  return (
    <div className="mx-auto flex max-w-prose flex-col gap-6">
      <PageHeader
        nadpis="Ochrana osobných údajov"
        popis={`Ako ${tenant.nazov} spracúva osobné údaje pri podávaní žiadostí cez tento portál.`}
      />

      <Alert ton="info" nadpis="Ukážkový text">
        <p>
          Toto je ukážkový text na účely demonštrácie portálu. Pred ostrou prevádzkou si obec dá
          spracovať vlastné podmienky ochrany osobných údajov v spolupráci so zodpovednou osobou.
        </p>
      </Alert>

      <div className="flex flex-col gap-8 text-ink">
        <section>
          <h2 className="text-xl font-semibold">Aké údaje spracúvame</h2>
          <p className="mt-2 text-ink-muted">
            Pri podaní žiadosti cez portál spracúvame len údaje potrebné na jej vybavenie:
          </p>
          <ul className="mt-3 list-inside list-disc space-y-1 text-ink-muted">
            <li>osobné údaje žiadateľa: meno, priezvisko, titul, adresa, telefón, e-mail,</li>
            <li>rodné číslo, ak je pre daný formulár potrebné na jednoznačnú identifikáciu,</li>
            <li>
              údaje o nehnuteľnosti: adresa, katastrálne územie, číslo parcely, číslo listu
              vlastníctva a súvisiace údaje,
            </li>
            <li>prílohy priložené k žiadosti, napríklad doklady a fotografie.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Právny základ spracúvania</h2>
          <p className="mt-2 text-ink-muted">
            Osobné údaje spracúvame na základe zákona č. 18/2018 Z. z. o ochrane osobných údajov a
            o zmene a doplnení niektorých zákonov, v spojení s osobitnými predpismi upravujúcimi
            jednotlivé konania (napríklad stavebný zákon). Spracúvanie je nevyhnutné na splnenie
            zákonnej povinnosti obce a na vybavenie podanej žiadosti.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Práva dotknutej osoby</h2>
          <p className="mt-2 text-ink-muted">Ako dotknutá osoba máte právo najmä na:</p>
          <ul className="mt-3 list-inside list-disc space-y-1 text-ink-muted">
            <li>prístup k svojim osobným údajom,</li>
            <li>opravu nesprávnych alebo neúplných údajov,</li>
            <li>výmaz údajov, ak na to nie je zákonný dôvod na ich ďalšie uchovávanie,</li>
            <li>obmedzenie spracúvania,</li>
            <li>namietanie proti spracúvaniu,</li>
            <li>podanie návrhu na Úrad na ochranu osobných údajov Slovenskej republiky.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Kontakt</h2>
          <p className="mt-2 text-ink-muted">
            V otázkach ochrany osobných údajov sa môžete obrátiť na {tenant.urad.nazovUradu}, na
            adrese {tenant.urad.ulica}, {tenant.urad.psc} {tenant.urad.obec}, telefón{' '}
            {tenant.urad.telefon}, e-mail{' '}
            <a
              className="text-primary underline underline-offset-4"
              href={`mailto:${tenant.urad.email}`}
            >
              {tenant.urad.email}
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  )
}
