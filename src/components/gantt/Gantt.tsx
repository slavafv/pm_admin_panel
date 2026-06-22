import { useState } from 'react'
import type { Project } from '../../data/types'
import { monthShort, monthLabel } from '../../lib/format'
import { useStore } from '../../store/useStore'

const COL = 34 // px per month
const LABEL_W = 196
// demo "today" = Feb 2026 → absolute month index from year 0
const DEMO_NOW_ABS = 2026 * 12 + 1

const RAG_HEX = { green: '#4caf82', amber: '#f0a830', red: '#e2574c' }

export function Gantt({ project, live = false }: { project: Project; live?: boolean }) {
  const markPhaseComplete = useStore((s) => s.markPhaseComplete)
  const [criticalPath, setCriticalPath] = useState(false)
  const [tip, setTip] = useState<string | null>(null)

  const months = project.durationMonths
  const startAbs = project.startYear * 12 + project.startMonthIndex
  const timelineW = months * COL
  // "today" position relative to this project's start (hidden if out of range)
  const nowRel = DEMO_NOW_ABS - startAbs
  const showNow = nowRel >= 0 && nowRel < months

  // calendar label for a column m (relative to project start)
  const colLabel = (m: number) => monthLabel(project.startMonthIndex + m, project.startYear)
  const colShort = (m: number) => monthShort(project.startMonthIndex + m)

  const years: { year: number; span: number; offset: number }[] = []
  for (let m = 0; m < months; m++) {
    const year = Math.floor((startAbs + m) / 12)
    const last = years[years.length - 1]
    if (last && last.year === year) last.span += 1
    else years.push({ year, span: 1, offset: m })
  }

  return (
    <div>
      {live && (
        <div className="mb-3 flex items-center gap-3">
          <button
            onClick={() => setCriticalPath((c) => !c)}
            className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
              criticalPath ? 'bg-red text-white' : 'bg-card border border-line text-[#475467] hover:bg-[#f3f5f9]'
            }`}
          >
            {criticalPath ? '● Critical path on' : '○ Show critical path'}
          </button>
          <span className="text-xs text-muted">Tip: hover a phase to see dates · mark a phase complete to update dashboards</span>
        </div>
      )}

      <div className="scroll-thin overflow-x-auto rounded-[16px] border border-line bg-card">
        <div style={{ width: LABEL_W + timelineW, minWidth: '100%' }}>
          {/* Year header */}
          <div className="flex border-b border-line bg-[#fafbfc]">
            <div style={{ width: LABEL_W }} className="shrink-0 px-4 py-2 text-xs font-semibold text-muted">
              Timeline
            </div>
            <div className="relative flex" style={{ width: timelineW }}>
              {years.map((y) => (
                <div
                  key={y.year}
                  className="border-l border-line py-2 text-center text-xs font-bold text-ink"
                  style={{ width: y.span * COL }}
                >
                  {y.year}
                </div>
              ))}
            </div>
          </div>
          {/* Month header */}
          <div className="flex border-b border-line">
            <div style={{ width: LABEL_W }} className="shrink-0" />
            <div className="relative flex" style={{ width: timelineW }}>
              {Array.from({ length: months }).map((_, m) => (
                <div
                  key={m}
                  className="border-l border-line/60 py-1.5 text-center text-[10px] text-muted"
                  style={{ width: COL }}
                >
                  {colShort(m)}
                </div>
              ))}
            </div>
          </div>

          {/* Milestones row */}
          <Section label="Milestones">
            <TodayLine />
            {project.milestones.map((ms) => (
              <div
                key={ms.id}
                className="group absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{ left: ms.month * COL + COL / 2 }}
                onMouseEnter={() => setTip(`${ms.name} — ${colLabel(ms.month)}`)}
                onMouseLeave={() => setTip(null)}
              >
                <div
                  className="h-3.5 w-3.5 rotate-45 rounded-[2px] ring-2 ring-white"
                  style={{ background: RAG_HEX[ms.rag] }}
                />
              </div>
            ))}
          </Section>

          {/* Phase rows */}
          {project.phases.map((ph) => {
            const left = ph.startMonth * COL
            const width = (ph.endMonth - ph.startMonth + 1) * COL
            const done = ph.status === 'complete'
            return (
              <Section key={ph.id} label={ph.name}>
                <TodayLine />
                <div
                  className="group absolute top-1/2 -translate-y-1/2 rounded-lg"
                  style={{
                    left: left + 2,
                    width: width - 4,
                    height: 26,
                    background: done ? '#2a3450' : RAG_HEX.green,
                    outline: criticalPath ? '2px dashed #e2574c' : 'none',
                    outlineOffset: 2,
                  }}
                  onMouseEnter={() => setTip(`${ph.name}: ${colLabel(ph.startMonth)} → ${colLabel(ph.endMonth)}`)}
                  onMouseLeave={() => setTip(null)}
                >
                  {/* progress fill */}
                  {!done && ph.progressPct > 0 && (
                    <div
                      className="h-full rounded-l-lg bg-black/15"
                      style={{ width: `${ph.progressPct}%` }}
                    />
                  )}
                  <span
                    className={`pointer-events-none absolute inset-0 flex items-center px-2 text-xs font-semibold text-white ${
                      done ? 'line-through opacity-80' : ''
                    }`}
                  >
                    {ph.name} {done ? '✓' : ph.progressPct > 0 ? `· ${ph.progressPct}%` : ''}
                  </span>
                  {live && !done && (
                    <button
                      onClick={() => markPhaseComplete(project.id, ph.id)}
                      className="absolute right-1 top-1/2 hidden -translate-y-1/2 rounded-md bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-navy group-hover:block"
                    >
                      ✓ complete
                    </button>
                  )}
                </div>
              </Section>
            )
          })}

          {/* Workload header */}
          <div className="flex border-y border-line bg-[#fafbfc]">
            <div style={{ width: LABEL_W }} className="shrink-0 px-4 py-2 text-xs font-semibold text-muted">
              Team workload (FTE)
            </div>
            <div style={{ width: timelineW }} />
          </div>

          {/* Workload rows */}
          {project.team.map((member) => (
            <Section key={member.id} label={member.name} small>
              <TodayLine />
              {project.phases.map((ph, i) => {
                const fte = member.fteByPhase[i] ?? 0
                if (fte <= 0) return null
                const left = ph.startMonth * COL
                const width = (ph.endMonth - ph.startMonth + 1) * COL
                const overloaded = fte > 1
                return (
                  <div
                    key={ph.id}
                    className="absolute top-1/2 -translate-y-1/2 rounded-md text-[10px] font-semibold text-white"
                    style={{
                      left: left + 2,
                      width: width - 4,
                      height: 16,
                      background: overloaded ? RAG_HEX.red : member.color,
                      opacity: overloaded ? 1 : 0.35 + fte * 0.5,
                    }}
                  >
                    <span className="absolute inset-0 flex items-center px-2 text-white">{fte} FTE</span>
                  </div>
                )
              })}
            </Section>
          ))}
        </div>
      </div>

      {tip && (
        <div className="mt-2 inline-block rounded-lg bg-navy px-3 py-1.5 text-xs font-medium text-white">{tip}</div>
      )}
    </div>
  )

  function Section({
    label,
    children,
    small,
  }: {
    label: string
    children: React.ReactNode
    small?: boolean
  }) {
    return (
      <div className="flex border-b border-line last:border-0">
        <div
          style={{ width: LABEL_W }}
          className={`shrink-0 px-4 ${small ? 'py-2 text-xs text-muted' : 'py-3 text-sm font-medium text-ink'}`}
        >
          {label}
        </div>
        <div className="relative" style={{ width: timelineW, height: small ? 32 : 44 }}>
          {children}
        </div>
      </div>
    )
  }

  function TodayLine() {
    if (!showNow) return null
    return (
      <div
        className="pointer-events-none absolute top-0 bottom-0 z-10 w-px bg-blue"
        style={{ left: nowRel * COL + COL / 2 }}
      />
    )
  }
}
