import { useState } from 'react'
import type { Project } from '../../data/types'
import { monthShort, monthLabel } from '../../lib/format'
import { useStore } from '../../store/useStore'

const MIN_COL = 26 // min px per month before horizontal scroll kicks in
const LABEL_W = 184
const DEMO_NOW_ABS = 2026 * 12 + 5 // demo "today" = Jun 2026

const RAG_HEX = { green: '#4caf82', amber: '#f0a830', red: '#e2574c' }

export function Gantt({ project, live = false }: { project: Project; live?: boolean }) {
  const markPhaseComplete = useStore((s) => s.markPhaseComplete)
  const [criticalPath, setCriticalPath] = useState(false)
  const [tip, setTip] = useState<string | null>(null)

  const months = project.durationMonths
  const startAbs = project.startYear * 12 + project.startMonthIndex
  const timelineMinW = months * MIN_COL
  const nowRel = DEMO_NOW_ABS - startAbs
  const showNow = nowRel >= 0 && nowRel < months

  const colLabel = (m: number) => monthLabel(project.startMonthIndex + m, project.startYear)
  const colShort = (m: number) => monthShort(project.startMonthIndex + m)

  // percentage helpers (timeline stretches to fill available width)
  const leftPct = (m: number) => `${(m / months) * 100}%`
  const spanPct = (s: number) => `${(s / months) * 100}%`

  const years: { year: number; span: number }[] = []
  for (let m = 0; m < months; m++) {
    const year = Math.floor((startAbs + m) / 12)
    const last = years[years.length - 1]
    if (last && last.year === year) last.span += 1
    else years.push({ year, span: 1 })
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
          <span className="cursor-help text-muted" title="Hover a phase to see dates. Mark a phase complete to update the dashboards. FTE bars: green = ok, amber = on leave, red = over-allocated.">ⓘ</span>
        </div>
      )}

      <div className="scroll-thin overflow-x-auto rounded-[16px] border border-line bg-card">
        <div style={{ minWidth: LABEL_W + timelineMinW }}>
          {/* Year header */}
          <Row label="Timeline" labelClass="py-2 text-xs font-semibold text-muted" headerBg>
            <div className="flex h-full">
              {years.map((y) => (
                <div key={y.year} className="flex items-center justify-center border-l border-line text-xs font-bold text-ink" style={{ width: spanPct(y.span) }}>
                  {y.year}
                </div>
              ))}
            </div>
          </Row>
          {/* Month header */}
          <Row label="" small>
            <div className="flex h-full">
              {Array.from({ length: months }).map((_, m) => (
                <div key={m} className="flex flex-1 items-center justify-center border-l border-line/60 text-[10px] text-muted">
                  {colShort(m)}
                </div>
              ))}
            </div>
          </Row>

          {/* Milestones */}
          <Row label="Milestones">
            <TodayLine />
            {project.milestones.map((ms) => (
              <div
                key={ms.id}
                className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{ left: leftPct(ms.month + 0.5) }}
                onMouseEnter={() => setTip(`${ms.name} — ${colLabel(ms.month)}`)}
                onMouseLeave={() => setTip(null)}
              >
                <div className="h-3.5 w-3.5 rotate-45 rounded-[2px] ring-2 ring-white" style={{ background: RAG_HEX[ms.rag] }} />
              </div>
            ))}
          </Row>

          {/* Phases */}
          {project.phases.map((ph) => {
            const done = ph.status === 'complete'
            return (
              <Row key={ph.id} label={ph.name}>
                <TodayLine />
                <div
                  className="group absolute top-1/2 -translate-y-1/2 overflow-hidden rounded-lg"
                  style={{
                    left: `calc(${leftPct(ph.startMonth)} + 2px)`,
                    width: `calc(${spanPct(ph.endMonth - ph.startMonth + 1)} - 4px)`,
                    height: 26,
                    background: done ? '#2a3450' : RAG_HEX.green,
                    outline: criticalPath ? '2px dashed #e2574c' : 'none',
                    outlineOffset: 2,
                  }}
                  onMouseEnter={() => setTip(`${ph.name}: ${colLabel(ph.startMonth)} → ${colLabel(ph.endMonth)}`)}
                  onMouseLeave={() => setTip(null)}
                >
                  {!done && ph.progressPct > 0 && <div className="h-full bg-black/15" style={{ width: `${ph.progressPct}%` }} />}
                  <span className={`pointer-events-none absolute inset-0 flex items-center truncate px-2 text-xs font-semibold text-white ${done ? 'line-through opacity-80' : ''}`}>
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
              </Row>
            )
          })}

          {/* Workload header */}
          <Row label="Team workload (FTE)" labelClass="py-2 text-xs font-semibold text-muted" headerBg>
            <div />
          </Row>

          {/* Workload rows */}
          {project.team.map((member) => (
            <Row key={member.id} label={member.name} small>
              <TodayLine />
              {project.phases.map((ph, i) => {
                const fte = member.fteByPhase[i] ?? 0
                if (fte <= 0) return null
                const onLeave = member.availability === 'On leave'
                const overloaded = fte > member.capacity
                // semantic colour: overloaded = red, on leave = amber, else green
                const bg = overloaded ? RAG_HEX.red : onLeave ? RAG_HEX.amber : RAG_HEX.green
                return (
                  <div
                    key={ph.id}
                    title={onLeave ? `${member.name} is on leave` : overloaded ? `${member.name} over-allocated` : undefined}
                    className="absolute top-1/2 -translate-y-1/2 overflow-hidden rounded-md text-[10px] font-semibold text-white"
                    style={{
                      left: `calc(${leftPct(ph.startMonth)} + 2px)`,
                      width: `calc(${spanPct(ph.endMonth - ph.startMonth + 1)} - 4px)`,
                      height: 16,
                      background: bg,
                      opacity: onLeave ? 0.55 : 0.55 + fte * 0.4,
                    }}
                  >
                    <span className="absolute inset-0 flex items-center truncate px-2 text-white">{fte} FTE{onLeave ? ' · leave' : ''}</span>
                  </div>
                )
              })}
            </Row>
          ))}
        </div>
      </div>

      {tip && <div className="mt-2 inline-block rounded-lg bg-navy px-3 py-1.5 text-xs font-medium text-white">{tip}</div>}
    </div>
  )

  function Row({
    label,
    children,
    small,
    headerBg,
    labelClass,
  }: {
    label: string
    children: React.ReactNode
    small?: boolean
    headerBg?: boolean
    labelClass?: string
  }) {
    return (
      <div className={`flex border-b border-line last:border-0 ${headerBg ? 'bg-[#fafbfc]' : ''}`}>
        <div
          style={{ width: LABEL_W }}
          className={`shrink-0 truncate px-4 ${labelClass ?? (small ? 'py-2 text-xs text-muted' : 'py-3 text-sm font-medium text-ink')}`}
        >
          {label}
        </div>
        <div className="relative flex-1" style={{ height: small ? 32 : 44 }}>
          {children}
        </div>
      </div>
    )
  }

  function TodayLine() {
    if (!showNow) return null
    return <div className="pointer-events-none absolute top-0 bottom-0 z-10 w-px bg-blue" style={{ left: leftPct(nowRel + 0.5) }} />
  }
}
