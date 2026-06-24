import { useState } from 'react'
import { useProject } from './ProjectLayout'
import { useStore } from '../store/useStore'
import { Card, Avatar, Button, Pill } from '../components/ui/primitives'
import { InlineAddForm } from '../components/ui/InlineAddForm'
import { aed } from '../lib/format'
import { calLabel } from '../lib/metrics'
import { STATUS_TONE, MAINT_TONE, utilColor, utilText } from '../lib/equipmentStyle'
import type { AccessLevel, Availability, Equipment, TeamMember, TeamRole } from '../data/types'

const AVAILABILITY: Availability[] = ['Available', 'On leave', 'Limited']

const TABS = ['Team & roles', 'Equipment & assets', 'Budget']
const ACCESS_LEVELS: AccessLevel[] = ['Full access', 'Budget view', 'Execution view', 'Read only']
const ROLE_OPTIONS: TeamRole[] = ['Project Manager', 'Department Head', 'Finance Officer', 'Senior Engineer', 'Document Controller', 'Observer', 'External Partner']
const ACCESS_BY_ROLE: Record<string, AccessLevel> = {
  'Project Manager': 'Full access', 'Department Head': 'Full access', 'Finance Officer': 'Budget view',
  'Senior Engineer': 'Execution view', 'Document Controller': 'Read only', Observer: 'Read only', 'External Partner': 'Read only',
}
const EQUIP_STATUS = ['Available', 'In use', 'Maintenance', 'Planned']
const AVATAR_COLORS = ['#1a2235', '#4caf82', '#3b82f6', '#f0a830', '#e2574c']

function initialsOf(name: string): string {
  const p = name.trim().split(/\s+/)
  return (p.length === 1 ? p[0].slice(0, 2) : p[0][0] + p[p.length - 1][0]).toUpperCase()
}

function Th({ children }: { children?: React.ReactNode }) {
  return <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted">{children}</th>
}
function Td({ children, className = '' }: { children?: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 text-sm text-ink ${className}`}>{children}</td>
}
function RemoveBtn({ onClick, disabled, title }: { onClick: () => void; disabled?: boolean; title?: string }) {
  return (
    <button onClick={onClick} disabled={disabled} title={title ?? 'Remove'}
      className="grid h-8 w-8 place-items-center rounded-lg text-muted transition hover:bg-red-soft hover:text-red disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-muted">
      🗑
    </button>
  )
}

export function ResourcesPage() {
  const p = useProject()
  const update = useStore((s) => s.updateProject)
  const addTeamMember = useStore((s) => s.addTeamMember)
  const removeTeamMember = useStore((s) => s.removeTeamMember)
  const [tab, setTab] = useState(0)
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [newRole, setNewRole] = useState<TeamRole>('Senior Engineer')
  const [equipFilter, setEquipFilter] = useState<'all' | 'Available' | 'In use' | 'Maintenance'>('all')

  function confirmAddMember() {
    const name = newName.trim()
    if (!name) return
    const member: TeamMember = {
      id: `m-${Date.now()}`, name, role: newRole, access: ACCESS_BY_ROLE[newRole],
      initials: initialsOf(name), color: AVATAR_COLORS[p.team.length % AVATAR_COLORS.length],
      fteByPhase: p.phases.map(() => 0.5), capacity: 1,
    }
    addTeamMember(p.id, member)
    setNewName(''); setNewRole('Senior Engineer'); setAdding(false)
  }
  function setAccess(id: string, access: AccessLevel) {
    update(p.id, (prj) => ({ ...prj, team: prj.team.map((t) => (t.id === id ? { ...t, access } : t)) }))
  }
  function setAvailability(id: string, availability: Availability) {
    update(p.id, (prj) => ({ ...prj, team: prj.team.map((t) => (t.id === id ? { ...t, availability } : t)) }))
  }
  function setBudgetLines(lines: typeof p.budgetLines) {
    update(p.id, (prj) => ({ ...prj, budgetLines: lines, totalBudget: lines.reduce((a, b) => a + b.allocated, 0) }))
  }
  const curIdx = Math.max(0, p.phases.findIndex((ph) => ph.id === p.currentPhaseId))

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center gap-2">
        {TABS.map((t, i) => (
          <button key={t} onClick={() => setTab(i)}
            className={`rounded-xl px-3.5 py-2 text-sm font-medium transition ${tab === i ? 'bg-navy text-white' : 'bg-card border border-line text-[#475467] hover:bg-[#f3f5f9]'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Team & roles */}
      {tab === 0 && (
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between px-5 pt-4">
            <h3 className="text-sm font-semibold">Core delivery team</h3>
            <span className="text-xs text-muted">{p.team.length} member{p.team.length === 1 ? '' : 's'}</span>
          </div>
          <table className="mt-2 w-full">
            <thead className="border-y border-line bg-[#fafbfc]"><tr><Th>Member</Th><Th>Role</Th><Th>Access level</Th><Th>Availability</Th><Th>Allocation</Th><Th>Remove</Th></tr></thead>
            <tbody>
              {p.team.map((m) => {
                const av = m.availability ?? 'Available'
                const fte = m.fteByPhase[curIdx] ?? 0
                const over = fte > (m.capacity || 1)
                return (
                <tr key={m.id} className="border-b border-line last:border-0">
                  <Td><div className="flex items-center gap-3"><Avatar initials={m.initials} color={m.color} ring={false} /><span className="font-semibold">{m.name}</span></div></Td>
                  <Td>{m.role}</Td>
                  <Td>
                    <select value={m.access} onChange={(e) => setAccess(m.id, e.target.value as AccessLevel)}
                      className="rounded-lg border border-line bg-card px-2.5 py-1.5 text-sm outline-none focus:border-navy">
                      {ACCESS_LEVELS.map((a) => <option key={a}>{a}</option>)}
                    </select>
                  </Td>
                  <Td>
                    <select value={av} onChange={(e) => setAvailability(m.id, e.target.value as Availability)}
                      className={`rounded-lg border bg-card px-2.5 py-1.5 text-sm outline-none focus:border-navy ${av === 'On leave' ? 'border-red text-red' : av === 'Limited' ? 'border-amber text-amber' : 'border-line'}`}>
                      {AVAILABILITY.map((a) => <option key={a}>{a}</option>)}
                    </select>
                  </Td>
                  <Td>
                    {av === 'On leave' ? (
                      <div className="flex items-center gap-2">
                        <span className="w-14 text-sm font-semibold text-muted">0 FTE</span>
                        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-[#eef0f4]" />
                        <span className="text-[11px] text-red">on leave</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className={`w-14 text-sm font-semibold ${over ? 'text-red' : 'text-ink'}`}>{fte} FTE</span>
                        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-[#eef0f4]">
                          <div className={`h-full rounded-full ${over ? 'bg-red' : 'bg-green'}`} style={{ width: `${Math.min(100, (fte / (m.capacity || 1)) * 100)}%` }} />
                        </div>
                      </div>
                    )}
                  </Td>
                  <Td><RemoveBtn onClick={() => removeTeamMember(p.id, m.id)} disabled={m.id === p.pmId} title={m.id === p.pmId ? 'The project manager cannot be removed' : 'Remove member'} /></Td>
                </tr>
              )})}
            </tbody>
          </table>
          <div className="border-t border-line p-4">
            {adding ? (
              <div className="flex flex-wrap items-center gap-2">
                <input autoFocus value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && confirmAddMember()} placeholder="Full name" className="rounded-xl border border-line px-3 py-2 text-sm outline-none focus:border-navy" />
                <select value={newRole} onChange={(e) => setNewRole(e.target.value as TeamRole)} className="rounded-xl border border-line px-3 py-2 text-sm outline-none focus:border-navy">
                  {ROLE_OPTIONS.map((r) => <option key={r}>{r}</option>)}
                </select>
                <Button onClick={confirmAddMember} disabled={!newName.trim()}>Add</Button>
                <Button variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
              </div>
            ) : (
              <button onClick={() => setAdding(true)} className="text-sm font-semibold text-navy hover:underline">＋ Add team member</button>
            )}
          </div>
        </Card>
      )}

      {/* Equipment & assets */}
      {tab === 1 && (() => {
        const eq = p.equipment
        const inUse = eq.filter((e) => e.status === 'In use').length
        const utilVals = eq.map((e) => e.utilization ?? 0).filter((u) => u > 0)
        const avgUtil = utilVals.length ? Math.round(utilVals.reduce((a, b) => a + b, 0) / utilVals.length) : 0
        const maintPending = eq.filter((e) => e.maintenance && e.maintenance !== 'Up to date').length
        const TABS_EQ = ['all', 'Available', 'In use', 'Maintenance'] as const
        const shown = eq
          .map((e, i) => ({ e, i }))
          .filter(({ e }) => equipFilter === 'all' || e.status === equipFilter)
        return (
          <div className="grid gap-4">
            {/* stat cards */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {[
                { label: 'Total units', value: eq.length },
                { label: 'In use', value: inUse },
                { label: 'Avg. utilisation', value: `${avgUtil}%` },
                { label: 'Maintenance pending', value: maintPending, amber: maintPending > 0 },
              ].map((s) => (
                <Card key={s.label} className="p-4">
                  <div className="text-xs text-muted">{s.label}</div>
                  <div className={`mt-1 text-2xl font-bold ${s.amber ? 'text-amber' : 'text-ink'}`}>{s.value}</div>
                </Card>
              ))}
            </div>

            <Card className="overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-4">
                <h3 className="text-sm font-semibold">Equipment fleet</h3>
                <div className="flex gap-1.5">
                  {TABS_EQ.map((t) => (
                    <button key={t} onClick={() => setEquipFilter(t)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition ${equipFilter === t ? 'bg-navy text-white' : 'bg-card border border-line text-[#475467] hover:bg-[#f3f5f9]'}`}>
                      {t === 'all' ? 'All' : t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="scroll-thin mt-2 overflow-x-auto">
                <table className="w-full min-w-[860px]">
                  <thead className="border-y border-line bg-[#fafbfc]">
                    <tr><Th>Equipment</Th><Th>Type</Th><Th>Status</Th><Th>Utilisation</Th><Th>Operator</Th><Th>Cost/hr</Th><Th>Maintenance</Th><Th>Service until</Th><Th></Th></tr>
                  </thead>
                  <tbody>
                    {shown.map(({ e, i }) => {
                      const op = e.operatorId ? p.team.find((t) => t.id === e.operatorId) : undefined
                      const phase = p.phases.find((ph) => ph.name === e.phase)
                      const expiring = e.serviceUntilMonth != null && phase != null && e.serviceUntilMonth < phase.endMonth
                      const util = e.utilization ?? 0
                      return (
                        <tr key={i} className="border-b border-line last:border-0">
                          <Td className="font-semibold">{e.name}</Td>
                          <Td className="text-muted">{e.category}</Td>
                          <Td><Pill tone={STATUS_TONE[e.status]}>{e.status}</Pill></Td>
                          <Td>
                            <div className="flex items-center gap-2">
                              <span className={`w-9 text-sm font-semibold ${util > 0 ? utilText(util) : 'text-muted'}`}>{util}%</span>
                              <div className="h-1.5 w-20 overflow-hidden rounded-full bg-[#eef0f4]">
                                <div className={`h-full rounded-full ${utilColor(util)}`} style={{ width: `${util}%` }} />
                              </div>
                            </div>
                          </Td>
                          <Td>
                            {op ? <span className="inline-flex items-center gap-2"><Avatar initials={op.initials} color={op.color} size={22} ring={false} />{op.name}</span>
                              : <Pill tone="bg-red-soft text-red">✕ Missing</Pill>}
                          </Td>
                          <Td>{e.costPerHour ? `$${e.costPerHour}` : '—'}</Td>
                          <Td>{e.maintenance ? <Pill tone={MAINT_TONE[e.maintenance]}>{e.maintenance}</Pill> : <span className="text-muted">—</span>}</Td>
                          <Td>{e.serviceUntilMonth != null ? <span className={expiring ? 'font-semibold text-red' : 'text-ink'}>{expiring ? '⚠ ' : ''}{calLabel(p, e.serviceUntilMonth)}</span> : <span className="text-muted">—</span>}</Td>
                          <Td><RemoveBtn onClick={() => update(p.id, (prj) => ({ ...prj, equipment: prj.equipment.filter((_, idx) => idx !== i) }))} /></Td>
                        </tr>
                      )
                    })}
                    {shown.length === 0 && <tr><Td className="text-muted">No equipment in this view.</Td></tr>}
                  </tbody>
                </table>
              </div>
              <div className="border-t border-line p-4">
                <InlineAddForm addLabel="＋ Add equipment / asset"
                  fields={[
                    { key: 'name', placeholder: 'Asset name', width: '170px' },
                    { key: 'category', placeholder: 'Type', width: '120px' },
                    { key: 'phase', placeholder: 'Assigned phase', width: '140px' },
                    { key: 'status', type: 'select', options: EQUIP_STATUS, placeholder: 'Status' },
                    { key: 'cost', type: 'number', placeholder: 'Cost/hr', width: '90px', required: false },
                    { key: 'maintenance', type: 'select', options: ['Up to date', 'Due soon', 'Pending', 'Overdue'], placeholder: 'Maintenance' },
                  ]}
                  onAdd={(v) => update(p.id, (prj) => ({ ...prj, equipment: [...prj.equipment, { name: v.name, category: v.category, phase: v.phase, status: v.status as Equipment['status'], costPerHour: v.cost ? Number(v.cost) : undefined, maintenance: v.maintenance as Equipment['maintenance'], utilization: 0 }] }))}
                />
              </div>
            </Card>
          </div>
        )
      })()}

      {/* Budget */}
      {tab === 2 && (
        <Card className="overflow-hidden">
          <div className="px-5 pt-4 pb-2 text-sm font-semibold">Budget breakdown</div>
          <table className="w-full">
            <thead className="border-y border-line bg-[#fafbfc]"><tr><Th>Phase / line</Th><Th>Allocated (AED)</Th><Th>Category</Th><Th>Remove</Th></tr></thead>
            <tbody>
              {p.budgetLines.map((b, i) => (
                <tr key={i} className="border-b border-line last:border-0">
                  <Td className="font-semibold">{b.phase}</Td>
                  <Td>
                    <input type="number" value={b.allocated}
                      onChange={(e) => setBudgetLines(p.budgetLines.map((line, idx) => (idx === i ? { ...line, allocated: Number(e.target.value) || 0 } : line)))}
                      className="w-40 rounded-lg border border-line px-2.5 py-1.5 text-sm outline-none focus:border-navy" />
                  </Td>
                  <Td className="text-muted">{b.category}</Td>
                  <Td><RemoveBtn onClick={() => setBudgetLines(p.budgetLines.filter((_, idx) => idx !== i))} /></Td>
                </tr>
              ))}
              <tr className="bg-[#fafbfc]"><Td className="font-bold">Total</Td><Td className="font-bold">{p.budgetLines.reduce((a, b) => a + b.allocated, 0).toLocaleString('en-US')}</Td><Td /><Td /></tr>
            </tbody>
          </table>
          <div className="border-t border-line p-4">
            <InlineAddForm addLabel="＋ Add budget line"
              fields={[
                { key: 'phase', placeholder: 'Phase / line', width: '200px' },
                { key: 'allocated', type: 'number', placeholder: 'Amount (AED)', width: '150px' },
                { key: 'category', placeholder: 'Category', width: '160px' },
              ]}
              onAdd={(v) => setBudgetLines([...p.budgetLines, { phase: v.phase, allocated: Number(v.allocated) || 0, category: v.category }])}
            />
            <p className="mt-2 text-xs text-muted">Total budget tracks the sum of the lines and updates across all screens. Current total: {aed(p.budgetLines.reduce((a, b) => a + b.allocated, 0))}.</p>
          </div>
        </Card>
      )}
    </div>
  )
}
