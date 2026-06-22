import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore, type NewProjectInput } from '../store/useStore'
import { Button } from './ui/primitives'

const DEPARTMENTS = [
  'RAK Public Services Department',
  'RAK Urban Planning Dept',
  'RAK Energy Efficiency Office',
  'RAK Municipality Legal',
]
const CONTRACTS = [
  'PPP — Public-Private Partnership',
  'Design-Build',
  'Framework',
  'EPC — Engineering, Procurement, Construction',
]
const ALL_TAGS = ['Infrastructure', 'Water', 'Sustainability', 'Roads', 'Energy', 'Buildings', 'Transport', 'Masterplan']

const inputCls =
  'w-full rounded-xl border border-line bg-card px-3 py-2.5 text-sm text-ink outline-none focus:border-navy disabled:text-muted'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid grid-cols-[150px_1fr] items-center gap-3">
      <span className="text-sm text-muted">{label}</span>
      <div className="min-w-0">{children}</div>
    </label>
  )
}

interface StageRow {
  id: number
  name: string
  months: string
}

export function CreateProjectModal({ onClose }: { onClose: () => void }) {
  const createProject = useStore((s) => s.createProject)
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [department, setDepartment] = useState('')
  const [contract, setContract] = useState('')
  const [startDate, setStartDate] = useState('')
  const [duration, setDuration] = useState('')
  const [budget, setBudget] = useState('')
  const [pm, setPm] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [stages, setStages] = useState<StageRow[]>([])
  const [nextStageId, setNextStageId] = useState(1)

  const valid =
    name.trim() && department && contract && startDate && Number(duration) > 0 && Number(budget) > 0 && pm.trim()

  function toggleTag(t: string) {
    setTags((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]))
  }
  function addStage() {
    setStages((s) => [...s, { id: nextStageId, name: '', months: '' }])
    setNextStageId((n) => n + 1)
  }
  function updateStage(id: number, patch: Partial<StageRow>) {
    setStages((s) => s.map((row) => (row.id === id ? { ...row, ...patch } : row)))
  }
  function removeStage(id: number) {
    setStages((s) => s.filter((row) => row.id !== id))
  }

  function submit() {
    if (!valid) return
    const d = new Date(startDate)
    const startLabel = `Start ${d.toLocaleDateString('en-GB')} (${duration} months)`
    const cleanStages = stages
      .filter((s) => s.name.trim() && Number(s.months) > 0)
      .map((s) => ({ name: s.name.trim(), months: Number(s.months) }))
    const input: NewProjectInput = {
      name: name.trim(),
      department,
      contractType: contract.includes('PPP') ? 'PPP Contract' : contract,
      startLabel,
      durationMonths: Number(duration),
      totalBudget: Number(budget),
      pmName: pm.trim(),
      tags,
      stages: cleanStages.length ? cleanStages : undefined,
    }
    const id = createProject(input)
    onClose()
    navigate(`/projects/${id}/setup`)
  }

  const stagesTotal = stages.reduce((acc, s) => acc + (Number(s.months) || 0), 0)

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-[#1a2235]/40 p-4" onClick={onClose}>
      <div
        className="scroll-thin max-h-[90vh] w-full max-w-[640px] overflow-y-auto rounded-[16px] bg-card p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink">New project</h2>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-[#eef0f4]">
            ✕
          </button>
        </div>
        <p className="mt-1 text-sm text-muted">Capture the core parameters — the workspace is structured for you.</p>

        <div className="mt-5 grid gap-3.5">
          <Field label="Project name">
            <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. RAK Wastewater Treatment Plant — Phase 1" />
          </Field>
          <Field label="Client / Department">
            <select className={inputCls} value={department} onChange={(e) => setDepartment(e.target.value)}>
              <option value="" disabled>
                Select department…
              </option>
              {DEPARTMENTS.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </Field>
          <Field label="Contract type">
            <select className={inputCls} value={contract} onChange={(e) => setContract(e.target.value)}>
              <option value="" disabled>
                Select contract type…
              </option>
              {CONTRACTS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Start date">
            <input type="date" className={inputCls} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </Field>
          <Field label="Duration">
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                className={inputCls}
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 36"
              />
              <span className="shrink-0 text-sm text-muted">months</span>
            </div>
          </Field>
          <Field label="Total budget">
            <div className="flex items-center gap-2">
              <span className="shrink-0 text-sm font-medium text-muted">AED</span>
              <input type="number" min="0" className={inputCls} value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="e.g. 387000000" />
            </div>
          </Field>
          <Field label="Project manager">
            <input className={inputCls} value={pm} onChange={(e) => setPm(e.target.value)} placeholder="Full name" />
          </Field>
          <Field label="Project tags">
            <div className="flex flex-wrap gap-2">
              {ALL_TAGS.map((t) => (
                <button
                  key={t}
                  onClick={() => toggleTag(t)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                    tags.includes(t) ? 'bg-navy text-white' : 'bg-[#eef0f4] text-[#475467]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </Field>
        </div>

        {/* Stages editor (optional) */}
        <div className="mt-5 rounded-2xl border border-line p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-ink">Project stages</h3>
              <p className="text-xs text-muted">
                Optional. Leave empty to auto-generate Planning / Execution / Handover from the duration.
              </p>
            </div>
            {duration && stagesTotal > 0 && (
              <span className={`text-xs font-medium ${stagesTotal > Number(duration) ? 'text-amber' : 'text-muted'}`}>
                {stagesTotal} / {duration} months
              </span>
            )}
          </div>
          {stages.length > 0 && (
            <div className="mt-3 grid gap-2">
              {stages.map((s, i) => (
                <div key={s.id} className="flex items-center gap-2">
                  <span className="w-5 text-xs text-muted">{i + 1}.</span>
                  <input
                    className={inputCls}
                    placeholder="Stage name (e.g. Design & permitting)"
                    value={s.name}
                    onChange={(e) => updateStage(s.id, { name: e.target.value })}
                  />
                  <input
                    type="number"
                    min="1"
                    className="w-24 rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-navy"
                    placeholder="months"
                    value={s.months}
                    onChange={(e) => updateStage(s.id, { months: e.target.value })}
                  />
                  <button
                    onClick={() => removeStage(s.id)}
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-muted hover:bg-red-soft hover:text-red"
                    title="Remove stage"
                  >
                    🗑
                  </button>
                </div>
              ))}
            </div>
          )}
          <button onClick={addStage} className="mt-3 text-sm font-semibold text-navy hover:underline">
            ＋ Add stage
          </button>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={!valid}>
            Create project
          </Button>
        </div>
      </div>
    </div>
  )
}
