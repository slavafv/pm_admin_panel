import { create } from 'zustand'
import type { PortfolioCard, Project, RoleId, TeamMember } from '../data/types'
import { portfolio, allProjects, genericPhases } from '../data/projects'

export interface NewProjectInput {
  name: string
  department: string
  contractType: string
  startLabel: string
  durationMonths: number
  totalBudget: number
  pmName: string
  tags: string[]
}

interface StoreState {
  projects: Project[]
  cards: PortfolioCard[]
  role: RoleId
  setRole: (r: RoleId) => void
  getProject: (id: string) => Project | undefined
  createProject: (input: NewProjectInput) => string
  markPhaseComplete: (projectId: string, phaseId: string) => void
  addTeamMember: (projectId: string, member: TeamMember) => void
  removeTeamMember: (projectId: string, memberId: string) => void
  resetDemo: () => void
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

let createdCount = 0

/** Build a clean, openable Project from the create-modal input. Stages are
 *  generated from the entered duration (not inherited from the hero project),
 *  so a new project never shows wastewater-specific phases or data. */
function buildProject(input: NewProjectInput): { project: Project; card: PortfolioCard } {
  createdCount += 1
  const id = `proj-${createdCount}`
  const pmName = input.pmName || 'Project Manager'

  const pm: TeamMember = {
    id: `pm-${createdCount}`,
    name: pmName,
    role: 'Project Manager',
    access: 'Full access',
    initials: initials(pmName),
    color: '#1a2235',
    fteByPhase: [1, 1, 1],
    capacity: 1,
  }

  const phases = genericPhases(input.durationMonths)
  const splits = [0.15, 0.7, 0.15]
  const budgetLines = phases.map((ph, i) => ({
    phase: ph.name,
    allocated: Math.round((input.totalBudget * splits[i]) / 1000) * 1000,
    category: ['Design, consulting', 'Delivery, works', 'Testing, handover'][i],
  }))

  const project: Project = {
    id,
    name: input.name,
    department: input.department,
    contractType: input.contractType,
    startMonthLabel: input.startLabel,
    startYear: 2026,
    startMonthIndex: 0,
    durationMonths: input.durationMonths,
    totalBudget: input.totalBudget,
    spentBudget: 0,
    pmId: pm.id,
    tags: input.tags,
    status: 'planning',
    overallProgress: 0,
    currentPhaseId: phases[0].id,
    health: 'green',
    healthNote: 'Newly created — setup in progress',
    team: [pm],
    internalStakeholders: [],
    externalPartners: [],
    budgetLines,
    equipment: [],
    dependencies: [],
    risks: [],
    phases,
    milestones: [
      { id: 'k', name: 'Project kickoff', month: phases[0].startMonth, rag: 'green', state: 'scheduled' },
      { id: 'e', name: 'Execution start', month: phases[1].startMonth, rag: 'green', state: 'scheduled' },
      { id: 'c', name: 'Project completion', month: phases[2].endMonth, rag: 'green', state: 'scheduled' },
    ],
    issues: [],
    tasks: { todo: 0, inProgress: 0, done: 0 },
    inProgressTasks: [],
    burn: [],
    kpis: [{ label: 'Overall completion', current: 0, target: 100, unit: '%' }],
  }

  const card: PortfolioCard = {
    id,
    name: input.name,
    department: input.department,
    status: 'planning',
    budget: input.totalBudget,
    contractType: input.contractType,
    startLabel: input.startLabel,
    durationMonths: input.durationMonths,
    tags: input.tags,
    progress: 0,
    teamInitials: [{ initials: pm.initials, color: pm.color }],
  }
  return { project, card }
}

export const useStore = create<StoreState>((set, get) => ({
  projects: allProjects,
  cards: portfolio,
  role: 'director_general',

  setRole: (r) => set({ role: r }),

  getProject: (id) => get().projects.find((p) => p.id === id),

  createProject: (input) => {
    const { project, card } = buildProject(input)
    set((s) => ({
      projects: [...s.projects, project],
      cards: [card, ...s.cards],
    }))
    return project.id
  },

  markPhaseComplete: (projectId, phaseId) =>
    set((s) => ({
      projects: s.projects.map((p) => {
        if (p.id !== projectId) return p
        const phases = p.phases.map((ph) =>
          ph.id === phaseId
            ? { ...ph, status: 'complete' as const, progressPct: 100 }
            : ph,
        )
        const overall = Math.round(
          phases.reduce((acc, ph) => acc + ph.progressPct, 0) / phases.length,
        )
        return { ...p, phases, overallProgress: overall }
      }),
    })),

  addTeamMember: (projectId, member) =>
    set((s) => ({
      projects: s.projects.map((p) =>
        p.id === projectId ? { ...p, team: [...p.team, member] } : p,
      ),
    })),

  removeTeamMember: (projectId, memberId) =>
    set((s) => ({
      projects: s.projects.map((p) =>
        p.id === projectId ? { ...p, team: p.team.filter((t) => t.id !== memberId) } : p,
      ),
    })),

  resetDemo: () => {
    createdCount = 0
    set({ projects: allProjects, cards: portfolio, role: 'director_general' })
  },
}))
