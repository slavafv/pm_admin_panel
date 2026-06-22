import type { Project, ProjectStatus } from '../data/types'
import { monthLabel, daysToMonth, shortContract } from './format'

export const STATUS_META: Record<ProjectStatus, { label: string; tone: 'gray' | 'green' | 'amber' | 'blue' }> = {
  presale: { label: 'Pre-sale / Contract', tone: 'blue' },
  delivery: { label: 'In delivery', tone: 'green' },
  onhold: { label: 'On hold (frozen)', tone: 'amber' },
  completed: { label: 'Completed', tone: 'gray' },
}

/** Single homogeneous classification line, e.g. "Design-Build · Urban Development". */
export function classification(p: Project): string {
  return `${shortContract(p.contractType)} · ${p.domain}`
}

/** Absolute month index (from year 0) of the project start and end. */
export function startAbs(p: Project): number {
  return p.startYear * 12 + p.startMonthIndex
}
export function endAbs(p: Project): number {
  return startAbs(p) + p.durationMonths - 1
}

export function startLabel(p: Project): string {
  return monthLabel(p.startMonthIndex, p.startYear)
}
export function endLabel(p: Project): string {
  return monthLabel(p.startMonthIndex + p.durationMonths - 1, p.startYear)
}

/** Days until project end (negative once finished). */
export function daysRemaining(p: Project): number {
  return daysToMonth(p.startMonthIndex + p.durationMonths, p.startYear)
}

export function spentPct(p: Project): number {
  return p.totalBudget > 0 ? (p.spentBudget / p.totalBudget) * 100 : 0
}
