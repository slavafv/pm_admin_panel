import { describe, it, expect, beforeEach } from 'vitest'
import { useStore, type NewProjectInput } from '../store/useStore'

const baseInput: NewProjectInput = {
  name: 'Corniche Bridge',
  department: 'RAK Urban Planning Dept',
  contractType: 'Design-Build',
  domain: 'Transport',
  location: 'RAK',
  startLabel: 'Start 01/03/2026',
  startYear: 2026,
  startMonthIndex: 2,
  durationMonths: 24,
  totalBudget: 50_000_000,
  pmName: 'Sara Lee',
  tags: ['Transport'],
}

describe('store', () => {
  beforeEach(() => useStore.getState().resetDemo())

  it('starts with the modelled portfolio; every project is openable', () => {
    const s = useStore.getState()
    expect(s.projects.length).toBeGreaterThanOrEqual(3)
    expect(s.projects.slice(0, 3).map((p) => p.id)).toEqual(['rak-wwtp-1', 'al-hamra-roads', 'barjeel-retrofit'])
    for (const p of s.projects) expect(s.getProject(p.id)).toBeTruthy()
  })

  it('statuses use the new lifecycle values', () => {
    const s = useStore.getState()
    expect(s.getProject('rak-wwtp-1')!.status).toBe('delivery')
    expect(s.getProject('al-hamra-roads')!.status).toBe('presale')
    expect(s.getProject('barjeel-retrofit')!.status).toBe('completed')
  })

  it('createProject prepends an openable project with generic stages', () => {
    const id = useStore.getState().createProject(baseInput)
    const s = useStore.getState()
    expect(s.projects[0].id).toBe(id)
    const proj = s.getProject(id)!
    expect(proj.team[0].name).toBe('Sara Lee')
    expect(proj.totalBudget).toBe(50_000_000)
    expect(proj.status).toBe('presale')
    expect(proj.phases.map((p) => p.id)).toEqual(['planning', 'execution', 'closeout'])
    expect(proj.startMonthIndex).toBe(2)
  })

  it('createProject with custom stages uses them as phases', () => {
    const id = useStore.getState().createProject({
      ...baseInput,
      durationMonths: 0,
      stages: [{ name: 'Discovery', months: 3 }, { name: 'Build', months: 9 }],
    })
    const proj = useStore.getState().getProject(id)!
    expect(proj.phases.map((p) => p.name)).toEqual(['Discovery', 'Build'])
    expect(proj.durationMonths).toBe(12)
  })

  it('markPhaseComplete recomputes overall progress', () => {
    useStore.getState().markPhaseComplete('rak-wwtp-1', 'commissioning')
    const p = useStore.getState().getProject('rak-wwtp-1')!
    expect(p.phases.find((ph) => ph.id === 'commissioning')!.status).toBe('complete')
    // design 100 + construction 6 + commissioning 100 → round(68.7) = 69
    expect(p.overallProgress).toBe(69)
  })

  it('add/remove team member mutates the project team', () => {
    const before = useStore.getState().getProject('rak-wwtp-1')!.team.length
    useStore.getState().addTeamMember('rak-wwtp-1', {
      id: 'tmp', name: 'New Person', role: 'Observer', access: 'Read only',
      initials: 'NP', color: '#000', fteByPhase: [0, 0, 0], capacity: 1,
    })
    expect(useStore.getState().getProject('rak-wwtp-1')!.team.length).toBe(before + 1)
    useStore.getState().removeTeamMember('rak-wwtp-1', 'tmp')
    expect(useStore.getState().getProject('rak-wwtp-1')!.team.length).toBe(before)
  })

  it('updateProject can edit budget lines and keep total in sync', () => {
    useStore.getState().updateProject('rak-wwtp-1', (p) => {
      const lines = p.budgetLines.slice(0, -1)
      return { ...p, budgetLines: lines, totalBudget: lines.reduce((a, b) => a + b.allocated, 0) }
    })
    const p = useStore.getState().getProject('rak-wwtp-1')!
    expect(p.totalBudget).toBe(p.budgetLines.reduce((a, b) => a + b.allocated, 0))
  })

  it('addGeneratedReport stores a report', () => {
    useStore.getState().addGeneratedReport({ id: 'r1', projectId: 'rak-wwtp-1', name: 'Status', dateLabel: 'x', params: ['Budget breakdown'], format: 'PDF' })
    expect(useStore.getState().generatedReports[0].id).toBe('r1')
  })

  it('setRole switches the active role', () => {
    useStore.getState().setRole('project_manager')
    expect(useStore.getState().role).toBe('project_manager')
  })
})
