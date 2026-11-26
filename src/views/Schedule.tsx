import { useMemo, useState } from 'react'
import { Icon } from '../components/Icon'
import { PlatformTag, SectionHead, StatusDot, Tabs } from '../components/ui'
import { scheduleEvents } from '../data'

const statusMeta: Record<string, { label: string; cls: string; dot: string }> = {
  published: { label: '已发布', cls: 'border-mint-500/25 bg-mint-500/[0.09] text-mint-400', dot: '#3BB183' },
  scheduled: { label: '已排期', cls: 'border-sky-500/25 bg-sky-500/[0.09] text-sky-400', dot: '#4A8CE8' },
  draft: { label: '初稿', cls: 'border-white/12 bg-white/[0.05] text-[var(--text-2)]', dot: '#8b8880' },
  overdue: { label: '逾期', cls: 'border-rose-500/30 bg-rose-500/[0.1] text-rose-400', dot: '#DB5A78' },
}

const weekdays = ['日', '一', '二', '三', '四', '五', '六']

export function Schedule({ onCreate }: { onCreate: (t: string) => void }) {
  const [selectedDay, setSelectedDay] = useState(26)
  const [view, setView] = useState<'month' | 'week'>('month')

  const days = useMemo(() => Array.from({ length: 30 }, (_, i) => i + 1), [])
  const dayEvents = scheduleEvents.filter((e) => e.day === selectedDay)

  const counts = {
    published: scheduleEvents.filter((e) => e.status === 'published').length,
    scheduled: scheduleEvents.filter((e) => e.status === 'scheduled').length,
    draft: scheduleEvents.filter((e) => e.status === 'draft').length,
    overdue: scheduleEvents.filter((e) => e.status === 'overdue').length,
  }

  return (
    <div className="mx-auto grid max-w-[1360px] gap-4 px-6 pb-10 pt-5 xl:grid-cols-[1.7fr_1fr]">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 text-[11px] text-[var(--text-3)]">
              <StatusDot tone="rose" /> 11 月共排 18 条 · 2 条逾期
            </div>
            <h2 className="mt-1 flex items-baseline gap-2 text-[19px] font-semibold tracking-tight text-sand-50">
              2026 年 11 月
              <span className="text-[11px] font-normal text-[var(--text-3)]">第 4 周</span>
            </h2>
          </div>
          <div className="flex items-center gap-1.5">
            <Tabs
              items={[
                { key: 'month', label: '月' },
                { key: 'week', label: '周' },
              ]}
              value={view}
              onChange={(v) => setView(v as typeof view)}
              size="sm"
            />
            <button className="grid h-7 w-7 place-items-center rounded-lg border border-white/[0.08] text-[var(--text-2)] hover:text-sand-50">
              <Icon name="chevronLeft" size={13} />
            </button>
            <button className="grid h-7 w-7 place-items-center rounded-lg border border-white/[0.08] text-[var(--text-2)] hover:text-sand-50">
              <Icon name="chevronRight" size={13} />
            </button>
            <button className="btn-primary px-2.5 py-1.5 text-[11.5px]">
              <Icon name="plus" size={12} strokeWidth={2} /> 排一条
            </button>
          </div>
        </div>

        <div className="card overflow-hidden p-0">
          <div className="grid grid-cols-7 border-b border-white/[0.06]">
            {weekdays.map((w) => (
              <div key={w} className="px-2 py-2 text-center text-[10.5px] text-[var(--text-3)]">
                {w}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {days.map((d) => {
              const evs = scheduleEvents.filter((e) => e.day === d)
              const isToday = d === 26
              const isSel = d === selectedDay
              const hasOverdue = evs.some((e) => e.status === 'overdue')
              return (
                <button
                  key={d}
                  onClick={() => setSelectedDay(d)}
                  className={`relative flex min-h-[86px] flex-col gap-1 border-b border-r border-white/[0.05] p-1.5 text-left transition-colors ${
                    isSel ? 'bg-amber-500/[0.07]' : 'hover:bg-white/[0.03]'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <span
                      className={`grid h-[19px] min-w-[19px] place-items-center rounded-md px-1 text-[11px] tabular-nums ${
                        isToday
                          ? 'bg-amber-500 font-semibold text-[#1a1207]'
                          : isSel
                            ? 'text-amber-300'
                            : 'text-[var(--text-2)]'
                      }`}
                    >
                      {d}
                    </span>
                    {hasOverdue && <span className="h-1 w-1 rounded-full bg-rose-500" />}
                    {d === 27 && <span className="ml-auto text-[8.5px] text-[var(--text-3)]">感恩节</span>}
                  </div>
                  <div className="flex flex-col gap-[3px]">
                    {evs.slice(0, 2).map((e) => (
                      <span
                        key={e.id}
                        className={`truncate rounded border px-1 py-[1px] text-[9px] leading-[13px] ${statusMeta[e.status].cls}`}
                      >
                        {e.time} {e.title}
                      </span>
                    ))}
                    {evs.length > 2 && <span className="text-[8.5px] text-[var(--text-3)]">+{evs.length - 2} 条</span>}
                  </div>
                </button>
              )
            })}
            {[1, 2, 3, 4, 5].map((d) => (
              <div
                key={`dec-${d}`}
                className="flex min-h-[86px] flex-col gap-1 border-b border-r border-white/[0.05] p-1.5 opacity-40"
              >
                <span className="grid h-[19px] min-w-[19px] place-items-center rounded-md px-1 text-[11px] tabular-nums text-[var(--text-3)]">
                  {d}
                </span>
                <span className="text-[8.5px] text-[var(--text-3)]">12 月</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {Object.entries(counts).map(([k, v]) => (
            <div key={k} className="card flex items-center gap-2 px-3 py-2">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: statusMeta[k].dot }} />
              <span className="text-[11px] text-[var(--text-2)]">{statusMeta[k].label}</span>
              <span className="ml-auto text-[13px] font-semibold tabular-nums text-sand-50">{v}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="card p-4">
          <SectionHead
            icon="calendar"
            title={`11 月 ${selectedDay} 日`}
            hint={`${dayEvents.length} 条内容`}
            right={<span className="text-[10px] text-[var(--text-3)]">周四</span>}
          />
          <div className="mt-3 flex flex-col gap-2">
            {dayEvents.length === 0 && (
              <div className="rounded-xl border border-dashed border-white/10 px-3 py-6 text-center">
                <p className="text-[11px] text-[var(--text-3)]">这天还没有排期</p>
                <button onClick={() => onCreate('给这一天排一条内容')} className="btn-ghost mt-2.5 px-2.5 py-1 text-[11px]">
                  <Icon name="plus" size={11} /> 排一条
                </button>
              </div>
            )}
            {dayEvents.map((e) => (
              <div key={e.id} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-[10px] text-amber-300">{e.time}</span>
                  <PlatformTag name={e.platform} />
                  <span className={`ml-auto rounded border px-1.5 py-[1px] text-[9px] ${statusMeta[e.status].cls}`}>
                    {statusMeta[e.status].label}
                  </span>
                </div>
                <div className="mt-1.5 text-[12.5px] font-medium text-sand-50">{e.title}</div>
                <div className="mt-2 flex items-center gap-1.5">
                  <button onClick={() => onCreate(e.title)} className="btn-ghost px-2 py-1 text-[10.5px]">
                    <Icon name="wand" size={10} /> 继续写
                  </button>
                  <button className="btn-ghost px-2 py-1 text-[10.5px]">
                    <Icon name="send" size={10} /> 手机领取
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-4">
          <SectionHead icon="clock" title="待处理" hint="逾期与临期" />
          <div className="mt-2.5 flex flex-col gap-1.5">
            {scheduleEvents
              .filter((e) => e.status === 'overdue' || e.status === 'draft')
              .map((e) => (
                <div key={e.id} className="flex items-center gap-2 rounded-lg border border-white/[0.05] bg-white/[0.015] px-2.5 py-2">
                  <span className="text-[10px] tabular-nums text-[var(--text-3)]">11-{String(e.day).padStart(2, '0')}</span>
                  <span className="min-w-0 flex-1 truncate text-[11.5px] text-sand-100">{e.title}</span>
                  <span className={`shrink-0 text-[9.5px] ${e.status === 'overdue' ? 'text-rose-400' : 'text-[var(--text-3)]'}`}>
                    {statusMeta[e.status].label}
                  </span>
                </div>
              ))}
          </div>
        </div>

        <div className="card p-4">
          <SectionHead icon="flame" title="节日与节点" hint="借势提醒" />
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {[
              { d: '11-27', n: '感恩节' },
              { d: '11-28', n: '黑五' },
              { d: '12-01', n: '双十二预热' },
              { d: '12-12', n: '双十二' },
              { d: '12-21', n: '冬至' },
              { d: '12-25', n: '圣诞' },
            ].map((f) => (
              <div key={f.d} className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2 py-1.5">
                <span className="font-mono text-[9.5px] text-amber-400/80">{f.d}</span>
                <span className="text-[10.5px] text-sand-100">{f.n}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
