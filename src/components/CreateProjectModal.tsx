import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore, type NewProjectInput } from '../store/useStore'
import { Button } from './ui/primitives'

const DEPARTMENTS = [
  'RAK Public Services Department',
  'RAK Municipality Urban Planning Dept',
  'RAK Municipality Energy Management',
  'RAK Municipality Legal',
]
const CONTRACTS = [
  'PPP — Public-Private Partnership',
  'Design-Build',
  'Framework',
  'EPC — Engineering, Procurement, Construction',
]
const ALL_TAGS = ['Infrastructure', 'Water', 'Sustainability', 'Roads', 'Energy', 'Buildings']

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid grid-cols-[150px_1fr] items-center gap-3">
      <span className="text-sm text-muted">{label}</span>
      {children}
    </label>
  )
}

const inputCls =
  'w-full rounded-xl border border-line bg-card px-3 py-2.5 text-sm text-ink outline-none focus:border-navy'

export function CreateProjectModal({ onClose }: { onClose: () => void }) {
  const createProject = useStore((s) => s.createProject)
  const navigate = useNavigate()

  const [name, setName] = useState('RAK Wastewater Treatment Plant — Phase 1')
  const [department, setDepartment] = useState(DEPARTMENTS[0])
  const [contract, setContract] = useState(CONTRACTS[0])
  const [startDate, setStartDate] = useState('2026-01-01')
  const [duration, setDuration] = useState('36')
  const [budget, setBudget] = useState('387000000')
  const [pm, setPm] = useState('Ahmed Al Mansouri')
  const [tags, setTags] = useState<string[]>(['Infrastructure', 'Water', 'Sustainability'])

  const valid =
    name.trim() &&
    department &&
    contract &&
    startDate &&
    Number(duration) > 0 &&
    Number(budget) > 0 &&
    pm.trim()

  function toggleTag(t: string) {
    setTags((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]))
  }

  function submit() {
    if (!valid) return
    const d = new Date(startDate)
    const startLabel = `Start ${d.toLocaleDateString('en-GB')} (${duration} months)`
    const input: NewProjectInput = {
      name: name.trim(),
      department,
      contractType: contract.replace(' — Public-Private Partnership', '').includes('PPP')
        ? 'PPP Contract'
        : contract,
      startLabel,
      durationMonths: Number(duration),
      totalBudget: Number(budget),
      pmName: pm.trim(),
      tags,
    }
    const id = createProject(input)
    onClose()
    navigate(`/projects/${id}/setup`)
  }

  return (
    <div
      className="fixed inset-0 z-40 grid place-items-center bg-[#1a2235]/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[640px] rounded-[16px] bg-card p-6 shadow-2xl"
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
            <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Client / Department">
            <select className={inputCls} value={department} onChange={(e) => setDepartment(e.target.value)}>
              {DEPARTMENTS.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </Field>
          <Field label="Contract type">
            <select className={inputCls} value={contract} onChange={(e) => setContract(e.target.value)}>
              {CONTRACTS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Start date">
              <input type="date" className={inputCls} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </Field>
            <label className="grid grid-cols-[110px_1fr] items-center gap-3">
              <span className="text-sm text-muted">Duration</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  className={inputCls}
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
                <span className="text-sm text-muted">months</span>
              </div>
            </label>
          </div>
          <Field label="Total budget">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted">AED</span>
              <input type="number" className={inputCls} value={budget} onChange={(e) => setBudget(e.target.value)} />
            </div>
          </Field>
          <Field label="Project manager">
            <input className={inputCls} value={pm} onChange={(e) => setPm(e.target.value)} />
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
