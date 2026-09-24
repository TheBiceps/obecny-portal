import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { StaffUser } from '@obec/core'
import { useTenant } from './tenant'

const KLUC = 'obec.crm.relacia'

interface Ctx {
  uzivatel: StaffUser | null
  nacitavame: boolean
  prihlasit: (email: string, heslo: string) => Promise<void>
  odhlasit: () => void
}

const AuthCtx = createContext<Ctx | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data } = useTenant()
  const [uzivatel, setUzivatel] = useState<StaffUser | null>(null)
  const [nacitavame, setNacitavame] = useState(true)

  useEffect(() => {
    const id = localStorage.getItem(KLUC)
    if (!id) {
      setNacitavame(false)
      return
    }
    data
      .listStaff()
      .then((z) => setUzivatel(z.find((s) => s.id === id) ?? null))
      .finally(() => setNacitavame(false))
  }, [data])

  const prihlasit = useCallback(
    async (email: string, heslo: string) => {
      const s = await data.prihlasitZamestnanca(email, heslo)
      localStorage.setItem(KLUC, s.id)
      setUzivatel(s)
    },
    [data],
  )

  const odhlasit = useCallback(() => {
    localStorage.removeItem(KLUC)
    setUzivatel(null)
  }, [])

  const hodnota = useMemo(
    () => ({ uzivatel, nacitavame, prihlasit, odhlasit }),
    [uzivatel, nacitavame, prihlasit, odhlasit],
  )

  return <AuthCtx.Provider value={hodnota}>{children}</AuthCtx.Provider>
}

export function useAuth(): Ctx {
  const c = useContext(AuthCtx)
  if (!c) throw new Error('useAuth treba použiť vnútri AuthProvider.')
  return c
}

/** Prihlásený zamestnanec ako text do auditu. */
export function menoAktora(u: StaffUser | null): string {
  return u ? `${u.meno} ${u.priezvisko}` : 'Neznámy používateľ'
}
