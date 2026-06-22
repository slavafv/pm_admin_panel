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
  setup: 'M12 15a3 3 0 100-6 3 3 0 000 6zM19 12a7 7 0 00-.1-1l2-1.6-2-3.4-2.4 1a7 7 0 00-1.7-1l-.3-2.5h-4l-.3 2.5a7 7 0 00-1.7 1l-2.4-1-2 3.4 2 1.6a7 7 0 000 2l-2 1.6 2 3.4 2.4-1a7 7 0 001.7 1l.3 2.5h4l.3-2.5a7 7 0 001.7-1l2.4 1 2-3.4-2-1.6c.06-.3.1-.66.1-1z',
  schedule: 'M8 2v4M16 2v4M3 10h18M5 6h14a2 2 0 012 2v11a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2z',
  dashboards: 'M3 13a9 9 0 0118 0M12 13l4-3',
  reports: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M9 13h6M9 17h6',
}

interface Item {
  to: string
  label: string
  icon: ReactNode
  end?: boolean
}

function NavItem({ to, label, icon, end }: Item) {
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
      {label}
    </NavLink>
  )
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

        <nav className="flex-1 overflow-y-auto px-3">
          <NavItem to="/" end label="Projects" icon={<Icon d={ICONS.projects} />} />

          {/* Contextual project section — only inside an open project */}
          {project && (
            <div className="mt-4">
              <div className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wide text-muted">
                {project.name}
              </div>
              <NavItem to={`/projects/${pid}`} end label="Overview" icon={<Icon d={ICONS.overview} />} />
              <NavItem to={`/projects/${pid}/setup`} label="Setup" icon={<Icon d={ICONS.setup} />} />
              <NavItem to={`/projects/${pid}/schedule`} label="Schedule" icon={<Icon d={ICONS.schedule} />} />
              <NavItem to={`/projects/${pid}/dashboards`} label="Dashboards" icon={<Icon d={ICONS.dashboards} />} />
              <NavItem to={`/projects/${pid}/reports`} label="Reports" icon={<Icon d={ICONS.reports} />} />
            </div>
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
