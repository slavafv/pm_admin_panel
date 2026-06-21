import { NavLink, Outlet, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { Logo } from './Logo'
import { RoleSwitcher } from './RoleSwitcher'

const HERO = 'rak-wwtp-1'

function projectIdFromPath(pathname: string): string {
  const m = pathname.match(/\/projects\/([^/]+)/)
  return m ? m[1] : HERO
}

interface NavItem {
  to: string
  label: string
  icon: ReactNode
}

function Icon({ d }: { d: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  )
}

export function AppShell() {
  const location = useLocation()
  const pid = projectIdFromPath(location.pathname)

  const items: NavItem[] = [
    { to: '/', label: 'Projects', icon: <Icon d="M3 7h18M3 12h18M3 17h18" /> },
    { to: `/projects/${pid}`, label: 'Overview', icon: <Icon d="M4 4h7v7H4zM13 4h7v4h-7zM13 11h7v9h-7zM4 14h7v6H4z" /> },
    { to: `/projects/${pid}/schedule`, label: 'Schedule', icon: <Icon d="M8 2v4M16 2v4M3 10h18M5 6h14a2 2 0 012 2v11a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2z" /> },
    { to: `/projects/${pid}/dashboards`, label: 'Dashboards', icon: <Icon d="M3 13a9 9 0 0118 0M12 13l4-3" /> },
    { to: `/projects/${pid}/reports`, label: 'Reports', icon: <Icon d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M9 13h6M9 17h6" /> },
  ]

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <aside className="flex w-[236px] shrink-0 flex-col border-r border-line bg-card">
        <div className="px-5 py-5">
          <Logo />
        </div>
        <nav className="flex-1 px-3">
          {items.map((it) => (
            <NavLink
              key={it.label}
              to={it.to}
              end={it.to === '/' || it.to === `/projects/${pid}`}
              className={({ isActive }) =>
                `mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive ? 'bg-navy text-white' : 'text-[#475467] hover:bg-[#f3f5f9]'
                }`
              }
            >
              {it.icon}
              {it.label}
            </NavLink>
          ))}
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
