import { Link } from 'react-router-dom'
import { Clock, FileEdit, ListChecks, MapPin, Search } from 'lucide-react'
import { Card } from '@obec/ui'
import { formatEur, formsForTenant } from '@obec/core'
import { useTenant } from '../app/tenant'
import { useAuth } from '../app/auth'

const KROKY = [
  {
    ikona: Search,
    nadpis: 'Vyberte formulár',
    popis: 'Z ponuky formulárov nájdite ten, ktorý zodpovedá vašej žiadosti.',
  },
  {
    ikona: FileEdit,
    nadpis: 'Vyplňte údaje',
    popis: 'Formulár vás prevedie krok po kroku, časť polí vám vopred doplníme.',
  },
  {
    ikona: ListChecks,
    nadpis: 'Sledujte stav podania',
    popis: 'Po odoslaní vidíte stav vybavovania v prehľade Moje podania.',
  },
]

export function Domov() {
  const { tenant } = useTenant()
  const { obcan } = useAuth()
  const formulare = formsForTenant(tenant.povoleneFormulare)

  return (
    <div className="flex flex-col gap-12">
      <section className="flex flex-col gap-4">
        <h1 className="text-3xl font-semibold text-ink sm:text-4xl">{tenant.nazov}</h1>
        <p className="max-w-prose text-ink-muted">
          Svoju žiadosť na úrad môžete vybaviť online, bez nutnosti osobnej návštevy. Vyplňte
          formulár, priložte potrebné prílohy a sledujte, ako sa vaše podanie vybavuje.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/formulare"
            className="inline-flex min-h-[44px] items-center rounded-control bg-primary px-5 font-medium text-white transition-colors duration-150 hover:bg-primary-dark"
          >
            Zobraziť formuláre
          </Link>
          <Link
            to={obcan ? '/moje-podania' : '/prihlasenie'}
            className="inline-flex min-h-[44px] items-center rounded-control border border-primary/40 bg-surface px-5 font-medium text-primary transition-colors duration-150 hover:bg-primary-soft"
          >
            {obcan ? 'Moje podania' : 'Prihlásiť sa'}
          </Link>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-ink">Ako to funguje</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {KROKY.map((k) => (
            <Card key={k.nadpis} className="flex flex-col gap-3 p-5">
              <k.ikona className="h-6 w-6 text-primary" aria-hidden="true" />
              <h3 className="font-semibold text-ink">{k.nadpis}</h3>
              <p className="text-sm text-ink-muted">{k.popis}</p>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-ink">Dostupné formuláre</h2>
        {formulare.length === 0 ? (
          <p className="mt-3 text-ink-muted">Obec momentálne nemá zapnutý žiadny formulár.</p>
        ) : (
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {formulare.map((f) => (
              <li key={f.id}>
                <Card as="article" className="flex h-full flex-col gap-2 p-5">
                  <h3 className="font-semibold text-ink">{f.nazov}</h3>
                  <p className="flex-1 text-sm text-ink-muted">{f.kratkyPopis}</p>
                  <p className="text-sm font-medium text-ink">
                    {f.poplatokEur === 0 ? 'Bez poplatku' : formatEur(f.poplatokEur)}
                  </p>
                  <Link
                    to={`/formular/${f.id}`}
                    className="mt-1 inline-flex min-h-[44px] items-center font-medium text-primary underline underline-offset-4"
                  >
                    Vyplniť formulár
                  </Link>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <Card className="grid gap-6 p-6 sm:grid-cols-2">
          <div className="flex gap-3">
            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
            <div>
              <h2 className="font-semibold text-ink">{tenant.urad.nazovUradu}</h2>
              <p className="text-sm text-ink-muted">{tenant.urad.ulica}</p>
              <p className="text-sm text-ink-muted">
                {tenant.urad.psc} {tenant.urad.obec}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Clock className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
            <div>
              <h2 className="font-semibold text-ink">Stránkové hodiny</h2>
              <ul className="text-sm text-ink-muted">
                {tenant.urad.strankoveHodiny.map((h) => (
                  <li key={h.den}>
                    {h.den}: {h.cas}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      </section>
    </div>
  )
}
