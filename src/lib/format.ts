const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

/** Convert a month index (0 = Jan of startYear) to a label like "Mar 2026". */
export function monthLabel(index: number, startYear = 2026): string {
  const m = ((index % 12) + 12) % 12
  const year = startYear + Math.floor(index / 12)
  return `${MONTHS[m]} ${year}`
}

export function monthShort(index: number): string {
  const m = ((index % 12) + 12) % 12
  return MONTHS[m]
}

/** Format AED currency, optionally compact (e.g. 387M). */
export function aed(value: number, compact = false): string {
  if (compact) {
    if (value >= 1_000_000) return `AED ${(value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 1)}M`
    if (value >= 1_000) return `AED ${(value / 1_000).toFixed(0)}K`
    return `AED ${value}`
  }
  return `AED ${value.toLocaleString('en-US')}`
}

export function pct(value: number, digits = 0): string {
  return `${value.toFixed(digits)}%`
}

/**
 * Demo "today". Chosen so the spec's headline numbers stay internally
 * consistent: design phase ~35% done, AED 4.2M spent of 4.8M planned-to-date,
 * federal approval (Mar 2026) still upcoming.
 */
export const DEMO_TODAY = new Date(2026, 1, 20) // 20 Feb 2026
export const DEMO_NOW_MONTH = 1 // Feb 2026, index from Jan 2026

/** Days from the demo "today" to a target month start. */
export function daysToMonth(monthIndex: number, startYear = 2026): number {
  const target = new Date(startYear + Math.floor(monthIndex / 12), ((monthIndex % 12) + 12) % 12, 1)
  return Math.round((target.getTime() - DEMO_TODAY.getTime()) / (1000 * 60 * 60 * 24))
}

/** Shorten a verbose contract type for compact display. */
export function shortContract(contractType: string): string {
  if (contractType.includes('PPP')) return 'PPP'
  if (contractType.startsWith('EPC')) return 'EPC'
  return contractType
}
