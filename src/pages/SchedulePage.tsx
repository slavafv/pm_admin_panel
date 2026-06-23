import { useState } from 'react'
import { useProject } from './ProjectLayout'
import { useStore } from '../store/useStore'
import { Gantt } from '../components/gantt/Gantt'
import { Card, Chip, RagDot, Button } from '../components/ui/primitives'
import { calLabel, calDays } from '../lib/metrics'

export function SchedulePage() {
  const p = useProject()
  const update = useStore((s) => s.updateProject)
  const [view, setView] = useState<'gantt' | 'table'>('gantt')
  const [editWorkload, setEditWorkload] = useState(false)
  const [editStages, setEditStages] = useState(false)

  function setFte(memberId: string, phaseIdx: number, value: number) {
    update(p.id, (prj) => ({
      ...prj,
      team: prj.team.map((t) =>
        t.id === memberId ? { ...t, fteByPhase: t.fteByPhase.map((f, i) => (i === phaseIdx ? value : f)) } : t,
      ),
    }))
  }

  // Lengthen / shorten a stage — recompute all phase boundaries + project duration.
  function setStageDuration(phaseId: string, months: number) {
    const m = Math.max(1, Math.round(months) || 1)
    update(p.id, (prj) => {
      let cursor = 0
      const phases = prj.phases.map((ph) => {
        const dur = ph.id === phaseId ? m : ph.endMonth - ph.startMonth + 1
        const next = { ...ph, startMonth: cursor, endMonth: cursor + dur - 1 }
        cursor += dur
        return next
      })
      return { ...prj, phases, durationMonths: cursor }
    })
  }

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
        <div className="flex gap-2">
          <Button
            variant={editStages ? 'primary' : 'soft'}
            onClick={() => { setView('gantt'); setEditStages((e) => !e) }}
          >
            {editStages ? '✓ Done' : '⇿ Edit stages'}
          </Button>
          <Button
            variant={editWorkload ? 'primary' : 'soft'}
            onClick={() => { setView('gantt'); setEditWorkload((e) => !e) }}
          >
            {editWorkload ? '✓ Done' : '✎ Edit workload'}
          </Button>
        </div>
      </div>

      {editStages && (
        <Card className="p-5">
          <h3 className="mb-1 text-sm font-semibold">Lengthen or shorten stages</h3>
          <p className="mb-3 text-xs text-muted">Change a stage's length in months — the timeline and downstream stages shift automatically.</p>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {p.phases.map((ph) => (
              <div key={ph.id} className="flex items-center justify-between rounded-xl border border-line px-4 py-2.5">
                <div>
                  <div className="text-sm font-medium">{ph.name}</div>
                  <div className="text-xs text-muted">{calLabel(p, ph.startMonth)} → {calLabel(p, ph.endMonth)}</div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    value={ph.endMonth - ph.startMonth + 1}
                    onChange={(e) => setStageDuration(ph.id, Number(e.target.value))}
                    className="w-16 rounded-lg border border-line px-2.5 py-1.5 text-sm outline-none focus:border-navy"
                  />
                  <span className="text-xs text-muted">months</span>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted">Project duration: {p.durationMonths} months.</p>
        </Card>
      )}

      {editWorkload && (
        <Card className="overflow-x-auto p-5">
          <h3 className="mb-1 text-sm font-semibold">Edit team workload — FTE per stage</h3>
          <p className="mb-3 text-xs text-muted">Set each person's load (0–1.5 FTE) per stage. Over-allocation (&gt;1.0) shows red in the Gantt.</p>
          <table className="w-full min-w-[520px]">
            <thead>
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted">Member</th>
                {p.phases.map((ph) => (
                  <th key={ph.id} className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                    {ph.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {p.team.map((m) => (
                <tr key={m.id} className="border-t border-line">
                  <td className="px-3 py-2 text-sm font-medium">{m.name}</td>
                  {p.phases.map((ph, i) => (
                    <td key={ph.id} className="px-3 py-2">
                      <input
                        type="number"
                        min="0"
                        max="1.5"
                        step="0.5"
                        value={m.fteByPhase[i] ?? 0}
                        onChange={(e) => setFte(m.id, i, Math.max(0, Number(e.target.value) || 0))}
                        className={`w-20 rounded-lg border px-2.5 py-1.5 text-sm outline-none focus:border-navy ${
                          (m.fteByPhase[i] ?? 0) > 1 ? 'border-red text-red' : 'border-line'
                        }`}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

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
                  <td className="px-4 py-3 text-sm">{calLabel(p, ph.startMonth)}</td>
                  <td className="px-4 py-3 text-sm">{calLabel(p, ph.endMonth)}</td>
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
            const days = calDays(p, m.month)
            return (
              <div key={m.id} className="flex items-center justify-between rounded-xl border border-line px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="h-3 w-3 rotate-45 rounded-[2px]" style={{ background: { green: '#4caf82', amber: '#f0a830', red: '#e2574c' }[m.rag] }} />
                  <div>
                    <div className="text-sm font-semibold">{m.name}</div>
                    <div className="text-xs text-muted">{calLabel(p, m.month)}</div>
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
