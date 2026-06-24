import type { Project, RoleId } from '../data/types'
import { roleMeta } from '../config/roles'

/**
 * Simulated role-based access. Source of truth for "who can see/do what".
 * - Director General + Department Head: see everything (all projects + workspace tools).
 * - Department Head: additionally can create projects.
 * - Project Manager: only the Projects area, and only projects they manage.
 */
export function canCreateProject(role: RoleId): boolean {
  return role === 'department_head'
}

/** Workspace tools = Employees + Equipment pages (org-wide rosters). */
export function canSeeWorkspaceTools(role: RoleId): boolean {
  return role !== 'project_manager'
}

export function pmNameOf(p: Project): string {
  return p.team.find((t) => t.id === p.pmId)?.name ?? ''
}

export function visibleProjects(role: RoleId, projects: Project[]): Project[] {
  if (role !== 'project_manager') return projects
  const me = roleMeta(role).person
  return projects.filter((p) => pmNameOf(p) === me)
}

export function canOpenProject(role: RoleId, p: Project): boolean {
  if (role !== 'project_manager') return true
  return pmNameOf(p) === roleMeta(role).person
}
