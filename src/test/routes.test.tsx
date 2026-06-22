import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup, within, fireEvent } from '@testing-library/react'
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

describe('routes render without crashing', () => {
  it('Screen 1 — project list shows hero project + create button', () => {
    renderAt('/')
    expect(screen.getByRole('heading', { name: 'Projects', level: 1 })).toBeInTheDocument()
    expect(screen.getAllByText(/RAK Wastewater Treatment Plant/i).length).toBeGreaterThan(0)
    expect(screen.getByText('＋ Create project')).toBeInTheDocument()
  })

  it('Screen 5 — summary table renders key rows', () => {
    renderAt('/projects/rak-wwtp-1')
    expect(screen.getByText('Current phase')).toBeInTheDocument()
    expect(screen.getByText('Budget spent')).toBeInTheDocument()
    expect(screen.getByText(/AED 4,200,000 of AED 387,000,000/)).toBeInTheDocument()
  })

  it('Screen 3 — setup tabs render and switch', () => {
    renderAt('/projects/rak-wwtp-1/setup')
    expect(screen.getByText('Ahmed Al Mansouri')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Stakeholders'))
    expect(screen.getByText('H.E. Munther bin Shekar')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Budget & Resources'))
    expect(screen.getByText('Treatment unit #1')).toBeInTheDocument()
  })

  it('Screen 4 — schedule renders gantt phases', () => {
    renderAt('/projects/rak-wwtp-1/schedule')
    expect(screen.getAllByText('Design & permitting').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Milestones').length).toBeGreaterThan(0)
  })

  it('Screen 6 — DG dashboard renders strategic cards', () => {
    renderAt('/projects/rak-wwtp-1/dashboards', 'director_general')
    expect(screen.getByText('Project health')).toBeInTheDocument()
    expect(screen.getByText('Budget overview')).toBeInTheDocument()
    expect(screen.getByText(/RAK Vision 2030/)).toBeInTheDocument()
  })

  it('Screen 6 — PM dashboard renders execution cards', () => {
    renderAt('/projects/rak-wwtp-1/dashboards', 'project_manager')
    expect(screen.getByText('Task board')).toBeInTheDocument()
    expect(screen.getByText('Blockers · open issues')).toBeInTheDocument()
    expect(screen.getByText('Next milestone')).toBeInTheDocument()
  })

  it('Screen 6 — Department Head dashboard renders operational cards', () => {
    renderAt('/projects/rak-wwtp-1/dashboards', 'department_head')
    expect(screen.getByText('Phase progress')).toBeInTheDocument()
    expect(screen.getByText('Budget burn rate')).toBeInTheDocument()
  })

  it('Screen 8 — reports renders all four report cards', () => {
    renderAt('/projects/rak-wwtp-1/reports')
    expect(screen.getByText('Project status report')).toBeInTheDocument()
    expect(screen.getByText('Budget summary')).toBeInTheDocument()
    expect(screen.getByText('Milestone progress')).toBeInTheDocument()
    expect(screen.getByText('Resource utilization')).toBeInTheDocument()
  })

  it('overview shows project stages with date ranges', () => {
    renderAt('/projects/rak-wwtp-1')
    expect(screen.getByText('Project stages')).toBeInTheDocument()
    expect(screen.getByText('Project summary')).toBeInTheDocument()
    // no removed quick-action buttons remain
    expect(screen.queryByText('＋ Add task')).not.toBeInTheDocument()
    expect(screen.queryByText('📎 Upload document')).not.toBeInTheDocument()
    expect(screen.queryByText('📊 Generate report')).not.toBeInTheDocument()
  })

  it('Al Hamra (planning) project opens — no longer not-found', () => {
    renderAt('/projects/al-hamra-roads')
    expect(screen.getAllByText('Al Hamra Masterplan — Road Network').length).toBeGreaterThan(0)
    expect(screen.queryByText('Project not found.')).not.toBeInTheDocument()
  })

  it('Barjeel (completed) project opens — no longer not-found', () => {
    renderAt('/projects/barjeel-retrofit')
    expect(screen.getAllByText('Barjeel Retrofit — Batch 1').length).toBeGreaterThan(0)
    expect(screen.queryByText('Project not found.')).not.toBeInTheDocument()
  })

  it('setup team tab can remove a (non-PM) member', () => {
    renderAt('/projects/rak-wwtp-1/setup')
    expect(screen.getByText('Sara Kovacs')).toBeInTheDocument()
    const beforeRows = useStore.getState().getProject('rak-wwtp-1')!.team.length
    // Sara Kovacs is the last team member; remove buttons are the 🗑 controls
    const removeBtns = screen.getAllByTitle('Remove member')
    fireEvent.click(removeBtns[removeBtns.length - 1])
    expect(useStore.getState().getProject('rak-wwtp-1')!.team.length).toBe(beforeRows - 1)
  })

  it('unknown project id shows a not-found fallback', () => {
    renderAt('/projects/does-not-exist')
    expect(screen.getByText('Project not found.')).toBeInTheDocument()
  })

  it('create-project flow adds a card to the list', () => {
    renderAt('/')
    fireEvent.click(screen.getByText('＋ Create project'))
    const dialogHeading = screen.getByRole('heading', { name: 'New project' })
    const modal = dialogHeading.closest('div')!.parentElement as HTMLElement
    const nameInput = within(modal).getAllByRole('textbox')[0] as HTMLInputElement
    fireEvent.change(nameInput, { target: { value: 'Corniche Upgrade' } })
    fireEvent.click(screen.getByText('Create project'))
    expect(useStore.getState().cards[0].name).toBe('Corniche Upgrade')
  })
})

describe('store-driven role switch changes dashboard content', () => {
  beforeEach(() => useStore.getState().resetDemo())
  it('DG shows Vision KPIs, PM shows task board', () => {
    const { unmount } = renderAt('/projects/rak-wwtp-1/dashboards', 'director_general')
    expect(screen.getByText(/RAK Vision 2030/)).toBeInTheDocument()
    unmount()
    renderAt('/projects/rak-wwtp-1/dashboards', 'project_manager')
    expect(screen.getByText('Task board')).toBeInTheDocument()
  })
})
