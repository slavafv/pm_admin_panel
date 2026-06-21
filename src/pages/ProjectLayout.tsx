import { NavLink, Outlet, useParams, useOutletContext, Link } from 'react-router-dom'
import { useStore } from '../store/useStore'
import type { Project } from '../data/types'
import { RagDot } from '../components/ui/primitives'

const TABS = [
  { to: '', label: 'Overview', end: true },
  { to: 'setup', label: 'Setup', end: false },
  { to: 'schedule', label: 'Schedule', end: false },
  { to: 'dashboards', label: 'Dashboards', end: false },
  { to: 'reports', label: 'Reports', end: false },
]

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

      <div className="mt-2 flex items-center gap-3">
        <h1 className="text-2xl font-bold text-ink">{project.name}</h1>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-card border border-line px-2.5 py-1 text-xs font-medium">
          <RagDot rag={project.health} /> {project.healthNote}
        </span>
      </div>

      <div className="mt-4 flex gap-1 border-b border-line">
        {TABS.map((t) => (
          <NavLink
            key={t.label}
            to={t.to}
            end={t.end}
            className={({ isActive }) =>
              `relative px-4 py-2.5 text-sm font-medium transition ${
                isActive ? 'text-navy' : 'text-muted hover:text-ink'
              } ${isActive ? "after:absolute after:inset-x-3 after:-bottom-px after:h-0.5 after:rounded-full after:bg-navy after:content-['']" : ''}`
            }
          >
            {t.label}
          </NavLink>
        ))}
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
