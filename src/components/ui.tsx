import type { ReactNode } from 'react'
import { Icon, type IconName } from './Icon'

export function StatusDot({ tone = 'amber' }: { tone?: 'amber' | 'mint' | 'rose' | 'sky' }) {
  const map = { amber: '#D9822B', mint: '#3BB183', rose: '#DB5A78', sky: '#4A8CE8' }
  return (
    <span className="relative flex h-1.5 w-1.5">
      <span className="absolute inset-0 rounded-full" style={{ background: map[tone], opacity: 0.35 }} />
      <span className="relative m-auto h-1.5 w-1.5 rounded-full" style={{ background: map[tone] }} />
    </span>
  )
}

export function Sparkline({ data, tone = '#D9822B', w = 84, h = 26 }: { data: number[]; tone?: string; w?: number; h?: number }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const span = max - min || 1
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - ((v - min) / span) * (h - 4) - 2
    return [x, y] as const
  })
  const d = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ')
  const area = `${d} L${w} ${h} L0 ${h} Z`
  const gid = `sg-${tone.replace('#', '')}`
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={tone} stopOpacity="0.28" />
          <stop offset="100%" stopColor={tone} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gid})`} />
      <path d={d} fill="none" stroke={tone} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="2" fill={tone} />
    </svg>
  )
}

export function Ring({ value, size = 46, tone = '#D9822B' }: { value: number; size?: number; tone?: string }) {
  const r = (size - 6) / 2
  const c = 2 * Math.PI * r
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={tone}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={`${(value / 100) * c} ${c}`}
        />
      </svg>
      <span className="absolute text-[12px] font-semibold tabular-nums" style={{ color: tone }}>
        {value}
      </span>
    </div>
  )
}

export function SectionHead({
  icon,
  title,
  hint,
  right,
}: {
  icon?: IconName
  title: string
  hint?: string
  right?: ReactNode
}) {
  return (
    <div className="flex items-end justify-between gap-3">
      <div className="flex items-center gap-2">
        {icon && (
          <span className="grid h-6 w-6 place-items-center rounded-lg bg-white/[0.05] text-sand-300">
            <Icon name={icon} size={13} />
          </span>
        )}
        <h2 className="text-[13.5px] font-semibold tracking-wide text-sand-50">{title}</h2>
        {hint && <span className="text-[11px] text-[var(--text-3)]">{hint}</span>}
      </div>
      {right}
    </div>
  )
}

export function Tabs<T extends string>({
  items,
  value,
  onChange,
  size = 'md',
}: {
  items: { key: T; label: string; count?: number }[]
  value: T
  onChange: (v: T) => void
  size?: 'sm' | 'md'
}) {
  return (
    <div className="inline-flex items-center gap-0.5 rounded-xl border border-white/[0.07] bg-white/[0.02] p-0.5">
      {items.map((it) => {
        const active = it.key === value
        return (
          <button
            key={it.key}
            onClick={() => onChange(it.key)}
            className={`rounded-[9px] transition-all ${
              size === 'sm' ? 'px-2.5 py-1 text-[11.5px]' : 'px-3 py-1.5 text-[12.5px]'
            } ${active ? 'bg-white/[0.09] text-white shadow-sm' : 'text-[var(--text-2)] hover:text-sand-100'}`}
          >
            {it.label}
            {typeof it.count === 'number' && (
              <span className={`ml-1.5 tabular-nums ${active ? 'text-amber-300' : 'text-[var(--text-3)]'}`}>{it.count}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}

export function PlatformTag({ name }: { name: string }) {
  const tone: Record<string, string> = {
    小红书: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    抖音: 'text-sand-100 bg-white/[0.06] border-white/10',
    公众号: 'text-mint-400 bg-mint-500/10 border-mint-500/20',
    Instagram: 'text-amber-300 bg-amber-500/10 border-amber-500/20',
    B站: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
    微博: 'text-amber-400 bg-amber-500/[0.08] border-amber-500/20',
    知乎: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
    YouTube: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    多平台: 'text-sand-200 bg-white/[0.06] border-white/10',
    排期: 'text-sand-200 bg-white/[0.06] border-white/10',
  }
  const cls = tone[name] ?? 'text-sand-200 bg-white/[0.06] border-white/10'
  return <span className={`inline-flex items-center rounded-md border px-1.5 py-[3px] text-[10.5px] font-medium ${cls}`}>{name}</span>
}

export function Avatar({ name, size = 26 }: { name: string; size?: number }) {
  const seed = name.charCodeAt(0) + name.length
  const grads = [
    'linear-gradient(135deg,#E8A15F,#B85F22)',
    'linear-gradient(135deg,#6BA6F5,#3E5FA8)',
    'linear-gradient(135deg,#5FCFA0,#2E8B69)',
    'linear-gradient(135deg,#F0718D,#A83E58)',
  ]
  return (
    <span
      className="grid shrink-0 place-items-center rounded-full font-semibold text-[#1a1207]"
      style={{ width: size, height: size, background: grads[seed % grads.length], fontSize: size * 0.42 }}
    >
      {name.slice(0, 1).toUpperCase()}
    </span>
  )
}
