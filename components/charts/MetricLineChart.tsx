'use client'

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface LineChartProps {
  data: Record<string, unknown>[]
  lines: { key: string; label: string; color: string }[]
  xKey?: string
  height?: number
  formatY?: (value: number) => string
}

export default function MetricLineChart({
  data, lines, xKey = 'data_referencia', height = 280, formatY
}: LineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey={xKey}
          tickFormatter={(v) => {
            try { return format(parseISO(v), 'dd/MM', { locale: ptBR }) } catch { return v }
          }}
          tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={formatY}
          width={50}
        />
        <Tooltip
          contentStyle={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            fontSize: '12px',
            color: 'var(--text-primary)',
          }}
          labelFormatter={(v) => {
            try { return format(parseISO(v as string), "dd 'de' MMMM", { locale: ptBR }) } catch { return v }
          }}
          formatter={(value: number, name: string) => [
            formatY ? formatY(value) : value.toLocaleString('pt-BR'),
            lines.find(l => l.key === name)?.label || name
          ]}
        />
        <Legend
          formatter={(value) => lines.find(l => l.key === value)?.label || value}
          wrapperStyle={{ fontSize: '12px', color: 'var(--text-secondary)' }}
        />
        {lines.map((line) => (
          <Line
            key={line.key}
            type="monotone"
            dataKey={line.key}
            stroke={line.color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
