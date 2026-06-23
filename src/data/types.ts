export type RAG = 'green' | 'amber' | 'red'
/** Lifecycle stage of a project (delivery pipeline, not health). */
export type ProjectStatus = 'presale' | 'delivery' | 'onhold' | 'completed'

export type RoleId = 'director_general' | 'department_head' | 'project_manager'

export type AccessLevel =
  | 'Full access'
  | 'Budget view'
  | 'Execution view'
  | 'Read only'

export type TeamRole =
  | 'Project Manager'
  | 'Department Head'
  | 'Finance Officer'
  | 'Senior Engineer'
  | 'Document Controller'
  | 'Observer'
  | 'External Partner'

export type Availability = 'Available' | 'On leave' | 'Limited'

export interface TeamMember {
  id: string
  name: string
  role: TeamRole
  access: AccessLevel
  initials: string
  color: string
  /** FTE load per phase index, aligned with project.phases */
  fteByPhase: number[]
  /** FTE capacity available (per month) */
  capacity: number
  /** Current availability — feeds staffing alerts */
  availability?: Availability
}

export interface InternalStakeholder {
  name: string
  title: string
  notification: string
}

export interface ExternalPartner {
  org: string
  contact: string
  role: string
  status: RAG
}

export interface BudgetLine {
  phase: string
  allocated: number
  category: string
}

export interface Equipment {
  name: string
  category: string
  phase: string
  status: 'Ordered' | 'Delivered' | 'In use' | 'Planned'
  /** Month index (relative to project start) when lease/service/certification ends. */
  serviceUntilMonth?: number
}

export interface Dependency {
  dependency: string
  type: string
  owner: string
  requiredBy: string
  status: RAG
}

export interface Risk {
  risk: string
  probability: 'Low' | 'Medium' | 'High'
  impact: 'Low' | 'Medium' | 'High'
  mitigation: string
  owner: string
}

export interface Phase {
  id: string
  name: string
  /** month index from project start (Jan 2026 = 0) */
  startMonth: number
  endMonth: number
  progressPct: number
  status: 'not_started' | 'in_progress' | 'complete'
}

export interface Milestone {
  id: string
  name: string
  month: number
  rag: RAG
  state: 'pending' | 'on_track' | 'scheduled' | 'done'
}

export interface Issue {
  id: string
  title: string
  category: 'Permitting' | 'Technical' | 'Commercial'
  severity: 'low' | 'medium' | 'high'
  raised: string
  owner: string
  daysOpen: number
}

export interface BurnPoint {
  month: string
  planned: number
  actual: number | null
}

export interface KPI {
  label: string
  current: number
  target: number
  unit: string
  note?: string
}

/** Assumptions log entry — things taken as true that need validation. */
export interface Assumption {
  text: string
  owner: string
  status: 'Open' | 'Validated' | 'Rejected'
}

export interface Project {
  id: string
  name: string
  department: string
  contractType: string
  domain: string // single classification, e.g. "Water", "Urban Development"
  location?: string
  description?: string
  startMonthLabel: string
  startYear: number
  startMonthIndex: number // 0 = Jan of startYear
  durationMonths: number
  totalBudget: number
  spentBudget: number
  pmId: string
  tags: string[]
  status: ProjectStatus
  overallProgress: number
  currentPhaseId: string
  health: RAG
  healthNote: string

  team: TeamMember[]
  internalStakeholders: InternalStakeholder[]
  externalPartners: ExternalPartner[]
  budgetLines: BudgetLine[]
  equipment: Equipment[]
  dependencies: Dependency[]
  risks: Risk[]
  assumptions: Assumption[]
  phases: Phase[]
  milestones: Milestone[]
  issues: Issue[]
  tasks: { todo: number; inProgress: number; done: number }
  inProgressTasks: { title: string; assigneeId: string; due: string }[]
  burn: BurnPoint[]
  kpis: KPI[]
}
