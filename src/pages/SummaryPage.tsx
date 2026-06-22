import { useProject } from './ProjectLayout'
import { Card, CardHead, RagDot, ProgressBar } from '../components/ui/primitives'
import { aed } from '../lib/format'
import { currentPhase, nextMilestone, teamCapacity, issueCounts, calLabel } from '../lib/metrics'
import type { ReactNode } from 'react'
import type { Phase as ProjectPhase } from '../data/types'

function Row({ label, value, status }: { label: string; value: ReactNode; status?: ReactNode }) {
  return (
    <div className="grid grid-cols-[1fr_1.4fr_1fr] items-center gap-4 border-b border-line px-5 py-3.5 last:border-0">
      <span className="text-sm text-muted">{label}</span>
      <span className="text-sm font-semibold text-ink">{value}</span>
      <span className="text-sm">{status}</span>
    </div>
  )
}

const PHASE_TONE = {
  complete: { dot: 'green' as const, label: 'Complete' },
  in_progress: { dot: 'amber' as const, label: 'In progress' },
  not_started: { dot: 'gray', label: 'Not started' },
}

function StageCard({ p, phase, isCurrent }: { p: ReturnType<typeof useProject>; phase: ProjectPhase; isCurrent: boolean }) {
  const tone = PHASE_TONE[phase.status]
  return (
    <div className={`rounded-2xl border p-4 ${isCurrent ? 'border-navy bg-[#f7f8fb]' : 'border-line'}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-ink">{phase.name}</span>
        {phase.status === 'complete' ? (
          <RagDot rag="green" />
        ) : phase.status === 'in_progress' ? (
          <RagDot rag="amber" />
        ) : (
          <span className="h-2.5 w-2.5 rounded-full bg-[#cbd2dd]" />
        )}
      </div>
      <div className="mt-1 text-xs text-muted">
        {calLabel(p, phase.startMonth)} → {calLabel(p, phase.endMonth)}
      </div>
      <ProgressBar value={phase.progressPct} tone={phase.status === 'complete' ? 'green' : 'navy'} className="mt-3" />
      <div className="mt-1.5 text-[11px] text-muted">
        {tone.label} · {phase.progressPct}%
      </div>
    </div>
  )
}

export function SummaryPage() {
  const p = useProject()
  const phase = currentPhase(p)
  const next = nextMilestone(p)
  const cap = teamCapacity(p)
  const issues = issueCounts(p)

  return (
    <div className="grid gap-5">
      {/* Stages — makes "which stage, and when" obvious at a glance */}
      <Card>
        <CardHead title="Project stages" />
        <div className="grid gap-3 px-5 pb-5 sm:grid-cols-2 lg:grid-cols-3">
          {p.phases.map((ph) => (
            <StageCard key={ph.id} p={p} phase={ph} isCurrent={ph.id === p.currentPhaseId} />
          ))}
        </div>
      </Card>

      {/* Cockpit summary table */}
      <Card>
        <CardHead title="Project summary" />
        <Row
          label="Current phase"
          value={phase.name}
          status={
            <span className="inline-flex items-center gap-1.5">
              <RagDot rag={phase.status === 'complete' ? 'green' : 'amber'} />
              {phase.status === 'complete' ? 'Complete' : phase.status === 'in_progress' ? 'In progress' : 'Not started'}
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
            status={`${calLabel(p, next.milestone.month)} · 📅 ${next.days} days`}
          />
        )}
        <Row
          label="Open issues"
          value={issues.total}
          status={
            issues.total === 0 ? (
              <span className="inline-flex items-center gap-1.5">
                <RagDot rag="green" /> None open
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5">
                <RagDot rag="amber" /> {issues.by.medium} medium · {issues.by.low} low
              </span>
            )
          }
        />
        <Row label="Risk level" value={p.risks.length ? 'Medium' : 'Low'} status={<RagDot rag={p.risks.length ? 'amber' : 'green'} />} />
        <Row
          label="Team capacity"
          value={`${cap.used.toFixed(1)} / ${cap.available.toFixed(1)} FTE`}
          status={<RagDot rag="green" />}
        />
        <Row label="PPP / external partners" value={`${p.externalPartners.length} active`} status={<RagDot rag="green" />} />
        <Row label="Last updated" value="Today, 09:14" status="—" />
      </Card>
    </div>
  )
}
