import { useRef, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Alert, Button, Card, ErrorSummary, Field, Input, useToast } from '@obec/ui'
import { DataError, DEMO_UCTY } from '@obec/core'
import { useAuth } from '../app/auth'
import { useTenant } from '../app/tenant'

const schema = z.object({
  email: z.string().min(1, 'Zadajte e-mail.').email('Zadajte e-mail v tvare meno@domena.sk.'),
  heslo: z.string().min(1, 'Zadajte heslo.'),
})

type Hodnoty = z.infer<typeof schema>

interface LocationState {
  odkial?: string
}

export function Prihlasenie() {
  const { uzivatel, nacitavame, prihlasit } = useAuth()
  const { tenant } = useTenant()
  const navigate = useNavigate()
  const location = useLocation()
  const [chybaPrihlasenia, setChybaPrihlasenia] = useState<string | null>(null)
  const formularRef = useRef<HTMLFormElement>(null)
  const odoslatRef = useRef<HTMLButtonElement>(null)
  const { oznam } = useToast()

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<Hodnoty>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', heslo: '' },
  })

  const chyby = Object.entries(errors).map(([kluc, chyba]) => ({
    fieldId: kluc,
    label: kluc === 'email' ? 'E-mail' : 'Heslo',
    sprava: (chyba?.message as string) ?? 'Skontrolujte pole.',
  }))

  if (!nacitavame && uzivatel) {
    return <Navigate to="/podania" replace />
  }

  const onOdoslat = handleSubmit(async (hodnoty) => {
    setChybaPrihlasenia(null)
    try {
      await prihlasit(hodnoty.email, hodnoty.heslo)
      const state = location.state as LocationState | null
      navigate(state?.odkial ?? '/podania')
    } catch (e) {
      if (e instanceof DataError) {
        setChybaPrihlasenia(e.message)
      } else {
        setChybaPrihlasenia('Prihlásenie sa nepodarilo. Skúste to prosím znova.')
      }
    }
  })

  function predvyplnitDemo() {
    setValue('email', DEMO_UCTY.urad.email, { shouldValidate: true })
    setValue('heslo', DEMO_UCTY.urad.heslo, { shouldValidate: true })
    // Formulár býva mimo obrazovky, preto naň posunieme pohľad
    // a potvrdíme doplnenie, inak to vyzerá, že sa nestalo nič.
    formularRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' })
    window.setTimeout(() => odoslatRef.current?.focus(), 350)
    oznam('Demo prístup sme vyplnili, stačí sa prihlásiť.', 'uspech')
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="flex w-full max-w-md flex-col gap-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <img
            src={`${import.meta.env.BASE_URL}${tenant.branding.erbSrc}`}
            alt={tenant.branding.erbAlt}
            className="h-14 w-auto"
            width={426}
            height={512}
          />
          <div>
            <p className="text-sm font-medium text-ink-muted">{tenant.nazov}</p>
            <h1 className="text-2xl font-semibold text-ink">CRM obecného úradu</h1>
          </div>
        </div>

        <Card className="p-6 sm:p-8">
          <form ref={formularRef} className="flex flex-col gap-4" onSubmit={onOdoslat} noValidate>
            <ErrorSummary chyby={chyby} />

            {chybaPrihlasenia ? (
              <Alert ton="chyba">
                <p>{chybaPrihlasenia}</p>
              </Alert>
            ) : null}

            <div id="pole-email">
              <Field label="E-mail" required error={errors.email?.message}>
                <Input type="email" autoComplete="email" {...register('email')} />
              </Field>
            </div>

            <div id="pole-heslo">
              <Field label="Heslo" required error={errors.heslo?.message}>
                <Input type="password" autoComplete="current-password" {...register('heslo')} />
              </Field>
            </div>

            <Button ref={odoslatRef} type="submit" pracuje={isSubmitting} className="mt-2 w-full">
              Prihlásiť sa
            </Button>
          </form>
        </Card>

        <Alert ton="info" nadpis="Demo prístup">
          <p>
            V ukážkovej verzii sa môžete prihlásiť ako demo zamestnanec úradu: {DEMO_UCTY.urad.email},
            heslo {DEMO_UCTY.urad.heslo}.
          </p>
          <Button variant="secondary" className="mt-3 w-full sm:w-auto" onClick={predvyplnitDemo}>
            Predvyplniť demo prístup
          </Button>
        </Alert>
      </div>
    </div>
  )
}
