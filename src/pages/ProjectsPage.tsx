import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import type { PortfolioCard, ProjectStatus } from '../data/types'
import { Card, Button, Chip, AvatarCluster, ProgressBar } from '../components/ui/primitives'
import { StatusBadge } from '../components/ui/StatusBadge'
import { CreateProjectModal } from '../components/CreateProjectModal'
import { aed } from '../lib/format'

const FILTERS: { key: ProjectStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'planning', label: 'Planning' },
  { key: 'onhold', label: 'On Hold' },
  { key: 'completed', label: 'Completed' },
]

function ProjectCard({ card, onOpen }: { card: PortfolioCard; onOpen: () => void }) {
  return (
    <Card className="p-5" onClick={onOpen}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="truncate text-base font-bold text-ink">{card.name}</h3>
          <p className="mt-0.5 text-sm text-muted">{card.department}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted">
            {card.contractType && <Chip>{card.contractType}</Chip>}
            {card.budget != null && <Chip>{aed(card.budget, true)}</Chip>}
            {card.startLabel && <span className="inline-flex items-center gap-1">📅 {card.startLabel}</span>}
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {card.tags?.map((t) => (
              <Chip key={t}>{t}</Chip>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-end gap-3">
          <StatusBadge status={card.status} />
          {card.teamInitials && <AvatarCluster people={card.teamInitials} />}
        </div>
      </div>
      {card.progress != null && card.status !== 'planning' && (
        <div className="mt-4 flex items-center gap-3">
          <ProgressBar
            value={card.progress}
            tone={card.status === 'completed' ? 'green' : 'navy'}
            className="flex-1"
          />
          <span className="w-10 text-right text-xs font-semibold text-muted">{card.progress}%</span>
        </div>
      )}
    </Card>
  )
}

export function ProjectsPage() {
  const cards = useStore((s) => s.cards)
  const navigate = useNavigate()
  const [filter, setFilter] = useState<ProjectStatus | 'all'>('all')
  const [search, setSearch] = useState('')
  const [creating, setCreating] = useState(false)

  const filtered = useMemo(() => {
    return cards.filter((c) => {
      const okFilter = filter === 'all' || c.status === filter
      const okSearch = !search || c.name.toLowerCase().includes(search.toLowerCase())
      return okFilter && okSearch
    })
  }, [cards, filter, search])

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-ink">Projects</h1>
        <div className="flex items-center gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects…"
            className="w-64 rounded-xl border border-line bg-card px-3.5 py-2.5 text-sm outline-none focus:border-navy"
          />
          <Button onClick={() => setCreating(true)}>＋ Create project</Button>
        </div>
      </div>

      <div className="mt-5 flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              filter === f.key ? 'bg-navy text-white' : 'bg-card text-[#475467] border border-line hover:bg-[#f3f5f9]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-4">
        {filtered.map((c) => (
          <ProjectCard key={c.id} card={c} onOpen={() => navigate(`/projects/${c.id}`)} />
        ))}
        {filtered.length === 0 && (
          <Card className="grid place-items-center p-12 text-sm text-muted">No projects match your filter.</Card>
        )}
      </div>

      {creating && <CreateProjectModal onClose={() => setCreating(false)} />}
    </div>
  )
}
