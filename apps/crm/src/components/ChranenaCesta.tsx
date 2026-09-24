import { Navigate } from 'react-router-dom'
import { Spinner } from '@obec/ui'
import { useAuth } from '../app/auth'

export function ChranenaCesta({ children }: { children: React.ReactNode }) {
  const { uzivatel, nacitavame } = useAuth()
  if (nacitavame) {
    return (
      <div className="py-16 text-center">
        <Spinner popis="Overujeme prihlásenie" />
      </div>
    )
  }
  if (!uzivatel) return <Navigate to="/prihlasenie" replace />
  return <>{children}</>
}
