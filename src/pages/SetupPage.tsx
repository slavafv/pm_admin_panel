import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProject } from './ProjectLayout'
import { useStore } from '../store/useStore'
import { Card, Avatar, Chip, Button, RagDot } from '../components/ui/primitives'
import { aed } from '../lib/format'
import type { AccessLevel, TeamMember, TeamRole } from '../data/types'

const TABS = ['Team & Roles', 'Stakeholders', 'Budget & Resources', 'Dependencies & Risks']

const ROLE_OPTIONS: TeamRole[] = ['Project Manager', 'Department Head', 'Finance Officer', 'Senior Engineer', 'Document Controller', 'Observer', 'External Partner']
const ACCESS_BY_ROLE: Record<string, AccessLevel> = {
  'Project Manager': 'Full access',
  'Department Head': 'Full access',
  'Finance Officer': 'Budget view',
  'Senior Engineer': 'Execution view',
  'Document Controller': 'Read only',
  Observer: 'Read only',
  'External Partner': 'Read only',
}
const AVATAR_COLORS = ['#1a2235', '#4caf82', '#3b82f6', '#f0a830', '#e2574c']

function memberInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted">{children}</th>
}
function Td({ children, className = '' }: { children?: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 text-sm text-ink ${className}`}>{children}</td>
}

export function SetupPage() {
  const p = useProject()
  const navigate = useNavigate()
  const addTeamMember = useStore((s) => s.addTeamMember)
  const removeTeamMember = useStore((s) => s.removeTeamMember)
  const [tab, setTab] = useState(0)
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [newRole, setNewRole] = useState<TeamRole>('Senior Engineer')

  function confirmAdd() {
    const name = newName.trim()
    if (!name) return
    const member: TeamMember = {
      id: `m-${Date.now()}`,
      name,
      role: newRole,
      access: ACCESS_BY_ROLE[newRole],
      initials: memberInitials(name),
      color: AVATAR_COLORS[p.team.length % AVATAR_COLORS.length],
      fteByPhase: p.phases.map(() => 0.5),
      capacity: 1,
    }
    addTeamMember(p.id, member)
    setNewName('')
    setNewRole('Senior Engineer')
    setAdding(false)
  }

  return (
    <div className="grid gap-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {TABS.map((t, i) => (
            <button
              key={t}
              onClick={() => setTab(i)}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition ${
                tab === i ? 'bg-navy text-white' : 'bg-card border border-line text-[#475467] hover:bg-[#f3f5f9]'
              }`}
            >
              <span
                className={`grid h-5 w-5 place-items-center rounded-full text-[11px] ${
                  tab === i ? 'bg-white/20' : 'bg-[#eef0f4]'
                }`}
              >
                {i + 1}
              </span>
              {t}
            </button>
          ))}
        </div>
        <span className="text-sm text-muted">Step {tab + 1} of 4</span>
      </div>

      {tab === 0 && (
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between px-5 pt-4">
            <h3 className="text-sm font-semibold">Core delivery team</h3>
            <span className="text-xs text-muted">{p.team.length} member{p.team.length === 1 ? '' : 's'}</span>
          </div>
          <table className="mt-2 w-full">
            <thead className="border-y border-line bg-[#fafbfc]">
              <tr>
                <Th>Member</Th>
                <Th>Role</Th>
                <Th>Access level</Th>
                <Th>Remove</Th>
              </tr>
            </thead>
            <tbody>
              {p.team.map((m) => (
                <tr key={m.id} className="border-b border-line last:border-0">
                  <Td>
                    <div className="flex items-center gap-3">
                      <Avatar initials={m.initials} color={m.color} ring={false} />
                      <span className="font-semibold">{m.name}</span>
                    </div>
                  </Td>
                  <Td>{m.role}</Td>
                  <Td>
                    <Chip>{m.access}</Chip>
                  </Td>
                  <Td>
                    <button
                      onClick={() => removeTeamMember(p.id, m.id)}
                      disabled={m.id === p.pmId}
                      title={m.id === p.pmId ? 'The project manager cannot be removed' : 'Remove member'}
                      className="grid h-8 w-8 place-items-center rounded-lg text-muted transition hover:bg-red-soft hover:text-red disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-muted"
                    >
                      🗑
                    </button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="border-t border-line p-4">
            {adding ? (
              <div className="flex flex-wrap items-center gap-2">
                <input
                  autoFocus
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && confirmAdd()}
                  placeholder="Full name"
                  className="rounded-xl border border-line px-3 py-2 text-sm outline-none focus:border-navy"
                />
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as TeamRole)}
                  className="rounded-xl border border-line px-3 py-2 text-sm outline-none focus:border-navy"
                >
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
                <Button onClick={confirmAdd} disabled={!newName.trim()}>
                  Add
                </Button>
                <Button variant="ghost" onClick={() => setAdding(false)}>
                  Cancel
                </Button>
              </div>
            ) : (
              <button onClick={() => setAdding(true)} className="text-sm font-semibold text-navy hover:underline">
                ＋ Add team member
              </button>
            )}
          </div>
        </Card>
      )}

      {tab === 1 && (
        <div className="grid gap-5">
          <Card className="overflow-hidden">
            <div className="px-5 pt-4 pb-2 text-sm font-semibold">Internal stakeholders</div>
            <table className="w-full">
              <thead className="border-y border-line bg-[#fafbfc]">
                <tr>
                  <Th>Name</Th>
                  <Th>Title</Th>
                  <Th>Notification level</Th>
                </tr>
              </thead>
              <tbody>
                {p.internalStakeholders.map((s) => (
                  <tr key={s.name} className="border-b border-line last:border-0">
                    <Td className="font-semibold">{s.name}</Td>
                    <Td>{s.title}</Td>
                    <Td>
                      <Chip>{s.notification}</Chip>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
          <Card className="overflow-hidden">
            <div className="px-5 pt-4 pb-2 text-sm font-semibold">External partners (PPP consortium)</div>
            <table className="w-full">
              <thead className="border-y border-line bg-[#fafbfc]">
                <tr>
                  <Th>Organization</Th>
                  <Th>Contact</Th>
                  <Th>Role</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody>
                {p.externalPartners.map((s) => (
                  <tr key={s.org} className="border-b border-line last:border-0">
                    <Td className="font-semibold">{s.org}</Td>
                    <Td>{s.contact}</Td>
                    <Td>{s.role}</Td>
                    <Td>
                      <RagDot rag={s.status} />
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {tab === 2 && (
        <div className="grid gap-5">
          <Card className="overflow-hidden">
            <div className="px-5 pt-4 pb-2 text-sm font-semibold">Budget breakdown</div>
            <table className="w-full">
              <thead className="border-y border-line bg-[#fafbfc]">
                <tr>
                  <Th>Phase</Th>
                  <Th>Allocated (AED)</Th>
                  <Th>Category</Th>
                </tr>
              </thead>
              <tbody>
                {p.budgetLines.map((b) => (
                  <tr key={b.phase} className="border-b border-line last:border-0">
                    <Td className="font-semibold">{b.phase}</Td>
                    <Td>{b.allocated.toLocaleString('en-US')}</Td>
                    <Td className="text-muted">{b.category}</Td>
                  </tr>
                ))}
                <tr className="bg-[#fafbfc]">
                  <Td className="font-bold">Total</Td>
                  <Td className="font-bold">{p.totalBudget.toLocaleString('en-US')}</Td>
                  <Td />
                </tr>
              </tbody>
            </table>
          </Card>
          <Card className="overflow-hidden">
            <div className="px-5 pt-4 pb-2 text-sm font-semibold">Equipment / assets</div>
            <table className="w-full">
              <thead className="border-y border-line bg-[#fafbfc]">
                <tr>
                  <Th>Asset</Th>
                  <Th>Category</Th>
                  <Th>Assigned phase</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody>
                {p.equipment.map((e) => (
                  <tr key={e.name} className="border-b border-line last:border-0">
                    <Td className="font-semibold">{e.name}</Td>
                    <Td>{e.category}</Td>
                    <Td>{e.phase}</Td>
                    <Td>
                      <Chip>{e.status}</Chip>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {tab === 3 && (
        <div className="grid gap-5">
          <Card className="overflow-hidden">
            <div className="px-5 pt-4 pb-2 text-sm font-semibold">Dependencies</div>
            <table className="w-full">
              <thead className="border-y border-line bg-[#fafbfc]">
                <tr>
                  <Th>Dependency</Th>
                  <Th>Type</Th>
                  <Th>Owner</Th>
                  <Th>Required by</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody>
                {p.dependencies.map((d) => (
                  <tr key={d.dependency} className="border-b border-line last:border-0">
                    <Td className="font-semibold">{d.dependency}</Td>
                    <Td>{d.type}</Td>
                    <Td>{d.owner}</Td>
                    <Td className="text-muted">{d.requiredBy}</Td>
                    <Td>
                      <RagDot rag={d.status} />
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
          <Card className="overflow-hidden">
            <div className="px-5 pt-4 pb-2 text-sm font-semibold">Top risks</div>
            <table className="w-full">
              <thead className="border-y border-line bg-[#fafbfc]">
                <tr>
                  <Th>Risk</Th>
                  <Th>Probability</Th>
                  <Th>Impact</Th>
                  <Th>Mitigation</Th>
                </tr>
              </thead>
              <tbody>
                {p.risks.map((r) => (
                  <tr key={r.risk} className="border-b border-line last:border-0">
                    <Td className="font-semibold">{r.risk}</Td>
                    <Td>{r.probability}</Td>
                    <Td>{r.impact}</Td>
                    <Td className="text-muted">{r.mitigation}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      <div className="flex justify-end">
        {tab < 3 ? (
          <Button onClick={() => setTab((t) => t + 1)}>Save & next →</Button>
        ) : (
          <Button onClick={() => navigate('../schedule')}>Save & continue to schedule →</Button>
        )}
      </div>

      <p className="text-xs text-muted">
        Budget total {aed(p.totalBudget)} · {p.team.length} team members · {p.externalPartners.length} PPP partners
      </p>
    </div>
  )
}
