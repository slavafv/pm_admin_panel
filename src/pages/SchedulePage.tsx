import { useState } from 'react'
import { useProject } from './ProjectLayout'
import { Gantt } from '../components/gantt/Gantt'
import { Card, Chip, RagDot, Button } from '../components/ui/primitives'
import { monthLabel, daysToMonth } from '../lib/format'

export function SchedulePage() {
  const p = useProject()
  const [view, setView] = useState<'gantt' | 'table'>('gantt')

  return (
    <div className="grid gap-5">
      <div className="flex items-center justify-between">
        <div className="flex rounded-xl border border-line bg-card p-1">
          {(['gantt', 'table'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`rounded-lg px-4 py-1.5 text-sm font-medium capitalize transition ${
                view === v ? 'bg-navy text-white' : 'text-muted hover:text-ink'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
        <Button onClick={() => setView('gantt')}>✎ Edit workload</Button>
      </div>

      {view === 'gantt' ? (
        <Gantt project={p} live />
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full">
            <thead className="border-b border-line bg-[#fafbfc]">
              <tr>
                {['Phase', 'Start', 'End', 'Progress', 'Status'].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {p.phases.map((ph) => (
                <tr key={ph.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3 text-sm font-semibold">{ph.name}</td>
                  <td className="px-4 py-3 text-sm">{monthLabel(ph.startMonth, p.startYear)}</td>
                  <td className="px-4 py-3 text-sm">{monthLabel(ph.endMonth, p.startYear)}</td>
                  <td className="px-4 py-3 text-sm">{ph.progressPct}%</td>
                  <td className="px-4 py-3 text-sm capitalize">{ph.status.replace('_', ' ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Card className="p-5">
        <h3 className="mb-3 text-sm font-semibold">Milestones</h3>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {p.milestones.map((m) => {
            const days = daysToMonth(m.month, p.startYear)
            return (
              <div key={m.id} className="flex items-center justify-between rounded-xl border border-line px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="h-3 w-3 rotate-45 rounded-[2px]" style={{ background: { green: '#4caf82', amber: '#f0a830', red: '#e2574c' }[m.rag] }} />
                  <div>
                    <div className="text-sm font-semibold">{m.name}</div>
                    <div className="text-xs text-muted">{monthLabel(m.month, p.startYear)}</div>
                  </div>
                </div>
                <Chip tone={m.rag}>
                  <RagDot rag={m.rag} />
                  {days > 0 ? `${days} days` : 'past'}
                </Chip>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
