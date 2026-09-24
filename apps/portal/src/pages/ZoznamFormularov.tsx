import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { Alert, Button, Card, EmptyState, Field, Input, PageHeader, Select } from '@obec/ui'
import { formatEur, formsForTenant, type FormSchema } from '@obec/core'
import { useTenant } from '../app/tenant'
import { useAuth } from '../app/auth'

export function ZoznamFormularov() {
  const { tenant } = useTenant()
  const { obcan } = useAuth()
  const [hladat, setHladat] = useState('')
  const [kategoria, setKategoria] = useState('')

  const formulare = useMemo(
    () => formsForTenant(tenant.povoleneFormulare),
    [tenant.povoleneFormulare],
  )

  const kategorie = useMemo(
    () => Array.from(new Set(formulare.map((f) => f.kategoria))).sort((a, b) => a.localeCompare(b, 'sk')),
    [formulare],
  )

  const vyfiltrovane = useMemo(() => {
    const dopyt = hladat.trim().toLowerCase()
    return formulare.filter((f) => {
      const zhodaKategorie = !kategoria || f.kategoria === kategoria
      const zhodaDopytu =
        !dopyt ||
        f.nazov.toLowerCase().includes(dopyt) ||
        f.kratkyPopis.toLowerCase().includes(dopyt)
      return zhodaKategorie && zhodaDopytu
    })
  }, [formulare, hladat, kategoria])

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        nadpis="Formuláre"
        popis="Vyberte si žiadosť, ktorú chcete podať na obecný úrad."
      />

      {!obcan ? (
        <Alert ton="info" nadpis="Prihláste sa a ušetrite čas">
          <p>
            Po prihlásení vyplníme vaše osobné údaje a údaje o nehnuteľnosti za vás.{' '}
            <Link to="/prihlasenie" className="font-medium text-primary underline underline-offset-4">
              Prejsť na prihlásenie
            </Link>
          </p>
        </Alert>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-[2fr,1fr]">
        <Field label="Vyhľadať formulár" htmlFor="hladat-formular">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint"
              aria-hidden="true"
            />
            <Input
              id="hladat-formular"
              type="search"
              value={hladat}
              onChange={(e) => setHladat(e.target.value)}
              placeholder="Napríklad vjazd alebo daň"
              className="pl-9"
            />
          </div>
        </Field>
        <Field label="Kategória" htmlFor="filter-kategoria">
          <Select
            id="filter-kategoria"
            value={kategoria}
            onChange={(e) => setKategoria(e.target.value)}
          >
            <option value="">Všetky kategórie</option>
            {kategorie.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <p className="sr-only" aria-live="polite">
        {vyfiltrovane.length === 0
          ? 'Nenašli sme žiadny formulár.'
          : `Zobrazujeme ${vyfiltrovane.length} formulárov.`}
      </p>

      {vyfiltrovane.length === 0 ? (
        <EmptyState
          nadpis="Nenašli sme žiadny formulár"
          popis="Skúste zmeniť hľadaný výraz alebo zrušte filter kategórie."
          akcia={
            <Button
              variant="secondary"
              onClick={() => {
                setHladat('')
                setKategoria('')
              }}
            >
              Zrušiť filter
            </Button>
          }
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {vyfiltrovane.map((f) => (
            <FormularKarta key={f.id} schema={f} />
          ))}
        </ul>
      )}
    </div>
  )
}

function FormularKarta({ schema }: { schema: FormSchema }) {
  const navigate = useNavigate()
  const povinnePrilohy = schema.prilohy.filter((p) => p.povinna)
  const nepovinnePrilohy = schema.prilohy.filter((p) => !p.povinna)

  return (
    <Card as="li" className="flex flex-col gap-3 p-5">
      <div>
        <h2 className="text-lg font-semibold">{schema.nazov}</h2>
        <p className="mt-1 text-sm text-ink-muted">{schema.kratkyPopis}</p>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-muted">
        <span>{schema.poplatokEur > 0 ? `Poplatok ${formatEur(schema.poplatokEur)}` : 'Bez poplatku'}</span>
        <span>Vyplnenie približne {schema.odhadovanyCasMin} minút</span>
      </div>

      {schema.prilohy.length > 0 ? (
        <div className="text-sm">
          <p className="font-medium text-ink">Potrebné prílohy</p>
          <ul className="mt-1 list-inside list-disc text-ink-muted">
            {povinnePrilohy.map((p) => (
              <li key={p.id}>{p.nazov}</li>
            ))}
            {nepovinnePrilohy.map((p) => (
              <li key={p.id}>{p.nazov} (nepovinná)</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-auto pt-2">
        <Button
          className="w-full sm:w-auto"
          onClick={() => navigate(`/formular/${schema.id}`)}
        >
          Vyplniť žiadosť
        </Button>
      </div>
    </Card>
  )
}
