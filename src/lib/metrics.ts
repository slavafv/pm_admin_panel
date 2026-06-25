import type { Project, Phase, Milestone } from '../data/types'
import { daysToMonth, monthLabel } from './format'

/** Calendar label for a month that is stored *relative* to the project start.
 *  Accounts for projects that don't start in January. */
export function calLabel(p: Project, relMonth: number): string {
  return monthLabel(p.startMonthIndex + relMonth, p.startYear)
}

/** Days from the demo "today" to a project-relative month. */
export function calDays(p: Project, relMonth: number): number {
  return daysToMonth(p.startMonthIndex + relMonth, p.startYear)
}

export function currentPhase(p: Project): Phase {
  return p.phases.find((ph) => ph.id === p.currentPhaseId) ?? p.phases[0]
}

export function nextMilestone(p: Project): { milestone: Milestone; days: number } | null {
  const upcoming = p.milestones
    .filter((m) => m.state !== 'done')
    .map((m) => ({ milestone: m, days: calDays(p, m.month) }))
    .filter((x) => x.days >= 0) // only genuinely upcoming — never a past milestone
    .sort((a, b) => a.days - b.days)
  return upcoming[0] ?? null
}

/** FTE used vs available, for a given phase index (default = current). */
export function teamCapacity(p: Project, phaseIndex?: number): { used: number; available: number } {
  const idx = phaseIndex ?? p.phases.findIndex((ph) => ph.id === p.currentPhaseId)
  const i = idx < 0 ? 0 : idx
  const used = p.team.reduce((acc, t) => acc + (t.fteByPhase[i] ?? 0), 0)
  const available = p.team.reduce((acc, t) => acc + t.capacity, 0)
  return { used, available }
}

/** Planned cumulative spend at the demo "now" (last burn point with actual). */
export function budgetVariance(p: Project): { planned: number; actual: number; underBy: number } {
  const withActual = p.burn.filter((b) => b.actual != null)
  const last = withActual[withActual.length - 1]
  const planned = (last?.planned ?? 0) * 1_000_000
  const actual = (last?.actual ?? 0) * 1_000_000
  return { planned, actual, underBy: planned - actual }
}

export function spentPct(p: Project): number {
  return (p.spentBudget / p.totalBudget) * 100
}

export function issueCounts(p: Project) {
  const by = { high: 0, medium: 0, low: 0 }
  const byCat = { Permitting: 0, Technical: 0, Commercial: 0 }
  for (const i of p.issues) {
    by[i.severity] += 1
    byCat[i.category] += 1
  }
  return { by, byCat, total: p.issues.length }
}
