import { Icon } from './Icon'

export function TopBar({
  title,
  subtitle,
  onNewChat,
  rightSlot,
}: {
  title: string
  subtitle: string
  onNewChat?: () => void
  rightSlot?: React.ReactNode
}) {
  return (
    <header className="flex h-[62px] shrink-0 items-center gap-4 border-b border-white/[0.06] px-6">
      <div className="min-w-0">
        <div className="flex items-baseline gap-2.5">
          <h1 className="truncate text-[16px] font-semibold tracking-tight text-sand-50">{title}</h1>
          <span className="hidden shrink-0 text-[11px] text-[var(--text-3)] xl:block">{subtitle}</span>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <div className="group hidden items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.02] px-2.5 py-1.5 transition-colors focus-within:border-amber-500/30 hover:border-white/[0.12] md:flex">
          <Icon name="search" size={13} className="text-[var(--text-3)]" />
          <input
            placeholder="搜索稿件、素材、对话…"
            className="w-[190px] bg-transparent text-[12px] text-sand-50 outline-none placeholder:text-[var(--text-3)]"
          />
          <span className="mono-tag">⌘K</span>
        </div>
        {rightSlot}
        <button className="relative grid h-8 w-8 place-items-center rounded-xl border border-white/[0.07] text-[var(--text-2)] hover:border-white/[0.12] hover:text-sand-50">
          <Icon name="bell" size={14} />
          <span className="absolute right-1.5 top-1.5 h-1 w-1 rounded-full bg-amber-400" />
        </button>
        {onNewChat && (
          <button onClick={onNewChat} className="btn-primary">
            <Icon name="plus" size={14} strokeWidth={2} />
            新建对话
          </button>
        )}
      </div>
    </header>
  )
}
