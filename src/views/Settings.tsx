import { useState } from 'react'
import { Icon } from '../components/Icon'
import { Avatar, SectionHead, StatusDot } from '../components/ui'

const models = [
  { n: 'DeepSeek V4', d: '写作与长文首选', tag: '已接入', on: true },
  { n: '通义千问', d: '中文语感稳定', tag: '已接入', on: true },
  { n: 'Claude Sonnet', d: '英文与结构化强', tag: '未配置', on: false },
  { n: '自定义 OpenAI 兼容', d: '接入自有网关', tag: '未配置', on: false },
]

export function Settings() {
  const [tab, setTab] = useState<'account' | 'model' | 'data' | 'about'>('model')

  return (
    <div className="mx-auto flex max-w-[1040px] gap-5 px-6 pb-10 pt-5">
      <div className="w-[168px] shrink-0">
        <div className="sec-title mb-2 px-2">设置</div>
        {[
          { k: 'account', l: '账号与空间', i: 'user' as const },
          { k: 'model', l: 'AI 模型接入', i: 'cpu' as const },
          { k: 'data', l: '数据与存储', i: 'layers' as const },
          { k: 'about', l: '关于 MZ', i: 'sparkles' as const },
        ].map((it) => (
          <button
            key={it.k}
            onClick={() => setTab(it.k as typeof tab)}
            className={`mb-0.5 flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-[12px] transition-colors ${
              tab === it.k ? 'bg-white/[0.07] text-sand-50' : 'text-[var(--text-2)] hover:bg-white/[0.04]'
            }`}
          >
            <Icon name={it.i} size={13} /> {it.l}
          </button>
        ))}
      </div>

      <div className="min-w-0 flex-1 space-y-3">
        {tab === 'model' && (
          <>
            <div className="card p-4">
              <SectionHead icon="cpu" title="模型" hint="按任务自动挑选，也可手动指定" />
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {models.map((m) => (
                  <div
                    key={m.n}
                    className={`rounded-xl border p-3 transition-colors ${
                      m.on ? 'border-amber-500/30 bg-amber-500/[0.05]' : 'border-white/[0.06] bg-white/[0.02]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`grid h-6 w-6 place-items-center rounded-md ${m.on ? 'bg-amber-500/20 text-amber-300' : 'bg-white/[0.06] text-[var(--text-3)]'}`}>
                        <Icon name="cpu" size={12} />
                      </span>
                      <span className="text-[12.5px] font-medium text-sand-50">{m.n}</span>
                      <span className={`ml-auto text-[9.5px] ${m.on ? 'text-mint-400' : 'text-[var(--text-3)]'}`}>{m.tag}</span>
                    </div>
                    <p className="mt-1.5 text-[10.5px] text-[var(--text-3)]">{m.d}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-4">
              <SectionHead icon="link" title="API Key" hint="仅存本地，不上传" />
              <div className="mt-3 space-y-2">
                {[
                  { k: 'DeepSeek', v: 'sk-••••••••••••••••3f2a' },
                  { k: '通义千问', v: 'sk-••••••••••••••••8c41' },
                ].map((r) => (
                  <div key={r.k} className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-2">
                    <span className="w-20 shrink-0 text-[11px] text-[var(--text-2)]">{r.k}</span>
                    <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-sand-100/80">{r.v}</span>
                    <button className="text-[10.5px] text-amber-400 hover:text-amber-300">更换</button>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between rounded-lg bg-white/[0.025] px-2.5 py-2">
                <span className="text-[10.5px] text-[var(--text-2)]">本月用量 6,240 / 10,000</span>
                <span className="text-[10px] text-[var(--text-3)]">下月 1 日重置</span>
              </div>
            </div>
          </>
        )}

        {tab === 'account' && (
          <>
            <div className="card p-4">
              <SectionHead icon="user" title="账号" hint="每个账号一个空间，记忆独立" />
              <div className="mt-3 space-y-2">
                {[
                  { n: 'MZ 主号', p: '小红书', f: '3.2w', m: '记忆 92%' },
                  { n: 'MZ 副号', p: '抖音', f: '1.8w', m: '记忆 78%' },
                  { n: '出海号', p: 'Instagram', f: '0.7w', m: '记忆 64%' },
                ].map((a) => (
                  <div key={a.n} className="flex items-center gap-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
                    <Avatar name={a.n} size={28} />
                    <div className="min-w-0 flex-1">
                      <div className="text-[12px] text-sand-50">{a.n}</div>
                      <div className="text-[9.5px] text-[var(--text-3)]">
                        {a.p} · {a.f} 粉 · {a.m}
                      </div>
                    </div>
                    <button className="btn-ghost px-2 py-1 text-[10.5px]">管理记忆</button>
                  </div>
                ))}
              </div>
            </div>
            <div className="card p-4">
              <SectionHead icon="settings" title="工作空间" />
              <div className="mt-2.5 space-y-1.5">
                {['空间名称 · MZ 工作台', '发布节奏 · 每周 3 篇', '默认平台 · 小红书图文'].map((r) => (
                  <div key={r} className="flex items-center justify-between rounded-lg bg-white/[0.025] px-2.5 py-2 text-[11px]">
                    <span className="text-[var(--text-2)]">{r.split(' · ')[0]}</span>
                    <span className="text-sand-100">{r.split(' · ')[1]}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {tab === 'data' && (
          <>
            <div className="card p-4">
              <SectionHead icon="layers" title="本地存储" hint="本地优先，数据不出机器" />
              <div className="mt-3 space-y-2">
                <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-2">
                  <div className="text-[10px] text-[var(--text-3)]">数据目录</div>
                  <div className="mt-0.5 truncate font-mono text-[11px] text-sand-100/85">D:\MZ\workspace</div>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/[0.025] px-2.5 py-2">
                  <span className="text-[11px] text-[var(--text-2)]">素材已占用</span>
                  <span className="font-mono text-[11px] text-sand-100">18.4 GB / 120 GB</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/[0.025] px-2.5 py-2">
                  <span className="text-[11px] text-[var(--text-2)]">自动备份</span>
                  <span className="flex items-center gap-1 text-[10.5px] text-mint-400">
                    <StatusDot tone="mint" /> 每天 03:00
                  </span>
                </div>
              </div>
              <div className="mt-3 flex gap-1.5">
                <button className="btn-ghost flex-1 py-1.5 text-[11px]">
                  <Icon name="download" size={11} /> 导出全部
                </button>
                <button className="btn-ghost flex-1 py-1.5 text-[11px]">
                  <Icon name="refresh" size={11} /> 立即备份
                </button>
              </div>
            </div>
          </>
        )}

        {tab === 'about' && (
          <div className="card p-5">
            <SectionHead icon="sparkles" title="关于 MZ" hint="v0.1.0" />
            <p className="mt-3 text-[12px] leading-relaxed text-[var(--text-2)]">
              MZ 是一个个人向的 AI 内容运营工作台：把选题、写稿、素材、排期和发布前的打包放在同一个界面里，
              账号的定位、文风和已发内容作为长期记忆被反复复用。
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {[
                ['产品形态', 'Web 版工作台'],
                ['技术栈', 'React 18 · TypeScript · Vite · Tailwind'],
                ['数据', '本地存储 / localStorage 持久化'],
                ['参考', 'Beav（原 RedBox）产品结构'],
              ].map(([k, v]) => (
                <div key={k} className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-2">
                  <div className="text-[10px] text-[var(--text-3)]">{k}</div>
                  <div className="mt-0.5 text-[11.5px] text-sand-100">{v}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
