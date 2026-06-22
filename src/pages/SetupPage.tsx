import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProject } from './ProjectLayout'
import { useStore } from '../store/useStore'
import { Card, Avatar, Chip, Button, RagDot } from '../components/ui/primitives'
import { InlineAddForm } from '../components/ui/InlineAddForm'
import { aed } from '../lib/format'
import type { AccessLevel, RAG, Risk, TeamMember, TeamRole } from '../data/types'

const TABS = ['Team & Roles', 'Stakeholders', 'Budget & Resources', 'Dependencies & Risks']
const ACCESS_LEVELS: AccessLevel[] = ['Full access', 'Budget view', 'Execution view', 'Read only']
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
function RemoveBtn({ onClick, disabled, title }: { onClick: () => void; disabled?: boolean; title?: string }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title ?? 'Remove'}
      className="grid h-8 w-8 place-items-center rounded-lg text-muted transition hover:bg-red-soft hover:text-red disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-muted"
    >
      🗑
    </button>
  )
}

export function SetupPage() {
  const p = useProject()
  const navigate = useNavigate()
  const update = useStore((s) => s.updateProject)
  const addTeamMember = useStore((s) => s.addTeamMember)
  const removeTeamMember = useStore((s) => s.removeTeamMember)
  const [tab, setTab] = useState(0)

  // ---- Team add form ----
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [newRole, setNewRole] = useState<TeamRole>('Senior Engineer')

  function confirmAddMember() {
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

  function setAccess(memberId: string, access: AccessLevel) {
    update(p.id, (prj) => ({ ...prj, team: prj.team.map((t) => (t.id === memberId ? { ...t, access } : t)) }))
  }

  // ---- budget helpers (total stays = sum of allocations) ----
  function setBudgetLines(lines: typeof p.budgetLines) {
    update(p.id, (prj) => ({ ...prj, budgetLines: lines, totalBudget: lines.reduce((a, b) => a + b.allocated, 0) }))
  }

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {TABS.map((t, i) => (
            <button
              key={t}
              onClick={() => setTab(i)}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition ${
                tab === i ? 'bg-navy text-white' : 'bg-card border border-line text-[#475467] hover:bg-[#f3f5f9]'
              }`}
            >
              <span className={`grid h-5 w-5 place-items-center rounded-full text-[11px] ${tab === i ? 'bg-white/20' : 'bg-[#eef0f4]'}`}>
                {i + 1}
              </span>
              {t}
            </button>
          ))}
        </div>
        <span className="text-sm text-muted">Step {tab + 1} of 4</span>
      </div>

      {/* ---------------- Tab 1: Team & roles ---------------- */}
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
                    <select
                      value={m.access}
                      onChange={(e) => setAccess(m.id, e.target.value as AccessLevel)}
                      className="rounded-lg border border-line bg-card px-2.5 py-1.5 text-sm outline-none focus:border-navy"
                    >
                      {ACCESS_LEVELS.map((a) => (
                        <option key={a}>{a}</option>
                      ))}
                    </select>
                  </Td>
                  <Td>
                    <RemoveBtn
                      onClick={() => removeTeamMember(p.id, m.id)}
                      disabled={m.id === p.pmId}
                      title={m.id === p.pmId ? 'The project manager cannot be removed' : 'Remove member'}
                    />
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
                  onKeyDown={(e) => e.key === 'Enter' && confirmAddMember()}
                  placeholder="Full name"
                  className="rounded-xl border border-line px-3 py-2 text-sm outline-none focus:border-navy"
                />
                <select value={newRole} onChange={(e) => setNewRole(e.target.value as TeamRole)} className="rounded-xl border border-line px-3 py-2 text-sm outline-none focus:border-navy">
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
                <Button onClick={confirmAddMember} disabled={!newName.trim()}>
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

      {/* ---------------- Tab 2: Stakeholders ---------------- */}
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
                  <Th>Remove</Th>
                </tr>
              </thead>
              <tbody>
                {p.internalStakeholders.map((s, i) => (
                  <tr key={i} className="border-b border-line last:border-0">
                    <Td className="font-semibold">{s.name}</Td>
                    <Td>{s.title}</Td>
                    <Td>
                      <Chip>{s.notification}</Chip>
                    </Td>
                    <Td>
                      <RemoveBtn onClick={() => update(p.id, (prj) => ({ ...prj, internalStakeholders: prj.internalStakeholders.filter((_, idx) => idx !== i) }))} />
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="border-t border-line p-4">
              <InlineAddForm
                addLabel="＋ Add internal stakeholder"
                fields={[
                  { key: 'name', placeholder: 'Name', width: '180px' },
                  { key: 'title', placeholder: 'Title', width: '220px' },
                  { key: 'notification', placeholder: 'Notification level', width: '180px' },
                ]}
                onAdd={(v) =>
                  update(p.id, (prj) => ({
                    ...prj,
                    internalStakeholders: [...prj.internalStakeholders, { name: v.name, title: v.title, notification: v.notification }],
                  }))
                }
              />
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="px-5 pt-4 pb-2 text-sm font-semibold">External partners</div>
            <table className="w-full">
              <thead className="border-y border-line bg-[#fafbfc]">
                <tr>
                  <Th>Organization</Th>
                  <Th>Contact</Th>
                  <Th>Role</Th>
                  <Th>Status</Th>
                  <Th>Remove</Th>
                </tr>
              </thead>
              <tbody>
                {p.externalPartners.map((s, i) => (
                  <tr key={i} className="border-b border-line last:border-0">
                    <Td className="font-semibold">{s.org}</Td>
                    <Td>{s.contact}</Td>
                    <Td>{s.role}</Td>
                    <Td>
                      <RagDot rag={s.status} />
                    </Td>
                    <Td>
                      <RemoveBtn onClick={() => update(p.id, (prj) => ({ ...prj, externalPartners: prj.externalPartners.filter((_, idx) => idx !== i) }))} />
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="border-t border-line p-4">
              <InlineAddForm
                addLabel="＋ Add external partner"
                fields={[
                  { key: 'org', placeholder: 'Organization', width: '170px' },
                  { key: 'contact', placeholder: 'Contact', width: '150px' },
                  { key: 'role', placeholder: 'Role', width: '190px' },
                  { key: 'status', type: 'select', options: ['green', 'amber', 'red'], placeholder: 'Status' },
                ]}
                onAdd={(v) =>
                  update(p.id, (prj) => ({
                    ...prj,
                    externalPartners: [...prj.externalPartners, { org: v.org, contact: v.contact, role: v.role, status: v.status as RAG }],
                  }))
                }
              />
            </div>
          </Card>
        </div>
      )}

      {/* ---------------- Tab 3: Budget & resources ---------------- */}
      {tab === 2 && (
        <Card className="overflow-hidden">
          <div className="px-5 pt-4 pb-2 text-sm font-semibold">Budget breakdown</div>
          <table className="w-full">
            <thead className="border-y border-line bg-[#fafbfc]">
              <tr>
                <Th>Phase</Th>
                <Th>Allocated (AED)</Th>
                <Th>Category</Th>
                <Th>Remove</Th>
              </tr>
            </thead>
            <tbody>
              {p.budgetLines.map((b, i) => (
                <tr key={i} className="border-b border-line last:border-0">
                  <Td className="font-semibold">{b.phase}</Td>
                  <Td>
                    <input
                      type="number"
                      value={b.allocated}
                      onChange={(e) =>
                        setBudgetLines(p.budgetLines.map((line, idx) => (idx === i ? { ...line, allocated: Number(e.target.value) || 0 } : line)))
                      }
                      className="w-40 rounded-lg border border-line px-2.5 py-1.5 text-sm outline-none focus:border-navy"
                    />
                  </Td>
                  <Td className="text-muted">{b.category}</Td>
                  <Td>
                    <RemoveBtn onClick={() => setBudgetLines(p.budgetLines.filter((_, idx) => idx !== i))} />
                  </Td>
                </tr>
              ))}
              <tr className="bg-[#fafbfc]">
                <Td className="font-bold">Total</Td>
                <Td className="font-bold">{p.budgetLines.reduce((a, b) => a + b.allocated, 0).toLocaleString('en-US')}</Td>
                <Td />
                <Td />
              </tr>
            </tbody>
          </table>
          <div className="border-t border-line p-4">
            <InlineAddForm
              addLabel="＋ Add budget line"
              fields={[
                { key: 'phase', placeholder: 'Phase / line', width: '200px' },
                { key: 'allocated', type: 'number', placeholder: 'Amount (AED)', width: '150px' },
                { key: 'category', placeholder: 'Category', width: '170px' },
              ]}
              onAdd={(v) => setBudgetLines([...p.budgetLines, { phase: v.phase, allocated: Number(v.allocated) || 0, category: v.category }])}
            />
            <p className="mt-2 text-xs text-muted">Total budget tracks the sum of the lines and updates across all screens.</p>
          </div>
        </Card>
      )}

      {/* ---------------- Tab 4: Dependencies & risks ---------------- */}
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
                  <Th>Remove</Th>
                </tr>
              </thead>
              <tbody>
                {p.dependencies.map((d, i) => (
                  <tr key={i} className="border-b border-line last:border-0">
                    <Td className="font-semibold">{d.dependency}</Td>
                    <Td>{d.type}</Td>
                    <Td>{d.owner}</Td>
                    <Td className="text-muted">{d.requiredBy}</Td>
                    <Td>
                      <RagDot rag={d.status} />
                    </Td>
                    <Td>
                      <RemoveBtn onClick={() => update(p.id, (prj) => ({ ...prj, dependencies: prj.dependencies.filter((_, idx) => idx !== i) }))} />
                    </Td>
                  </tr>
                ))}
                {p.dependencies.length === 0 && (
                  <tr>
                    <Td className="text-muted">No dependencies yet.</Td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="border-t border-line p-4">
              <InlineAddForm
                addLabel="＋ Add dependency"
                fields={[
                  { key: 'dependency', placeholder: 'Dependency', width: '190px' },
                  { key: 'type', placeholder: 'Type', width: '130px' },
                  { key: 'owner', placeholder: 'Owner', width: '150px' },
                  { key: 'requiredBy', placeholder: 'Required by', width: '150px' },
                  { key: 'status', type: 'select', options: ['green', 'amber', 'red'], placeholder: 'Status' },
                ]}
                onAdd={(v) =>
                  update(p.id, (prj) => ({
                    ...prj,
                    dependencies: [...prj.dependencies, { dependency: v.dependency, type: v.type, owner: v.owner, requiredBy: v.requiredBy, status: v.status as RAG }],
                  }))
                }
              />
            </div>
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
                  <Th>Remove</Th>
                </tr>
              </thead>
              <tbody>
                {p.risks.map((r, i) => (
                  <tr key={i} className="border-b border-line last:border-0">
                    <Td className="font-semibold">{r.risk}</Td>
                    <Td>{r.probability}</Td>
                    <Td>{r.impact}</Td>
                    <Td className="text-muted">{r.mitigation}</Td>
                    <Td>
                      <RemoveBtn onClick={() => update(p.id, (prj) => ({ ...prj, risks: prj.risks.filter((_, idx) => idx !== i) }))} />
                    </Td>
                  </tr>
                ))}
                {p.risks.length === 0 && (
                  <tr>
                    <Td className="text-muted">No risks logged yet.</Td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="border-t border-line p-4">
              <InlineAddForm
                addLabel="＋ Log risk"
                fields={[
                  { key: 'risk', placeholder: 'Risk', width: '190px' },
                  { key: 'probability', type: 'select', options: ['Low', 'Medium', 'High'], placeholder: 'Probability' },
                  { key: 'impact', type: 'select', options: ['Low', 'Medium', 'High'], placeholder: 'Impact' },
                  { key: 'mitigation', placeholder: 'Mitigation', width: '180px' },
                ]}
                onAdd={(v) =>
                  update(p.id, (prj) => ({
                    ...prj,
                    risks: [
                      ...prj.risks,
                      { risk: v.risk, probability: v.probability as Risk['probability'], impact: v.impact as Risk['impact'], mitigation: v.mitigation, owner: prj.team[0]?.name ?? '—' },
                    ],
                  }))
                }
              />
            </div>
          </Card>
        </div>
      )}

      <div className="flex justify-end">
        {tab < 3 ? (
          <Button onClick={() => setTab((t) => t + 1)}>Save & next →</Button>
        ) : (
          <Button onClick={() => navigate(`/projects/${p.id}/schedule`)}>Save & continue to schedule →</Button>
        )}
      </div>

      <p className="text-xs text-muted">
        Budget total {aed(p.budgetLines.reduce((a, b) => a + b.allocated, 0))} · {p.team.length} team members · {p.externalPartners.length} external partners
      </p>
    </div>
  )
}
