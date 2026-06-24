import type { Project } from '../data/types'
import { calLabel, budgetVariance } from './metrics'
import { riskScore } from './risk'

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

  // Equipment issues — one alert per unit, combining lease-expiry + overdue maintenance
  for (const e of p.equipment) {
    const phase = p.phases.find((ph) => ph.name === e.phase)
    const needsUntil = phase ? phase.endMonth : p.durationMonths - 1
    const expiring = e.serviceUntilMonth != null && e.serviceUntilMonth < needsUntil
    const overdue = e.maintenance === 'Overdue'
    if (!expiring && !overdue) continue
    const texts: string[] = []
    const recs: string[] = []
    if (overdue) {
      texts.push('maintenance is overdue')
      recs.push('service it before further use')
    }
    if (expiring) {
      texts.push(`service/lease ends ${calLabel(p, e.serviceUntilMonth!)}, before ${e.phase} finishes (${calLabel(p, needsUntil)})`)
      recs.push('schedule renewal/replacement ahead of that date')
    }
    out.push({
      level: overdue ? 'risk' : 'warn',
      area: 'Equipment',
      text: `${e.name}: ${texts.join('; ')}.`,
      recommendation: recs.map((r) => r[0].toUpperCase() + r.slice(1)).join('. ') + '.',
    })
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

  // High-severity active risks (score = P×I ≥ 15)
  for (const r of p.risks) {
    if (r.status !== 'Closed' && riskScore(r) >= 15) {
      out.push({
        level: 'risk',
        area: 'Risk',
        text: `High-severity risk ${r.id}: ${r.risk} (score ${riskScore(r)}).`,
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
