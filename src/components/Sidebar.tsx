import { Icon, Logo, type IconName } from './Icon'
import { Avatar, StatusDot } from './ui'

export type ViewKey =
  | 'home'
  | 'chat'
  | 'schedule'
  | 'hot'
  | 'drafts'
  | 'media'
  | 'knowledge'
  | 'automation'
  | 'settings'

const groups: { label: string; items: { key: ViewKey; label: string; icon: IconName; badge?: string }[] }[] = [
  {
    label: '工作台',
    items: [
      { key: 'home', label: '主页', icon: 'home' },
      { key: 'chat', label: '对话', icon: 'chat', badge: '2' },
      { key: 'schedule', label: '内容排期', icon: 'calendar' },
    ],
  },
  {
    label: '创作',
    items: [
      { key: 'hot', label: '热点雷达', icon: 'flame', badge: '6' },
      { key: 'drafts', label: '稿件', icon: 'doc' },
      { key: 'media', label: '素材库', icon: 'layers' },
      { key: 'knowledge', label: '知识库', icon: 'book' },
    ],
  },
  {
    label: '系统',
    items: [
      { key: 'automation', label: '自动化', icon: 'zap' },
      { key: 'settings', label: '设置', icon: 'settings' },
    ],
  },
]

export function Sidebar({
  active,
  onNavigate,
}: {
  active: ViewKey
  onNavigate: (v: ViewKey) => void
}) {
  return (
    <aside className="flex h-full w-[232px] shrink-0 flex-col border-r border-white/[0.06] bg-[#0d0e12]/80 backdrop-blur">
      <div className="flex items-center gap-2.5 px-4 pb-3 pt-4">
        <Logo size={30} />
        <div className="leading-none">
          <div className="text-[15px] font-semibold tracking-[0.16em] text-sand-50">MZ</div>
          <div className="mt-1 text-[9.5px] uppercase tracking-[0.18em] text-[var(--text-3)]">Workbench</div>
        </div>
        <span className="ml-auto rounded-md border border-amber-500/25 bg-amber-500/10 px-1.5 py-0.5 text-[9.5px] font-medium text-amber-300">
          v0.1
        </span>
      </div>

      <button className="mx-3 mb-3 flex items-center gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.03] px-2.5 py-2 text-left hover:border-white/[0.12] hover:bg-white/[0.05]">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-sand-200 to-sand-400 text-[11px] font-bold text-[#1a1207]">
          MZ
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[12.5px] font-medium text-sand-50">MZ 工作台</span>
          <span className="block truncate text-[10.5px] text-[var(--text-3)]">个人空间 · 3 个账号</span>
        </span>
        <Icon name="chevronDown" size={13} className="text-[var(--text-3)]" />
      </button>

      <nav className="flex-1 overflow-y-auto px-3 pb-2 scroll-thin">
        {groups.map((g) => (
          <div key={g.label} className="mb-4">
            <div className="sec-title mb-1.5 px-3">{g.label}</div>
            <div className="flex flex-col gap-0.5 pl-[9px]">
              {g.items.map((it) => (
                <button
                  key={it.key}
                  className="rail-item"
                  data-active={active === it.key}
                  onClick={() => onNavigate(it.key)}
                >
                  <Icon name={it.icon} size={15} className="shrink-0 opacity-90" />
                  <span className="flex-1 text-left">{it.label}</span>
                  {it.badge && (
                    <span className="rounded-full bg-amber-500/15 px-1.5 py-[1px] text-[9.5px] font-semibold tabular-nums text-amber-300">
                      {it.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="mx-3 mb-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5">
        <div className="flex items-center justify-between text-[10.5px]">
          <span className="text-[var(--text-2)]">本月 AI 用量</span>
          <span className="font-mono text-[10px] text-sand-200">6,240 / 10,000</span>
        </div>
        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/[0.07]">
          <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-600" style={{ width: '62%' }} />
        </div>
      </div>

      <div className="flex items-center gap-2 border-t border-white/[0.06] px-3 py-2.5">
        <Avatar name="MZ" size={26} />
        <div className="min-w-0 flex-1 leading-tight">
          <div className="truncate text-[12px] text-sand-50">MZ 主理人</div>
          <div className="flex items-center gap-1 text-[10px] text-[var(--text-3)]">
            <StatusDot tone="mint" /> 本地优先 · 已同步
          </div>
        </div>
        <button className="grid h-6 w-6 place-items-center rounded-lg text-[var(--text-3)] hover:bg-white/[0.06] hover:text-sand-100">
          <Icon name="more" size={14} />
        </button>
      </div>
    </aside>
  )
}
