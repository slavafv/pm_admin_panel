import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { Card, Avatar, Pill, Button } from '../components/ui/primitives'
import { STATUS_TONE, MAINT_TONE, utilColor, utilText } from '../lib/equipmentStyle'
import { aggregateEquipment, fleetStats } from '../lib/workspace'
import { buildCsv, triggerDownload } from '../lib/download'

const TABS = ['all', 'Available', 'In use', 'Maintenance'] as const

export function EquipmentPage() {
  const projects = useStore((s) => s.projects)
  const [filter, setFilter] = useState<(typeof TABS)[number]>('all')
  const [q, setQ] = useState('')

  const rows = useMemo(() => aggregateEquipment(projects), [projects])
  const stats = useMemo(() => fleetStats(rows), [rows])
  const shown = rows.filter((r) => {
    const okFilter = filter === 'all' || r.equipment.status === filter
    const okSearch = !q || r.equipment.name.toLowerCase().includes(q.toLowerCase()) || r.equipment.category.toLowerCase().includes(q.toLowerCase())
    return okFilter && okSearch
  })

  function exportCsv() {
    const data: (string | number)[][] = [
      ['Equipment', 'Type', 'Status', 'Utilisation %', 'Operator', 'Project', 'Cost/hr', 'Maintenance'],
      ...rows.map((r) => {
        const op = r.equipment.operatorId ? r.project.team.find((t) => t.id === r.equipment.operatorId)?.name : 'Missing'
        return [r.equipment.name, r.equipment.category, r.equipment.status, r.equipment.utilization ?? 0, op ?? 'Missing', r.project.name, r.equipment.costPerHour ?? 0, r.equipment.maintenance ?? '—']
      }),
    ]
    triggerDownload(buildCsv(data), 'RAK_EquipmentFleet.csv')
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">Equipment fleet</h1>
          <p className="text-sm text-muted">{stats.total} units across {stats.categories} categories · {stats.avgUtil}% average utilisation</p>
        </div>
        <Button variant="soft" onClick={exportCsv}>⬇ Export</Button>
      </div>

      {/* stat cards */}
      <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Total units', value: stats.total },
          { label: 'Active (in use)', value: stats.inUse },
          { label: 'Avg. utilisation', value: `${stats.avgUtil}%` },
          { label: 'Maintenance pending', value: stats.maintPending, amber: stats.maintPending > 0 },
        ].map((s) => (
          <Card key={s.label} className="p-5">
            <div className="text-xs text-muted">{s.label}</div>
            <div className={`mt-1 text-3xl font-bold ${s.amber ? 'text-amber' : 'text-ink'}`}>{s.value}</div>
          </Card>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search equipment…"
          className="w-64 rounded-xl border border-line bg-card px-3.5 py-2.5 text-sm outline-none focus:border-navy" />
        <div className="flex gap-1.5">
          {TABS.map((t) => (
            <button key={t} onClick={() => setFilter(t)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${filter === t ? 'bg-navy text-white' : 'bg-card border border-line text-[#475467] hover:bg-[#f3f5f9]'}`}>
              {t === 'all' ? 'All' : t}
            </button>
          ))}
        </div>
      </div>

      <Card className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[920px]">
          <thead className="border-b border-line bg-[#fafbfc]">
            <tr>{['Equipment', 'Type', 'Status', 'Utilisation', 'Operator', 'Project', 'Cost/hr', 'Maintenance'].map((h) => (
              <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted">{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {shown.map(({ equipment: e, project }, i) => {
              const op = e.operatorId ? project.team.find((t) => t.id === e.operatorId) : undefined
              const util = e.utilization ?? 0
              return (
                <tr key={i} className="border-b border-line last:border-0">
                  <td className="px-4 py-3 text-sm font-semibold">{e.name}</td>
                  <td className="px-4 py-3 text-sm text-muted">{e.category}</td>
                  <td className="px-4 py-3"><Pill tone={STATUS_TONE[e.status]}>{e.status}</Pill></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-9 text-sm font-semibold ${util > 0 ? utilText(util) : 'text-muted'}`}>{util}%</span>
                      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-[#eef0f4]"><div className={`h-full rounded-full ${utilColor(util)}`} style={{ width: `${util}%` }} /></div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {op ? <span className="inline-flex items-center gap-2"><Avatar initials={op.initials} color={op.color} size={22} ring={false} />{op.name}</span> : <Pill tone="bg-red-soft text-red">✕ Missing</Pill>}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <Link to={`/projects/${project.id}/resources`} className="text-navy hover:underline">{project.name}</Link>
                  </td>
                  <td className="px-4 py-3 text-sm">{e.costPerHour ? `$${e.costPerHour}` : '—'}</td>
                  <td className="px-4 py-3">{e.maintenance ? <Pill tone={MAINT_TONE[e.maintenance]}>{e.maintenance}</Pill> : <span className="text-muted">—</span>}</td>
                </tr>
              )
            })}
            {shown.length === 0 && <tr><td className="px-4 py-6 text-sm text-muted">No equipment in this view.</td></tr>}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
