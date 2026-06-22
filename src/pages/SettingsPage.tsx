import { useState } from 'react'
import { useProject } from './ProjectLayout'
import { useStore } from '../store/useStore'
import { Card, CardHead, Avatar, Chip, RagDot } from '../components/ui/primitives'
import { InlineAddForm } from '../components/ui/InlineAddForm'
import type { AccessLevel, RAG } from '../data/types'

const ACCESS_LEVELS: AccessLevel[] = ['Full access', 'Budget view', 'Execution view', 'Read only']
const inputCls = 'w-full rounded-xl border border-line bg-card px-3 py-2.5 text-sm text-ink outline-none focus:border-navy'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid grid-cols-[150px_1fr] items-center gap-3">
      <span className="text-sm text-muted">{label}</span>
      <div className="min-w-0">{children}</div>
    </label>
  )
}
function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted">{children}</th>
}
function Td({ children, className = '' }: { children?: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 text-sm text-ink ${className}`}>{children}</td>
}
function RemoveBtn({ onClick }: { onClick: () => void }) {
  return <button onClick={onClick} title="Remove" className="grid h-8 w-8 place-items-center rounded-lg text-muted transition hover:bg-red-soft hover:text-red">🗑</button>
}

export function SettingsPage() {
  const p = useProject()
  const update = useStore((s) => s.updateProject)
  const [tab, setTab] = useState(0)
  const TABS = ['General', 'Stakeholders', 'Access & permissions']

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

      {/* General */}
      {tab === 0 && (
        <Card className="p-5">
          <CardHead title="General — parameters set during creation" />
          <div className="mt-3 grid gap-3.5">
            <Field label="Project name">
              <input className={inputCls} value={p.name} onChange={(e) => update(p.id, (prj) => ({ ...prj, name: e.target.value }))} />
            </Field>
            <Field label="Domain / sector">
              <input className={inputCls} value={p.domain} onChange={(e) => update(p.id, (prj) => ({ ...prj, domain: e.target.value }))} />
            </Field>
            <Field label="Location">
              <input className={inputCls} value={p.location ?? ''} onChange={(e) => update(p.id, (prj) => ({ ...prj, location: e.target.value }))} placeholder="Physical site" />
            </Field>
            <Field label="Description">
              <textarea className={`${inputCls} h-20 resize-none`} value={p.description ?? ''} onChange={(e) => update(p.id, (prj) => ({ ...prj, description: e.target.value }))} />
            </Field>
            <Field label="Total budget (AED)">
              <input type="number" className={inputCls} value={p.totalBudget} onChange={(e) => update(p.id, (prj) => ({ ...prj, totalBudget: Number(e.target.value) || 0 }))} />
            </Field>
          </div>
          <p className="mt-4 text-xs text-muted">Changes here propagate everywhere instantly (header, cards, dashboards).</p>
        </Card>
      )}

      {/* Stakeholders edit mode */}
      {tab === 1 && (
        <div className="grid gap-5">
          <p className="text-sm text-muted">Stakeholders appear read-only on the Overview. This is where you actually add, edit or remove them.</p>
          <Card className="overflow-hidden">
            <div className="px-5 pt-4 pb-2 text-sm font-semibold">Internal stakeholders</div>
            <table className="w-full">
              <thead className="border-y border-line bg-[#fafbfc]"><tr><Th>Name</Th><Th>Title</Th><Th>Notification</Th><Th>Remove</Th></tr></thead>
              <tbody>
                {p.internalStakeholders.map((s, i) => (
                  <tr key={i} className="border-b border-line last:border-0">
                    <Td className="font-semibold">{s.name}</Td><Td>{s.title}</Td><Td><Chip>{s.notification}</Chip></Td>
                    <Td><RemoveBtn onClick={() => update(p.id, (prj) => ({ ...prj, internalStakeholders: prj.internalStakeholders.filter((_, idx) => idx !== i) }))} /></Td>
                  </tr>
                ))}
                {p.internalStakeholders.length === 0 && <tr><Td className="text-muted">None yet.</Td></tr>}
              </tbody>
            </table>
            <div className="border-t border-line p-4">
              <InlineAddForm addLabel="＋ Add internal stakeholder"
                fields={[{ key: 'name', placeholder: 'Name', width: '180px' }, { key: 'title', placeholder: 'Title', width: '220px' }, { key: 'notification', placeholder: 'Notification level', width: '180px' }]}
                onAdd={(v) => update(p.id, (prj) => ({ ...prj, internalStakeholders: [...prj.internalStakeholders, { name: v.name, title: v.title, notification: v.notification }] }))}
              />
            </div>
          </Card>
          <Card className="overflow-hidden">
            <div className="px-5 pt-4 pb-2 text-sm font-semibold">External partners</div>
            <table className="w-full">
              <thead className="border-y border-line bg-[#fafbfc]"><tr><Th>Organization</Th><Th>Contact</Th><Th>Role</Th><Th>Status</Th><Th>Remove</Th></tr></thead>
              <tbody>
                {p.externalPartners.map((s, i) => (
                  <tr key={i} className="border-b border-line last:border-0">
                    <Td className="font-semibold">{s.org}</Td><Td>{s.contact}</Td><Td>{s.role}</Td><Td><RagDot rag={s.status} /></Td>
                    <Td><RemoveBtn onClick={() => update(p.id, (prj) => ({ ...prj, externalPartners: prj.externalPartners.filter((_, idx) => idx !== i) }))} /></Td>
                  </tr>
                ))}
                {p.externalPartners.length === 0 && <tr><Td className="text-muted">None yet.</Td></tr>}
              </tbody>
            </table>
            <div className="border-t border-line p-4">
              <InlineAddForm addLabel="＋ Add external partner"
                fields={[{ key: 'org', placeholder: 'Organization', width: '170px' }, { key: 'contact', placeholder: 'Contact', width: '150px' }, { key: 'role', placeholder: 'Role', width: '180px' }, { key: 'status', type: 'select', options: ['green', 'amber', 'red'], placeholder: 'Status' }]}
                onAdd={(v) => update(p.id, (prj) => ({ ...prj, externalPartners: [...prj.externalPartners, { org: v.org, contact: v.contact, role: v.role, status: v.status as RAG }] }))}
              />
            </div>
          </Card>
        </div>
      )}

      {/* Access & permissions */}
      {tab === 2 && (
        <Card className="overflow-hidden">
          <div className="px-5 pt-4 pb-2 text-sm font-semibold">Access & permissions</div>
          <table className="w-full">
            <thead className="border-y border-line bg-[#fafbfc]"><tr><Th>Member</Th><Th>Role</Th><Th>Access level</Th></tr></thead>
            <tbody>
              {p.team.map((m) => (
                <tr key={m.id} className="border-b border-line last:border-0">
                  <Td><div className="flex items-center gap-3"><Avatar initials={m.initials} color={m.color} ring={false} /><span className="font-semibold">{m.name}</span></div></Td>
                  <Td>{m.role}</Td>
                  <Td>
                    <select value={m.access} onChange={(e) => update(p.id, (prj) => ({ ...prj, team: prj.team.map((t) => (t.id === m.id ? { ...t, access: e.target.value as AccessLevel } : t)) }))}
                      className="rounded-lg border border-line bg-card px-2.5 py-1.5 text-sm outline-none focus:border-navy">
                      {ACCESS_LEVELS.map((a) => <option key={a}>{a}</option>)}
                    </select>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="border-t border-line p-4 text-xs text-muted">
            Access levels are saved per member. In the full product these gate what each person can see and edit after sign-in; in this PoC they're stored but not enforced (no authentication layer).
          </p>
        </Card>
      )}
    </div>
  )
}
