import { useProject } from './ProjectLayout'
import { useStore } from '../store/useStore'
import { Card, Chip, RagDot } from '../components/ui/primitives'
import { InlineAddForm } from '../components/ui/InlineAddForm'
import type { RAG, Risk } from '../data/types'

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted">{children}</th>
}
function Td({ children, className = '' }: { children?: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 text-sm text-ink ${className}`}>{children}</td>
}
function RemoveBtn({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} title="Remove"
      className="grid h-8 w-8 place-items-center rounded-lg text-muted transition hover:bg-red-soft hover:text-red">🗑</button>
  )
}
const sevTone = (v: string): 'gray' | 'amber' | 'red' => (v === 'High' ? 'red' : v === 'Medium' ? 'amber' : 'gray')

export function RisksPage() {
  const p = useProject()
  const update = useStore((s) => s.updateProject)

  return (
    <div className="grid gap-5">
      <p className="text-sm text-muted">Active risk management — the register, blocking dependencies, and assumptions that need validation. Updated as the project runs.</p>

      {/* Risk register */}
      <Card className="overflow-hidden">
        <div className="px-5 pt-4 pb-2 text-sm font-semibold">Risk register</div>
        <table className="w-full">
          <thead className="border-y border-line bg-[#fafbfc]"><tr><Th>Risk</Th><Th>Probability</Th><Th>Impact</Th><Th>Mitigation</Th><Th>Owner</Th><Th>Remove</Th></tr></thead>
          <tbody>
            {p.risks.map((r, i) => (
              <tr key={i} className="border-b border-line last:border-0">
                <Td className="font-semibold">{r.risk}</Td>
                <Td><Chip tone={sevTone(r.probability)}>{r.probability}</Chip></Td>
                <Td><Chip tone={sevTone(r.impact)}>{r.impact}</Chip></Td>
                <Td className="text-muted">{r.mitigation}</Td>
                <Td className="text-muted">{r.owner}</Td>
                <Td><RemoveBtn onClick={() => update(p.id, (prj) => ({ ...prj, risks: prj.risks.filter((_, idx) => idx !== i) }))} /></Td>
              </tr>
            ))}
            {p.risks.length === 0 && <tr><Td className="text-muted">No risks logged yet.</Td></tr>}
          </tbody>
        </table>
        <div className="border-t border-line p-4">
          <InlineAddForm addLabel="＋ Log risk"
            fields={[
              { key: 'risk', placeholder: 'Risk', width: '190px' },
              { key: 'probability', type: 'select', options: ['Low', 'Medium', 'High'], placeholder: 'Probability' },
              { key: 'impact', type: 'select', options: ['Low', 'Medium', 'High'], placeholder: 'Impact' },
              { key: 'mitigation', placeholder: 'Mitigation', width: '170px' },
              { key: 'owner', placeholder: 'Owner', width: '140px' },
            ]}
            onAdd={(v) => update(p.id, (prj) => ({ ...prj, risks: [...prj.risks, { risk: v.risk, probability: v.probability as Risk['probability'], impact: v.impact as Risk['impact'], mitigation: v.mitigation, owner: v.owner }] }))}
          />
        </div>
      </Card>

      {/* Dependencies */}
      <Card className="overflow-hidden">
        <div className="px-5 pt-4 pb-2 text-sm font-semibold">Dependencies</div>
        <table className="w-full">
          <thead className="border-y border-line bg-[#fafbfc]"><tr><Th>Dependency</Th><Th>Type</Th><Th>Owner</Th><Th>Required by</Th><Th>Status</Th><Th>Remove</Th></tr></thead>
          <tbody>
            {p.dependencies.map((d, i) => (
              <tr key={i} className="border-b border-line last:border-0">
                <Td className="font-semibold">{d.dependency}</Td><Td>{d.type}</Td><Td>{d.owner}</Td><Td className="text-muted">{d.requiredBy}</Td><Td><RagDot rag={d.status} /></Td>
                <Td><RemoveBtn onClick={() => update(p.id, (prj) => ({ ...prj, dependencies: prj.dependencies.filter((_, idx) => idx !== i) }))} /></Td>
              </tr>
            ))}
            {p.dependencies.length === 0 && <tr><Td className="text-muted">No dependencies yet.</Td></tr>}
          </tbody>
        </table>
        <div className="border-t border-line p-4">
          <InlineAddForm addLabel="＋ Add dependency"
            fields={[
              { key: 'dependency', placeholder: 'Dependency', width: '180px' },
              { key: 'type', placeholder: 'Type', width: '120px' },
              { key: 'owner', placeholder: 'Owner', width: '140px' },
              { key: 'requiredBy', placeholder: 'Required by', width: '150px' },
              { key: 'status', type: 'select', options: ['green', 'amber', 'red'], placeholder: 'Status' },
            ]}
            onAdd={(v) => update(p.id, (prj) => ({ ...prj, dependencies: [...prj.dependencies, { dependency: v.dependency, type: v.type, owner: v.owner, requiredBy: v.requiredBy, status: v.status as RAG }] }))}
          />
        </div>
      </Card>

      {/* Assumptions log */}
      <Card className="overflow-hidden">
        <div className="px-5 pt-4 pb-2 text-sm font-semibold">Assumptions log</div>
        <p className="px-5 pb-2 text-xs text-muted">Things the team assumed to be true that still need validation.</p>
        <table className="w-full">
          <thead className="border-y border-line bg-[#fafbfc]"><tr><Th>Assumption</Th><Th>Owner</Th><Th>Status</Th><Th>Remove</Th></tr></thead>
          <tbody>
            {p.assumptions.map((a, i) => (
              <tr key={i} className="border-b border-line last:border-0">
                <Td className="font-semibold">{a.text}</Td><Td className="text-muted">{a.owner}</Td>
                <Td><Chip tone={a.status === 'Validated' ? 'green' : a.status === 'Rejected' ? 'red' : 'amber'}>{a.status}</Chip></Td>
                <Td><RemoveBtn onClick={() => update(p.id, (prj) => ({ ...prj, assumptions: prj.assumptions.filter((_, idx) => idx !== i) }))} /></Td>
              </tr>
            ))}
            {p.assumptions.length === 0 && <tr><Td className="text-muted">No assumptions logged yet.</Td></tr>}
          </tbody>
        </table>
        <div className="border-t border-line p-4">
          <InlineAddForm addLabel="＋ Add assumption"
            fields={[
              { key: 'text', placeholder: 'Assumption', width: '240px' },
              { key: 'owner', placeholder: 'Owner', width: '140px' },
              { key: 'status', type: 'select', options: ['Open', 'Validated', 'Rejected'], placeholder: 'Status' },
            ]}
            onAdd={(v) => update(p.id, (prj) => ({ ...prj, assumptions: [...prj.assumptions, { text: v.text, owner: v.owner, status: v.status as 'Open' | 'Validated' | 'Rejected' }] }))}
          />
        </div>
      </Card>
    </div>
  )
}
