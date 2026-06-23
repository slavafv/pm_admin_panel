import { useEffect, useState } from 'react'
import { useProject } from './ProjectLayout'
import { Card, CardHead, RagDot, ProgressBar, Avatar, Chip } from '../components/ui/primitives'
import { aed } from '../lib/format'
import { currentPhase, nextMilestone, teamCapacity, issueCounts, calLabel } from '../lib/metrics'
import { startLabel, endLabel, daysRemaining, spentPct } from '../lib/project'
import { deriveAlerts, healthExplanation } from '../lib/alerts'
import type { ReactNode } from 'react'
import type { Phase, Project } from '../data/types'

function Row({ label, value, status }: { label: string; value: ReactNode; status?: ReactNode }) {
  return (
    <div className="grid grid-cols-[1fr_1.4fr_1fr] items-center gap-4 border-b border-line px-5 py-3.5 last:border-0">
      <span className="text-sm text-muted">{label}</span>
      <span className="text-sm font-semibold text-ink">{value}</span>
      <span className="text-sm">{status}</span>
    </div>
  )
}

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-[#e9ecf2] ${className}`} />
}

function KpiCard({ label, value, sub, tone }: { label: string; value: ReactNode; sub?: ReactNode; tone?: 'amber' }) {
  return (
    <Card className="p-4">
      <div className="text-xs text-muted">{label}</div>
      <div className={`mt-1 text-xl font-bold ${tone === 'amber' ? 'text-amber' : 'text-ink'}`}>{value}</div>
      {sub && <div className="mt-0.5 text-xs text-muted">{sub}</div>}
    </Card>
  )
}

/** Vertical stage timeline — scales to any number of stages without the
 *  horizontal scrolling problem of a fixed row of cards. */
function StageTimeline({ p }: { p: Project }) {
  const dot = (ph: Phase) =>
    ph.status === 'complete' ? '#4caf82' : ph.status === 'in_progress' ? '#f0a830' : '#cbd2dd'
  return (
    <div className="px-5 pb-5">
      <ol className="relative ml-1 border-l-2 border-line">
        {p.phases.map((ph) => {
          const current = ph.id === p.currentPhaseId
          return (
            <li key={ph.id} className="relative ml-5 py-3">
              <span className="absolute -left-[27px] top-4 h-3.5 w-3.5 rounded-full ring-4 ring-card" style={{ background: dot(ph) }} />
              <div className={`rounded-xl border px-4 py-3 ${current ? 'border-navy bg-[#f7f8fb]' : 'border-line'}`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-ink">{ph.name}</span>
                  <span className="text-xs text-muted">{calLabel(p, ph.startMonth)} → {calLabel(p, ph.endMonth)}</span>
                </div>
                <div className="mt-2 flex items-center gap-3">
                  <ProgressBar value={ph.progressPct} tone={ph.status === 'complete' ? 'green' : 'navy'} className="flex-1" />
                  <span className="w-28 text-right text-[11px] text-muted">
                    {ph.status === 'complete' ? 'Complete' : ph.status === 'in_progress' ? `In progress · ${ph.progressPct}%` : 'Not started'}
                  </span>
                </div>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

export function SummaryPage() {
  const p = useProject()
  const [loading, setLoading] = useState(true)

  // simulated load of project parameters (per the boss's "loaders" note)
  useEffect(() => {
    setLoading(true)
    const t = setTimeout(() => setLoading(false), 450)
    return () => clearTimeout(t)
  }, [p.id])

  const phase = currentPhase(p)
  const next = nextMilestone(p)
  const cap = teamCapacity(p)
  const issues = issueCounts(p)
  const pct = spentPct(p)
  const pm = p.team.find((t) => t.id === p.pmId) ?? p.team[0]
  const alerts = deriveAlerts(p)

  const durationText =
    p.status === 'completed'
      ? `${startLabel(p)} → ${endLabel(p)} · delivered`
      : p.status === 'presale'
        ? `${startLabel(p)} → ${endLabel(p)} · starts soon`
        : `${startLabel(p)} → ${endLabel(p)} · ${Math.max(0, daysRemaining(p))} days remaining`

  if (loading) {
    return (
      <div className="grid gap-5">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20" />)}
        </div>
        <Skeleton className="h-48" />
        <Skeleton className="h-72" />
      </div>
    )
  }

  return (
    <div className="grid gap-5">
      {/* KPI cards — detail that complements the header indicators */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Overall completion" value={`${p.overallProgress}%`} sub={p.status === 'completed' ? 'Delivered' : 'On track'} />
        <KpiCard label="Budget spent" value={`${aed(p.spentBudget, true)}`} sub={`${pct.toFixed(pct < 10 ? 1 : 0)}% of ${aed(p.totalBudget, true)}`} />
        <KpiCard label="Next milestone" value={next ? `${next.days} days` : 'All complete'} sub={next?.milestone.name} />
        <KpiCard label="Open issues" tone={issues.total > 0 ? 'amber' : undefined} value={issues.total} sub={issues.total ? `${issues.by.medium} medium · ${issues.by.low} low` : 'None open'} />
      </div>

      {/* Attention & recommendations — only when not green or alerts exist */}
      {(p.health !== 'green' || alerts.length > 0) && (
        <Card className={`border-l-4 ${p.health === 'red' ? 'border-l-red' : 'border-l-amber'}`}>
          <div className="px-5 pt-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-ink">
              <RagDot rag={p.health} /> Attention & recommendations
            </h3>
            <p className="mt-1 text-sm text-muted">{healthExplanation(p)}</p>
          </div>
          <div className="grid gap-2 px-5 py-4">
            {alerts.length === 0 ? (
              <p className="text-sm text-muted">No specific alerts — health flag set manually.</p>
            ) : (
              alerts.map((a, i) => (
                <div key={i} className="flex items-start gap-3 rounded-xl bg-[#f7f8fb] px-3 py-2.5">
                  <span className={`mt-0.5 rounded-md px-2 py-0.5 text-[10px] font-semibold ${a.level === 'risk' ? 'bg-red-soft text-red' : 'bg-amber-soft text-amber'}`}>{a.area}</span>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-ink">{a.text}</div>
                    <div className="text-xs text-muted">→ {a.recommendation}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {/* Stage timeline */}
      <Card>
        <CardHead title="Project stages" />
        <StageTimeline p={p} />
      </Card>

      {/* Summary table */}
      <Card>
        <CardHead title="Project summary" />
        <Row label="Current phase" value={phase.name}
          status={<span className="inline-flex items-center gap-1.5"><RagDot rag={phase.status === 'complete' ? 'green' : 'amber'} />{phase.status === 'complete' ? 'Complete' : phase.status === 'in_progress' ? 'In progress' : 'Not started'}</span>} />
        <Row label="Overall completion" value={`${p.overallProgress}%`} status="—" />
        <Row label="Budget spent" value={`${aed(p.spentBudget)} of ${aed(p.totalBudget)}`} status={<span className="inline-flex items-center gap-1.5"><RagDot rag="green" /> On track</span>} />
        {next && <Row label="Next milestone" value={next.milestone.name} status={`${calLabel(p, next.milestone.month)} · 📅 ${next.days} days`} />}
        <Row label="Open issues" value={issues.total}
          status={issues.total === 0 ? <span className="inline-flex items-center gap-1.5"><RagDot rag="green" /> None open</span> : <span className="inline-flex items-center gap-1.5"><RagDot rag="amber" /> {issues.by.medium} medium · {issues.by.low} low</span>} />
        <Row label="Risk level" value={p.risks.length ? 'Medium' : 'Low'} status={<RagDot rag={p.risks.length ? 'amber' : 'green'} />} />
        <Row label="Team capacity" value={`${cap.used.toFixed(1)} / ${cap.available.toFixed(1)} FTE`} status={<RagDot rag="green" />} />
        <Row label="Project manager" value={<span className="inline-flex items-center gap-2"><Avatar initials={pm.initials} color={pm.color} size={24} ring={false} /> {pm.name}</span>} status="Project Manager" />
        <Row label="Contract type" value={p.contractType} status="—" />
        <Row label="Project duration" value={durationText} status="—" />
        <Row label="Project location" value={p.location ?? '—'} status="—" />
      </Card>

      {/* Read-only stakeholders block (context, editable in Settings) */}
      <Card>
        <CardHead title="Stakeholders" />
        <div className="grid gap-4 px-5 pb-5 md:grid-cols-2">
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Internal</div>
            {p.internalStakeholders.length ? p.internalStakeholders.map((s, i) => (
              <div key={i} className="border-b border-line py-2 last:border-0">
                <div className="text-sm font-semibold text-ink">{s.name}</div>
                <div className="text-xs text-muted">{s.title} · {s.notification}</div>
              </div>
            )) : <p className="text-sm text-muted">None.</p>}
          </div>
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">External partners</div>
            {p.externalPartners.length ? p.externalPartners.map((s, i) => (
              <div key={i} className="flex items-center justify-between border-b border-line py-2 last:border-0">
                <div>
                  <div className="text-sm font-semibold text-ink">{s.org}</div>
                  <div className="text-xs text-muted">{s.role}</div>
                </div>
                <Chip tone={s.status}><RagDot rag={s.status} /></Chip>
              </div>
            )) : <p className="text-sm text-muted">None.</p>}
          </div>
        </div>
      </Card>
    </div>
  )
}
