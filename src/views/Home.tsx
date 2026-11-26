import { Icon } from '../components/Icon'
import { Avatar, Ring, SectionHead, Sparkline, StatusDot } from '../components/ui'
import { dailyBrief, scheduleEvents, sessions, stats, tools, type SessionCard } from '../data'

const colMeta: { key: SessionCard['column']; label: string; tone: 'amber' | 'mint' | 'sky'; hint: string }[] = [
  { key: 'waiting', label: '等你处理', tone: 'amber', hint: 'AI 停下来等你拍板' },
  { key: 'review', label: '待查看', tone: 'mint', hint: '做完等你验收' },
  { key: 'running', label: '进行中', tone: 'sky', hint: '后台还在跑' },
]

const toneHex = { amber: '#D9822B', mint: '#3BB183', sky: '#4A8CE8', rose: '#DB5A78' }

const toolAccent: Record<string, string> = {
  amber: 'from-amber-500/20 to-amber-600/[0.04] text-amber-300',
  sky: 'from-sky-500/20 to-sky-600/[0.04] text-sky-400',
  mint: 'from-mint-500/20 to-mint-600/[0.04] text-mint-400',
  rose: 'from-rose-500/20 to-rose-600/[0.04] text-rose-400',
}

const today = 26

export function Home({
  onOpenSession,
  onNavigate,
}: {
  onOpenSession: (id: string) => void
  onNavigate: (v: 'hot' | 'schedule' | 'drafts' | 'media') => void
}) {
  const week = [
    { day: 23, wd: '一' },
    { day: 24, wd: '二' },
    { day: 25, wd: '三' },
    { day: 26, wd: '四' },
    { day: 27, wd: '五' },
    { day: 28, wd: '六' },
    { day: 29, wd: '日' },
  ]

  return (
    <div className="mx-auto flex max-w-[1360px] flex-col gap-5 px-6 pb-10 pt-5">
      {/* 概览 */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-[11px] text-[var(--text-3)]">
            <StatusDot tone="mint" />
            {dailyBrief.date}
            <span className="text-white/15">/</span>
            距 12 月 1 日还有 5 天
          </div>
          <h2 className="mt-1.5 text-[21px] font-semibold tracking-tight text-sand-50">
            早上好，今天有 <span className="text-amber-400">2 个决定</span> 等你
          </h2>
        </div>
        <div className="hidden items-center gap-1.5 lg:flex">
          {['今天', '本周', '本月'].map((t, i) => (
            <button
              key={t}
              className={`rounded-lg px-2.5 py-1.5 text-[12px] transition-colors ${
                i === 0 ? 'bg-white/[0.08] text-sand-50' : 'text-[var(--text-3)] hover:text-sand-100'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* 指标 */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {stats.map((s, i) => (
          <div key={s.label} className="card hoverable animate-rise px-3.5 py-3" style={{ animationDelay: `${i * 40}ms` }}>
            <div className="flex items-start justify-between">
              <span className="text-[11.5px] text-[var(--text-2)]">{s.label}</span>
              <Sparkline data={s.trend} tone={i === 2 ? toneHex.rose : toneHex.amber} />
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-[24px] font-semibold leading-none tabular-nums text-sand-50">{s.value}</span>
              <span className="text-[11px] text-[var(--text-3)]">{s.unit}</span>
            </div>
            <div className="mt-1.5 truncate text-[10.5px] text-[var(--text-3)]">{s.delta}</div>
          </div>
        ))}
      </div>

      {/* 会话看板 */}
      <div className="card p-4">
        <SectionHead
          icon="panel"
          title="会话看板"
          hint="AI 在后台干活，你只看三栏"
          right={
            <button
              onClick={() => onNavigate('drafts')}
              className="flex items-center gap-1 text-[11.5px] text-[var(--text-2)] hover:text-amber-300"
            >
              全部会话 <Icon name="chevronRight" size={12} />
            </button>
          }
        />
        <div className="mt-3.5 grid gap-3 lg:grid-cols-3">
          {colMeta.map((col) => {
            const list = sessions.filter((s) => s.column === col.key)
            return (
              <div key={col.key} className="rounded-xl border border-white/[0.05] bg-black/20 p-2">
                <div className="mb-2 flex items-center gap-2 px-1.5 pt-1">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: toneHex[col.tone] }} />
                  <span className="text-[12px] font-medium text-sand-100">{col.label}</span>
                  <span className="rounded-full bg-white/[0.07] px-1.5 text-[10px] tabular-nums text-[var(--text-2)]">
                    {list.length}
                  </span>
                  <span className="ml-auto hidden text-[10px] text-[var(--text-3)] xl:block">{col.hint}</span>
                </div>
                <div className="flex flex-col gap-2">
                  {list.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => onOpenSession(s.id)}
                      className="group relative w-full rounded-lg border border-white/[0.06] bg-[var(--surface-2)] p-2.5 text-left transition-all hover:border-amber-500/30 hover:bg-[var(--surface-3)]"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="rounded-md border border-white/10 bg-white/[0.05] px-1.5 py-[2px] text-[9.5px] text-[var(--text-2)]">
                          {s.platform}
                        </span>
                        <span className="truncate text-[10.5px] text-[var(--text-3)]">{s.account}</span>
                        <span className="ml-auto shrink-0 text-[9.5px] text-[var(--text-3)]">{s.updated}</span>
                      </div>
                      <div className="mt-1.5 line-clamp-2 text-[12.5px] font-medium leading-snug text-sand-50">{s.title}</div>
                      <div className="mt-1 line-clamp-1 text-[10.5px] text-[var(--text-3)]">{s.brief}</div>
                      {s.ask && col.key === 'waiting' && (
                        <div className="mt-2 flex items-start gap-1.5 rounded-md border border-amber-500/20 bg-amber-500/[0.07] px-2 py-1.5">
                          <Icon name="chat" size={11} className="mt-[1px] shrink-0 text-amber-400" />
                          <span className="line-clamp-2 text-[10.5px] leading-relaxed text-amber-200/90">{s.ask}</span>
                        </div>
                      )}
                      {col.key === 'running' && (
                        <div className="mt-2 h-[3px] overflow-hidden rounded-full bg-white/[0.07]">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-sky-500/60 to-sky-400"
                            style={{ width: s.updated.includes('62') ? '62%' : '34%' }}
                          />
                        </div>
                      )}
                      <Icon
                        name="chevronRight"
                        size={13}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-transparent transition-colors group-hover:text-amber-400"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 排期 + 日报 + 工具 */}
      <div className="grid gap-3 xl:grid-cols-[1.35fr_1fr]">
        <div className="card p-4">
          <SectionHead
            icon="calendar"
            title="本周内容排期"
            hint="11 月第 4 周"
            right={
              <button
                onClick={() => onNavigate('schedule')}
                className="flex items-center gap-1 text-[11.5px] text-[var(--text-2)] hover:text-amber-300"
              >
                月视图 <Icon name="chevronRight" size={12} />
              </button>
            }
          />
          <div className="mt-3 grid grid-cols-7 gap-1.5">
            {week.map((d) => {
              const evs = scheduleEvents.filter((e) => e.day === d.day)
              const isToday = d.day === today
              return (
                <div
                  key={d.day}
                  className={`flex min-h-[92px] flex-col rounded-lg border p-1.5 transition-colors ${
                    isToday ? 'border-amber-500/35 bg-amber-500/[0.07]' : 'border-white/[0.05] bg-white/[0.015]'
                  }`}
                >
                  <div className="flex items-baseline justify-between">
                    <span className={`text-[10px] ${isToday ? 'text-amber-300' : 'text-[var(--text-3)]'}`}>{d.wd}</span>
                    <span className={`text-[12px] tabular-nums ${isToday ? 'font-semibold text-amber-200' : 'text-[var(--text-2)]'}`}>
                      {d.day}
                    </span>
                  </div>
                  <div className="mt-1.5 flex flex-col gap-1">
                    {evs.length === 0 && <span className="text-[9.5px] text-white/15">—</span>}
                    {evs.map((e) => (
                      <span
                        key={e.id}
                        title={`${e.time} · ${e.platform} · ${e.title}`}
                        className={`rounded border px-1 py-[2px] ${
                          e.status === 'overdue'
                            ? 'border-rose-500/25 bg-rose-500/10 text-rose-400'
                            : e.status === 'draft'
                              ? 'border-white/10 bg-white/[0.05] text-[var(--text-2)]'
                              : e.status === 'scheduled'
                                ? 'border-sky-500/25 bg-sky-500/10 text-sky-400'
                                : 'border-mint-500/20 bg-mint-500/[0.08] text-mint-400'
                        }`}
                      >
                        <span className="block font-mono text-[8px] opacity-70">{e.time}</span>
                        <span className="block truncate text-[9px] leading-[12px]">{e.title}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
          <div className="mt-3 flex items-center gap-3 border-t border-white/[0.06] pt-2.5 text-[10px] text-[var(--text-3)]">
            {[
              ['已发', '#3BB183'],
              ['已排期', '#4A8CE8'],
              ['初稿', '#8b8880'],
              ['逾期', '#DB5A78'],
            ].map(([label, c]) => (
              <span key={label} className="flex items-center gap-1">
                <i className="h-1.5 w-1.5 rounded-sm" style={{ background: c }} />
                {label}
              </span>
            ))}
            <span className="ml-auto text-rose-400">2 条逾期未发</span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="card relative overflow-hidden p-4">
            <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-amber-500/10 blur-2xl" />
            <SectionHead icon="sparkles" title="今日运营日报" hint="09:00 自动生成" />
            <p className="mt-2.5 text-[11px] font-medium text-amber-300/90">{dailyBrief.headline}</p>
            <div className="mt-2 flex flex-col gap-2">
              {dailyBrief.items.map((it) => (
                <div key={it.text} className="group rounded-lg border border-white/[0.05] bg-white/[0.02] p-2">
                  <p className="text-[11.5px] leading-relaxed text-sand-100/90">{it.text}</p>
                  <button
                    onClick={() => onNavigate('hot')}
                    className="mt-1.5 flex items-center gap-1 text-[10.5px] text-amber-400 hover:text-amber-300"
                  >
                    {it.action} <Icon name="arrowUpRight" size={11} />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-2.5 space-y-1 border-t border-white/[0.06] pt-2.5">
              {dailyBrief.plan.map((p) => (
                <div key={p} className="flex items-start gap-1.5 text-[10.5px] text-[var(--text-2)]">
                  <Icon name="clock" size={11} className="mt-[2px] shrink-0 text-[var(--text-3)]" />
                  <span>{p}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-4">
            <SectionHead
              icon="grid"
              title="小工具"
              right={<span className="text-[10px] text-[var(--text-3)]">6 个</span>}
            />
            <div className="mt-2.5 grid grid-cols-3 gap-2">
              {tools.map((t) => (
                <button
                  key={t.id}
                  className="group flex flex-col items-start gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] p-2 text-left transition-all hover:border-white/[0.13] hover:bg-white/[0.05]"
                >
                  <span className={`grid h-6 w-6 place-items-center rounded-md bg-gradient-to-br ${toolAccent[t.accent]}`}>
                    <Icon
                      name={
                        t.id === 't1' ? 'image' : t.id === 't2' ? 'sparkles' : t.id === 't3' ? 'video' : t.id === 't4' ? 'layers' : t.id === 't5' ? 'flame' : 'wand'
                      }
                      size={12}
                    />
                  </span>
                  <span className="text-[11px] font-medium text-sand-100">{t.name}</span>
                  <span className="text-[9.5px] text-[var(--text-3)]">{t.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 账号记忆 */}
      <div className="card flex flex-wrap items-center gap-4 p-3.5">
        <div className="flex items-center gap-2">
          <Ring value={86} size={38} />
          <div>
            <div className="text-[12px] font-medium text-sand-50">账号记忆完整度</div>
            <div className="text-[10px] text-[var(--text-3)]">定位、文风、已发内容已建立长期记忆</div>
          </div>
        </div>
        <div className="hairline hidden h-8 w-px flex-none bg-white/10 lg:block" />
        <div className="flex flex-wrap items-center gap-2">
          {[
            { n: 'MZ 主号', p: '小红书', f: '3.2w' },
            { n: 'MZ 副号', p: '抖音', f: '1.8w' },
            { n: '出海号', p: 'Instagram', f: '0.7w' },
          ].map((a) => (
            <div
              key={a.n}
              className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2 py-1.5"
            >
              <Avatar name={a.n} size={20} />
              <span className="text-[11px] text-sand-100">{a.n}</span>
              <span className="text-[9.5px] text-[var(--text-3)]">{a.p}</span>
              <span className="text-[10px] tabular-nums text-[var(--text-2)]">{a.f} 粉</span>
            </div>
          ))}
        </div>
        <button className="btn-ghost ml-auto" onClick={() => onNavigate('media')}>
          管理记忆
          <Icon name="chevronRight" size={12} />
        </button>
      </div>
    </div>
  )
}
