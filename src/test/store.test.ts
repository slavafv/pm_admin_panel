import { describe, it, expect, beforeEach } from 'vitest'
import { useStore } from '../store/useStore'

describe('store', () => {
  beforeEach(() => useStore.getState().resetDemo())

  it('starts with the hero project + 3 portfolio cards', () => {
    const s = useStore.getState()
    expect(s.projects).toHaveLength(1)
    expect(s.cards).toHaveLength(3)
    expect(s.projects[0].id).toBe('rak-wwtp-1')
  })

  it('createProject adds an openable project and a card on top', () => {
    const id = useStore.getState().createProject({
      name: 'Test Bridge',
      department: 'RAK Municipality Urban Planning Dept',
      contractType: 'Design-Build',
      startLabel: 'Start 01/03/2026 (24 months)',
      durationMonths: 24,
      totalBudget: 100_000_000,
      pmName: 'Jane Doe',
      tags: ['Roads'],
    })
    const s = useStore.getState()
    expect(s.projects.find((p) => p.id === id)).toBeTruthy()
    expect(s.cards[0].name).toBe('Test Bridge')
    expect(s.cards[0].status).toBe('planning')
    const proj = s.getProject(id)!
    expect(proj.team[0].name).toBe('Jane Doe')
    expect(proj.totalBudget).toBe(100_000_000)
    expect(proj.overallProgress).toBe(0)
  })

  it('markPhaseComplete sets phase to complete and recomputes progress', () => {
    useStore.getState().markPhaseComplete('rak-wwtp-1', 'design')
    const p = useStore.getState().getProject('rak-wwtp-1')!
    const design = p.phases.find((ph) => ph.id === 'design')!
    expect(design.status).toBe('complete')
    expect(design.progressPct).toBe(100)
    // 100 + 0 + 0 over 3 phases ~= 33
    expect(p.overallProgress).toBe(33)
  })

  it('setRole switches the active role', () => {
    useStore.getState().setRole('project_manager')
    expect(useStore.getState().role).toBe('project_manager')
  })
})
