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
const DOMAINS = ['Water', 'Energy', 'Urban Development', 'Transport', 'Buildings', 'Sustainability']

// Preset delivery stages the PM can toggle on/off (with a default length).
const STAGE_PRESETS: { name: string; months: number }[] = [
  { name: 'Pre-sale', months: 1 },
  { name: 'Discovery', months: 2 },
  { name: 'MVP', months: 4 },
  { name: 'MVP 2', months: 3 },
  { name: 'Hardening', months: 2 },
  { name: 'Tech support', months: 6 },
]

const inputCls =
  'w-full rounded-xl border border-line bg-card px-3 py-2.5 text-sm text-ink outline-none focus:border-navy disabled:text-muted'

function Field({ label, children, align = 'center' }: { label: string; children: React.ReactNode; align?: 'center' | 'start' }) {
  return (
    <label className={`grid grid-cols-[150px_1fr] gap-3 ${align === 'center' ? 'items-center' : 'items-start'}`}>
      <span className="pt-2 text-sm text-muted">{label}</span>
      <div className="min-w-0">{children}</div>
    </label>
  )
}

function monthsBetween(start: string, end: string): number {
  const s = new Date(start)
  const e = new Date(end)
  return (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth()) + 1
}

export function CreateProjectModal({ onClose }: { onClose: () => void }) {
  const createProject = useStore((s) => s.createProject)
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [department, setDepartment] = useState('')
  const [contract, setContract] = useState('')
  const [domain, setDomain] = useState('')
  const [location, setLocation] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [budget, setBudget] = useState('')
  const [pm, setPm] = useState('')
  const [description, setDescription] = useState('')
  const [stageMonths, setStageMonths] = useState<Record<string, string>>({})

  const duration = startDate && endDate ? monthsBetween(startDate, endDate) : 0
  const valid =
    name.trim() && department && contract && domain && startDate && endDate && duration > 0 && Number(budget) > 0 && pm.trim()

  function toggleStage(name: string, defMonths: number) {
    setStageMonths((cur) => {
      if (name in cur) {
        const next = { ...cur }
        delete next[name]
        return next
      }
      return { ...cur, [name]: String(defMonths) }
    })
  }

  function submit() {
    if (!valid) return
    const s = new Date(startDate)
    const startLabel = `Start ${s.toLocaleDateString('en-GB')}`
    const stages = STAGE_PRESETS.filter((p) => p.name in stageMonths).map((p) => ({
      name: p.name,
      months: Math.max(1, Number(stageMonths[p.name]) || p.months),
    }))
    const input: NewProjectInput = {
      name: name.trim(),
      department,
      contractType: contract,
      domain,
      location: location.trim() || undefined,
      description: description.trim() || undefined,
      startLabel,
      startYear: s.getFullYear(),
      startMonthIndex: s.getMonth(),
      durationMonths: duration,
      totalBudget: Number(budget),
      pmName: pm.trim(),
      tags: [domain],
      stages: stages.length ? stages : undefined,
    }
    const id = createProject(input)
    onClose()
    navigate(`/projects/${id}`)
  }

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
              <option value="" disabled>Select department…</option>
              {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
            </select>
          </Field>
          <Field label="Contract type">
            <select className={inputCls} value={contract} onChange={(e) => setContract(e.target.value)}>
              <option value="" disabled>Select contract type…</option>
              {CONTRACTS.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Domain / sector">
            <select className={inputCls} value={domain} onChange={(e) => setDomain(e.target.value)}>
              <option value="" disabled>Select domain…</option>
              {DOMAINS.map((d) => <option key={d}>{d}</option>)}
            </select>
          </Field>
          <Field label="Location">
            <input className={inputCls} value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Physical site (optional, e.g. Al Hamra Industrial Zone, RAK)" />
          </Field>
          <Field label="Start date">
            <input type="date" className={inputCls} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </Field>
          <Field label="End date">
            <div>
              <input type="date" className={inputCls} value={endDate} min={startDate || undefined} onChange={(e) => setEndDate(e.target.value)} />
              {duration > 0 && <p className="mt-1 text-xs text-muted">{duration} months</p>}
              {startDate && endDate && duration <= 0 && <p className="mt-1 text-xs text-red">End date must be after start date.</p>}
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
          <Field label="Short description" align="start">
            <textarea className={`${inputCls} h-20 resize-none`} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="One or two sentences on what this project delivers (optional)" />
          </Field>
        </div>

        {/* Stage checkboxes */}
        <div className="mt-5 rounded-2xl border border-line p-4">
          <h3 className="text-sm font-semibold text-ink">Project stages</h3>
          <p className="text-xs text-muted">Tick the stages this project will have and set their length. Leave all unticked to auto-generate Planning / Execution / Handover.</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {STAGE_PRESETS.map((s) => {
              const on = s.name in stageMonths
              return (
                <div key={s.name} className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${on ? 'border-navy bg-[#f7f8fb]' : 'border-line'}`}>
                  <input type="checkbox" checked={on} onChange={() => toggleStage(s.name, s.months)} className="h-4 w-4 accent-[#1a2235]" />
                  <span className="flex-1 text-sm">{s.name}</span>
                  {on && (
                    <span className="flex items-center gap-1">
                      <input
                        type="number"
                        min="1"
                        value={stageMonths[s.name]}
                        onChange={(e) => setStageMonths((c) => ({ ...c, [s.name]: e.target.value }))}
                        className="w-14 rounded-lg border border-line px-2 py-1 text-sm outline-none focus:border-navy"
                      />
                      <span className="text-xs text-muted">mo</span>
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={!valid}>Create project</Button>
        </div>
      </div>
    </div>
  )
}
