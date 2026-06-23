import type { Availability, Equipment, Project, TeamMember } from '../data/types'

/**
 * Workspace-level aggregations. These are DERIVED VIEWS over the same project
 * objects in the store — there is no separate copy, so the global Employees /
 * Equipment pages can never diverge from the per-project data. Edits happen in
 * a project (Resources) and show up here immediately.
 */

export interface EmployeeAssignment {
  project: Project
  member: TeamMember
}
export interface EmployeeAggregate {
  name: string
  role: string
  initials: string
  color: string
  availability: Availability
  /** representative load = peak FTE across assignments */
  peakFte: number
  assignments: EmployeeAssignment[]
}

export function aggregateEmployees(projects: Project[]): EmployeeAggregate[] {
  const map = new Map<string, EmployeeAggregate>()
  for (const project of projects) {
    for (const member of project.team) {
      let agg = map.get(member.name)
      if (!agg) {
        agg = {
          name: member.name,
          role: member.role,
          initials: member.initials,
          color: member.color,
          availability: member.availability ?? 'Available',
          peakFte: 0,
          assignments: [],
        }
        map.set(member.name, agg)
      }
      if (member.availability === 'On leave') agg.availability = 'On leave'
      agg.peakFte = Math.max(agg.peakFte, ...member.fteByPhase, 0)
      agg.assignments.push({ project, member })
    }
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name))
}

export function activeEmployeeCount(emps: EmployeeAggregate[]): number {
  return emps.filter((e) => e.availability !== 'On leave').length
}

export interface EquipmentRow {
  equipment: Equipment
  project: Project
}
export function aggregateEquipment(projects: Project[]): EquipmentRow[] {
  const rows: EquipmentRow[] = []
  for (const project of projects) for (const equipment of project.equipment) rows.push({ equipment, project })
  return rows
}

export interface FleetStats {
  total: number
  inUse: number
  avgUtil: number
  maintPending: number
  categories: number
}
export function fleetStats(rows: EquipmentRow[]): FleetStats {
  const utils = rows.map((r) => r.equipment.utilization ?? 0).filter((u) => u > 0)
  return {
    total: rows.length,
    inUse: rows.filter((r) => r.equipment.status === 'In use').length,
    avgUtil: utils.length ? Math.round(utils.reduce((a, b) => a + b, 0) / utils.length) : 0,
    maintPending: rows.filter((r) => r.equipment.maintenance && r.equipment.maintenance !== 'Up to date').length,
    categories: new Set(rows.map((r) => r.equipment.category)).size,
  }
}

/** Bar geometry for an assignment within a calendar year (for the Gantt). */
export function yearBar(project: Project, year: number): { leftPct: number; widthPct: number } | null {
  const startAbs = project.startYear * 12 + project.startMonthIndex
  const endAbs = startAbs + project.durationMonths - 1
  const yStart = year * 12
  const yEnd = year * 12 + 11
  const s = Math.max(startAbs, yStart)
  const e = Math.min(endAbs, yEnd)
  if (s > e) return null
  return { leftPct: ((s - yStart) / 12) * 100, widthPct: ((e - s + 1) / 12) * 100 }
}
