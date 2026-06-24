import { useMemo, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { Card, Avatar, Pill, ProgressBar } from '../components/ui/primitives'
import { aggregateEmployees, activeEmployeeCount, yearBar, type EmployeeAggregate } from '../lib/workspace'
import { canSeeWorkspaceTools } from '../lib/rbac'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const YEAR = 2026
const NOW_PCT = ((1 + 20 / 28) / 12) * 100 // demo "today" ≈ 20 Feb 2026
const LABEL_W = 220

const AV_TONE: Record<string, string> = {
  Available: 'bg-green-soft text-green',
  'On leave': 'bg-red-soft text-red',
  Limited: 'bg-amber-soft text-amber',
}

function AvailabilityPill({ a }: { a: EmployeeAggregate['availability'] }) {
  return <Pill tone={AV_TONE[a]}>{a}</Pill>
}

export function EmployeesPage() {
  const projects = useStore((s) => s.projects)
  const role = useStore((s) => s.role)
  const [view, setView] = useState<'table' | 'gantt'>('table')
  const [q, setQ] = useState('')

  const employees = useMemo(() => aggregateEmployees(projects), [projects])
  const filtered = employees.filter((e) => !q || e.name.toLowerCase().includes(q.toLowerCase()))
  const active = activeEmployeeCount(employees)

  if (!canSeeWorkspaceTools(role)) return <Navigate to="/" replace />

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">Employees</h1>
          <p className="text-sm text-muted">{employees.length} people · {active} active right now</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex rounded-xl border border-line bg-card p-1">
            {(['table', 'gantt'] as const).map((v) => (
              <button key={v} onClick={() => setView(v)}
                className={`rounded-lg px-4 py-1.5 text-sm font-medium capitalize transition ${view === v ? 'bg-navy text-white' : 'text-muted hover:text-ink'}`}>
                {v === 'gantt' ? 'Allocation' : 'Table'}
              </button>
            ))}
          </div>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name…"
            className="w-56 rounded-xl border border-line bg-card px-3.5 py-2.5 text-sm outline-none focus:border-navy" />
        </div>
      </div>

      {view === 'table' ? (
        <Card className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead className="border-b border-line bg-[#fafbfc]">
              <tr>{['Person', 'Role', 'Project', 'Availability', 'Allocation'].map((h) => (
                <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr key={e.name} className="border-b border-line last:border-0">
                  <td className="px-4 py-3"><div className="flex items-center gap-3"><Avatar initials={e.initials} color={e.color} ring={false} /><span className="text-sm font-semibold">{e.name}</span></div></td>
                  <td className="px-4 py-3 text-sm text-muted">{e.role}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {e.assignments.map((a) => (
                        <Link key={a.project.id} to={`/projects/${a.project.id}/resources`} className="rounded-full bg-[#eef0f4] px-2.5 py-1 text-xs font-medium text-[#475467] hover:bg-[#e2e6ee]">
                          {a.project.name.length > 28 ? a.project.name.slice(0, 28) + '…' : a.project.name}
                        </Link>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3"><AvailabilityPill a={e.availability} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-14 text-sm font-semibold ${e.peakFte > 1 ? 'text-red' : 'text-ink'}`}>{e.peakFte} FTE</span>
                      <ProgressBar value={Math.min(100, e.peakFte * 100)} tone={e.peakFte > 1 ? 'red' : 'green'} className="w-24" />
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td className="px-4 py-6 text-sm text-muted">No people match.</td></tr>}
            </tbody>
          </table>
        </Card>
      ) : (
        <Card className="mt-5 overflow-x-auto">
          <div style={{ minWidth: LABEL_W + 12 * 56 }}>
            {/* year + months header */}
            <div className="flex border-b border-line bg-[#fafbfc]">
              <div style={{ width: LABEL_W }} className="shrink-0 px-4 py-2 text-xs font-semibold text-muted">Person</div>
              <div className="relative flex-1 py-2 text-center text-xs font-bold text-ink">{YEAR}</div>
            </div>
            <div className="flex border-b border-line">
              <div style={{ width: LABEL_W }} className="shrink-0" />
              <div className="flex flex-1">
                {MONTHS.map((m) => <div key={m} className="flex-1 border-l border-line/60 py-1.5 text-center text-[10px] text-muted">{m}</div>)}
              </div>
            </div>
            {/* rows */}
            {filtered.map((e) => (
              <div key={e.name} className="flex border-b border-line last:border-0">
                <div style={{ width: LABEL_W }} className="flex shrink-0 items-center gap-2 px-4 py-3">
                  <Avatar initials={e.initials} color={e.color} size={24} ring={false} />
                  <span className="truncate text-sm font-medium text-ink">{e.name}</span>
                </div>
                <div className="relative flex-1" style={{ height: 48 }}>
                  <div className="pointer-events-none absolute top-0 bottom-0 z-10 w-px bg-blue" style={{ left: `${NOW_PCT}%` }} />
                  {e.assignments.map((a) => {
                    const bar = yearBar(a.project, YEAR)
                    if (!bar) return null
                    const fte = Math.max(...a.member.fteByPhase, 0)
                    const over = fte > 1
                    return (
                      <div key={a.project.id}
                        className={`absolute top-1/2 grid -translate-y-1/2 place-items-center overflow-hidden rounded-md px-2 text-[11px] font-semibold ${over ? 'bg-red-soft text-red' : 'bg-green-soft text-green'}`}
                        style={{ left: `calc(${bar.leftPct}% + 2px)`, width: `calc(${bar.widthPct}% - 4px)`, height: 26 }}
                        title={`${a.project.name} · ${fte} FTE`}>
                        {fte} FTE
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
