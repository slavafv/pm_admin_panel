import { useState } from 'react'
import { Button } from './primitives'

export interface FieldDef {
  key: string
  placeholder: string
  type?: 'text' | 'number' | 'select'
  options?: string[]
  required?: boolean
  width?: string
}

const baseInput = 'rounded-xl border border-line px-3 py-2 text-sm outline-none focus:border-navy'

/** Toggleable inline form for appending a row to a list. */
export function InlineAddForm({
  fields,
  addLabel = '＋ Add',
  onAdd,
}: {
  fields: FieldDef[]
  addLabel?: string
  onAdd: (values: Record<string, string>) => void
}) {
  const blank = () => Object.fromEntries(fields.map((f) => [f.key, f.type === 'select' ? f.options?.[0] ?? '' : '']))
  const [open, setOpen] = useState(false)
  const [vals, setVals] = useState<Record<string, string>>(blank())

  const valid = fields.every((f) => f.required === false || String(vals[f.key] ?? '').trim())

  function submit() {
    if (!valid) return
    onAdd(vals)
    setVals(blank())
    setOpen(false)
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-sm font-semibold text-navy hover:underline">
        {addLabel}
      </button>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {fields.map((f) =>
        f.type === 'select' ? (
          <select
            key={f.key}
            className={baseInput}
            value={vals[f.key]}
            onChange={(e) => setVals((v) => ({ ...v, [f.key]: e.target.value }))}
          >
            {f.options?.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        ) : (
          <input
            key={f.key}
            type={f.type === 'number' ? 'number' : 'text'}
            placeholder={f.placeholder}
            className={baseInput}
            style={{ width: f.width }}
            value={vals[f.key]}
            onChange={(e) => setVals((v) => ({ ...v, [f.key]: e.target.value }))}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
          />
        ),
      )}
      <Button onClick={submit} disabled={!valid}>
        Add
      </Button>
      <Button variant="ghost" onClick={() => setOpen(false)}>
        Cancel
      </Button>
    </div>
  )
}
