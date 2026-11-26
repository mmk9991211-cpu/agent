import { useState } from 'react'
import { Icon } from '../components/Icon'
import { Avatar, PlatformTag, SectionHead, StatusDot, Tabs } from '../components/ui'
import { knowledgeItems } from '../data'

const statusTone: Record<string, string> = {
  已拆解: 'border-amber-500/25 bg-amber-500/10 text-amber-300',
  已转写: 'border-mint-500/20 bg-mint-500/10 text-mint-400',
  待转写: 'border-white/10 bg-white/[0.05] text-[var(--text-2)]',
  同步中: 'border-sky-500/25 bg-sky-500/10 text-sky-400',
}

export function Knowledge() {
  const [tab, setTab] = useState<'all' | 'done' | 'todo'>('all')
  const [active, setActive] = useState(knowledgeItems[0].id)

  const list = knowledgeItems.filter((k) =>
    tab === 'all' ? true : tab === 'done' ? k.status === '已拆解' : k.status !== '已拆解',
  )
  const cur = knowledgeItems.find((k) => k.id === active)!

  return (
    <div className="mx-auto grid max-w-[1360px] gap-4 px-6 pb-10 pt-5 xl:grid-cols-[1.55fr_1fr]">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 text-[11px] text-[var(--text-3)]">
              <StatusDot tone="mint" /> 已关联 Obsidian 仓库 · 自动转写开启
            </div>
            <h2 className="mt-1 text-[19px] font-semibold tracking-tight text-sand-50">知识库</h2>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn-ghost">
              <Icon name="link" size={12} /> 粘贴链接
            </button>
            <button className="btn-primary">
              <Icon name="user" size={12} /> 手机上传
            </button>
          </div>
        </div>

        <div className="card p-3">
          <div className="flex items-center gap-2">
            <Tabs
              items={[
                { key: 'all', label: '全部', count: knowledgeItems.length },
                { key: 'done', label: '已拆解', count: knowledgeItems.filter((k) => k.status === '已拆解').length },
                { key: 'todo', label: '待处理', count: knowledgeItems.filter((k) => k.status !== '已拆解').length },
              ]}
              value={tab}
              onChange={(v) => setTab(v as typeof tab)}
              size="sm"
            />
            <div className="ml-auto flex items-center gap-1.5 rounded-lg border border-white/[0.07] bg-white/[0.02] px-2 py-1">
              <Icon name="search" size={11} className="text-[var(--text-3)]" />
              <input placeholder="搜条目" className="w-[110px] bg-transparent text-[11px] outline-none placeholder:text-[var(--text-3)]" />
            </div>
          </div>

          <div className="mt-2.5 flex flex-col">
            {list.map((k) => (
              <button
                key={k.id}
                onClick={() => setActive(k.id)}
                className={`flex items-center gap-2.5 rounded-lg px-2 py-2.5 text-left transition-colors ${
                  k.id === active ? 'bg-amber-500/[0.08]' : 'hover:bg-white/[0.04]'
                }`}
              >
                <Avatar name={k.author} size={24} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[12.5px] font-medium text-sand-50">{k.title}</div>
                  <div className="mt-0.5 flex items-center gap-1.5 text-[9.5px] text-[var(--text-3)]">
                    <PlatformTag name={k.platform} />
                    <span>{k.author}</span>
                    <span className="text-white/15">·</span>
                    <span>{k.comments} 条评论</span>
                    <span className="text-white/15">·</span>
                    <span>{k.savedAt}</span>
                  </div>
                </div>
                <span className={`shrink-0 rounded-md border px-1.5 py-[2px] text-[9.5px] ${statusTone[k.status]}`}>{k.status}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="card p-4">
          <SectionHead icon="wand" title="爆款拆解" hint={cur.title.slice(0, 12) + '…'} />
          <div className="mt-3 space-y-2">
            {[
              { k: '选题内核', v: '换季焦虑 + 具体自救步骤，需求明确、可立即执行' },
              { k: '结构', v: '结论前置 → 分类判断 → 三步方案 → 何时该换' },
              { k: '钩子', v: '首句用后台提问数据制造共鸣（47 条同样问题）' },
              { k: '镜头 / 排版', v: '短段落 + 加粗结论，每段不超过 3 行' },
              { k: '可复用点', v: '「分类判断 + 三步方案」可套用到任何护肤问题' },
            ].map((r) => (
              <div key={r.k} className="rounded-lg border border-white/[0.05] bg-white/[0.02] px-2.5 py-2">
                <div className="text-[10px] text-amber-300/80">{r.k}</div>
                <div className="mt-0.5 text-[11.5px] leading-relaxed text-sand-100/85">{r.v}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex gap-1.5">
            <button className="btn-primary flex-1 py-1.5 text-[11.5px]">
              <Icon name="sparkles" size={11} /> 用这个结构写一篇
            </button>
            <button className="btn-ghost px-2.5 py-1.5 text-[11.5px]">
              <Icon name="copy" size={11} />
            </button>
          </div>
        </div>

        <div className="card p-4">
          <SectionHead icon="user" title="订阅博主" hint="每天自动同步" />
          <div className="mt-2.5 flex flex-col gap-1.5">
            {[
              { n: '皮皮医生', p: '小红书', new: 2 },
              { n: '实验室老张', p: 'B站', new: 1 },
              { n: '干皮自救', p: '小红书', new: 2 },
              { n: 'Dr. Lim', p: 'YouTube', new: 0 },
            ].map((s) => (
              <div key={s.n} className="flex items-center gap-2 rounded-lg px-1.5 py-1.5 hover:bg-white/[0.03]">
                <Avatar name={s.n} size={22} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[11.5px] text-sand-100">{s.n}</div>
                  <div className="text-[9.5px] text-[var(--text-3)]">{s.p}</div>
                </div>
                {s.new > 0 ? (
                  <span className="rounded-full bg-amber-500/15 px-1.5 text-[9.5px] font-semibold text-amber-300">+{s.new}</span>
                ) : (
                  <span className="text-[9.5px] text-[var(--text-3)]">已同步</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="card p-4">
          <SectionHead icon="cpu" title="AI 已理解" hint="可一句话检索" />
          <div className="mt-2 flex flex-wrap gap-1.5">
            {['换季泛红', '屏障修复', '神经酰胺', '成分浓度', '空瓶复购', '干皮急救', '价格对比'].map((t) => (
              <span key={t} className="chip hover:border-amber-500/30 hover:text-amber-300">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
