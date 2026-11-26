import { useMemo, useState } from 'react'
import { Icon } from '../components/Icon'
import { PlatformTag, SectionHead, StatusDot } from '../components/ui'
import { drafts as seedDrafts, type Draft } from '../data'

function renderInline(text: string, key: number) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return (
    <span key={key}>
      {parts.map((p, i) =>
        p.startsWith('**') && p.endsWith('**') ? (
          <strong key={i} className="font-semibold text-sand-50">
            {p.slice(2, -2)}
          </strong>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </span>
  )
}

function Markdown({ src }: { src: string }) {
  const lines = src.split('\n')
  const out: JSX.Element[] = []
  let list: string[] = []
  const flush = (k: number) => {
    if (list.length) {
      out.push(
        <ul key={`ul-${k}`} className="my-2 space-y-1.5">
          {list.map((li, i) => (
            <li key={i} className="flex gap-2 text-[13px] leading-relaxed text-sand-100/85">
              <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-amber-500/70" />
              {renderInline(li, i)}
            </li>
          ))}
        </ul>,
      )
      list = []
    }
  }
  lines.forEach((raw, idx) => {
    const line = raw.trimEnd()
    if (/^###\s/.test(line)) {
      flush(idx)
      out.push(
        <h4 key={idx} className="mb-1.5 mt-4 text-[13.5px] font-semibold text-sand-50">
          {line.replace(/^###\s/, '')}
        </h4>,
      )
    } else if (/^##\s/.test(line)) {
      flush(idx)
      out.push(
        <h3 key={idx} className="mb-2 mt-5 flex items-center gap-2 text-[15px] font-semibold text-sand-50">
          <span className="h-3.5 w-[3px] rounded-full bg-amber-500" />
          {line.replace(/^##\s/, '')}
        </h3>,
      )
    } else if (/^#\s/.test(line)) {
      flush(idx)
      out.push(
        <h2 key={idx} className="mb-3 text-[22px] font-semibold leading-snug tracking-tight text-sand-50">
          {line.replace(/^#\s/, '')}
        </h2>,
      )
    } else if (/^---+$/.test(line)) {
      flush(idx)
      out.push(<div key={idx} className="my-4 h-px bg-white/[0.08]" />)
    } else if (/^[-*]\s/.test(line)) {
      list.push(line.replace(/^[-*]\s/, ''))
    } else if (/^\d+\.\s/.test(line)) {
      flush(idx)
      out.push(
        <div key={idx} className="my-1.5 flex gap-2 text-[13px] leading-relaxed text-sand-100/85">
          <span className="mt-[1px] shrink-0 font-mono text-[11px] text-amber-400">{line.match(/^\d+/)?.[0]}.</span>
          {renderInline(line.replace(/^\d+\.\s/, ''), idx)}
        </div>,
      )
    } else if (line === '') {
      flush(idx)
    } else {
      flush(idx)
      out.push(
        <p key={idx} className="my-2 text-[13.5px] leading-[1.85] text-sand-100/85">
          {renderInline(line, idx)}
        </p>,
      )
    }
  })
  flush(999)
  return <div>{out}</div>
}

const aiActions = ['改开头更抓人', '换 5 个标题', '压到 800 字', '补一段使用场景', '加话题标签', '检查平台合规']

export function Drafts({ initialId, onCreate }: { initialId?: string; onCreate: (topic: string) => void }) {
  const [list, setList] = useState<Draft[]>(seedDrafts)
  const [activeId, setActiveId] = useState(initialId ?? seedDrafts[0].id)
  const [tab, setTab] = useState<'edit' | 'preview'>('preview')
  const [savedTick, setSavedTick] = useState(true)
  const active = list.find((d) => d.id === activeId)!

  const body = active.body
  const words = useMemo(() => body.replace(/\s/g, '').length, [body])

  const update = (patch: Partial<Draft>) => {
    setList((l) => l.map((d) => (d.id === activeId ? { ...d, ...patch } : d)))
    setSavedTick(false)
    window.setTimeout(() => setSavedTick(true), 700)
  }

  return (
    <div className="flex h-full min-h-0">
      {/* 稿件列表 */}
      <div className="flex w-[268px] shrink-0 flex-col border-r border-white/[0.06]">
        <div className="flex items-center gap-2 px-4 pb-2 pt-4">
          <span className="text-[13px] font-semibold text-sand-50">稿件</span>
          <span className="rounded-full bg-white/[0.07] px-1.5 text-[10px] tabular-nums text-[var(--text-2)]">{list.length}</span>
          <button
            onClick={() => onCreate('新建一篇稿件')}
            className="ml-auto grid h-6 w-6 place-items-center rounded-lg border border-white/[0.08] text-[var(--text-2)] hover:border-amber-500/30 hover:text-amber-300"
          >
            <Icon name="plus" size={13} />
          </button>
        </div>
        <div className="px-4 pb-2">
          <div className="flex items-center gap-1.5 rounded-lg border border-white/[0.07] bg-white/[0.02] px-2 py-1.5">
            <Icon name="search" size={11} className="text-[var(--text-3)]" />
            <input placeholder="搜索稿件" className="w-full bg-transparent text-[11px] outline-none placeholder:text-[var(--text-3)]" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-2 pb-4 scroll-thin">
          {['11 月 · 秋季新品', '11 月 · 长文', '11 月 · 短视频', '11 月 · 出海', '11 月 · 复盘'].map((folder) => {
            const items = list.filter((d) => d.folder === folder)
            if (!items.length) return null
            return (
              <div key={folder} className="mb-2">
                <div className="flex items-center gap-1.5 px-2 py-1.5 text-[10.5px] text-[var(--text-3)]">
                  <Icon name="folder" size={11} /> {folder}
                </div>
                <div className="flex flex-col gap-0.5">
                  {items.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => setActiveId(d.id)}
                      className={`w-full rounded-lg px-2.5 py-2 text-left transition-colors ${
                        d.id === activeId ? 'bg-amber-500/[0.1] shadow-[inset_0_0_0_1px_rgba(217,130,43,0.2)]' : 'hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-[12px] font-medium text-sand-50">{d.title}</span>
                      </div>
                      <div className="mt-1 flex items-center gap-1.5 text-[9.5px] text-[var(--text-3)]">
                        <span className={d.id === activeId ? 'text-amber-300' : ''}>{d.status}</span>
                        <span className="text-white/15">·</span>
                        <span>{d.body.replace(/\s/g, '').length} 字</span>
                        <span className="ml-auto">{d.updated}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 编辑器 */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-11 shrink-0 items-center gap-2 border-b border-white/[0.06] px-4">
          <PlatformTag name={active.platform} />
          <span className="chip py-[2px] text-[10px]">{active.status}</span>
          <span className="flex items-center gap-1 text-[10px] text-[var(--text-3)]">
            <StatusDot tone={savedTick ? 'mint' : 'amber'} />
            {savedTick ? '已自动保存' : '保存中…'}
          </span>
          <div className="ml-auto flex items-center gap-1 rounded-lg border border-white/[0.07] bg-white/[0.02] p-0.5">
            {(['edit', 'preview'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`rounded-md px-2.5 py-1 text-[11px] transition-colors ${
                  tab === t ? 'bg-white/[0.09] text-sand-50' : 'text-[var(--text-3)] hover:text-sand-100'
                }`}
              >
                {t === 'edit' ? '编辑' : '预览'}
              </button>
            ))}
          </div>
          <button className="btn-ghost px-2 py-1 text-[11px]">
            <Icon name="download" size={11} /> 导出
          </button>
          <button className="btn-primary px-2.5 py-1 text-[11px]">
            <Icon name="layers" size={11} /> 打包素材
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto scroll-thin">
          <div className="mx-auto max-w-[720px] px-8 py-7">
            <input
              value={active.title}
              onChange={(e) => update({ title: e.target.value })}
              className="w-full bg-transparent text-[24px] font-semibold leading-tight tracking-tight text-sand-50 outline-none placeholder:text-[var(--text-3)]"
            />
            <div className="mt-2 flex items-center gap-2 text-[10.5px] text-[var(--text-3)]">
              <span>{words} 字</span>
              <span className="text-white/15">·</span>
              <span>预计阅读 {Math.max(1, Math.round(words / 380))} 分钟</span>
              <span className="text-white/15">·</span>
              <span>更新于 {active.updated}</span>
            </div>
            <div className="my-5 h-px bg-white/[0.07]" />
            {tab === 'edit' ? (
              <textarea
                value={body}
                onChange={(e) => update({ body: e.target.value })}
                spellCheck={false}
                className="min-h-[62vh] w-full resize-none bg-transparent font-mono text-[12.5px] leading-[1.9] text-sand-100/80 outline-none"
              />
            ) : (
              <Markdown src={body} />
            )}
          </div>
        </div>
      </div>

      {/* AI 侧栏 */}
      <div className="hidden w-[248px] shrink-0 flex-col border-l border-white/[0.06] xl:flex">
        <div className="flex items-center gap-2 px-3.5 pb-2 pt-4">
          <span className="grid h-5 w-5 place-items-center rounded-md bg-amber-500/15 text-amber-400">
            <Icon name="sparkles" size={11} />
          </span>
          <span className="text-[12.5px] font-medium text-sand-50">AI 侧栏</span>
          <span className="ml-auto text-[9.5px] text-[var(--text-3)]">读到全文</span>
        </div>
        <div className="px-3.5">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5">
            <p className="text-[10.5px] leading-relaxed text-[var(--text-2)]">
              我已读这篇 {words} 字的稿件和主号最近 12 篇，可以直接帮你改。
            </p>
          </div>
        </div>
        <div className="mt-2.5 flex flex-col gap-1 px-2.5">
          {aiActions.map((a) => (
            <button
              key={a}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[11px] text-[var(--text-2)] transition-colors hover:bg-white/[0.05] hover:text-sand-50"
            >
              <Icon name="wand" size={11} className="shrink-0 text-amber-500/70" />
              {a}
            </button>
          ))}
        </div>
        <div className="mt-auto p-3">
          <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-2">
            <textarea
              rows={2}
              placeholder="让 AI 改这一段…"
              className="w-full resize-none bg-transparent text-[11px] leading-relaxed outline-none placeholder:text-[var(--text-3)]"
            />
            <div className="flex items-center justify-between">
              <span className="text-[9.5px] text-[var(--text-3)]">⌘↵ 发送</span>
              <button className="grid h-6 w-6 place-items-center rounded-lg bg-amber-500/15 text-amber-400 hover:bg-amber-500/25">
                <Icon name="send" size={12} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function DraftsHeader() {
  return <SectionHead icon="doc" title="稿件" />
}
