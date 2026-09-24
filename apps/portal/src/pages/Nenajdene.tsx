import { Link } from 'react-router-dom'
import { EmptyState } from '@obec/ui'

export function Nenajdene() {
  return (
    <EmptyState
      nadpis="Stránku sme nenašli"
      popis="Odkaz je možno zastaraný alebo obsahuje preklep. Skúste prosím začať od zoznamu formulárov."
      akcia={
        <Link
          to="/formulare"
          className="inline-flex min-h-[44px] items-center rounded-control bg-primary px-4 font-medium text-white hover:bg-primary-dark"
        >
          Prejsť na formuláre
        </Link>
      }
    />
  )
}
