import type { Risk } from '../data/types'

/** Risk score = Probability (1–5) × Impact (1–5) → 1–25. */
export function riskScore(r: Risk): number {
  return r.probability * r.impact
}

export type Severity = 'low' | 'medium' | 'high'

export function severityOf(score: number): Severity {
  return score >= 15 ? 'high' : score >= 8 ? 'medium' : 'low'
}

export const SEVERITY_TONE: Record<Severity, string> = {
  high: 'bg-red-soft text-red',
  medium: 'bg-amber-soft text-amber',
  low: 'bg-green-soft text-green',
}

export const STATUS_TONE: Record<Risk['status'], string> = {
  Open: 'bg-red-soft text-red',
  Mitigating: 'bg-amber-soft text-amber',
  Monitoring: 'bg-blue-soft text-blue',
  Closed: 'bg-green-soft text-green',
}

/** Overall risk level for a project, from the highest-scoring open/active risk. */
export function projectRiskLevel(risks: Risk[]): Severity | 'none' {
  const active = risks.filter((r) => r.status !== 'Closed')
  if (active.length === 0) return 'none'
  return severityOf(Math.max(...active.map(riskScore)))
}
