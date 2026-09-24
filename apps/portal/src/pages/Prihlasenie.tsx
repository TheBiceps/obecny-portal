import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Landmark, ShieldCheck } from 'lucide-react'
import { Alert, Badge, Button, Card, ErrorSummary, Field, Input } from '@obec/ui'
import { DataError, DEMO_UCTY } from '@obec/core'
import { useAuth } from '../app/auth'

const schema = z.object({
  email: z.string().min(1, 'Zadajte e-mail.').email('Zadajte e-mail v tvare meno@domena.sk.'),
  heslo: z.string().min(1, 'Zadajte heslo.'),
})

type Hodnoty = z.infer<typeof schema>

interface LocationState {
  odkial?: string
}

export function Prihlasenie() {
  const { prihlasit } = useAuth()
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

  const onOdoslat = handleSubmit(async (hodnoty) => {
    setChybaPrihlasenia(null)
    try {
      await prihlasit(hodnoty.email, hodnoty.heslo)
      const state = location.state as LocationState | null
      navigate(state?.odkial ?? '/formulare')
    } catch (e) {
      if (e instanceof DataError) {
        setChybaPrihlasenia(e.message)
      } else {
        setChybaPrihlasenia('Prihlásenie sa nepodarilo. Skúste to prosím znova.')
      }
    }
  })

  function predvyplnitDemo() {
    setValue('email', DEMO_UCTY.obcan.email, { shouldValidate: true })
    setValue('heslo', DEMO_UCTY.obcan.heslo, { shouldValidate: true })
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6">
      <Card className="p-6 sm:p-8">
        <h1 className="text-2xl font-semibold text-ink">Prihlásenie</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Prihláste sa e-mailom a heslom, aby ste mohli sledovať svoje podania.
        </p>

        <form className="mt-6 flex flex-col gap-4" onSubmit={onOdoslat} noValidate>
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

        <div className="mt-6 flex flex-col gap-2 border-t border-line pt-6 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-ink-muted">Nemáte konto?</span>
            <Link to="/registracia" className="font-medium text-primary underline underline-offset-4">
              Zaregistrovať sa
            </Link>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-ink-muted">Zabudli ste heslo?</span>
            <Link to="/zabudnute-heslo" className="font-medium text-primary underline underline-offset-4">
              Obnoviť heslo
            </Link>
          </div>
        </div>
      </Card>

      <Card className="p-6 sm:p-8">
        <h2 className="text-sm font-semibold text-ink">Prihlásenie cez iného poskytovateľa</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Prihlásenie cez týchto poskytovateľov pripravujeme, zatiaľ nie je dostupné.
        </p>
        <div className="mt-4 flex flex-col gap-2">
          <button
            type="button"
            disabled
            aria-disabled="true"
            className="flex min-h-[44px] cursor-not-allowed items-center justify-between gap-3 rounded-control border border-line bg-canvas px-4 text-sm font-medium text-ink-faint"
          >
            <span className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              Slovensko.sk (eID)
            </span>
            <Badge ton="neutral">Čoskoro</Badge>
          </button>
          <button
            type="button"
            disabled
            aria-disabled="true"
            className="flex min-h-[44px] cursor-not-allowed items-center justify-between gap-3 rounded-control border border-line bg-canvas px-4 text-sm font-medium text-ink-faint"
          >
            <span className="flex items-center gap-2">
              <Landmark className="h-4 w-4" aria-hidden="true" />
              Google
            </span>
            <Badge ton="neutral">Čoskoro</Badge>
          </button>
          <button
            type="button"
            disabled
            aria-disabled="true"
            className="flex min-h-[44px] cursor-not-allowed items-center justify-between gap-3 rounded-control border border-line bg-canvas px-4 text-sm font-medium text-ink-faint"
          >
            <span className="flex items-center gap-2">
              <Landmark className="h-4 w-4" aria-hidden="true" />
              Apple
            </span>
            <Badge ton="neutral">Čoskoro</Badge>
          </button>
        </div>
      </Card>

      <Alert ton="info" nadpis="Demo prístup">
        <p>
          V ukážkovej verzii sa môžete prihlásiť ako demo občan: {DEMO_UCTY.obcan.email}, heslo{' '}
          {DEMO_UCTY.obcan.heslo}.
        </p>
        <Button variant="secondary" size="sm" className="mt-3" onClick={predvyplnitDemo}>
          Predvyplniť demo prístup
        </Button>
      </Alert>
    </div>
  )
}
