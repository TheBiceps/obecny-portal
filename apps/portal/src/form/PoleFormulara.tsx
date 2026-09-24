import {
  Checkbox,
  Field as Obal,
  Input,
  RadioGroup,
  Select,
  Textarea,
} from '@obec/ui'
import {
  TYP_NEHNUTELNOSTI_LABEL,
  fieldOptions,
  type Field,
  type Property,
  type TenantConfig,
} from '@obec/core'
import { SuborPole } from './SuborPole'

export interface PoleProps {
  pole: Field
  hodnota: unknown
  chyba?: string
  doplnene?: boolean
  tenant: TenantConfig
  nehnutelnosti: Property[]
  onZmena: (v: unknown) => void
  onVyberNehnutelnosti: (id: string) => void
}

export function PoleFormulara(p: PoleProps) {
  const { pole, hodnota, chyba, doplnene, tenant, onZmena } = p
  const idPola = `pole-${pole.id}`

  if (pole.type === 'info') {
    return (
      <div className="rounded-control border border-line bg-canvas p-4 text-sm text-ink-muted">
        <p className="mb-1 font-medium text-ink">{pole.label}</p>
        <p>{pole.text}</p>
      </div>
    )
  }

  if (pole.type === 'propertyPicker') {
    return (
      <VyberNehnutelnosti
        pole={pole}
        nehnutelnosti={p.nehnutelnosti}
        hodnota={String(hodnota ?? '')}
        onVyber={p.onVyberNehnutelnosti}
      />
    )
  }

  if (pole.type === 'checkbox' || pole.type === 'consent') {
    return (
      <Checkbox
        id={idPola}
        checked={Boolean(hodnota)}
        onChange={(e) => onZmena(e.target.checked)}
        error={chyba}
        helper={pole.helper}
        label={
          pole.text ? (
            <span>
              <span className="mb-1 block font-medium">{pole.label}</span>
              <span className="block text-ink-muted">{pole.text}</span>
            </span>
          ) : (
            pole.label
          )
        }
      />
    )
  }

  if (pole.type === 'radio') {
    return (
      <div id={idPola} tabIndex={-1}>
        <RadioGroup
          legend={pole.label}
          name={pole.id}
          required={Boolean(pole.required)}
          helper={pole.helper}
          error={chyba}
          value={String(hodnota ?? '')}
          options={fieldOptions(pole, tenant).map((o) => ({
            value: o.value,
            label: o.label,
            helper: 'helper' in o ? (o as { helper?: string }).helper : undefined,
          }))}
          onChange={onZmena}
        />
      </div>
    )
  }

  if (pole.type === 'address') {
    const a = (hodnota ?? {}) as Record<string, string>
    const uprav = (kluc: string, v: string) => onZmena({ ...a, [kluc]: v })
    return (
      <fieldset className="rounded-control border border-line p-4">
        <legend className="px-1 text-sm font-medium text-ink">
          {pole.label}
          {pole.required ? (
            <span className="ml-1 text-danger" aria-hidden="true">
              *
            </span>
          ) : null}
        </legend>
        {pole.helper ? <p className="mb-3 text-sm text-ink-muted">{pole.helper}</p> : null}
        <div id={idPola} tabIndex={-1} className="grid gap-4 sm:grid-cols-2">
          <Obal label="Ulica" required={Boolean(pole.required)} className="sm:col-span-2">
            <Input
              value={a.ulica ?? ''}
              onChange={(e) => uprav('ulica', e.target.value)}
              autoComplete="address-line1"
              doplnene={doplnene}
            />
          </Obal>
          <Obal label="Súpisné číslo">
            <Input
              value={a.supisneCislo ?? ''}
              onChange={(e) => uprav('supisneCislo', e.target.value)}
            />
          </Obal>
          <Obal label="Orientačné číslo">
            <Input
              value={a.orientacneCislo ?? ''}
              onChange={(e) => uprav('orientacneCislo', e.target.value)}
            />
          </Obal>
          <Obal label="Obec" required={Boolean(pole.required)}>
            <Input
              value={a.obec ?? ''}
              onChange={(e) => uprav('obec', e.target.value)}
              autoComplete="address-level2"
            />
          </Obal>
          <Obal label="PSČ" required={Boolean(pole.required)} helper="Päť číslic, napríklad 900 27.">
            <Input
              value={a.psc ?? ''}
              onChange={(e) => uprav('psc', e.target.value)}
              inputMode="numeric"
              autoComplete="postal-code"
            />
          </Obal>
        </div>
        {chyba ? (
          <p className="mt-2 text-sm font-medium text-danger" role="alert">
            {chyba}
          </p>
        ) : null}
      </fieldset>
    )
  }

  if (pole.type === 'file') {
    return (
      <Obal
        label={pole.label}
        required={Boolean(pole.required)}
        helper={pole.helper}
        error={chyba}
        htmlFor={idPola}
      >
        <SuborPole
          pole={pole}
          hodnota={Array.isArray(hodnota) ? hodnota : []}
          onZmena={onZmena}
        />
      </Obal>
    )
  }

  if (pole.type === 'select') {
    return (
      <Obal
        label={pole.label}
        required={Boolean(pole.required)}
        helper={pole.helper}
        error={chyba}
        doplnene={doplnene}
        htmlFor={idPola}
      >
        <Select
          id={idPola}
          value={String(hodnota ?? '')}
          doplnene={doplnene}
          onChange={(e) => onZmena(e.target.value)}
        >
          <option value="">Vyberte možnosť</option>
          {fieldOptions(pole, tenant).map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
      </Obal>
    )
  }

  if (pole.type === 'textarea') {
    return (
      <Obal
        label={pole.label}
        required={Boolean(pole.required)}
        helper={pole.helper}
        error={chyba}
        htmlFor={idPola}
      >
        <Textarea
          id={idPola}
          value={String(hodnota ?? '')}
          maxLength={pole.maxLength}
          placeholder={pole.placeholder}
          onChange={(e) => onZmena(e.target.value)}
        />
      </Obal>
    )
  }

  const typVstupu =
    pole.type === 'date' ? 'date' : pole.type === 'number' ? 'number' : 'text'

  return (
    <Obal
      label={pole.label}
      required={Boolean(pole.required)}
      helper={pole.helper}
      error={chyba}
      doplnene={doplnene}
      htmlFor={idPola}
    >
      <Input
        id={idPola}
        type={typVstupu}
        inputMode={pole.type === 'year' || pole.type === 'number' ? 'numeric' : undefined}
        maxLength={pole.type === 'year' ? 4 : pole.maxLength}
        placeholder={pole.placeholder}
        value={String(hodnota ?? '')}
        doplnene={doplnene}
        onChange={(e) => onZmena(e.target.value)}
      />
    </Obal>
  )
}

function VyberNehnutelnosti({
  pole,
  nehnutelnosti,
  hodnota,
  onVyber,
}: {
  pole: Field
  nehnutelnosti: Property[]
  hodnota: string
  onVyber: (id: string) => void
}) {
  if (nehnutelnosti.length === 0) return null
  return (
    <fieldset className="rounded-control border border-primary/30 bg-primary-soft p-4">
      <legend className="px-1 text-sm font-medium text-primary-dark">{pole.label}</legend>
      {pole.helper ? (
        <p className="mb-3 text-sm text-ink-muted">{pole.helper}</p>
      ) : null}
      <div className="flex flex-col gap-2">
        {nehnutelnosti.map((n) => {
          const id = `nehnutelnost-${n.id}`
          return (
            <label
              key={n.id}
              htmlFor={id}
              className={`flex min-h-[44px] cursor-pointer items-start gap-3 rounded-control border bg-surface p-3 ${
                hodnota === n.id ? 'border-primary' : 'border-line'
              }`}
            >
              <input
                id={id}
                type="radio"
                name={pole.id}
                checked={hodnota === n.id}
                onChange={() => onVyber(n.id)}
                className="mt-0.5 h-5 w-5 cursor-pointer accent-primary"
              />
              <span className="min-w-0">
                <span className="block text-sm font-medium text-ink">
                  {n.nazov?.trim() || TYP_NEHNUTELNOSTI_LABEL[n.typ]}
                </span>
                <span className="block text-sm text-ink-muted">
                  {n.adresa.ulica} {n.adresa.supisneCislo ?? ''}, parcela {n.parcelaCislo},
                  LV {n.cisloLv}
                </span>
              </span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
