import { NavLink, Outlet, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { Logo } from './Logo'
import { RoleSwitcher } from './RoleSwitcher'
import { useStore } from '../store/useStore'

function projectIdFromPath(pathname: string): string | null {
  const m = pathname.match(/\/projects\/([^/]+)/)
  return m ? m[1] : null
}

function Icon({ d }: { d: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  )
}

const ICONS = {
  projects: 'M3 7h18M3 12h18M3 17h18',
  overview: 'M4 4h7v7H4zM13 4h7v4h-7zM13 11h7v9h-7zM4 14h7v6H4z',
  schedule: 'M8 2v4M16 2v4M3 10h18M5 6h14a2 2 0 012 2v11a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2z',
  employees: 'M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM22 21v-2a4 4 0 00-3-3.9M16 3.1a4 4 0 010 7.8',
  equipment: 'M10 17h4V5H2v12h3M20 17h2v-3.3a1 1 0 00-.3-.7l-2.6-2.6a1 1 0 00-.7-.3H14v7h2M7.5 19a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM17.5 19a1.5 1.5 0 100-3 1.5 1.5 0 000 3z',
  resources: 'M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM22 21v-2a4 4 0 00-3-3.9M16 3.1a4 4 0 010 7.8',
  dashboards: 'M3 13a9 9 0 0118 0M12 13l4-3',
  risks: 'M12 9v4M12 17h.01M10.3 3.9l-8 14A2 2 0 004 21h16a2 2 0 001.7-3.1l-8-14a2 2 0 00-3.4 0z',
  reports: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M9 13h6M9 17h6',
  settings: 'M12 15a3 3 0 100-6 3 3 0 000 6zM19 12a7 7 0 00-.1-1l2-1.6-2-3.4-2.4 1a7 7 0 00-1.7-1l-.3-2.5h-4l-.3 2.5a7 7 0 00-1.7 1l-2.4-1-2 3.4 2 1.6a7 7 0 000 2l-2 1.6 2 3.4 2.4-1a7 7 0 001.7 1l.3 2.5h4l.3-2.5a7 7 0 001.7-1l2.4 1 2-3.4-2-1.6c.06-.3.1-.66.1-1z',
}

interface Item {
  to: string
  label: string
  icon: ReactNode
  end?: boolean
  badge?: number
}

function NavItem({ to, label, icon, end, badge }: Item) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
          isActive ? 'bg-navy text-white' : 'text-[#475467] hover:bg-[#f3f5f9]'
        }`
      }
    >
      {icon}
      <span className="flex-1">{label}</span>
      {badge != null && badge > 0 && (
        <span className="grid h-5 min-w-[20px] place-items-center rounded-full bg-amber-soft px-1 text-[11px] font-semibold text-amber">
          {badge}
        </span>
      )}
    </NavLink>
  )
}

function GroupLabel({ children }: { children: ReactNode }) {
  return <div className="px-3 pb-1 pt-4 text-[10px] font-semibold uppercase tracking-wider text-[#9aa1ad]">{children}</div>
}

export function AppShell() {
  const location = useLocation()
  const pid = projectIdFromPath(location.pathname)
  const project = useStore((s) => (pid ? s.projects.find((p) => p.id === pid) : undefined))

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <aside className="flex w-[236px] shrink-0 flex-col border-r border-line bg-card">
        <div className="px-5 py-5">
          <Logo />
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pb-3">
          <GroupLabel>Workspace</GroupLabel>
          <NavItem to="/" end label="All projects" icon={<Icon d={ICONS.projects} />} />
          <NavItem to="/employees" label="Employees" icon={<Icon d={ICONS.employees} />} />
          <NavItem to="/equipment" label="Equipment" icon={<Icon d={ICONS.equipment} />} />

          {/* Contextual project sections — only inside an open project */}
          {project && (
            <>
              <div className="mt-3 truncate px-3 text-[11px] font-semibold text-ink" title={project.name}>
                {project.name}
              </div>

              <GroupLabel>Project</GroupLabel>
              <NavItem to={`/projects/${pid}`} end label="Overview" icon={<Icon d={ICONS.overview} />} />
              <NavItem to={`/projects/${pid}/schedule`} label="Schedule" icon={<Icon d={ICONS.schedule} />} />
              <NavItem to={`/projects/${pid}/resources`} label="Resources" icon={<Icon d={ICONS.resources} />} />

              <GroupLabel>Monitor</GroupLabel>
              <NavItem to={`/projects/${pid}/dashboards`} label="Dashboards" icon={<Icon d={ICONS.dashboards} />} />
              <NavItem to={`/projects/${pid}/risks`} label="Risks" icon={<Icon d={ICONS.risks} />} badge={project.risks.length} />
              <NavItem to={`/projects/${pid}/reports`} label="Reports" icon={<Icon d={ICONS.reports} />} />

              <GroupLabel>Settings</GroupLabel>
              <NavItem to={`/projects/${pid}/settings`} label="Project settings" icon={<Icon d={ICONS.settings} />} />
            </>
          )}
        </nav>

        <div className="m-3 rounded-2xl bg-[#f3f5f9] p-3">
          <div className="text-[11px] font-medium uppercase tracking-wide text-muted">Workspace</div>
          <div className="mt-1 text-sm font-semibold text-ink">RAK Municipality</div>
          <div className="text-xs text-muted">Project administration</div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-line bg-card px-7 py-3.5">
          <div className="text-sm text-muted">
            Project Management <span className="text-[#c2c7d2]">·</span>{' '}
            <span className="font-medium text-ink">Admin panel</span>
          </div>
          <RoleSwitcher />
        </header>
        <main className="scroll-thin flex-1 overflow-y-auto px-7 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
