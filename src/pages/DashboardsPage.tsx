import { useProject } from './ProjectLayout'
import { useStore } from '../store/useStore'
import { roleMeta } from '../config/roles'
import { Card, CardHead, RagDot, ProgressBar, Avatar, Chip, Button } from '../components/ui/primitives'
import { BudgetDonut, BurnChart } from '../components/dashboards/charts'
import { aed, monthLabel, daysToMonth } from '../lib/format'
import { nextMilestone, budgetVariance, issueCounts } from '../lib/metrics'
import type { Project, RAG } from '../data/types'

const RAG_HEX: Record<RAG, string> = { green: '#4caf82', amber: '#f0a830', red: '#e2574c' }

function RoleBanner() {
  const role = useStore((s) => s.role)
  const m = roleMeta(role)
  return (
    <Card className="flex items-center gap-4 p-4">
      <Avatar initials={m.initials} color={m.color} size={42} ring={false} />
      <div>
        <div className="text-sm font-bold text-ink">
          {m.label} view <span className="font-normal text-muted">· {m.person}</span>
        </div>
        <div className="text-xs text-muted">{m.scope}</div>
      </div>
      <span className="ml-auto rounded-full bg-[#eef0f4] px-3 py-1 text-xs font-medium text-[#475467]">{m.short}</span>
    </Card>
  )
}

/* ---------------- Director General ---------------- */
function DirectorGeneral({ p }: { p: Project }) {
  const next = nextMilestone(p)
  const variance = budgetVariance(p)
  const partnersRag: RAG = p.externalPartners.some((x) => x.status === 'red')
    ? 'red'
    : p.externalPartners.some((x) => x.status === 'amber')
      ? 'amber'
      : 'green'
  const sub = [
    { label: 'Schedule', rag: 'green' as RAG },
    { label: 'Budget', rag: 'green' as RAG },
    { label: 'Risk', rag: 'amber' as RAG },
    { label: 'Partners', rag: partnersRag },
  ]
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card>
        <CardHead title="Project health" />
        <div className="flex items-center gap-5 px-5 pb-5">
          <div
            className="grid h-24 w-24 shrink-0 place-items-center rounded-full text-white"
            style={{ background: RAG_HEX[p.health] }}
          >
            <span className="text-2xl">{p.health === 'green' ? '✓' : '!'}</span>
          </div>
          <div className="flex-1">
            <div className="mb-2 text-sm font-semibold text-ink">{p.healthNote}</div>
            <div className="grid grid-cols-2 gap-2">
              {sub.map((s) => (
                <div key={s.label} className="flex items-center gap-2 text-sm">
                  <RagDot rag={s.rag} /> {s.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <CardHead title="Budget overview" />
        <div className="flex items-center gap-4 px-5 pb-5">
          <div className="w-[160px]">
            <BudgetDonut spent={p.spentBudget} total={p.totalBudget} />
          </div>
          <div className="flex-1 text-sm">
            <div className="text-muted">Spent</div>
            <div className="text-lg font-bold text-ink">{aed(p.spentBudget, true)}</div>
            <div className="mt-1 text-muted">of {aed(p.totalBudget, true)} total</div>
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-green-soft px-2.5 py-1 text-xs font-semibold text-green">
              <RagDot rag="green" /> Under budget by {aed(variance.underBy, true)}
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <CardHead title="Milestone status" />
        <div className="px-5 pb-4">
          {p.milestones.map((m) => (
            <div key={m.id} className="flex items-center justify-between border-b border-line py-2.5 last:border-0">
              <div className="flex items-center gap-2.5">
                <span className="h-3 w-3 rotate-45 rounded-[2px]" style={{ background: RAG_HEX[m.rag] }} />
                <span className="text-sm font-medium">{m.name}</span>
              </div>
              <span className="text-xs text-muted">
                {monthLabel(m.month, p.startYear)} · {m.state.replace('_', ' ')}
              </span>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardHead title="Top risks" />
        <div className="px-5 pb-4">
          {p.risks.map((r) => (
            <div key={r.risk} className="flex items-center justify-between border-b border-line py-2.5 last:border-0">
              <span className="text-sm font-medium">{r.risk}</span>
              <div className="flex items-center gap-1.5 text-xs">
                <Chip tone={r.probability === 'High' ? 'red' : r.probability === 'Medium' ? 'amber' : 'gray'}>
                  {r.probability}
                </Chip>
                <Chip tone={r.impact === 'High' ? 'red' : r.impact === 'Medium' ? 'amber' : 'gray'}>{r.impact}</Chip>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="lg:col-span-2">
        <CardHead title="RAK Vision 2030 — sustainability KPIs" />
        <div className="grid grid-cols-2 gap-4 px-5 pb-5 lg:grid-cols-4">
          {p.kpis.map((k) => (
            <div key={k.label} className="rounded-2xl bg-[#f7f8fb] p-4">
              <div className="text-xs text-muted">{k.label}</div>
              <div className="mt-1 text-lg font-bold text-ink">
                {k.unit === '' ? (k.note ?? '—') : `${k.current.toLocaleString()} / ${k.target.toLocaleString()}`}
              </div>
              {k.unit && k.unit !== '' && <div className="text-xs text-muted">{k.unit}</div>}
              {k.unit !== '' && (
                <ProgressBar value={k.target ? (k.current / k.target) * 100 : 0} tone="navy" className="mt-2" />
              )}
              {next && k.label.includes('capacity') && (
                <div className="mt-1.5 text-[11px] text-muted">{k.note}</div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

/* ---------------- Department Head ---------------- */
function DepartmentHead({ p }: { p: Project }) {
  const issues = issueCounts(p)
  const variance = budgetVariance(p)
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Card>
        <CardHead title="Phase progress" />
        <div className="grid gap-3 px-5 pb-5">
          {p.phases.map((ph) => (
            <div key={ph.id}>
              <div className="mb-1 flex justify-between text-sm">
                <span className="font-medium">{ph.name}</span>
                <span className="text-muted">{ph.progressPct}%</span>
              </div>
              <ProgressBar value={ph.progressPct} tone={ph.progressPct > 0 ? 'green' : 'navy'} />
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardHead title="Team workload" />
        <div className="grid gap-3 px-5 pb-5">
          {p.team.map((m) => {
            const used = m.fteByPhase[0] ?? 0
            const full = used >= m.capacity
            return (
              <div key={m.id}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium">{m.name.split(' ')[0]}</span>
                  <span className={full ? 'font-semibold text-red' : 'text-muted'}>
                    {used.toFixed(1)}/{m.capacity.toFixed(1)} {full ? '🔴' : '🟢'}
                  </span>
                </div>
                <ProgressBar value={(used / m.capacity) * 100} tone={full ? 'red' : 'green'} />
              </div>
            )
          })}
        </div>
      </Card>

      <Card>
        <CardHead title="Open issues" />
        <div className="grid gap-2.5 px-5 pb-5">
          {(['Permitting', 'Technical', 'Commercial'] as const).map((cat) => {
            const n = issues.byCat[cat]
            return (
              <div key={cat} className="flex items-center justify-between rounded-xl bg-[#f7f8fb] px-3 py-2.5">
                <span className="text-sm font-medium">{cat}</span>
                <Chip tone={n === 0 ? 'green' : n > 1 ? 'amber' : 'gray'}>{n === 0 ? '✓ 0' : n}</Chip>
              </div>
            )
          })}
          <button className="text-left text-xs font-semibold text-navy">View all →</button>
        </div>
      </Card>

      <Card className="lg:col-span-2">
        <CardHead
          title="Budget burn rate"
          action={
            <span className="rounded-full bg-green-soft px-2.5 py-1 text-xs font-semibold text-green">
              −{aed(variance.underBy, true)} vs plan
            </span>
          }
        />
        <div className="px-3 pb-4">
          <BurnChart data={p.burn} />
        </div>
      </Card>

      <Card>
        <CardHead title="Upcoming milestones · 60 days" />
        <div className="grid gap-2.5 px-5 pb-5">
          {p.milestones
            .map((m) => ({ m, days: daysToMonth(m.month, p.startYear) }))
            .filter((x) => x.days > 0)
            .sort((a, b) => a.days - b.days)
            .slice(0, 3)
            .map(({ m, days }) => (
              <div key={m.id} className="rounded-xl border border-line px-3 py-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{m.name}</span>
                  <Chip tone={m.rag}>{m.rag === 'amber' ? 'At risk' : 'On track'}</Chip>
                </div>
                <div className="mt-0.5 text-xs text-muted">
                  {monthLabel(m.month, p.startYear)} · {days} days
                </div>
              </div>
            ))}
        </div>
      </Card>
    </div>
  )
}

/* ---------------- Project Manager ---------------- */
function ProjectManager({ p }: { p: Project }) {
  const next = nextMilestone(p)
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHead title="Task board" />
        <div className="grid grid-cols-3 gap-3 px-5 pb-3">
          {[
            { k: 'To do', v: p.tasks.todo, tone: 'gray' },
            { k: 'In progress', v: p.tasks.inProgress, tone: 'amber' },
            { k: 'Done', v: p.tasks.done, tone: 'green' },
          ].map((c) => (
            <div key={c.k} className="rounded-2xl bg-[#f7f8fb] p-4 text-center">
              <div className="text-2xl font-bold text-ink">{c.v}</div>
              <div className="text-xs text-muted">{c.k}</div>
            </div>
          ))}
        </div>
        <div className="px-5 pb-5">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">In progress</div>
          {p.inProgressTasks.map((t) => {
            const a = p.team.find((m) => m.id === t.assigneeId)
            return (
              <div key={t.title} className="flex items-center justify-between border-b border-line py-2.5 last:border-0">
                <span className="text-sm font-medium">{t.title}</span>
                <div className="flex items-center gap-2 text-xs text-muted">
                  {a && <Avatar initials={a.initials} color={a.color} size={24} ring={false} />}
                  {t.due}
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      <Card>
        <CardHead title="Next milestone" />
        <div className="grid place-items-center px-5 py-8 text-center">
          <div className="text-5xl font-extrabold text-navy">{next ? next.days : '—'}</div>
          <div className="mt-1 text-sm text-muted">days</div>
          <div className="mt-2 text-sm font-semibold">until {next?.milestone.name}</div>
          <Button variant="soft" className="mt-4">
            View milestone details
          </Button>
        </div>
      </Card>

      <Card>
        <CardHead title="Resource FTE · this month" />
        <div className="grid gap-3 px-5 pb-5">
          {p.team.map((m) => {
            const used = m.fteByPhase[0] ?? 0
            const overloaded = used > m.capacity
            return (
              <div key={m.id}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-medium">{m.name.split(' ')[0]}</span>
                  <span className={overloaded ? 'font-semibold text-red' : 'text-muted'}>{used.toFixed(1)} FTE</span>
                </div>
                <ProgressBar value={(used / m.capacity) * 100} tone={overloaded ? 'red' : 'green'} />
              </div>
            )
          })}
        </div>
      </Card>

      <Card className="lg:col-span-2">
        <CardHead title="Blockers · open issues" />
        <table className="w-full">
          <thead className="border-y border-line bg-[#fafbfc]">
            <tr>
              {['Issue', 'Raised', 'Owner', 'Days open'].map((h) => (
                <th key={h} className="px-5 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {p.issues.map((i) => (
              <tr key={i.id} className="border-b border-line last:border-0">
                <td className="px-5 py-2.5 text-sm font-medium">{i.title}</td>
                <td className="px-5 py-2.5 text-sm text-muted">{i.raised}</td>
                <td className="px-5 py-2.5 text-sm text-muted">{i.owner}</td>
                <td className="px-5 py-2.5 text-sm">{i.daysOpen}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}

export function DashboardsPage() {
  const p = useProject()
  const role = useStore((s) => s.role)

  return (
    <div className="grid gap-4">
      <RoleBanner />
      {role === 'director_general' && <DirectorGeneral p={p} />}
      {role === 'department_head' && <DepartmentHead p={p} />}
      {role === 'project_manager' && <ProjectManager p={p} />}
    </div>
  )
}
