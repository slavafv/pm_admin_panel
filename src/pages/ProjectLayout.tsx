import { Outlet, useParams, useOutletContext, Link } from 'react-router-dom'
import { useStore } from '../store/useStore'
import type { Project } from '../data/types'
import { RagDot } from '../components/ui/primitives'
import { STATUS_META, spentPct } from '../lib/project'

const HEALTH_LABEL = { green: 'On track', amber: 'Needs attention', red: 'At risk' } as const

/** A labeled indicator — separates the three different signals so a green
 *  lifecycle stage next to an amber health reading is not read as a conflict. */
function Indicator({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-line bg-card px-3.5 py-2">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-0.5 flex items-center gap-1.5 text-sm font-semibold text-ink">{children}</div>
    </div>
  )
}

export function ProjectLayout() {
  const { id } = useParams()
  const project = useStore((s) => s.projects.find((p) => p.id === id))

  if (!project) {
    return (
      <div className="grid place-items-center py-20 text-center">
        <p className="text-muted">Project not found.</p>
        <Link to="/" className="mt-2 font-semibold text-navy underline">Back to projects</Link>
      </div>
    )
  }

  const pct = spentPct(project)

  return (
    <div>
      <nav className="text-sm text-muted">
        <Link to="/" className="hover:text-ink">Projects</Link>
        <span className="px-1.5 text-[#c2c7d2]">/</span>
        <span className="text-muted">{project.domain}</span>
      </nav>

      {/* Client + project name (no duplicated title) */}
      <div className="mt-2">
        <div className="text-sm font-medium text-muted">{project.department}</div>
        <h1 className="text-2xl font-bold text-ink">{project.name}</h1>
      </div>

      {/* Separated, labeled indicators */}
      <div className="mt-4 flex flex-wrap gap-2.5">
        <Indicator label="Stage">
          <span className={STATUS_META[project.status].tone === 'blue' ? 'text-blue' : undefined}>{STATUS_META[project.status].label}</span>
        </Indicator>
        <Indicator label="Health">
          <RagDot rag={project.health} /> {HEALTH_LABEL[project.health]}
        </Indicator>
        <Indicator label="Budget spent">
          {pct.toFixed(pct < 10 ? 1 : 0)}%
        </Indicator>
      </div>

      <div className="mt-6">
        <Outlet context={project} />
      </div>
    </div>
  )
}

export function useProject(): Project {
  return useOutletContext<Project>()
}
