import { useState, useRef, useEffect } from 'react'
import { useStore } from '../store/useStore'
import { ROLES, roleMeta } from '../config/roles'
import { Avatar } from './ui/primitives'

export function RoleSwitcher() {
  const role = useStore((s) => s.role)
  const setRole = useStore((s) => s.setRole)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const current = roleMeta(role)

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-3 rounded-xl border border-line bg-card px-3 py-1.5 transition hover:bg-[#f7f8fb]"
      >
        <Avatar initials={current.initials} color={current.color} size={30} ring={false} />
        <div className="text-left leading-tight">
          <div className="text-[11px] text-muted">Viewing as</div>
          <div className="text-sm font-semibold text-ink">{current.label}</div>
        </div>
        <span className="text-muted">▾</span>
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-2 w-72 rounded-2xl border border-line bg-card p-1.5 shadow-xl">
          {ROLES.map((r) => (
            <button
              key={r.id}
              onClick={() => {
                setRole(r.id)
                setOpen(false)
              }}
              className={`flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-[#f3f5f9] ${
                r.id === role ? 'bg-[#f3f5f9]' : ''
              }`}
            >
              <Avatar initials={r.initials} color={r.color} size={32} ring={false} />
              <div className="leading-tight">
                <div className="text-sm font-semibold text-ink">{r.label}</div>
                <div className="text-xs text-muted">{r.person}</div>
                <div className="mt-0.5 text-[11px] text-muted">{r.scope}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
