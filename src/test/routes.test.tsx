import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AppRoutes } from '../App'
import { useStore } from '../store/useStore'
import type { RoleId } from '../data/types'

function renderAt(path: string, role?: RoleId) {
  useStore.getState().resetDemo()
  if (role) useStore.getState().setRole(role)
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
    </MemoryRouter>,
  )
}

afterEach(cleanup)

describe('projects list', () => {
  it('shows projects with new lifecycle filters and pagination', async () => {
    renderAt('/')
    expect(screen.getByRole('heading', { name: 'Projects', level: 1 })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Pre-sale' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'In delivery' })).toBeInTheDocument()
    expect(screen.getAllByText(/RAK Wastewater Treatment Plant/i).length).toBeGreaterThan(0)
    // 9 projects, page size 6 → pagination present
    expect(screen.getByText('Next →')).toBeInTheDocument()
  })

  it('filtering by status narrows the list', () => {
    renderAt('/')
    fireEvent.click(screen.getByRole('button', { name: 'Completed' }))
    expect(screen.getAllByText(/Barjeel Retrofit/).length).toBeGreaterThan(0)
    expect(screen.queryByText(/RAK Wastewater Treatment Plant/)).not.toBeInTheDocument()
  })
})

describe('project pages render without crashing', () => {
  it('Overview (after loader) shows KPI + stages + summary, no filler buttons', async () => {
    renderAt('/projects/rak-wwtp-1')
    expect(await screen.findByText('Project stages')).toBeInTheDocument()
    expect(screen.getByText('Project summary')).toBeInTheDocument()
    expect(screen.getByText('Project location')).toBeInTheDocument()
    expect(screen.queryByText('＋ Add task')).not.toBeInTheDocument()
  })

  it('Resources page has Team / Equipment / Budget tabs', () => {
    renderAt('/projects/rak-wwtp-1/resources')
    expect(screen.getByText('Team & roles')).toBeInTheDocument()
    expect(screen.getByText('Equipment & assets')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Budget'))
    expect(screen.getByText('Budget breakdown')).toBeInTheDocument()
  })

  it('Resources team tab can change a member access level (persists)', () => {
    renderAt('/projects/rak-wwtp-1/resources')
    const selects = screen.getAllByRole('combobox')
    fireEvent.change(selects[0], { target: { value: 'Read only' } })
    const pm = useStore.getState().getProject('rak-wwtp-1')!.team.find((t) => t.id === 'ahmed')!
    expect(pm.access).toBe('Read only')
  })

  it('Risks page lists register, dependencies, assumptions', () => {
    renderAt('/projects/rak-wwtp-1/risks')
    expect(screen.getByText('Risk register')).toBeInTheDocument()
    expect(screen.getByText('Dependencies')).toBeInTheDocument()
    expect(screen.getByText('Assumptions log')).toBeInTheDocument()
  })

  it('risk register shows the new columns + score', () => {
    renderAt('/projects/rak-wwtp-1/risks')
    expect(screen.getByText('Risk register')).toBeInTheDocument()
    expect(screen.getByText('R-01')).toBeInTheDocument()
    // score = P×I, e.g. 3×4 = 12
    expect(screen.getByText(/12 · medium/)).toBeInTheDocument()
  })

  it('Schedule renders gantt + edit workload', () => {
    renderAt('/projects/rak-wwtp-1/schedule')
    expect(screen.getByText('✎ Edit workload')).toBeInTheDocument()
    expect(screen.getAllByText('Design & permitting').length).toBeGreaterThan(0)
  })

  it('Reports builder generates and stores a report', () => {
    renderAt('/projects/rak-wwtp-1/reports')
    expect(screen.getByText('Build a report')).toBeInTheDocument()
    fireEvent.click(screen.getByText('⬇ Generate & download'))
    expect(useStore.getState().generatedReports.filter((r) => r.projectId === 'rak-wwtp-1').length).toBe(1)
    expect(screen.getByText(/Generated reports \(1\)/)).toBeInTheDocument()
  })

  it('legacy /setup redirects to overview (not found is not shown)', async () => {
    renderAt('/projects/rak-wwtp-1/setup')
    expect(await screen.findByText('Project stages')).toBeInTheDocument()
  })

  it('Al Hamra and Barjeel both open', async () => {
    renderAt('/projects/al-hamra-roads')
    expect(screen.getAllByText('Al Hamra Masterplan — Road Network').length).toBeGreaterThan(0)
    cleanup()
    renderAt('/projects/barjeel-retrofit')
    expect(screen.getAllByText('Barjeel Retrofit — Batch 1').length).toBeGreaterThan(0)
  })

  it('unknown project id shows a not-found fallback', () => {
    renderAt('/projects/does-not-exist')
    expect(screen.getByText('Project not found.')).toBeInTheDocument()
  })
})

describe('workspace pages (derived from project data)', () => {
  it('Employees page aggregates people across all projects', () => {
    renderAt('/employees')
    expect(screen.getByRole('heading', { name: 'Employees', level: 1 })).toBeInTheDocument()
    // hero PM + a PM from another project both appear (cross-project aggregation)
    expect(screen.getByText('Ahmed Al Mansouri')).toBeInTheDocument()
    expect(screen.getByText('Omar Al Khalifa')).toBeInTheDocument()
  })

  it('Employee count matches the unique names across the store (no divergence)', () => {
    const projects = useStore.getState().projects
    const unique = new Set(projects.flatMap((p) => p.team.map((t) => t.name)))
    renderAt('/employees')
    expect(screen.getByText(`${unique.size} people · ${unique.size - 1} active right now`)).toBeInTheDocument()
  })

  it('Equipment fleet aggregates units and shows the owning project', () => {
    renderAt('/equipment')
    expect(screen.getByRole('heading', { name: 'Equipment fleet', level: 1 })).toBeInTheDocument()
    expect(screen.getByText('CRN-01 Tower crane')).toBeInTheDocument()
    // project column links to the owning project
    expect(screen.getAllByText('RAK Wastewater Treatment Plant — Phase 1').length).toBeGreaterThan(0)
  })
})

describe('RBAC simulation', () => {
  it('Department Head can create projects and sees all', () => {
    renderAt('/', 'department_head')
    expect(screen.getByText('＋ Create project')).toBeInTheDocument()
    expect(screen.getAllByText(/RAK Wastewater Treatment Plant/i).length).toBeGreaterThan(0)
  })

  it('Director General cannot create but sees workspace nav + all projects', () => {
    renderAt('/', 'director_general')
    expect(screen.queryByText('＋ Create project')).not.toBeInTheDocument()
    expect(screen.getByText('Employees')).toBeInTheDocument()
  })

  it('PM sees only their own projects, no create, no workspace nav', () => {
    renderAt('/', 'project_manager')
    expect(screen.queryByText('＋ Create project')).not.toBeInTheDocument()
    expect(screen.queryByText('Employees')).not.toBeInTheDocument()
    // Ahmed manages RAK + Julphar + Marjan; should NOT see Barjeel (different PM)
    expect(screen.getByText('RAK Wastewater Treatment Plant — Phase 1')).toBeInTheDocument()
    expect(screen.queryByText('Barjeel Retrofit — Batch 1')).not.toBeInTheDocument()
  })

  it('PM is blocked from opening a project they do not manage', () => {
    renderAt('/projects/barjeel-retrofit', 'project_manager')
    expect(screen.getByText(/don't have access to this project/)).toBeInTheDocument()
  })

  it('PM redirected away from workspace Employees page', () => {
    renderAt('/employees', 'project_manager')
    expect(screen.queryByRole('heading', { name: 'Employees', level: 1 })).not.toBeInTheDocument()
  })
})

describe('role-based dashboards', () => {
  it('DG shows Vision KPIs; PM shows task board', () => {
    renderAt('/projects/rak-wwtp-1/dashboards', 'director_general')
    expect(screen.getByText(/RAK Vision 2030/)).toBeInTheDocument()
    cleanup()
    renderAt('/projects/rak-wwtp-1/dashboards', 'project_manager')
    expect(screen.getByText('Task board')).toBeInTheDocument()
  })
})

describe('create project modal', () => {
  it('requires fields, then creates a project and opens it', async () => {
    renderAt('/', 'department_head')
    fireEvent.click(screen.getByText('＋ Create project'))
    fireEvent.change(screen.getByPlaceholderText(/RAK Wastewater/), { target: { value: 'Corniche Upgrade' } })
    const selects = screen.getAllByRole('combobox')
    fireEvent.change(selects[0], { target: { value: 'RAK Urban Planning Dept' } })
    fireEvent.change(selects[1], { target: { value: 'Design-Build' } })
    fireEvent.change(selects[2], { target: { value: 'Transport' } })
    const dates = document.querySelectorAll('input[type="date"]')
    fireEvent.change(dates[0] as HTMLInputElement, { target: { value: '2026-03-01' } })
    fireEvent.change(dates[1] as HTMLInputElement, { target: { value: '2027-03-01' } })
    fireEvent.change(screen.getByPlaceholderText('e.g. 387000000'), { target: { value: '50000000' } })
    fireEvent.change(screen.getByPlaceholderText('Full name'), { target: { value: 'Sara Lee' } })
    fireEvent.click(screen.getByText('Create project'))
    expect(useStore.getState().projects[0].name).toBe('Corniche Upgrade')
  })
})
