import type { ProjectStatus } from '../../data/types'
import { STATUS_META } from '../../lib/project'
import { Chip } from './primitives'

const ICON: Record<ProjectStatus, string> = {
  presale: '📝',
  delivery: '🚧',
  onhold: '⏸️',
  completed: '✅',
}

export function StatusBadge({ status }: { status: ProjectStatus }) {
  const m = STATUS_META[status]
  return (
    <Chip tone={m.tone === 'blue' ? 'gray' : m.tone}>
      <span>{ICON[status]}</span>
      {m.label}
    </Chip>
  )
}
