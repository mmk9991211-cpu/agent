import { useState } from 'react'
import { Icon } from '../components/Icon'
import { SectionHead, StatusDot } from '../components/ui'

const seed = [
  { id: 'a1', name: '每日运营日报', desc: '每天 09:00 结合账号方向生成今日计划与发现', cron: '09:00 · 每天', on: true, last: '今天 09:00 已执行' },
  { id: 'a2', name: '订阅博主同步', desc: '每 6 小时拉取订阅账号的新内容并入库', cron: '每 6 小时', on: true, last: '今天 06:00 同步 5 条' },
  { id: 'a3', name: '爆款自动拆解', desc: '新入库内容自动拆解结构、钩子和评论', cron: '入库后触发', on: true, last: '今天 08:41 拆解 2 条' },
  { id: 'a4', name: '排期逾期提醒', desc: '计划日未发布的内容，第二天上午提醒', cron: '10:00 · 工作日', on: false, last: '已暂停' },
  { id: 'a5', name: '月度复盘报告', desc: '每月 1 日汇总上月数据、最好与最差的 3 篇', cron: '每月 1 日', on: true, last: '11-01 已生成' },
]

const agents = [
  { n: 'Claude Code', s: '已接入', d: '可直接读写 MZ 素材库与稿件' },
  { n: 'Codex CLI', s: '可接入', d: '通过 MCP 暴露本地素材与知识库' },
  { n: 'Obsidian', s: '已关联', d: '仓库路径 ~/Documents/MZ-Vault' },
]

export function Automation() {
  const [list, setList] = useState(seed)
  const toggle = (id: string) => setList((l) => l.map((x) => (x.id === id ? { ...x, on: !x.on } : x)))

  return (
    <div className="mx-auto grid max-w-[1200px] gap-4 px-6 pb-10 pt-5 xl:grid-cols-[1.5fr_1fr]">
      <div className="flex flex-col gap-3">
        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2 text-[11px] text-[var(--text-3)]">
              <StatusDot tone="mint" /> 4 个任务运行中
            </div>
            <h2 className="mt-1 text-[19px] font-semibold tracking-tight text-sand-50">自动化</h2>
          </div>
          <button className="btn-primary">
            <Icon name="plus" size={13} strokeWidth={2} /> 新建自动化
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {list.map((a) => (
            <div key={a.id} className="card hoverable flex items-start gap-3 p-3.5">
              <span className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg ${a.on ? 'bg-amber-500/15 text-amber-400' : 'bg-white/[0.05] text-[var(--text-3)]'}`}>
                <Icon name="zap" size={13} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-medium text-sand-50">{a.name}</span>
                  <span className="mono-tag">{a.cron}</span>
                </div>
                <p className="mt-0.5 text-[11px] leading-relaxed text-[var(--text-2)]">{a.desc}</p>
                <div className="mt-1 text-[10px] text-[var(--text-3)]">{a.last}</div>
              </div>
              <button
                onClick={() => toggle(a.id)}
                className={`relative h-[18px] w-[32px] shrink-0 rounded-full transition-colors ${a.on ? 'bg-amber-500' : 'bg-white/[0.12]'}`}
                aria-label="toggle"
              >
                <span
                  className={`absolute top-[2px] h-[14px] w-[14px] rounded-full bg-white transition-all ${a.on ? 'left-[16px]' : 'left-[2px]'}`}
                />
              </button>
            </div>
          ))}
        </div>

        <div className="card p-4">
          <SectionHead icon="cpu" title="接入 Agent" hint="让常用 AI 直接读写 MZ" />
          <div className="mt-2.5 flex flex-col gap-2">
            {agents.map((a) => (
              <div key={a.n} className="flex items-center gap-2.5 rounded-lg border border-white/[0.05] bg-white/[0.02] px-2.5 py-2">
                <span className="grid h-6 w-6 place-items-center rounded-md bg-white/[0.06] text-sand-200">
                  <Icon name="cpu" size={12} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[11.5px] text-sand-100">{a.n}</div>
                  <div className="truncate text-[9.5px] text-[var(--text-3)]">{a.d}</div>
                </div>
                <span
                  className={`rounded-md border px-1.5 py-[2px] text-[9.5px] ${
                    a.s === '可接入'
                      ? 'border-white/10 bg-white/[0.05] text-[var(--text-2)]'
                      : 'border-mint-500/20 bg-mint-500/10 text-mint-400'
                  }`}
                >
                  {a.s}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="card p-4">
          <SectionHead icon="chart" title="近 7 天执行" />
          <div className="mt-3 flex h-[92px] items-end gap-1.5">
            {[4, 7, 5, 9, 6, 8, 11].map((v, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <div className="w-full rounded-t-[3px] bg-gradient-to-t from-amber-600/40 to-amber-400" style={{ height: v * 6 }} />
                <span className="text-[9px] text-[var(--text-3)]">{['一', '二', '三', '四', '五', '六', '日'][i]}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 flex items-center justify-between text-[10.5px]">
            <span className="text-[var(--text-3)]">共执行 50 次</span>
            <span className="text-mint-400">成功率 98%</span>
          </div>
        </div>

        <div className="card p-4">
          <SectionHead icon="settings" title="全局规则" hint="所有自动化共用" />
          <div className="mt-2.5 space-y-2">
            {[
              { k: '发布节奏', v: '每周 3 篇，周二 / 周四 / 周日晚 20:00' },
              { k: '合规检查', v: '自动过滤绝对化用语与医疗宣称' },
              { k: '素材留存', v: '原片保留 90 天，成片永久' },
            ].map((r) => (
              <div key={r.k} className="rounded-lg border border-white/[0.05] bg-white/[0.02] px-2.5 py-2">
                <div className="text-[10px] text-[var(--text-3)]">{r.k}</div>
                <div className="mt-0.5 text-[11.5px] text-sand-100/85">{r.v}</div>
              </div>
            ))}
          </div>
          <button className="btn-ghost mt-3 w-full py-1.5 text-[11.5px]">编辑规则</button>
        </div>
      </div>
    </div>
  )
}
