import { useEffect, useState } from 'react'
import { useTenant } from './tenant'

/**
 * Sleduje zmeny v úložisku, ktoré urobila druhá aplikácia.
 * Vďaka tomu sa nové podanie z portálu objaví v CRM bez obnovenia stránky.
 */
export function useZmenyDat(): number {
  const { lokalny } = useTenant()
  const [verzia, setVerzia] = useState(0)

  useEffect(() => {
    return lokalny.onZmena(() => setVerzia((v) => v + 1))
  }, [lokalny])

  return verzia
}
