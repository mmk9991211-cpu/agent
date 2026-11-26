import { useMemo, useState } from 'react'
import { Icon } from '../components/Icon'
import { PlatformTag, SectionHead, Tabs } from '../components/ui'
import { mediaItems, type MediaItem } from '../data'

const palettes = [
  ['#3B2A1C', '#8A5A2B', '#E8B87A'],
  ['#1E2A33', '#2F5A6B', '#7FC0CC'],
  ['#2A2431', '#5A4468', '#B79BD1'],
  ['#2B2420', '#6B4B36', '#C79A76'],
  ['#20262B', '#3E5A4B', '#8FC0A8'],
  ['#2C2326', '#6B3A46', '#D18C9C'],
]

function Thumb({ item, big = false }: { item: MediaItem; big?: boolean }) {
  const idx = parseInt(item.id.replace('m', ''), 10) % palettes.length
  const [a, b, c] = palettes[idx]
  const id = `g-${item.id}${big ? '-b' : ''}`
  const base = item.name.split('·')[0].replace(/（.*?）/g, '').trim()
  const coverTitle =
    base.length <= 5
      ? [base]
      : base.length <= 10
        ? [base.slice(0, Math.ceil(base.length / 2)), base.slice(Math.ceil(base.length / 2))]
        : [base.slice(0, 5), base.slice(5, 10)]

  if (item.type === '文案') {
    return (
      <div className="flex h-full w-full flex-col justify-between bg-[var(--surface-3)] p-2.5">
        <div className="space-y-[5px]">
          {[92, 76, 88, 64, 80, 56, 70, 84, 48, 62].slice(0, big ? 10 : 6).map((w, i) => (
            <div key={i} className="h-[3px] rounded-full bg-white/[0.13]" style={{ width: `${w}%` }} />
          ))}
        </div>
        <div className="flex items-center gap-1 text-[9px] text-[var(--text-3)]">
          <Icon name="text" size={9} /> 文案
        </div>
      </div>
    )
  }
  if (item.type === '配乐') {
    return (
      <div className="flex h-full w-full items-center justify-center gap-[3px] bg-[#181C22] px-3">
        {[14, 26, 38, 22, 44, 30, 18, 34, 48, 24, 16, 30, 40, 20, 12].map((h, i) => (
          <div key={i} className="w-[3px] rounded-full" style={{ height: h, background: `linear-gradient(180deg,${c},${b})`, opacity: 0.75 }} />
        ))}
      </div>
    )
  }
  return (
    <div className="relative h-full w-full overflow-hidden" style={{ background: `linear-gradient(150deg, ${a}, ${b})` }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full opacity-45">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={c} stopOpacity="0.7" />
            <stop offset="100%" stopColor={c} stopOpacity="0.05" />
          </linearGradient>
        </defs>
        <circle cx={idx % 2 === 0 ? 78 : 22} cy="26" r="30" fill={`url(#${id})`} opacity="0.6" />
        <path d="M0 78 Q 38 58 100 74 L100 100 L0 100 Z" fill={a} opacity="0.65" />
      </svg>
      <div className="absolute inset-0 grid-dots opacity-25" />

      {/* 封面文字排版 */}
      <div className={`absolute inset-x-0 top-[16%] flex flex-col px-2.5 ${idx % 3 === 0 ? 'items-start' : idx % 3 === 1 ? 'items-center' : 'items-start'}`}>
        <div
          className={`font-bold leading-[1.18] text-white/95 ${big ? 'text-[30px]' : 'text-[15px]'}`}
          style={{ textShadow: '0 2px 12px rgba(0,0,0,0.45)', letterSpacing: '-0.01em' }}
        >
          {coverTitle.map((l, i) => (
            <div key={i}>{l}</div>
          ))}
        </div>
        <span className={`mt-1.5 rounded-sm bg-white/85 ${big ? 'h-[3px] w-10' : 'h-[2px] w-6'}`} />
      </div>

      <div className="absolute right-1.5 top-1.5 flex flex-col items-end gap-1">
        <span className="rounded bg-black/30 px-1 py-[1px] text-[8px] text-white/60 backdrop-blur">{item.ratio}</span>
      </div>
      <div className="absolute bottom-1.5 left-2 text-[8px] tracking-[0.2em] text-white/35">MZ</div>
      {item.type === '视频' && (
        <div className="absolute inset-0 grid place-items-center">
          <span className="grid h-8 w-8 place-items-center rounded-full border border-white/25 bg-black/35 text-white/90 backdrop-blur">
            <Icon name="play" size={13} />
          </span>
        </div>
      )}
    </div>
  )
}

export function Media() {
  const [type, setType] = useState<'全部' | MediaItem['type']>('全部')
  const [from, setFrom] = useState<string>('全部来源')
  const [preview, setPreview] = useState<MediaItem | null>(null)
  const [selected, setSelected] = useState<string[]>([])

  const list = useMemo(
    () =>
      mediaItems.filter(
        (m) => (type === '全部' || m.type === type) && (from === '全部来源' || m.from === from),
      ),
    [type, from],
  )

  return (
    <div className="mx-auto max-w-[1360px] px-6 pb-10 pt-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-[11px] text-[var(--text-3)]">312 个素材 · 本周入库 18 个</div>
          <h2 className="mt-1 text-[19px] font-semibold tracking-tight text-sand-50">素材库</h2>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-ghost">
            <Icon name="filter" size={12} /> 筛选
          </button>
          <button className="btn-ghost">
            <Icon name="download" size={12} /> 导出所选
          </button>
          <button className="btn-primary">
            <Icon name="plus" size={13} strokeWidth={2} /> 上传素材
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Tabs
          items={[
            { key: '全部', label: '全部', count: mediaItems.length },
            { key: '图片', label: '图片' },
            { key: '视频', label: '视频' },
            { key: '文案', label: '文案' },
            { key: '配乐', label: '配乐' },
          ]}
          value={type}
          onChange={(v) => setType(v as typeof type)}
          size="sm"
        />
        <div className="ml-1 flex items-center gap-1">
          {['全部来源', 'AI 生成', '爆款拆解', '本地上传', '订阅同步'].map((f) => (
            <button
              key={f}
              onClick={() => setFrom(f)}
              className={`rounded-lg px-2 py-1 text-[11px] transition-colors ${
                from === f ? 'bg-white/[0.08] text-sand-50' : 'text-[var(--text-3)] hover:text-sand-100'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <span className="ml-auto text-[10.5px] text-[var(--text-3)]">
          {selected.length > 0 ? `已选 ${selected.length} 个` : `${list.length} 个结果`}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {list.map((m, i) => {
          const on = selected.includes(m.id)
          return (
            <div
              key={m.id}
              className={`group animate-rise relative cursor-pointer overflow-hidden rounded-xl border transition-all ${
                on ? 'border-amber-500/60 shadow-glow' : 'border-white/[0.07] hover:border-white/[0.18]'
              }`}
              style={{ animationDelay: `${i * 22}ms` }}
              onClick={() => setPreview(m)}
            >
              <div className="aspect-[4/5] w-full">
                <Thumb item={m} />
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setSelected((s) => (on ? s.filter((x) => x !== m.id) : [...s, m.id]))
                }}
                className={`absolute left-1.5 top-1.5 grid h-4.5 w-4.5 place-items-center rounded border text-[9px] transition-opacity ${
                  on
                    ? 'border-amber-400 bg-amber-500 text-[#1a1207] opacity-100'
                    : 'border-white/40 bg-black/40 text-transparent opacity-0 group-hover:opacity-100'
                }`}
                style={{ width: 18, height: 18 }}
              >
                <Icon name="check" size={10} strokeWidth={2.6} />
              </button>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent px-2 pb-1.5 pt-4">
                <div className="truncate text-[10.5px] font-medium text-white/95">{m.name}</div>
                <div className="flex items-center gap-1 text-[9px] text-white/50">
                  <span>{m.meta}</span>
                  <span className="text-white/25">·</span>
                  <span className="truncate">{m.from}</span>
                </div>
              </div>
              <span className="absolute right-1.5 top-1.5 rounded bg-black/45 px-1 py-[1px] text-[8.5px] text-white/70 backdrop-blur">
                {m.tag}
              </span>
            </div>
          )
        })}
      </div>

      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm animate-fade" onClick={() => setPreview(null)}>
          <div
            className="flex max-h-[86vh] w-full max-w-[900px] overflow-hidden rounded-2xl border border-white/[0.1] bg-[var(--surface-1)] shadow-soft animate-rise"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid min-w-0 flex-1 place-items-center bg-black/40 p-6">
              <div className="w-full max-w-[420px] overflow-hidden rounded-xl border border-white/10">
                <div className="aspect-[4/5]">
                  <Thumb item={preview} big />
                </div>
              </div>
            </div>
            <div className="flex w-[268px] shrink-0 flex-col border-l border-white/[0.07] p-4">
              <div className="flex items-start gap-2">
                <span className="text-[9.5px] text-[var(--text-3)]">{preview.type}</span>
                <button onClick={() => setPreview(null)} className="ml-auto grid h-6 w-6 place-items-center rounded-lg text-[var(--text-3)] hover:bg-white/[0.06] hover:text-sand-50">
                  <Icon name="x" size={13} />
                </button>
              </div>
              <h3 className="mt-1 text-[15px] font-semibold leading-snug text-sand-50">{preview.name}</h3>
              <div className="mt-3 space-y-2">
                {[
                  ['来源', preview.from],
                  ['尺寸 / 时长', preview.meta],
                  ['比例', preview.ratio],
                  ['标签', preview.tag],
                  ['入库时间', '2026-11-26 08:41'],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between text-[11px]">
                    <span className="text-[var(--text-3)]">{k}</span>
                    <span className="text-sand-100">{v}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5">
                <div className="flex items-center gap-1.5 text-[10.5px] text-amber-300">
                  <Icon name="cpu" size={10} /> AI 已理解
                </div>
                <p className="mt-1 text-[10.5px] leading-relaxed text-[var(--text-2)]">
                  这张素材已被视觉索引，可以用「浅色背景、大字标题、对比色」这类描述直接搜到。
                </p>
              </div>
              <div className="mt-auto flex flex-col gap-1.5 pt-4">
                <button className="btn-primary w-full py-1.5 text-[11.5px]">
                  <Icon name="send" size={11} /> 分享到手机
                </button>
                <div className="flex gap-1.5">
                  <button className="btn-ghost flex-1 py-1.5 text-[11px]">
                    <Icon name="copy" size={11} /> 复制
                  </button>
                  <button className="btn-ghost flex-1 py-1.5 text-[11px]">
                    <Icon name="trash" size={11} /> 删除
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function MediaHeader() {
  return <SectionHead icon="layers" title="素材库" />
}

export function MediaPlatformNote() {
  return <PlatformTag name="小红书" />
}
