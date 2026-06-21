import type { RoleId } from '../data/types'

export interface RoleMeta {
  id: RoleId
  label: string
  short: string
  person: string
  scope: string
  initials: string
  color: string
}

export const ROLES: RoleMeta[] = [
  {
    id: 'director_general',
    label: 'Director General',
    short: 'Strategic',
    person: 'H.E. Munther bin Shekar',
    scope: 'Portfolio health, budget variance, milestones, Vision 2030 KPIs',
    initials: 'MS',
    color: '#1a2235',
  },
  {
    id: 'department_head',
    label: 'Department Head',
    short: 'Operational',
    person: 'Eng. Khalid Al Zaabi',
    scope: 'Phase progress, team workload, issues, budget burn',
    initials: 'KZ',
    color: '#4caf82',
  },
  {
    id: 'project_manager',
    label: 'Project Manager',
    short: 'Execution',
    person: 'Ahmed Al Mansouri',
    scope: 'Task board, live schedule, blockers, next milestone',
    initials: 'AM',
    color: '#3b82f6',
  },
]

export function roleMeta(id: RoleId): RoleMeta {
  return ROLES.find((r) => r.id === id) ?? ROLES[0]
}
