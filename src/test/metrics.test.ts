import { describe, it, expect } from 'vitest'
import { rakProject } from '../data/projects'
import {
  currentPhase,
  nextMilestone,
  teamCapacity,
  budgetVariance,
  spentPct,
  issueCounts,
} from '../lib/metrics'
import { aed, monthLabel, monthShort } from '../lib/format'

describe('format helpers', () => {
  it('labels months across years', () => {
    expect(monthLabel(0, 2026)).toBe('Jan 2026')
    expect(monthLabel(2, 2026)).toBe('Mar 2026')
    expect(monthLabel(12, 2026)).toBe('Jan 2027')
    expect(monthLabel(35, 2026)).toBe('Dec 2028')
  })
  it('short month is stable', () => {
    expect(monthShort(5)).toBe('Jun')
  })
  it('formats AED', () => {
    expect(aed(387_000_000)).toBe('AED 387,000,000')
    expect(aed(387_000_000, true)).toBe('AED 387M')
    expect(aed(4_200_000, true)).toBe('AED 4.2M')
  })
})

describe('metrics', () => {
  it('finds the current phase', () => {
    expect(currentPhase(rakProject).id).toBe('design')
  })
  it('next milestone is the earliest non-done', () => {
    const next = nextMilestone(rakProject)
    expect(next?.milestone.id).toBe('m1')
    expect(next?.days).toBeGreaterThan(0)
  })
  it('team capacity sums FTE for the current phase', () => {
    const cap = teamCapacity(rakProject)
    // design phase: 1 + 0.5 + 0.5 + 0.5 = 2.5 used, 4 available
    expect(cap.used).toBeCloseTo(2.5)
    expect(cap.available).toBeCloseTo(4)
  })
  it('budget is under plan', () => {
    const v = budgetVariance(rakProject)
    expect(v.underBy).toBeGreaterThan(0)
    expect(v.planned).toBe(4_800_000)
    expect(v.actual).toBe(4_200_000)
  })
  it('spent percent is small', () => {
    expect(spentPct(rakProject)).toBeCloseTo(1.085, 2)
  })
  it('issue counts tally by severity and category', () => {
    const c = issueCounts(rakProject)
    expect(c.total).toBe(3)
    expect(c.by.medium).toBe(2)
    expect(c.by.low).toBe(1)
    expect(c.byCat.Permitting).toBe(2)
    expect(c.byCat.Commercial).toBe(0)
  })
})
