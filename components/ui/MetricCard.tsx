'use client'

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface MetricCardProps {
  label: string
  value: string | number
  prefix?: string
  suffix?: string
  trend?: number // percentual de variação
  trendLabel?: string
  icon?: React.ReactNode
  color?: string
}

export default function MetricCard({
  label, value, prefix, suffix, trend, trendLabel, icon, color
}: MetricCardProps) {
  const trendPositive = trend !== undefined && trend > 0
  const trendNegative = trend !== undefined && trend < 0
  const trendNeutral = trend !== undefined && trend === 0

  return (
    <div className="card card-hover" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</span>
        {icon && (
          <div style={{
            width: '36px', height: '36px', borderRadius: '8px',
            background: color ? `${color}20` : 'var(--accent-subtle)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: color || 'var(--accent)'
          }}>
            {icon}
          </div>
        )}
      </div>

      <div style={{ marginBottom: '8px' }}>
        <span style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Outfit, sans-serif' }}>
          {prefix}{typeof value === 'number' ? value.toLocaleString('pt-BR') : value}{suffix}
        </span>
      </div>

      {trend !== undefined && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {trendPositive && <TrendingUp size={13} color="var(--success)" />}
          {trendNegative && <TrendingDown size={13} color="var(--destructive)" />}
          {trendNeutral && <Minus size={13} color="var(--text-muted)" />}
          <span style={{
            fontSize: '12px', fontWeight: 500,
            color: trendPositive ? 'var(--success)' : trendNegative ? 'var(--destructive)' : 'var(--text-muted)'
          }}>
            {trendPositive ? '+' : ''}{trend}% {trendLabel || 'vs período anterior'}
          </span>
        </div>
      )}
    </div>
  )
}
