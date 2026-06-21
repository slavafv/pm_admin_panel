import { create } from 'zustand'
import type { PortfolioCard, Project, RoleId } from '../data/types'
import { portfolio, rakProject } from '../data/projects'

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
  resetDemo: () => void
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

let createdCount = 0

/** Build an openable Project from the create-modal input, reusing the
 *  hero project's rich sub-structures so every downstream screen has data. */
function buildProject(input: NewProjectInput): { project: Project; card: PortfolioCard } {
  createdCount += 1
  const id = `proj-${createdCount}`
  const pmInitials = initials(input.pmName || 'Project Manager')

  const team = rakProject.team.map((t, i) =>
    i === 0
      ? { ...t, name: input.pmName || t.name, initials: pmInitials }
      : { ...t },
  )

  const project: Project = {
    ...structuredClone(rakProject),
    id,
    name: input.name,
    department: input.department,
    contractType: input.contractType,
    startMonthLabel: input.startLabel,
    durationMonths: input.durationMonths,
    totalBudget: input.totalBudget,
    spentBudget: 0,
    tags: input.tags,
    status: 'planning',
    overallProgress: 0,
    health: 'green',
    healthNote: 'Newly created — setup in progress',
    team,
    pmId: team[0].id,
  }
  // a freshly created project hasn't started any phase
  project.phases = project.phases.map((p) => ({
    ...p,
    progressPct: 0,
    status: 'not_started',
  }))
  project.tasks = { todo: 0, inProgress: 0, done: 0 }

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
    teamInitials: team.map((t) => ({ initials: t.initials, color: t.color })),
  }
  return { project, card }
}

export const useStore = create<StoreState>((set, get) => ({
  projects: [rakProject],
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

  resetDemo: () => {
    createdCount = 0
    set({ projects: [rakProject], cards: portfolio, role: 'director_general' })
  },
}))
