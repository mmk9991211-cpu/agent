import { useState } from 'react'
import { Icon } from '../components/Icon'
import { PlatformTag, Ring, SectionHead, StatusDot, Tabs } from '../components/ui'
import { boards, hotItems } from '../data'

export function Hot({ onCreate }: { onCreate: (topic: string) => void }) {
  const [platform, setPlatform] = useState<keyof typeof boards>('小红书')
  const [selected, setSelected] = useState(hotItems[0].id)
  const [saved, setSaved] = useState<string[]>([])

  const platforms = Object.keys(boards) as (keyof typeof boards)[]

  return (
    <div className="mx-auto grid max-w-[1360px] gap-4 px-6 pb-10 pt-5 xl:grid-cols-[1.45fr_1fr]">
      <div className="flex flex-col gap-3">
        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2 text-[11px] text-[var(--text-3)]">
              <StatusDot tone="amber" /> 每 30 分钟刷新 · 按 MZ 主号方向打分
            </div>
            <h2 className="mt-1 text-[19px] font-semibold tracking-tight text-sand-50">适合我的账号</h2>
          </div>
          <button className="btn-ghost">
            <Icon name="refresh" size={12} />
            重新评分
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {hotItems.map((h, i) => {
            const active = h.id === selected
            return (
              <button
                key={h.id}
                onClick={() => setSelected(h.id)}
                className={`group animate-rise rounded-2xl border p-3.5 text-left transition-all ${
                  active
                    ? 'border-amber-500/35 bg-amber-500/[0.055] shadow-glow'
                    : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.13] hover:bg-white/[0.04]'
                }`}
                style={{ animationDelay: `${i * 35}ms` }}
              >
                <div className="flex items-start gap-3">
                  <Ring value={h.score} size={46} tone={h.score >= 90 ? '#D9822B' : h.score >= 80 ? '#C9A15E' : '#8b8880'} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[9.5px] tabular-nums text-[var(--text-3)]">#{i + 1}</span>
                      <span className="truncate text-[13.5px] font-medium text-sand-50">{h.title}</span>
                      <span className="ml-auto flex shrink-0 items-center gap-0.5 text-[10.5px] font-medium text-mint-400">
                        <Icon name="arrowUpRight" size={11} /> {h.growth}%
                      </span>
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      {h.tags.map((t) => (
                        <span key={t} className="chip py-[2px] text-[10px]">
                          {t}
                        </span>
                      ))}
                      <span className="ml-auto flex items-center gap-1">
                        {h.platforms.map((p) => (
                          <span key={p.name} className="flex items-center gap-1 rounded-md bg-white/[0.05] px-1.5 py-[2px] text-[9.5px] text-[var(--text-2)]">
                            {p.name}
                            <b className="font-semibold tabular-nums text-sand-200">{p.rank}</b>
                          </span>
                        ))}
                      </span>
                    </div>
                    {active && (
                      <div className="mt-2.5 animate-fade rounded-lg border border-amber-500/20 bg-black/25 px-2.5 py-2">
                        <div className="flex items-start gap-1.5">
                          <Icon name="wand" size={11} className="mt-[2px] shrink-0 text-amber-400" />
                          <p className="text-[11px] leading-relaxed text-sand-100/85">{h.angle}</p>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onCreate(h.title)
                            }}
                            className="btn-primary px-2.5 py-1 text-[11px]"
                          >
                            <Icon name="sparkles" size={11} /> 去创作
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setSaved((s) => (s.includes(h.id) ? s.filter((x) => x !== h.id) : [...s, h.id]))
                            }}
                            className="btn-ghost px-2.5 py-1 text-[11px]"
                          >
                            <Icon name={saved.includes(h.id) ? 'check' : 'plus'} size={11} />
                            {saved.includes(h.id) ? '已存选题池' : '存进选题池'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="card p-4">
          <SectionHead icon="flame" title="平台热榜" hint="右侧并排对照" />
          <div className="mt-3">
            <Tabs items={platforms.map((p) => ({ key: p, label: p }))} value={platform} onChange={(v) => setPlatform(v)} size="sm" />
          </div>
          <div className="mt-3 flex flex-col">
            {boards[platform].map((b) => {
              const matched = hotItems.some((h) => h.title === b.title)
              return (
                <div
                  key={b.rank}
                  className="group flex items-center gap-2.5 rounded-lg px-1.5 py-[7px] transition-colors hover:bg-white/[0.04]"
                >
                  <span
                    className={`w-4 shrink-0 text-center text-[11px] font-semibold tabular-nums ${
                      b.rank <= 3 ? 'text-amber-400' : 'text-[var(--text-3)]'
                    }`}
                  >
                    {b.rank}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[12px] text-sand-100/90">{b.title}</span>
                  {matched && (
                    <span className="shrink-0 rounded border border-amber-500/25 bg-amber-500/10 px-1 py-[1px] text-[9px] text-amber-300">
                      匹配
                    </span>
                  )}
                  <span className="shrink-0 text-[10px] tabular-nums text-[var(--text-3)]">{b.heat}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="card p-4">
          <SectionHead icon="book" title="选题池" hint={`${saved.length} 条待写`} />
          <div className="mt-2.5 flex flex-col gap-1.5">
            {saved.length === 0 && (
              <div className="rounded-lg border border-dashed border-white/10 px-3 py-5 text-center text-[11px] text-[var(--text-3)]">
                还没有收藏的选题，左侧点「存进选题池」
              </div>
            )}
            {saved.map((id) => {
              const h = hotItems.find((x) => x.id === id)!
              return (
                <div key={id} className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-2">
                  <Icon name="pin" size={11} className="shrink-0 text-amber-400" />
                  <span className="min-w-0 flex-1 truncate text-[11.5px] text-sand-100">{h.title}</span>
                  <button onClick={() => onCreate(h.title)} className="text-[10.5px] text-amber-400 hover:text-amber-300">
                    去写
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        <div className="card p-4">
          <SectionHead icon="chart" title="今日来源分布" />
          <div className="mt-3 space-y-2">
            {[
              { n: '小红书', v: 42, c: '#DB5A78' },
              { n: '抖音', v: 31, c: '#C0A16B' },
              { n: 'B 站', v: 14, c: '#4A8CE8' },
              { n: '微博 / 知乎', v: 13, c: '#8b8880' },
            ].map((r) => (
              <div key={r.n} className="flex items-center gap-2">
                <span className="w-16 shrink-0 text-[10.5px] text-[var(--text-2)]">{r.n}</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                  <div className="h-full rounded-full" style={{ width: `${r.v}%`, background: r.c }} />
                </div>
                <span className="w-7 shrink-0 text-right text-[10px] tabular-nums text-[var(--text-3)]">{r.v}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function PlatformBadge({ name }: { name: string }) {
  return <PlatformTag name={name} />
}
