import { useEffect, useState } from 'react'
import { Sidebar, type ViewKey } from './components/Sidebar'
import { TopBar } from './components/TopBar'
import { SessionDrawer } from './components/SessionDrawer'
import { Home } from './views/Home'
import { Hot } from './views/Hot'
import { Drafts } from './views/Drafts'
import { Media } from './views/Media'
import { Knowledge } from './views/Knowledge'
import { Schedule } from './views/Schedule'
import { ChatPage } from './views/ChatPage'
import { Automation } from './views/Automation'
import { Settings } from './views/Settings'
import { sessions } from './data'

const meta: Record<ViewKey, { title: string; sub: string }> = {
  home: { title: '主页', sub: '今天做什么，一屏看完' },
  chat: { title: '对话', sub: '说目标，AI 干活' },
  schedule: { title: '内容排期', sub: '月 / 周视图 · 拖动改期' },
  hot: { title: '热点雷达', sub: '按你的账号方向打分' },
  drafts: { title: '稿件', sub: '实时预览编辑 · AI 侧栏' },
  media: { title: '素材库', sub: '图片 / 视频 / 文案 / 配乐' },
  knowledge: { title: '知识库', sub: '链接入库 · 自动转写拆解' },
  automation: { title: '自动化', sub: '定时任务与 Agent 接入' },
  settings: { title: '设置', sub: '模型、账号与数据' },
}

const isView = (v: string): v is ViewKey => v in meta

function readRoute(): ViewKey {
  const hash = window.location.hash.replace('#', '')
  if (isView(hash)) return hash
  const saved = localStorage.getItem('mz:view')
  return saved && isView(saved) ? saved : 'home'
}

export default function App() {
  const [view, setView] = useState<ViewKey>(readRoute)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [topic, setTopic] = useState<string | null>(null)
  const [chatKey, setChatKey] = useState(0)

  useEffect(() => {
    localStorage.setItem('mz:view', view)
    if (window.location.hash !== `#${view}`) window.location.hash = view
  }, [view])

  useEffect(() => {
    const onHash = () => setView(readRoute())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const openSession = (id: string) => setSessionId(id)
  const createFrom = (t: string) => {
    setTopic(t)
    setChatKey((k) => k + 1)
    setView('chat')
  }

  const fullBleed = view === 'drafts' || view === 'chat'
  const active = sessions.find((s) => s.id === sessionId)

  return (
    <div className="app-bg flex h-screen w-full overflow-hidden text-[13px]">
      <Sidebar active={view} onNavigate={(v) => setView(v)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          title={meta[view].title}
          subtitle={meta[view].sub}
          onNewChat={() => createFrom('新对话')}
        />

        <main className={`min-h-0 flex-1 ${fullBleed ? 'overflow-hidden' : 'overflow-y-auto scroll-thin'}`}>
          {view === 'home' && <Home onOpenSession={openSession} onNavigate={(v) => setView(v)} />}
          {view === 'chat' && <ChatPage key={chatKey} topic={topic} />}
          {view === 'schedule' && <Schedule onCreate={createFrom} />}
          {view === 'hot' && <Hot onCreate={createFrom} />}
          {view === 'drafts' && <Drafts onCreate={createFrom} />}
          {view === 'media' && <Media />}
          {view === 'knowledge' && <Knowledge />}
          {view === 'automation' && <Automation />}
          {view === 'settings' && <Settings />}
        </main>
      </div>

      {active && <SessionDrawer session={active} onClose={() => setSessionId(null)} />}
    </div>
  )
}
