import type { ProjectStatus } from '../../data/types'
import { Chip } from './primitives'

const MAP: Record<ProjectStatus, { label: string; icon: string; tone: 'gray' | 'green' | 'amber' }> = {
  planning: { label: 'Planning', icon: '📋', tone: 'gray' },
  active: { label: 'In progress', icon: '🚧', tone: 'green' },
  onhold: { label: 'On hold', icon: '⏸️', tone: 'amber' },
  completed: { label: 'Completed', icon: '✅', tone: 'gray' },
}

export function StatusBadge({ status }: { status: ProjectStatus }) {
  const m = MAP[status]
  return (
    <Chip tone={m.tone}>
      <span>{m.icon}</span>
      {m.label}
    </Chip>
  )
}
