import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { FileText, LogOut, Menu, Users, X } from 'lucide-react'
import { Button, SkipLink, cn } from '@obec/ui'
import { useTenant } from '../app/tenant'
import { useAuth } from '../app/auth'

const ODKAZY = [
  { to: '/podania', text: 'Prijaté podania', ikona: FileText },
  { to: '/pouzivatelia', text: 'Používatelia', ikona: Users },
]

export function Layout() {
  const { tenant } = useTenant()
  const { uzivatel, odhlasit } = useAuth()
  const [otvorene, setOtvorene] = useState(false)

  return (
    <div className="flex min-h-screen flex-col">
      <SkipLink />
      <header className="border-b border-line bg-surface netlacit">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2.5">
          <Link to="/podania" className="flex items-center gap-3 rounded-control">
            <img
              src={`${import.meta.env.BASE_URL}${tenant.branding.erbSrc}`}
              alt={tenant.branding.erbAlt}
              className="h-9 w-auto"
              width={30}
              height={36}
            />
            <span className="leading-tight">
              <span className="block font-display text-sm font-semibold text-ink">
                {tenant.nazov}
              </span>
              <span className="block text-xs text-ink-muted">CRM obecného úradu</span>
            </span>
          </Link>

          <nav aria-label="Hlavné menu" className="hidden items-center gap-1 sm:flex">
            {ODKAZY.map((o) => (
              <NavLink
                key={o.to}
                to={o.to}
                className={({ isActive }) =>
                  cn(
                    'inline-flex min-h-[40px] items-center gap-2 rounded-control px-3 text-sm font-medium transition-colors duration-150',
                    isActive
                      ? 'bg-primary-soft text-primary-dark'
                      : 'text-ink-muted hover:bg-canvas hover:text-ink',
                  )
                }
              >
                <o.ikona className="h-4 w-4" aria-hidden="true" />
                {o.text}
              </NavLink>
            ))}
            <span className="ml-3 hidden text-sm text-ink-muted lg:inline">
              {uzivatel ? `${uzivatel.meno} ${uzivatel.priezvisko}` : ''}
            </span>
            <Button variant="ghost" size="sm" onClick={odhlasit} className="ml-1">
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Odhlásiť sa
            </Button>
          </nav>

          <button
            type="button"
            className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-control border border-line sm:hidden"
            aria-expanded={otvorene}
            aria-controls="menu-mobil"
            aria-label={otvorene ? 'Zavrieť menu' : 'Otvoriť menu'}
            onClick={() => setOtvorene((o) => !o)}
          >
            {otvorene ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {otvorene ? (
          <nav id="menu-mobil" aria-label="Hlavné menu" className="border-t border-line px-4 sm:hidden">
            <ul className="flex flex-col">
              {ODKAZY.map((o) => (
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
                <Button variant="secondary" onClick={odhlasit} className="w-full">
                  Odhlásiť sa
                </Button>
              </li>
            </ul>
          </nav>
        ) : null}
      </header>

      <main id="obsah" tabIndex={-1} className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">
        <Outlet />
      </main>

      <footer className="border-t border-line bg-surface px-4 py-3 text-center text-xs text-ink-muted netlacit">
        Ukážková verzia. Dáta sú uložené len v tomto prehliadači.
      </footer>
    </div>
  )
}
