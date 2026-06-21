import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import type { BurnPoint } from '../../data/types'
import { aed } from '../../lib/format'

export function BudgetDonut({ spent, total }: { spent: number; total: number }) {
  const data = [
    { name: 'Spent', value: spent },
    { name: 'Remaining', value: Math.max(0, total - spent) },
  ]
  const pct = ((spent / total) * 100).toFixed(1)
  return (
    <div className="relative h-[150px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" innerRadius={52} outerRadius={70} startAngle={90} endAngle={-270} stroke="none">
            <Cell fill="#4caf82" />
            <Cell fill="#eef0f4" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 grid place-items-center">
        <div className="text-center">
          <div className="text-xl font-bold text-ink">{pct}%</div>
          <div className="text-[11px] text-muted">spent</div>
        </div>
      </div>
    </div>
  )
}

export function BurnChart({ data }: { data: BurnPoint[] }) {
  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
          <CartesianGrid stroke="#eef0f4" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} unit="M" />
          <Tooltip
            formatter={((v: unknown, name: unknown) => [
              v == null ? '—' : aed(Number(v) * 1_000_000, true),
              name,
            ]) as never}
            contentStyle={{ borderRadius: 12, border: '1px solid #e7e9ee', fontSize: 12 }}
          />
          <Line type="monotone" dataKey="planned" name="Planned" stroke="#1a2235" strokeWidth={2} dot={{ r: 3 }} />
          <Line
            type="monotone"
            dataKey="actual"
            name="Actual"
            stroke="#4caf82"
            strokeWidth={2.5}
            dot={{ r: 3 }}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
