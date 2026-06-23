import type { ReactNode } from 'react'
import clsx from 'clsx'
import type { RAG } from '../../data/types'

export function Card({
  children,
  className = '',
  onClick,
}: {
  children: ReactNode
  className?: string
  onClick?: () => void
}) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        'rounded-[16px] bg-card border border-line shadow-[0_1px_3px_rgba(16,24,40,0.04),0_6px_18px_rgba(16,24,40,0.05)]',
        onClick && 'cursor-pointer transition hover:shadow-[0_4px_14px_rgba(16,24,40,0.1)] hover:-translate-y-0.5',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function CardHead({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between px-5 pt-4 pb-2">
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      {action}
    </div>
  )
}

const RAG_BG: Record<RAG, string> = {
  green: 'bg-green',
  amber: 'bg-amber',
  red: 'bg-red',
}
const RAG_SOFT: Record<RAG, string> = {
  green: 'bg-green-soft text-green',
  amber: 'bg-amber-soft text-amber',
  red: 'bg-red-soft text-red',
}

export function RagDot({ rag, className = '' }: { rag: RAG; className?: string }) {
  return <span className={clsx('inline-block h-2.5 w-2.5 rounded-full', RAG_BG[rag], className)} />
}

export function Chip({
  children,
  tone = 'gray',
}: {
  children: ReactNode
  tone?: 'gray' | RAG | 'navy'
}) {
  const tones: Record<string, string> = {
    gray: 'bg-[#eef0f4] text-[#475467]',
    navy: 'bg-navy text-white',
    green: RAG_SOFT.green,
    amber: RAG_SOFT.amber,
    red: RAG_SOFT.red,
  }
  return (
    <span className={clsx('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium', tones[tone])}>
      {children}
    </span>
  )
}

export function Avatar({
  initials,
  color,
  size = 28,
  ring = true,
}: {
  initials: string
  color: string
  size?: number
  ring?: boolean
}) {
  return (
    <div
      className={clsx('grid shrink-0 place-items-center rounded-full font-semibold text-white', ring && 'ring-2 ring-white')}
      style={{ background: color, width: size, height: size, minWidth: size, fontSize: size * 0.36 }}
    >
      {initials}
    </div>
  )
}

export function AvatarCluster({
  people,
  size = 28,
}: {
  people: { initials: string; color: string }[]
  size?: number
}) {
  return (
    <div className="flex -space-x-2">
      {people.map((p, i) => (
        <Avatar key={i} initials={p.initials} color={p.color} size={size} />
      ))}
    </div>
  )
}

export function ProgressBar({
  value,
  tone = 'green',
  className = '',
}: {
  value: number
  tone?: RAG | 'navy'
  className?: string
}) {
  const tones: Record<string, string> = {
    green: 'bg-green',
    amber: 'bg-amber',
    red: 'bg-red',
    navy: 'bg-navy',
  }
  return (
    <div className={clsx('h-2 w-full overflow-hidden rounded-full bg-[#eef0f4]', className)}>
      <div
        className={clsx('h-full rounded-full transition-all', tones[tone])}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  )
}

export function Button({
  children,
  variant = 'primary',
  onClick,
  disabled,
  type = 'button',
  className = '',
}: {
  children: ReactNode
  variant?: 'primary' | 'ghost' | 'soft'
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit'
  className?: string
}) {
  const styles: Record<string, string> = {
    primary: 'bg-navy text-white hover:bg-navy-soft disabled:bg-[#c2c7d2] disabled:cursor-not-allowed',
    ghost: 'bg-transparent text-ink hover:bg-[#eef0f4]',
    soft: 'bg-[#eef0f4] text-ink hover:bg-[#e2e6ee]',
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition',
        styles[variant],
        className,
      )}
    >
      {children}
    </button>
  )
}

export function Pill({ tone, children }: { tone: string; children: ReactNode }) {
  return <span className={clsx('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold', tone)}>{children}</span>
}

export function StatRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2 text-sm">
      <span className="text-muted">{label}</span>
      <span className="font-semibold text-ink">{value}</span>
    </div>
  )
}
