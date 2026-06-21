import { useNavigate } from 'react-router-dom'
import { useProject } from './ProjectLayout'
import { Card, Button, RagDot } from '../components/ui/primitives'
import { aed, monthLabel } from '../lib/format'
import { currentPhase, nextMilestone, teamCapacity, issueCounts } from '../lib/metrics'
import type { ReactNode } from 'react'

function Row({ label, value, status }: { label: string; value: ReactNode; status?: ReactNode }) {
  return (
    <div className="grid grid-cols-[1fr_1.4fr_1fr] items-center gap-4 border-b border-line px-5 py-3.5 last:border-0">
      <span className="text-sm text-muted">{label}</span>
      <span className="text-sm font-semibold text-ink">{value}</span>
      <span className="text-sm">{status}</span>
    </div>
  )
}

export function SummaryPage() {
  const p = useProject()
  const navigate = useNavigate()
  const phase = currentPhase(p)
  const next = nextMilestone(p)
  const cap = teamCapacity(p)
  const issues = issueCounts(p)

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-soft px-3 py-1.5 text-sm font-semibold text-amber">
          <RagDot rag={p.health} /> {p.healthNote}
        </span>
        <span className="rounded-full bg-card border border-line px-3 py-1.5 text-sm font-medium">
          Phase: {phase.name}
        </span>
        <span className="rounded-full bg-card border border-line px-3 py-1.5 text-sm font-medium">
          {p.overallProgress}% complete
        </span>
      </div>

      <div className="flex flex-wrap gap-2.5">
        <Button variant="soft" onClick={() => navigate('../schedule')}>
          ＋ Add task
        </Button>
        <Button variant="soft" onClick={() => navigate('../setup')}>
          ⚠ Log risk
        </Button>
        <Button variant="soft">📎 Upload document</Button>
        <Button variant="soft" onClick={() => navigate('../reports')}>
          📊 Generate report
        </Button>
      </div>

      <Card>
        <Row
          label="Current phase"
          value={phase.name}
          status={
            <span className="inline-flex items-center gap-1.5">
              <RagDot rag="amber" /> In progress
            </span>
          }
        />
        <Row label="Overall completion" value={`${p.overallProgress}%`} status="—" />
        <Row
          label="Budget spent"
          value={`${aed(p.spentBudget)} of ${aed(p.totalBudget)}`}
          status={
            <span className="inline-flex items-center gap-1.5">
              <RagDot rag="green" /> On track
            </span>
          }
        />
        {next && (
          <Row
            label="Next milestone"
            value={next.milestone.name}
            status={`${monthLabel(next.milestone.month, p.startYear)} · 📅 ${next.days} days`}
          />
        )}
        <Row
          label="Open issues"
          value={issues.total}
          status={
            <span className="inline-flex items-center gap-1.5">
              <RagDot rag="amber" /> {issues.by.medium} medium · {issues.by.low} low
            </span>
          }
        />
        <Row
          label="Risk level"
          value="Medium"
          status={<RagDot rag="amber" />}
        />
        <Row
          label="Team capacity"
          value={`${cap.used.toFixed(1)} / ${cap.available.toFixed(1)} FTE`}
          status={<RagDot rag="green" />}
        />
        <Row
          label="PPP partners"
          value={`${p.externalPartners.length} active`}
          status={<RagDot rag="green" />}
        />
        <Row label="Last updated" value="Today, 09:14" status="—" />
      </Card>
    </div>
  )
}
