import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import type { Project, ProjectStatus } from '../data/types'
import { Card, Button, Avatar, RagDot, ProgressBar } from '../components/ui/primitives'
import { StatusBadge } from '../components/ui/StatusBadge'
import { CreateProjectModal } from '../components/CreateProjectModal'
import { aed } from '../lib/format'
import { classification, spentPct, startLabel, endLabel, daysRemaining } from '../lib/project'
import { canCreateProject, visibleProjects } from '../lib/rbac'

const FILTERS: { key: ProjectStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'presale', label: 'Pre-sale' },
  { key: 'delivery', label: 'In delivery' },
  { key: 'onhold', label: 'On hold' },
  { key: 'completed', label: 'Completed' },
]

const PAGE_SIZE = 6

const HEALTH_LABEL = { green: 'On track', amber: 'Attention', red: 'At risk' } as const

function dateLine(p: Project): string {
  if (p.status === 'presale') return `Starts ${startLabel(p)}`
  if (p.status === 'completed') return `Completed ${endLabel(p)}`
  const d = daysRemaining(p)
  return d > 0 ? `Ends ${endLabel(p)} · ${d} days left` : `Ends ${endLabel(p)}`
}

function ProjectCard({ project, onOpen }: { project: Project; onOpen: () => void }) {
  const pm = project.team.find((t) => t.id === project.pmId) ?? project.team[0]
  const pct = spentPct(project)
  return (
    <Card className="p-5" onClick={onOpen}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="truncate text-base font-bold text-ink">{project.name}</h3>
          <p className="mt-0.5 text-sm text-muted">{project.department}</p>
          {/* single homogeneous classification line */}
          <p className="mt-2 truncate text-xs font-medium text-[#475467]">
            {classification(project)} <span className="text-[#c2c7d2]">·</span> {aed(project.totalBudget, true)}
          </p>
          <p className="mt-1 text-xs text-muted">📅 {dateLine(project)}</p>
        </div>
        <StatusBadge status={project.status} />
      </div>

      <div className="mt-4 flex items-center justify-between gap-4">
        {/* PM only — full team lives inside the project */}
        {pm && (
          <div className="flex items-center gap-2">
            <Avatar initials={pm.initials} color={pm.color} size={28} ring={false} />
            <div className="leading-tight">
              <div className="text-xs font-semibold text-ink">{pm.name}</div>
              <div className="text-[11px] text-muted">Project manager</div>
            </div>
          </div>
        )}
        <div className="flex items-center gap-5">
          {/* Completed projects show outcome, not a live health flag */}
          <div className="text-right">
            {project.status === 'completed' ? (
              <>
                <div className="flex items-center justify-end gap-1.5 text-xs font-semibold text-green">✅ Delivered</div>
                <div className="text-[11px] text-muted">Outcome</div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-end gap-1.5 text-xs font-semibold text-ink">
                  <RagDot rag={project.health} /> {HEALTH_LABEL[project.health]}
                </div>
                <div className="text-[11px] text-muted">Health</div>
              </>
            )}
          </div>
          {/* Budget — TBC before the project starts */}
          <div className="w-28">
            {project.status === 'presale' ? (
              <div className="text-right text-[11px] text-muted">Budget<br /><span className="font-semibold text-ink">TBC</span></div>
            ) : (
              <>
                <div className="mb-1 flex items-center justify-between text-[11px]">
                  <span className="text-muted">Budget</span>
                  <span className="font-semibold text-ink">{pct.toFixed(pct < 10 ? 1 : 0)}%</span>
                </div>
                <ProgressBar value={pct} tone={pct > 100 ? 'red' : 'green'} />
              </>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}

export function ProjectsPage() {
  const projects = useStore((s) => s.projects)
  const role = useStore((s) => s.role)
  const navigate = useNavigate()
  const [filter, setFilter] = useState<ProjectStatus | 'all'>('all')
  const [search, setSearch] = useState('')
  const [creating, setCreating] = useState(false)
  const [page, setPage] = useState(0)

  // RBAC: PMs see only the projects they manage
  const scoped = useMemo(() => visibleProjects(role, projects), [role, projects])

  const filtered = useMemo(() => {
    return scoped.filter((c) => {
      const okFilter = filter === 'all' || c.status === filter
      const okSearch = !search || c.name.toLowerCase().includes(search.toLowerCase())
      return okFilter && okSearch
    })
  }, [scoped, filter, search])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount - 1)
  const paged = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE)

  function changeFilter(f: ProjectStatus | 'all') {
    setFilter(f)
    setPage(0)
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-ink">Projects</h1>
        <div className="flex items-center gap-3">
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(0)
            }}
            placeholder="Search projects…"
            className="w-64 rounded-xl border border-line bg-card px-3.5 py-2.5 text-sm outline-none focus:border-navy"
          />
          {canCreateProject(role) && <Button onClick={() => setCreating(true)}>＋ Create project</Button>}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => changeFilter(f.key)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              filter === f.key ? 'bg-navy text-white' : 'bg-card text-[#475467] border border-line hover:bg-[#f3f5f9]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-4">
        {paged.map((c) => (
          <ProjectCard key={c.id} project={c} onOpen={() => navigate(`/projects/${c.id}`)} />
        ))}
        {filtered.length === 0 && (
          <Card className="grid place-items-center p-12 text-sm text-muted">No projects match your filter.</Card>
        )}
      </div>

      {pageCount > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={safePage === 0}
            className="rounded-lg border border-line bg-card px-3 py-1.5 text-sm font-medium text-ink transition hover:bg-[#f3f5f9] disabled:opacity-40"
          >
            ← Prev
          </button>
          {Array.from({ length: pageCount }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className={`h-8 w-8 rounded-lg text-sm font-medium transition ${
                i === safePage ? 'bg-navy text-white' : 'border border-line bg-card text-ink hover:bg-[#f3f5f9]'
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            disabled={safePage === pageCount - 1}
            className="rounded-lg border border-line bg-card px-3 py-1.5 text-sm font-medium text-ink transition hover:bg-[#f3f5f9] disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      )}

      {creating && <CreateProjectModal onClose={() => setCreating(false)} />}
    </div>
  )
}
