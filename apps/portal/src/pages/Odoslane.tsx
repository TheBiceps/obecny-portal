import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Alert, Button, Card, EmptyState, Spinner, useToast } from '@obec/ui'
import {
  formatDate,
  formatEur,
  getFormSchema,
  STAV_LABEL,
  type FormSchema,
  type Submission,
} from '@obec/core'
import { useTenant } from '../app/tenant'
import { useAuth } from '../app/auth'

/** Generátor PDF načítame až pri stiahnutí, aby sa nenačítaval pri štarte aplikácie. */
async function stiahniPdfPodania(
  ...argumenty: Parameters<typeof import('@obec/pdf').stiahniPdfPodania>
) {
  const modul = await import('@obec/pdf')
  return modul.stiahniPdfPodania(...argumenty)
}

export function Odoslane() {
  const { podanieId } = useParams()
  const { tenant, data } = useTenant()
  const { obcan } = useAuth()
  const { oznam } = useToast()
  const navigate = useNavigate()
  const [podanie, setPodanie] = useState<Submission | null | undefined>(undefined)
  const [stahujeme, setStahujeme] = useState(false)

  useEffect(() => {
    let zrusene = false
    if (!podanieId) {
      setPodanie(null)
      return
    }
    data.getSubmission(podanieId).then((p) => {
      if (!zrusene) setPodanie(p)
    })
    return () => {
      zrusene = true
    }
  }, [data, podanieId])

  if (podanie === undefined) {
    return (
      <div className="py-16 text-center">
        <Spinner popis="Načítavame potvrdenie" />
      </div>
    )
  }

  if (!podanie) {
    return (
      <EmptyState
        nadpis="Toto podanie sme nenašli"
        popis="Overte si prosím odkaz, alebo si vyberte formulár znova."
        akcia={<Button onClick={() => navigate('/formulare')}>Prejsť na formuláre</Button>}
      />
    )
  }

  const schema: FormSchema | undefined = getFormSchema(podanie.formId)

  async function stiahniKopiu() {
    if (!schema || !podanie) return
    setStahujeme(true)
    try {
      await stiahniPdfPodania(
        { schema, podanie, tenant, zakladnaUrl: import.meta.env.BASE_URL },
        `${schema.pdfNazov}-${podanie.cisloPodania}`,
      )
    } catch {
      oznam('PDF sa nepodarilo pripraviť. Skúste to prosím znova.', 'chyba')
    } finally {
      setStahujeme(false)
    }
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <Alert ton="uspech" nadpis="Žiadosť bola prijatá">
        <p>Vašu žiadosť sme úspešne zaevidovali a úrad ju čoskoro spracuje.</p>
      </Alert>

      <Card className="flex flex-col items-center gap-2 p-6 text-center">
        <p className="text-sm text-ink-muted">Číslo podania</p>
        <p className="text-3xl font-semibold tracking-wide text-primary sm:text-4xl">
          {podanie.cisloPodania}
        </p>
        <p className="max-w-prose text-sm text-ink-muted">
          Toto číslo si prosím poznačte. Budete ho potrebovať pri komunikácii s úradom.
        </p>
      </Card>

      <Card className="flex flex-col gap-3 p-5 sm:p-6">
        <h2 className="text-lg font-semibold">Zhrnutie</h2>
        <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-ink-faint">Formulár</dt>
            <dd className="mt-0.5 text-ink">{podanie.formNazov}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-ink-faint">
              Dátum prijatia
            </dt>
            <dd className="mt-0.5 text-ink">{formatDate(podanie.prijateAt)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-ink-faint">Stav</dt>
            <dd className="mt-0.5 text-ink">{STAV_LABEL[podanie.status] ?? podanie.status}</dd>
          </div>
        </dl>
      </Card>

      {schema ? (
        <Card className="flex flex-col gap-3 p-5 sm:p-6">
          <h2 className="text-lg font-semibold">Čo bude nasledovať</h2>
          <div className="flex flex-col gap-2 text-sm text-ink-muted">
            {schema.poplatokEur > 0 ? (
              <p>
                Za vybavenie žiadosti je potrebné uhradiť správny poplatok vo výške{' '}
                {formatEur(schema.poplatokEur)}
                {schema.poplatokPoznamka ? `. ${schema.poplatokPoznamka}` : '.'}
              </p>
            ) : null}
            {schema.infoPoznamka ? <p>{schema.infoPoznamka}</p> : null}
            <div>
              <p className="font-medium text-ink">Kde a kedy si potvrdenie prevziať</p>
              <p>
                {tenant.urad.nazovUradu}, {tenant.urad.ulica}, {tenant.urad.psc} {tenant.urad.obec}
              </p>
              <ul className="mt-1 list-inside list-disc">
                {tenant.urad.strankoveHodiny.map((h) => (
                  <li key={h.den}>
                    {h.den}: {h.cas}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button pracuje={stahujeme} pracujeText="Pripravujeme PDF…" onClick={stiahniKopiu}>
          Stiahnuť kópiu v PDF
        </Button>
        {obcan ? (
          <Link to="/moje-podania" className="font-medium text-primary underline underline-offset-4">
            Moje podania
          </Link>
        ) : null}
        <Link to="/formulare" className="font-medium text-primary underline underline-offset-4">
          Späť na formuláre
        </Link>
      </div>
    </div>
  )
}
