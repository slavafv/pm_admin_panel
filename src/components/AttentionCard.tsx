import { Card, RagDot } from './ui/primitives'
import { deriveAlerts, healthExplanation, effectiveHealth } from '../lib/alerts'
import type { Project } from '../data/types'

/** Shared "Attention & recommendations" panel — shown on the Overview and on the
 *  role dashboards so every view reflects the same derived warnings. */
export function AttentionCard({ p }: { p: Project }) {
  const health = effectiveHealth(p)
  const alerts = deriveAlerts(p)
  if (health === 'green' && alerts.length === 0) return null

  return (
    <Card className={`border-l-4 ${health === 'red' ? 'border-l-red' : 'border-l-amber'}`}>
      <div className="px-5 pt-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-ink">
          <RagDot rag={health} /> Attention &amp; recommendations
        </h3>
        <p className="mt-1 text-sm text-muted">{healthExplanation(p)}</p>
      </div>
      <div className="grid gap-2 px-5 py-4">
        {alerts.length === 0 ? (
          <p className="text-sm text-muted">No specific alerts — health flag set manually.</p>
        ) : (
          alerts.map((a, i) => (
            <div key={i} className="flex items-start gap-3 rounded-xl bg-[#f7f8fb] px-3 py-2.5">
              <span className={`mt-0.5 rounded-md px-2 py-0.5 text-[10px] font-semibold ${a.level === 'risk' ? 'bg-red-soft text-red' : 'bg-amber-soft text-amber'}`}>{a.area}</span>
              <div className="min-w-0">
                <div className="text-sm font-medium text-ink">{a.text}</div>
                <div className="text-xs text-muted">→ {a.recommendation}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  )
}
