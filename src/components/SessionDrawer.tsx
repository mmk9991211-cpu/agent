import { useState } from 'react'
import { Icon } from './Icon'
import { Avatar, PlatformTag, StatusDot } from './ui'
import type { SessionCard } from '../data'

export function SessionDrawer({ session, onClose }: { session: SessionCard; onClose: () => void }) {
  const [openSteps, setOpenSteps] = useState<number | null>(0)
  const [reply, setReply] = useState('')

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/50 backdrop-blur-[2px] animate-fade" onClick={onClose}>
      <div
        className="flex h-full w-full max-w-[480px] flex-col border-l border-white/[0.08] bg-[var(--surface-1)] shadow-soft animate-slidein"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-2 border-b border-white/[0.06] px-4 py-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <PlatformTag name={session.platform} />
              <span className="text-[10px] text-[var(--text-3)]">{session.account}</span>
              <span className="flex items-center gap-1 text-[10px] text-mint-400">
                <StatusDot tone="mint" /> 进行中
              </span>
            </div>
            <h3 className="mt-1.5 truncate text-[14px] font-semibold text-sand-50">{session.title}</h3>
            <p className="mt-0.5 truncate text-[10.5px] text-[var(--text-3)]">{session.brief}</p>
          </div>
          <button onClick={onClose} className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-[var(--text-3)] hover:bg-white/[0.07] hover:text-sand-50">
            <Icon name="x" size={14} />
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4 scroll-thin">
          {session.messages.map((m, i) =>
            m.role === 'user' ? (
              <div key={i} className="flex justify-end gap-2">
                <div className="max-w-[86%] rounded-2xl rounded-br-md border border-amber-500/20 bg-amber-500/[0.1] px-3 py-2 text-[12px] leading-relaxed text-sand-50">
                  {m.text}
                </div>
                <Avatar name="MZ" size={22} />
              </div>
            ) : (
              <div key={i} className="flex gap-2">
                <span className="mt-0.5 grid h-[22px] w-[22px] shrink-0 place-items-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-[#1a1207]">
                  <Icon name="sparkles" size={11} />
                </span>
                <div className="min-w-0 flex-1">
                  {m.steps && (
                    <div className="mb-1.5 overflow-hidden rounded-lg border border-white/[0.06] bg-white/[0.02]">
                      <button
                        onClick={() => setOpenSteps(openSteps === i ? null : i)}
                        className="flex w-full items-center gap-1.5 px-2.5 py-1.5 text-left text-[10.5px] text-[var(--text-2)] hover:text-sand-100"
                      >
                        <Icon name={openSteps === i ? 'chevronDown' : 'chevronRight'} size={11} />
                        执行了 {m.steps.length} 步
                        <span className="ml-auto text-[9.5px] text-[var(--text-3)]">折叠</span>
                      </button>
                      {openSteps === i && (
                        <div className="animate-fade border-t border-white/[0.05] px-2.5 py-1.5">
                          {m.steps.map((s, k) => (
                            <div key={k} className="flex items-center gap-1.5 py-[3px] text-[10.5px] text-[var(--text-2)]">
                              <Icon name="check" size={9} className="text-mint-400" />
                              {s}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  <div className="rounded-2xl rounded-bl-md border border-white/[0.07] bg-white/[0.035] px-3 py-2 text-[12px] leading-relaxed text-sand-100/90">
                    {m.text}
                  </div>
                </div>
              </div>
            ),
          )}

          {session.ask && (
            <div className="rounded-xl border border-amber-500/25 bg-amber-500/[0.06] p-3">
              <div className="flex items-center gap-1.5 text-[10px] font-medium text-amber-300">
                <Icon name="chat" size={11} /> AI 在等你决定
              </div>
              <p className="mt-1.5 text-[12px] leading-relaxed text-sand-50">{session.ask}</p>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                <button className="btn-primary px-2.5 py-1 text-[11px]">1 · 成分科普优先</button>
                <button className="btn-ghost px-2.5 py-1 text-[11px]">2 · 使用场景优先</button>
                <button className="btn-ghost px-2.5 py-1 text-[11px]">跳过，按推荐来</button>
              </div>
            </div>
          )}

          {session.column === 'review' && (
            <div className="rounded-xl border border-mint-500/20 bg-mint-500/[0.06] p-3">
              <div className="flex items-center gap-1.5 text-[10px] font-medium text-mint-400">
                <Icon name="check" size={11} /> 结果已就绪，等你验收
              </div>
              <div className="mt-2 flex gap-1.5">
                <button className="btn-primary px-2.5 py-1 text-[11px]">通过并排期</button>
                <button className="btn-ghost px-2.5 py-1 text-[11px]">要改一版</button>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-white/[0.06] p-3">
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-2 focus-within:border-amber-500/30">
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              rows={2}
              placeholder="继续对话，或直接说下一步…"
              className="w-full resize-none bg-transparent text-[12px] leading-relaxed text-sand-50 outline-none placeholder:text-[var(--text-3)]"
            />
            <div className="flex items-center gap-1.5">
              <button className="grid h-6 w-6 place-items-center rounded-md text-[var(--text-3)] hover:bg-white/[0.06] hover:text-sand-100">
                <Icon name="image" size={12} />
              </button>
              <button className="grid h-6 w-6 place-items-center rounded-md text-[var(--text-3)] hover:bg-white/[0.06] hover:text-sand-100">
                <Icon name="link" size={12} />
              </button>
              <span className="ml-auto text-[9.5px] text-[var(--text-3)]">⌘↵ 发送</span>
              <button
                className={`grid h-7 w-7 place-items-center rounded-lg transition-colors ${
                  reply.trim() ? 'bg-amber-500 text-[#1a1207]' : 'bg-white/[0.07] text-[var(--text-3)]'
                }`}
              >
                <Icon name="send" size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
