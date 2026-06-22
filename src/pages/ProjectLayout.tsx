import { Outlet, useParams, useOutletContext, Link } from 'react-router-dom'
import { useStore } from '../store/useStore'
import type { Project } from '../data/types'
import { RagDot } from '../components/ui/primitives'
import { StatusBadge } from '../components/ui/StatusBadge'

export function ProjectLayout() {
  const { id } = useParams()
  const project = useStore((s) => s.projects.find((p) => p.id === id))

  if (!project) {
    return (
      <div className="grid place-items-center py-20 text-center">
        <p className="text-muted">Project not found.</p>
        <Link to="/" className="mt-2 font-semibold text-navy underline">
          Back to projects
        </Link>
      </div>
    )
  }

  return (
    <div>
      <nav className="text-sm text-muted">
        <Link to="/" className="hover:text-ink">
          Projects
        </Link>{' '}
        <span className="text-[#c2c7d2]">›</span>{' '}
        <span className="font-medium text-ink">{project.name}</span>
      </nav>

      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold text-ink">{project.name}</h1>
        <StatusBadge status={project.status} />
        <span className="inline-flex items-center gap-1.5 rounded-full bg-card border border-line px-2.5 py-1 text-xs font-medium">
          <RagDot rag={project.health} /> {project.healthNote}
        </span>
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
