import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Alert, Button, Card, ErrorSummary, Field, Input } from '@obec/ui'
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
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="flex w-full max-w-md flex-col gap-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <img
            src={`${import.meta.env.BASE_URL}${tenant.branding.erbSrc}`}
            alt={tenant.branding.erbAlt}
            className="h-14 w-auto"
            width={44}
            height={56}
          />
          <div>
            <p className="text-sm font-medium text-ink-muted">{tenant.nazov}</p>
            <h1 className="text-2xl font-semibold text-ink">CRM obecného úradu</h1>
          </div>
        </div>

        <Card className="p-6 sm:p-8">
          <form className="flex flex-col gap-4" onSubmit={onOdoslat} noValidate>
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

            <Button type="submit" pracuje={isSubmitting} className="mt-2 w-full">
              Prihlásiť sa
            </Button>
          </form>
        </Card>

        <Alert ton="info" nadpis="Demo prístup">
          <p>
            V ukážkovej verzii sa môžete prihlásiť ako demo zamestnanec úradu: {DEMO_UCTY.urad.email},
            heslo {DEMO_UCTY.urad.heslo}.
          </p>
          <Button variant="secondary" size="sm" className="mt-3" onClick={predvyplnitDemo}>
            Predvyplniť demo prístup
          </Button>
        </Alert>
      </div>
    </div>
  )
}
