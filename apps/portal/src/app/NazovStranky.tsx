import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useTenant } from './tenant'

const NAZVY: { cesta: string; nazov: string }[] = [
  { cesta: '/prihlasenie', nazov: 'Prihlásenie' },
  { cesta: '/registracia', nazov: 'Registrácia' },
  { cesta: '/zabudnute-heslo', nazov: 'Zabudnuté heslo' },
  { cesta: '/ochrana-udajov', nazov: 'Ochrana osobných údajov' },
  { cesta: '/formulare', nazov: 'Formuláre' },
  { cesta: '/formular/', nazov: 'Vyplnenie žiadosti' },
  { cesta: '/odoslane/', nazov: 'Žiadosť bola prijatá' },
  { cesta: '/moje-podania', nazov: 'Moje podania' },
  { cesta: '/profil', nazov: 'Môj profil' },
  { cesta: '/404', nazov: 'Stránku sme nenašli' },
]

/** Nastaví názov stránky pri každej zmene cesty, aby ho čítačka obrazovky oznámila. */
export function NazovStranky() {
  const { pathname } = useLocation()
  const { tenant } = useTenant()

  useEffect(() => {
    const zhoda = NAZVY.find((n) => pathname.startsWith(n.cesta))
    const cast = zhoda?.nazov ?? 'Portál pre občanov'
    document.title = `${cast}, ${tenant.nazov}`
  }, [pathname, tenant])

  return null
}
