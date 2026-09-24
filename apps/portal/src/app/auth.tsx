import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { Resident } from '@obec/core'
import { useTenant } from './tenant'

const KLUC = 'obec.portal.relacia'

interface Ctx {
  obcan: Resident | null
  nacitavame: boolean
  prihlasit: (email: string, heslo: string) => Promise<void>
  odhlasit: () => void
  obnovit: () => Promise<void>
  nastavObcana: (r: Resident) => void
}

const AuthCtx = createContext<Ctx | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data } = useTenant()
  const [obcan, setObcan] = useState<Resident | null>(null)
  const [nacitavame, setNacitavame] = useState(true)

  useEffect(() => {
    const id = localStorage.getItem(KLUC)
    if (!id) {
      setNacitavame(false)
      return
    }
    data
      .getResident(id)
      .then((r) => setObcan(r))
      .finally(() => setNacitavame(false))
  }, [data])

  const prihlasit = useCallback(
    async (email: string, heslo: string) => {
      const r = await data.prihlasitObcana(email, heslo)
      localStorage.setItem(KLUC, r.id)
      setObcan(r)
    },
    [data],
  )

  const odhlasit = useCallback(() => {
    localStorage.removeItem(KLUC)
    setObcan(null)
  }, [])

  const obnovit = useCallback(async () => {
    if (!obcan) return
    const r = await data.getResident(obcan.id)
    setObcan(r)
  }, [data, obcan])

  const nastavObcana = useCallback((r: Resident) => {
    localStorage.setItem(KLUC, r.id)
    setObcan(r)
  }, [])

  const hodnota = useMemo(
    () => ({ obcan, nacitavame, prihlasit, odhlasit, obnovit, nastavObcana }),
    [obcan, nacitavame, prihlasit, odhlasit, obnovit, nastavObcana],
  )

  return <AuthCtx.Provider value={hodnota}>{children}</AuthCtx.Provider>
}

export function useAuth(): Ctx {
  const c = useContext(AuthCtx)
  if (!c) throw new Error('useAuth treba použiť vnútri AuthProvider.')
  return c
}
