import { useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { LogOut, Menu, X } from 'lucide-react'
import { Button, SkipLink, cn } from '@obec/ui'
import { useTenant } from '../app/tenant'
import { useAuth } from '../app/auth'

const ODKAZY_VEREJNE = [
  { to: '/formulare', text: 'Formuláre' },
  { to: '/ochrana-udajov', text: 'Ochrana osobných údajov' },
]

const ODKAZY_PRIHLASENY = [
  { to: '/formulare', text: 'Formuláre' },
  { to: '/moje-podania', text: 'Moje podania' },
  { to: '/profil', text: 'Môj profil' },
]

export function Layout() {
  const { tenant } = useTenant()
  const { obcan, odhlasit } = useAuth()
  const [otvorene, setOtvorene] = useState(false)
  const location = useLocation()
  const odkazy = obcan ? ODKAZY_PRIHLASENY : ODKAZY_VEREJNE

  return (
    <div className="flex min-h-screen flex-col">
      <SkipLink />
      <header className="border-b border-line bg-surface netlacit">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/" className="flex items-center gap-3 rounded-control">
            <img
              src={`${import.meta.env.BASE_URL}${tenant.branding.erbSrc}`}
              alt={tenant.branding.erbAlt}
              className="h-10 w-auto"
              width={426}
              height={512}
            />
            <span className="leading-tight">
              <span className="block font-display text-base font-semibold text-ink">
                {tenant.nazov}
              </span>
              <span className="block text-xs text-ink-muted">Portál pre občanov</span>
            </span>
          </Link>

          <nav aria-label="Hlavné menu" className="hidden items-center gap-1 md:flex">
            {odkazy.map((o) => (
              <NavLink
                key={o.to}
                to={o.to}
                className={({ isActive }) =>
                  cn(
                    'rounded-control px-3 py-2 text-sm font-medium transition-colors duration-150',
                    isActive
                      ? 'bg-primary-soft text-primary-dark'
                      : 'text-ink-muted hover:bg-canvas hover:text-ink',
                  )
                }
              >
                {o.text}
              </NavLink>
            ))}
            {obcan ? (
              <Button variant="ghost" size="sm" onClick={odhlasit} className="ml-2">
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Odhlásiť sa
              </Button>
            ) : (
              <Link
                to="/prihlasenie"
                state={{ odkial: location.pathname }}
                className="ml-2 inline-flex min-h-[40px] items-center rounded-control bg-primary px-4 text-sm font-medium text-white hover:bg-primary-dark"
              >
                Prihlásiť sa
              </Link>
            )}
          </nav>

          <button
            type="button"
            className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-control border border-line md:hidden"
            aria-expanded={otvorene}
            aria-controls="menu-mobil"
            aria-label={otvorene ? 'Zavrieť menu' : 'Otvoriť menu'}
            onClick={() => setOtvorene((o) => !o)}
          >
            {otvorene ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {otvorene ? (
          <nav
            id="menu-mobil"
            aria-label="Hlavné menu"
            className="border-t border-line bg-surface px-4 py-2 md:hidden"
          >
            <ul className="flex flex-col">
              {odkazy.map((o) => (
                <li key={o.to}>
                  <NavLink
                    to={o.to}
                    onClick={() => setOtvorene(false)}
                    className="block min-h-[44px] border-b border-line py-3 text-ink"
                  >
                    {o.text}
                  </NavLink>
                </li>
              ))}
              <li className="py-3">
                {obcan ? (
                  <Button variant="secondary" onClick={odhlasit} className="w-full">
                    Odhlásiť sa
                  </Button>
                ) : (
                  <Link
                    to="/prihlasenie"
                    onClick={() => setOtvorene(false)}
                    className="inline-flex min-h-[44px] w-full items-center justify-center rounded-control bg-primary px-4 font-medium text-white"
                  >
                    Prihlásiť sa
                  </Link>
                )}
              </li>
            </ul>
          </nav>
        ) : null}
      </header>

      <main id="obsah" tabIndex={-1} className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:py-10">
        <Outlet />
      </main>

      <footer className="border-t border-line bg-surface netlacit">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 text-sm sm:grid-cols-3">
          <div>
            <p className="font-semibold text-ink">{tenant.nazov}</p>
            <p className="text-ink-muted">
              {tenant.urad.nazovUradu}, {tenant.urad.ulica}
            </p>
            <p className="text-ink-muted">
              {tenant.urad.psc} {tenant.urad.obec}
            </p>
          </div>
          <div>
            <p className="font-semibold text-ink">Kontakt</p>
            <p className="text-ink-muted">{tenant.urad.telefon}</p>
            <a className="text-primary underline underline-offset-4" href={`mailto:${tenant.urad.email}`}>
              {tenant.urad.email}
            </a>
          </div>
          <div>
            <p className="font-semibold text-ink">Stránkové hodiny</p>
            <ul className="text-ink-muted">
              {tenant.urad.strankoveHodiny.map((h) => (
                <li key={h.den}>
                  {h.den}: {h.cas}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-line px-4 py-4 text-center text-xs text-ink-muted">
          Ukážková verzia portálu. Podania sa neodosielajú na skutočný úrad.
        </div>
      </footer>
    </div>
  )
}
