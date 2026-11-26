import { useState } from 'react'
import { Icon } from '../components/Icon'
import { Avatar, PlatformTag, StatusDot } from '../components/ui'
import { sessions } from '../data'

const tools = ['知识库检索', '读账号记忆', '写稿', '生图', '打包素材包']

export function ChatPage({ topic }: { topic?: string | null }) {
  const [activeId, setActiveId] = useState('s1')
  const [input, setInput] = useState('')
  const [stepsOpen, setStepsOpen] = useState(true)
  const active = sessions.find((s) => s.id === activeId)!

  const thread = topic
    ? [
        { role: 'user' as const, text: `帮我围绕「${topic}」出一篇小红书笔记，风格延续主号。` },
        {
          role: 'ai' as const,
          text: `我已经读过主号最近 12 篇的写法，并检索了知识库里 4 条相关素材。「${topic}」这个方向有一个可以直接用的结构：先给结论，再分类判断，最后给三步做法。`,
          steps: ['检索知识库 · 4 条命中', '读取账号记忆 · 文风与受众', '参考近 12 篇结构', '生成大纲 · 5 节'],
        },
        { role: 'ai' as const, text: '稿子已经写好，含标题、正文和话题标签，封面也一起出了两版。要现在打包成素材包吗？' },
      ]
    : [
        { role: 'user' as const, text: '用知识库里的秋季新品调研，写 3 篇小红书笔记，风格延续主号。' },
        {
          role: 'ai' as const,
          text: '我读了 4 条调研笔记和主号最近 12 篇已发内容，提炼出三个可用切口：成分、场景、对比测评。建议按 4:3:3 的配比写。',
          steps: ['检索知识库 · 4 条命中', '读取账号档案 · 主号文风', '参考近 12 篇已发布结构', '生成 3 个切口'],
        },
        { role: 'ai' as const, text: '第 1 篇已出稿（成分科普版），另外两篇在排队。你想先看这篇，还是三篇一起出？' },
      ]

  return (
    <div className="flex h-full min-h-0">
      <div className="flex w-[236px] shrink-0 flex-col border-r border-white/[0.06]">
        <div className="flex items-center gap-2 px-3.5 pb-2 pt-4">
          <span className="text-[13px] font-semibold text-sand-50">对话</span>
          <button className="ml-auto grid h-6 w-6 place-items-center rounded-lg border border-white/[0.08] text-[var(--text-2)] hover:border-amber-500/30 hover:text-amber-300">
            <Icon name="plus" size={13} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-2 pb-4 scroll-thin">
          {sessions.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveId(s.id)}
              className={`mb-0.5 w-full rounded-lg px-2.5 py-2 text-left transition-colors ${
                s.id === activeId && !topic ? 'bg-amber-500/[0.1]' : 'hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className="truncate text-[11.5px] font-medium text-sand-100">{s.title}</span>
              </div>
              <div className="mt-0.5 flex items-center gap-1 text-[9.5px] text-[var(--text-3)]">
                <span>{s.platform}</span>
                <span className="text-white/15">·</span>
                <span>{s.updated}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-11 shrink-0 items-center gap-2 border-b border-white/[0.06] px-5">
          <PlatformTag name={active.platform} />
          <span className="text-[11px] text-[var(--text-3)]">{topic ? `新对话 · ${topic}` : active.title}</span>
          <span className="ml-auto flex items-center gap-1 text-[10px] text-mint-400">
            <StatusDot tone="mint" /> 已接入 deepseek · 本地记忆
          </span>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto scroll-thin">
          <div className="mx-auto max-w-[760px] space-y-4 px-6 py-6">
            {thread.map((m, i) =>
              m.role === 'user' ? (
                <div key={i} className="flex justify-end gap-2.5">
                  <div className="max-w-[80%] rounded-2xl rounded-br-md border border-amber-500/20 bg-amber-500/[0.1] px-3.5 py-2.5 text-[13px] leading-relaxed text-sand-50">
                    {m.text}
                  </div>
                  <Avatar name="MZ" size={26} />
                </div>
              ) : (
                <div key={i} className="flex gap-2.5">
                  <span className="mt-0.5 grid h-[26px] w-[26px] shrink-0 place-items-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-[#1a1207]">
                    <Icon name="sparkles" size={13} />
                  </span>
                  <div className="min-w-0 flex-1">
                    {m.steps && (
                      <div className="mb-2 overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02]">
                        <button
                          onClick={() => setStepsOpen(!stepsOpen)}
                          className="flex w-full items-center gap-1.5 px-2.5 py-1.5 text-[10.5px] text-[var(--text-2)] hover:text-sand-100"
                        >
                          <Icon name={stepsOpen ? 'chevronDown' : 'chevronRight'} size={11} />
                          执行了 {m.steps.length} 步
                          <span className="ml-auto text-[9.5px] text-[var(--text-3)]">可折叠</span>
                        </button>
                        {stepsOpen && (
                          <div className="animate-fade grid grid-cols-2 gap-x-3 border-t border-white/[0.05] px-3 py-2">
                            {m.steps.map((s, k) => (
                              <div key={k} className="flex items-center gap-1.5 py-[3px] text-[10.5px] text-[var(--text-2)]">
                                <Icon name="check" size={9} className="shrink-0 text-mint-400" />
                                <span className="truncate">{s}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    <div className="rounded-2xl rounded-bl-md border border-white/[0.07] bg-white/[0.035] px-3.5 py-2.5 text-[13px] leading-[1.8] text-sand-100/90">
                      {m.text}
                    </div>
                  </div>
                </div>
              ),
            )}

            <div className="rounded-xl border border-white/[0.07] bg-[var(--surface-2)] p-3">
              <div className="flex items-center gap-1.5">
                <Icon name="doc" size={12} className="text-amber-400" />
                <span className="text-[11.5px] font-medium text-sand-50">换季烂脸？先别急着换全套</span>
                <span className="ml-auto rounded border border-white/10 bg-white/[0.05] px-1.5 py-[1px] text-[9px] text-[var(--text-2)]">
                  初稿 · 1180 字
                </span>
              </div>
              <p className="mt-1.5 line-clamp-2 text-[11px] leading-relaxed text-[var(--text-2)]">
                上周后台收到 47 条同样的问题：换季了，脸开始泛红、起皮、上妆卡粉，是不是要把护肤品全套换掉？先说结论：不要。
              </p>
              <div className="mt-2 flex gap-1.5">
                <button className="btn-ghost px-2 py-1 text-[10.5px]">打开全文</button>
                <button className="btn-ghost px-2 py-1 text-[10.5px]">继续改</button>
                <button className="btn-primary px-2 py-1 text-[10.5px]">打包素材</button>
              </div>
            </div>

            <div className="rounded-xl border border-amber-500/25 bg-amber-500/[0.06] p-3">
              <div className="flex items-center gap-1.5 text-[10px] font-medium text-amber-300">
                <Icon name="chat" size={11} /> 需要你拍板
              </div>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-sand-50">
                另外两篇的落点你想偏「成分科普」还是「使用场景」？主号最近成分类偏多，我倾向这次做场景。
              </p>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                <button className="btn-ghost px-2.5 py-1 text-[11px]">1 · 成分科普</button>
                <button className="btn-primary px-2.5 py-1 text-[11px]">2 · 使用场景（推荐）</button>
                <button className="btn-ghost px-2.5 py-1 text-[11px]">跳过</button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/[0.06] px-6 py-3">
          <div className="mx-auto max-w-[760px]">
            <div className="rounded-2xl border border-white/[0.09] bg-[var(--surface-2)] p-2.5 transition-colors focus-within:border-amber-500/35">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={2}
                placeholder="说目标就行，例如：用知识库里的秋季新品调研，写一篇小红书笔记"
                className="w-full resize-none bg-transparent text-[13px] leading-relaxed text-sand-50 outline-none placeholder:text-[var(--text-3)]"
              />
              <div className="flex items-center gap-1.5">
                <button className="flex items-center gap-1 rounded-lg border border-white/[0.07] px-2 py-1 text-[10.5px] text-[var(--text-2)] hover:border-white/[0.14]">
                  <Icon name="sparkles" size={10} /> 模板
                </button>
                <button className="flex items-center gap-1 rounded-lg border border-white/[0.07] px-2 py-1 text-[10.5px] text-[var(--text-2)] hover:border-white/[0.14]">
                  <Icon name="layers" size={10} /> 引用素材
                </button>
                <button className="flex items-center gap-1 rounded-lg border border-white/[0.07] px-2 py-1 text-[10.5px] text-[var(--text-2)] hover:border-white/[0.14]">
                  <Icon name="book" size={10} /> 知识库
                </button>
                <span className="ml-auto text-[9.5px] text-[var(--text-3)]">⌘↵ 发送 · 支持拖入文件</span>
                <button
                  className={`grid h-7 w-7 place-items-center rounded-lg ${
                    input.trim() ? 'bg-amber-500 text-[#1a1207]' : 'bg-white/[0.07] text-[var(--text-3)]'
                  }`}
                >
                  <Icon name="send" size={13} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden w-[218px] shrink-0 flex-col gap-3 border-l border-white/[0.06] p-3.5 2xl:flex">
        <div>
          <div className="sec-title mb-2">本次上下文</div>
          <div className="space-y-1.5">
            {[
              { k: '账号', v: 'MZ 主号 · 小红书' },
              { k: '平台格式', v: '图文 · 3:4 封面' },
              { k: '引用知识库', v: '4 条' },
              { k: '账号记忆', v: '12 篇已发' },
            ].map((r) => (
              <div key={r.k} className="flex items-center justify-between rounded-lg bg-white/[0.025] px-2 py-1.5 text-[10.5px]">
                <span className="text-[var(--text-3)]">{r.k}</span>
                <span className="text-sand-100">{r.v}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="sec-title mb-2">可用工具</div>
          <div className="flex flex-wrap gap-1">
            {tools.map((t) => (
              <span key={t} className="chip py-[2px] text-[10px]">
                {t}
              </span>
            ))}
          </div>
        </div>
        <div>
          <div className="sec-title mb-2">产物</div>
          <div className="space-y-1">
            {['稿件 · 1 篇', '封面 · 2 张', '素材包 · 待打包'].map((p) => (
              <div key={p} className="flex items-center gap-1.5 rounded-lg bg-white/[0.025] px-2 py-1.5 text-[10.5px] text-sand-100">
                <Icon name="check" size={9} className="text-mint-400" /> {p}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
