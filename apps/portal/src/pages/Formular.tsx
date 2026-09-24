import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Alert, Badge, Card, Spinner } from '@obec/ui'
import {
  formatEur,
  getFormSchema,
  type AttachmentMeta,
  type FormValues,
  type Property,
} from '@obec/core'
import { useTenant } from '../app/tenant'
import { useAuth } from '../app/auth'
import { FormRenderer } from '../form/FormRenderer'
import { Nenajdene } from './Nenajdene'

export function Formular() {
  const { formId } = useParams()
  const { tenant, data } = useTenant()
  const { obcan } = useAuth()
  const navigate = useNavigate()
  const [nehnutelnosti, setNehnutelnosti] = useState<Property[]>([])
  const [nacitavame, setNacitavame] = useState(true)

  const schema = formId ? getFormSchema(formId) : undefined
  const povoleny = schema ? tenant.povoleneFormulare.includes(schema.id) : false

  useEffect(() => {
    let zrusene = false
    if (!obcan) {
      setNehnutelnosti([])
      setNacitavame(false)
      return
    }
    setNacitavame(true)
    data.listProperties(obcan.id).then((n) => {
      if (!zrusene) {
        setNehnutelnosti(n)
        setNacitavame(false)
      }
    })
    return () => {
      zrusene = true
    }
  }, [data, obcan])

  if (!schema || !povoleny) return <Nenajdene />

  if (nacitavame) {
    return (
      <div className="py-16 text-center">
        <Spinner popis="Pripravujeme formulár" />
      </div>
    )
  }

  async function odosli(
    values: FormValues,
    prilohy: AttachmentMeta[],
    propertyId: string | null,
  ) {
    if (!schema) return
    const meno = [values.titul, values.meno, values.priezvisko]
      .filter((x) => typeof x === 'string' && x.trim())
      .join(' ')
      .trim()
    const nazovFirmy = typeof values.nazovFirmy === 'string' ? values.nazovFirmy.trim() : ''
    const podanie = await data.createSubmission({
      formId: schema.id,
      formNazov: schema.nazov,
      residentId: obcan?.id ?? null,
      ziadatelMeno: nazovFirmy || meno || 'Neuvedený žiadateľ',
      ziadatelEmail: String(values.email ?? ''),
      propertyId,
      data: values,
      prilohy,
    })
    navigate(`/odoslane/${podanie.id}`)
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <nav aria-label="Omrvinková navigácia" className="text-sm">
        <Link to="/formulare" className="text-primary underline underline-offset-4">
          Formuláre
        </Link>
        <span className="mx-2 text-ink-faint" aria-hidden="true">
          ›
        </span>
        <span className="text-ink-muted">{schema.nazov}</span>
      </nav>

      <div>
        <h1 className="text-2xl font-semibold sm:text-3xl">{schema.nazov}</h1>
        <p className="mt-2 max-w-prose text-ink-muted">{schema.kratkyPopis}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge ton="primary">
            {schema.poplatokEur > 0 ? `Poplatok ${formatEur(schema.poplatokEur)}` : 'Bez poplatku'}
          </Badge>
          <Badge>Vyplnenie približne {schema.odhadovanyCasMin} minút</Badge>
          <Badge>Podľa {schema.pravnyZaklad}</Badge>
        </div>
      </div>

      {obcan && nehnutelnosti.length === 0 ? (
        <Alert ton="info" nadpis="Pridajte si nehnuteľnosť">
          <p>
            V profile si môžete uložiť dom, byt alebo pozemok. Pri ďalších žiadostiach
            potom údaje o parcele doplníme za vás.{' '}
            <Link to="/profil" className="font-medium text-primary underline underline-offset-4">
              Prejsť do profilu
            </Link>
          </p>
        </Alert>
      ) : null}

      <Card className="p-5 sm:p-6">
        <h2 className="text-lg font-semibold">Čo budete potrebovať</h2>
        <ul className="mt-2 list-inside list-disc text-ink-muted">
          {schema.prilohy.map((p) => (
            <li key={p.id}>
              {p.nazov}
              {p.povinna ? '' : ' (nepovinné)'}
            </li>
          ))}
        </ul>
      </Card>

      <FormRenderer
        schema={schema}
        tenant={tenant}
        obcan={obcan}
        nehnutelnosti={nehnutelnosti}
        onOdoslat={odosli}
      />
    </div>
  )
}
