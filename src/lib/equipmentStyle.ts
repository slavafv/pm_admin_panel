export const STATUS_TONE: Record<string, string> = {
  'In use': 'bg-blue-soft text-blue',
  Available: 'bg-green-soft text-green',
  Maintenance: 'bg-red-soft text-red',
  Planned: 'bg-[#eef0f4] text-[#475467]',
}

export const MAINT_TONE: Record<string, string> = {
  'Up to date': 'bg-green-soft text-green',
  'Due soon': 'bg-amber-soft text-amber',
  Pending: 'bg-amber-soft text-amber',
  Overdue: 'bg-red-soft text-red',
}

export function utilColor(u: number): string {
  return u >= 90 ? 'bg-green' : u >= 55 ? 'bg-amber' : 'bg-red'
}
export function utilText(u: number): string {
  return u >= 90 ? 'text-green' : u >= 55 ? 'text-amber' : 'text-red'
}
