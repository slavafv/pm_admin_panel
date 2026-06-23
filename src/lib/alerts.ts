import type { Project } from '../data/types'
import { calLabel, budgetVariance } from './metrics'

export interface Alert {
  level: 'risk' | 'warn'
  area: 'Schedule' | 'Budget' | 'Resources' | 'Equipment' | 'Risk'
  text: string
  recommendation: string
}

/**
 * Derive live, cross-linked alerts from the project's own data — this is what
 * makes the tool more than a set of static tables: equipment lifecycle, people
 * availability, over-allocation, budget burn and high risks all surface here
 * and explain why a project may not be in the green.
 */
export function deriveAlerts(p: Project): Alert[] {
  const out: Alert[] = []

  // Equipment whose lease / service / certification ends before its assigned phase finishes
  for (const e of p.equipment) {
    if (e.serviceUntilMonth == null) continue
    const phase = p.phases.find((ph) => ph.name === e.phase)
    const needsUntil = phase ? phase.endMonth : p.durationMonths - 1
    if (e.serviceUntilMonth < needsUntil) {
      out.push({
        level: 'warn',
        area: 'Equipment',
        text: `${e.name} service/lease ends ${calLabel(p, e.serviceUntilMonth)}, before ${e.phase} finishes (${calLabel(p, needsUntil)}).`,
        recommendation: 'Schedule renewal or replacement ahead of that date.',
      })
    }
  }

  // Equipment with overdue maintenance
  for (const e of p.equipment) {
    if (e.maintenance === 'Overdue') {
      out.push({
        level: 'risk',
        area: 'Equipment',
        text: `${e.name} maintenance is overdue.`,
        recommendation: 'Take it offline and service before further use.',
      })
    }
  }

  // People on leave / limited availability
  for (const m of p.team) {
    if (m.availability === 'On leave') {
      out.push({
        level: 'warn',
        area: 'Resources',
        text: `${m.name} (${m.role}) is on leave — coverage gap.`,
        recommendation: 'Assign a backup or adjust the schedule for their tasks.',
      })
    }
  }

  // Over-allocation (any phase load above capacity)
  for (const m of p.team) {
    const over = m.fteByPhase.findIndex((f) => f > m.capacity)
    if (over >= 0) {
      out.push({
        level: 'warn',
        area: 'Resources',
        text: `${m.name} is over-allocated (${m.fteByPhase[over]} FTE) during ${p.phases[over]?.name ?? 'a stage'}.`,
        recommendation: 'Rebalance workload or add a resource for that stage.',
      })
    }
  }

  // High-probability, high-impact risks
  for (const r of p.risks) {
    if (r.probability === 'High' && r.impact === 'High') {
      out.push({
        level: 'risk',
        area: 'Risk',
        text: `High-severity risk: ${r.risk}.`,
        recommendation: r.mitigation || 'Define a mitigation and assign an owner.',
      })
    }
  }

  // Budget burning ahead of plan
  const v = budgetVariance(p)
  if (v.underBy < 0) {
    out.push({
      level: 'warn',
      area: 'Budget',
      text: `Spend is ahead of plan by ${Math.abs(v.underBy / 1_000_000).toFixed(1)}M AED.`,
      recommendation: 'Review cost drivers and forecast against contingency.',
    })
  }

  // Open higher-severity issues
  const med = p.issues.filter((i) => i.severity !== 'low').length
  if (med > 0) {
    out.push({
      level: 'warn',
      area: 'Schedule',
      text: `${med} open issue${med === 1 ? '' : 's'} of medium+ severity.`,
      recommendation: 'Work the issue log down before the next milestone.',
    })
  }

  return out
}

const HEALTH_EXPLAIN: Record<Project['health'], string> = {
  green: 'On track — schedule, budget and risks are within tolerance.',
  amber: 'Needs attention — one or more areas need action to stay on track.',
  red: 'At risk — material problems threaten scope, schedule or budget.',
}

export function healthExplanation(p: Project): string {
  return HEALTH_EXPLAIN[p.health]
}
