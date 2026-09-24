import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useTenant } from './tenant'

const NAZVY: { cesta: string; nazov: string }[] = [
  { cesta: '/prihlasenie', nazov: 'Prihlásenie' },
  { cesta: '/podania/', nazov: 'Detail podania' },
  { cesta: '/podania', nazov: 'Prijaté podania' },
  { cesta: '/pouzivatelia', nazov: 'Používatelia' },
]

/** Nastaví názov stránky pri každej zmene cesty, aby ho čítačka obrazovky oznámila. */
export function NazovStranky() {
  const { pathname } = useLocation()
  const { tenant } = useTenant()

  useEffect(() => {
    const zhoda = NAZVY.find((n) => pathname.startsWith(n.cesta))
    const cast = zhoda?.nazov ?? 'CRM obecného úradu'
    document.title = `${cast}, CRM obecného úradu, ${tenant.nazov}`
  }, [pathname, tenant])

  return null
}
