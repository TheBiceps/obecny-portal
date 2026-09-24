import { useRef, useState } from 'react'
import { Paperclip, Trash2 } from 'lucide-react'
import { Button, cn } from '@obec/ui'
import { formatVelkost, type AttachmentMeta, type Field } from '@obec/core'

const POVOLENE = ['application/pdf', 'image/png', 'image/jpeg']

function nahodneId() {
  return Math.random().toString(36).slice(2, 10)
}

export function SuborPole({
  pole,
  hodnota,
  onZmena,
  popisId,
}: {
  pole: Field
  hodnota: AttachmentMeta[]
  onZmena: (v: AttachmentMeta[]) => void
  popisId?: string
}) {
  const vstupRef = useRef<HTMLInputElement>(null)
  const [chyba, setChyba] = useState<string | null>(null)
  const maxMb = pole.maxVelkostMb ?? 5
  const maxPocet = pole.maxSuborov ?? 3

  async function pridaj(subory: FileList | null) {
    if (!subory?.length) return
    setChyba(null)
    const nove: AttachmentMeta[] = []
    for (const s of Array.from(subory)) {
      if (hodnota.length + nove.length >= maxPocet) {
        setChyba(`Nahrať môžete najviac ${maxPocet} súbory.`)
        break
      }
      if (!POVOLENE.includes(s.type)) {
        setChyba('Prijímame len súbory vo formáte PDF, JPG a PNG.')
        continue
      }
      if (s.size > maxMb * 1024 * 1024) {
        setChyba(`Súbor ${s.name} je väčší ako ${maxMb} MB.`)
        continue
      }
      const nahlad = s.type.startsWith('image/') ? await naDataUrl(s) : undefined
      nove.push({
        id: nahodneId(),
        fieldId: pole.id,
        nazovSuboru: s.name,
        velkostBajtov: s.size,
        typSuboru: s.type,
        nahlad,
      })
    }
    if (nove.length) onZmena([...hodnota, ...nove])
    if (vstupRef.current) vstupRef.current.value = ''
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        className={cn(
          'rounded-control border border-dashed p-4',
          chyba ? 'border-danger bg-danger-soft' : 'border-line bg-canvas',
        )}
      >
        <input
          ref={vstupRef}
          id={`pole-${pole.id}`}
          type="file"
          multiple={maxPocet > 1}
          accept=".pdf,.png,.jpg,.jpeg"
          aria-describedby={popisId}
          className="block w-full cursor-pointer text-sm file:mr-3 file:min-h-[40px] file:cursor-pointer file:rounded-control file:border-0 file:bg-primary file:px-4 file:text-sm file:font-medium file:text-white hover:file:bg-primary-dark"
          onChange={(e) => pridaj(e.target.files)}
        />
        <p className="mt-2 text-xs text-ink-muted">
          Formáty PDF, JPG a PNG. Najviac {maxPocet} súbory, každý do {maxMb} MB.
        </p>
      </div>

      {chyba ? (
        <p className="text-sm font-medium text-danger" role="alert">
          {chyba}
        </p>
      ) : null}

      {hodnota.length ? (
        <ul className="flex flex-col gap-2">
          {hodnota.map((s) => (
            <li
              key={s.id}
              className="flex items-center gap-3 rounded-control border border-line bg-surface p-2.5"
            >
              {s.nahlad ? (
                <img
                  src={s.nahlad}
                  alt=""
                  className="h-10 w-10 rounded object-cover"
                  aria-hidden="true"
                />
              ) : (
                <span className="flex h-10 w-10 items-center justify-center rounded bg-canvas">
                  <Paperclip className="h-4 w-4 text-ink-muted" aria-hidden="true" />
                </span>
              )}
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm text-ink">{s.nazovSuboru}</span>
                <span className="block text-xs text-ink-muted">
                  {formatVelkost(s.velkostBajtov)}
                </span>
              </span>
              <Button
                variant="ghost"
                size="sm"
                aria-label={`Odstrániť súbor ${s.nazovSuboru}`}
                onClick={() => onZmena(hodnota.filter((x) => x.id !== s.id))}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </Button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

function naDataUrl(s: File): Promise<string> {
  return new Promise((vyries) => {
    const c = new FileReader()
    c.onload = () => vyries(String(c.result))
    c.readAsDataURL(s)
  })
}
