import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Alert, Button, Card, ErrorSummary, Field, Input } from '@obec/ui'
import { DataError } from '@obec/core'
import { useTenant } from '../app/tenant'

const schema = z.object({
  email: z.string().min(1, 'Zadajte e-mail.').email('Zadajte e-mail v tvare meno@domena.sk.'),
})

type Hodnoty = z.infer<typeof schema>

export function ZabudnuteHeslo() {
  const { data } = useTenant()
  const [odoslane, setOdoslane] = useState(false)
  const [chybaOdoslania, setChybaOdoslania] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Hodnoty>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  })

  const chyby = Object.entries(errors).map(([kluc, chyba]) => ({
    fieldId: kluc,
    label: 'E-mail',
    sprava: (chyba?.message as string) ?? 'Skontrolujte pole.',
  }))

  const onOdoslat = handleSubmit(async (hodnoty) => {
    setChybaOdoslania(null)
    try {
      await data.poziadatOObnovuHesla(hodnoty.email)
      setOdoslane(true)
    } catch (e) {
      if (e instanceof DataError) {
        setChybaOdoslania(e.message)
      } else {
        setChybaOdoslania('Žiadosť sa nepodarilo odoslať. Skúste to prosím znova.')
      }
    }
  })

  return (
    <div className="mx-auto w-full max-w-md">
      <Card className="p-6 sm:p-8">
        <h1 className="text-2xl font-semibold text-ink">Zabudnuté heslo</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Zadajte e-mail, na ktorý je vaše konto zaregistrované.
        </p>

        {odoslane ? (
          <Alert ton="uspech" className="mt-6">
            <p>
              Ak k e-mailu existuje konto, poslali sme naň odkaz na obnovu hesla. V ukážkovej verzii
              sa e-maily neodosielajú.
            </p>
          </Alert>
        ) : (
          <form className="mt-6 flex flex-col gap-4" onSubmit={onOdoslat} noValidate>
            <ErrorSummary chyby={chyby} />

            {chybaOdoslania ? (
              <Alert ton="chyba">
                <p>{chybaOdoslania}</p>
              </Alert>
            ) : null}

            <div id="pole-email">
              <Field label="E-mail" required error={errors.email?.message}>
                <Input type="email" autoComplete="email" {...register('email')} />
              </Field>
            </div>

            <Button type="submit" pracuje={isSubmitting} className="mt-2 w-full">
              Odoslať odkaz na obnovu
            </Button>
          </form>
        )}

        <div className="mt-6 border-t border-line pt-6 text-sm">
          <Link to="/prihlasenie" className="font-medium text-primary underline underline-offset-4">
            Späť na prihlásenie
          </Link>
        </div>
      </Card>
    </div>
  )
}
