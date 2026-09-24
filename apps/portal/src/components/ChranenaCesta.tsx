import { Navigate, useLocation } from 'react-router-dom'
import { Spinner } from '@obec/ui'
import { useAuth } from '../app/auth'

export function ChranenaCesta({ children }: { children: React.ReactNode }) {
  const { obcan, nacitavame } = useAuth()
  const location = useLocation()

  if (nacitavame) {
    return (
      <div className="py-16 text-center">
        <Spinner popis="Načítavame vaše konto" />
      </div>
    )
  }
  if (!obcan) {
    return <Navigate to="/prihlasenie" replace state={{ odkial: location.pathname }} />
  }
  return <>{children}</>
}
