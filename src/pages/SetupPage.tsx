import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProject } from './ProjectLayout'
import { Card, Avatar, Chip, Button, RagDot } from '../components/ui/primitives'
import { aed } from '../lib/format'

const TABS = ['Team & Roles', 'Stakeholders', 'Budget & Resources', 'Dependencies & Risks']

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted">{children}</th>
}
function Td({ children, className = '' }: { children?: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 text-sm text-ink ${className}`}>{children}</td>
}

export function SetupPage() {
  const p = useProject()
  const navigate = useNavigate()
  const [tab, setTab] = useState(0)

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
          <table className="w-full">
            <thead className="border-b border-line bg-[#fafbfc]">
              <tr>
                <Th>Member</Th>
                <Th>Role</Th>
                <Th>Access level</Th>
                <Th>Actions</Th>
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
                  <Td className="text-muted">Edit · Remove</Td>
                </tr>
              ))}
            </tbody>
          </table>
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
