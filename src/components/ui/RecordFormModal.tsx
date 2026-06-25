import { useState } from 'react'
import { Button } from './primitives'

export interface FormField {
  key: string
  label: string
  type: 'text' | 'textarea' | 'number' | 'select'
  options?: string[]
  required?: boolean
  placeholder?: string
  /** initial value */
  default?: string
}

const inputCls = 'w-full rounded-xl border border-line bg-card px-3 py-2.5 text-sm text-ink outline-none focus:border-navy'

/** A full add/edit form rendered as a modal — fields stack vertically with room
 *  for long text (textarea). Used so every field is filled, not crammed in a row. */
export function RecordFormModal({
  title,
  fields,
  submitLabel = 'Add',
  onSubmit,
  onClose,
}: {
  title: string
  fields: FormField[]
  submitLabel?: string
  onSubmit: (values: Record<string, string>) => void
  onClose: () => void
}) {
  const [vals, setVals] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((f) => [f.key, f.default ?? (f.type === 'select' ? f.options?.[0] ?? '' : '')])),
  )

  const valid = fields.every((f) => f.required === false || String(vals[f.key] ?? '').trim())

  function set(key: string, v: string) {
    setVals((cur) => ({ ...cur, [key]: v }))
  }
  function submit() {
    if (!valid) return
    onSubmit(vals)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-[#1a2235]/40 p-4" onClick={onClose}>
      <div className="scroll-thin max-h-[90vh] w-full max-w-[560px] overflow-y-auto rounded-[16px] bg-card p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink">{title}</h2>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-[#eef0f4]">✕</button>
        </div>

        <div className="mt-5 grid gap-3.5">
          {fields.map((f) => (
            <label key={f.key} className="grid gap-1">
              <span className="text-sm font-medium text-ink">
                {f.label} {f.required === false && <span className="text-xs font-normal text-muted">(optional)</span>}
              </span>
              {f.type === 'textarea' ? (
                <textarea className={`${inputCls} h-24 resize-none`} placeholder={f.placeholder} value={vals[f.key]} onChange={(e) => set(f.key, e.target.value)} />
              ) : f.type === 'select' ? (
                <select className={inputCls} value={vals[f.key]} onChange={(e) => set(f.key, e.target.value)}>
                  {f.options?.map((o) => <option key={o}>{o}</option>)}
                </select>
              ) : (
                <input type={f.type === 'number' ? 'number' : 'text'} className={inputCls} placeholder={f.placeholder} value={vals[f.key]} onChange={(e) => set(f.key, e.target.value)} />
              )}
            </label>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={!valid}>{submitLabel}</Button>
        </div>
      </div>
    </div>
  )
}
