import { useMemo, useState } from 'react'
import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom'
import {
  BarChart3, Bot, Brain, Calculator, CheckSquare, ChevronDown, ClipboardList,
  FileBarChart2, FolderOpen, GitBranch, Globe, History, LayoutDashboard, Leaf,
  Loader, Lock, MessageSquare, Newspaper, Send, SlidersHorizontal, Sparkles,
  Truck, X
} from 'lucide-react'
import Dashboard            from './pages/Dashboard'
import SupplierPortal       from './pages/SupplierPortal'
import DocumentVault        from './pages/DocumentVault'
import AuthenticationCentre from './pages/AuthenticationCentre'
import DataLineage          from './pages/DataLineage'
import DataQuality          from './pages/DataQuality'
import AIExplainability     from './pages/AIExplainability'
import AuditTrail           from './pages/AuditTrail'
import GeoRiskMap           from './pages/GeoRiskMap'
import EUDRCompliance       from './pages/EUDRCompliance'
import CarbonCalculator     from './pages/CarbonCalculator'
import BenchmarkComparison  from './pages/BenchmarkComparison'
import ESGNewsFeed          from './pages/ESGNewsFeed'
import ReportingHub         from './pages/ReportingHub'
import ProcessingHistory    from './pages/ProcessingHistory'
import { askEnviroAgent } from './api/client'

const PRIMARY_NAV = [
  { to:'/',              icon:LayoutDashboard, label:'Dashboard' },
  { to:'/documents',     icon:FolderOpen,      label:'Verify' },
  { to:'/authenticate',  icon:Lock,            label:'Trust Score' },
  { to:'/explainability',icon:Brain,           label:'Copilot' },
  { to:'/quality',       icon:BarChart3,       label:'Analytics' },
  { to:'/reporting',     icon:FileBarChart2,   label:'Reports' },
  { to:'/eudr',          icon:CheckSquare,     label:'EF Agent' },
]

const SECONDARY_NAV = [
  { to:'/suppliers', icon:Truck, label:'Suppliers' },
  { to:'/history', icon:History, label:'Processing History' },
  { to:'/lineage', icon:GitBranch, label:'Data Lineage' },
  { to:'/audit', icon:ClipboardList, label:'Audit Trail' },
  { to:'/georisk', icon:Globe, label:'Geo Risk Map' },
  { to:'/carbon', icon:Calculator, label:'Carbon Calculator' },
  { to:'/benchmark', icon:BarChart3, label:'Benchmark' },
  { to:'/news', icon:Newspaper, label:'ESG News' },
]

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/documents': 'Upload & Verify',
  '/authenticate': 'Trust Score Authentication',
  '/explainability': 'AI Copilot',
  '/quality': 'Analytics',
  '/reporting': 'Reports',
  '/eudr': 'EUDR / EF Agent',
  '/suppliers': 'Supplier Portal',
  '/history': 'Processing History',
  '/lineage': 'Data Lineage',
  '/audit': 'Audit Trail',
  '/georisk': 'Geo Risk Map',
  '/carbon': 'Carbon Calculator',
  '/benchmark': 'Benchmark',
  '/news': 'ESG News',
}

function Brand() {
  return (
    <div className="flex items-center gap-3 min-w-[220px]">
      <div className="w-9 h-9 rounded-xl border border-teal-200 bg-white flex items-center justify-center shadow-sm">
        <Leaf className="w-5 h-5 text-teal-700" />
      </div>
      <div className="leading-tight">
        <div className="text-[15px] font-black text-slate-900">TCS Envirozone AI</div>
        <div className="text-[10px] font-bold tracking-[0.16em] text-slate-500 uppercase">Data Intelligence</div>
      </div>
    </div>
  )
}

function TopNav({ shellContext, setShellContext }) {
  const [moreOpen, setMoreOpen] = useState(false)
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="h-[74px] px-6 flex items-center gap-5">
        <Brand />

        <nav className="flex items-center gap-1 flex-1 min-w-0">
          {PRIMARY_NAV.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} end={to === '/'}
              className={({ isActive }) => `top-nav-link${isActive ? ' active' : ''}`}>
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </NavLink>
          ))}
          <div className="relative">
            <button onClick={() => setMoreOpen(p => !p)} className="top-nav-link">
              <SlidersHorizontal className="w-4 h-4" />
              <span>More</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            {moreOpen && (
              <div className="absolute right-0 top-11 w-64 rounded-xl border border-slate-200 bg-white shadow-xl p-2">
                {SECONDARY_NAV.map(({ to, icon: Icon, label }) => (
                  <NavLink key={to} to={to} onClick={() => setMoreOpen(false)}
                    className={({ isActive }) => `more-nav-link${isActive ? ' active' : ''}`}>
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className="hidden xl:flex items-center rounded-full bg-teal-50 px-3 py-1 text-xs font-black text-teal-800">
          Sustainability Data Trust
        </div>
      </div>
    </header>
  )
}

function EnviroAgent({ shellContext }) {
  const location = useLocation()
  const page = PAGE_TITLES[location.pathname] || 'Application'
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'agent',
      text: 'Ask me about trust scores, ESG evidence, EUDR gaps, supplier risks, or how to explain a result to an auditor.',
    },
  ])

  const quickPrompts = useMemo(() => [
    'Explain the current trust score logic',
    'What evidence should an auditor see?',
    'How can I improve supplier data quality?',
  ], [])

  const ask = async (text = input) => {
    const question = text.trim()
    if (!question || loading) return
    setInput('')
    setMessages(prev => [...prev, { role:'user', text:question }])
    setLoading(true)
    try {
      const response = await askEnviroAgent({
        message: question,
        page,
        context: { ...shellContext, route: location.pathname },
      })
      setMessages(prev => [...prev, { role:'agent', text:response.data.answer }])
    } catch {
      setMessages(prev => [...prev, {
        role:'agent',
        text:'I could not reach EnviroAgent right now. Please check the backend connection and try again.',
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {open && (
        <section className="fixed bottom-24 right-6 z-40 w-[390px] max-w-[calc(100vw-2rem)] rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
          <button onClick={() => setOpen(false)}
            className="absolute right-3 top-3 z-10 h-8 w-8 rounded-full bg-white text-slate-500 shadow-sm border border-slate-200 hover:bg-slate-50 hover:text-slate-900 flex items-center justify-center"
            aria-label="Close EnviroAgent">
            <X className="w-4 h-4" />
          </button>
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-950 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-500 flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm">EnviroAgent</div>
                <div className="text-[11px] text-slate-300">{page} context enabled</div>
              </div>
            </div>
            <div className="w-9" />
          </div>

          <div className="h-[380px] overflow-y-auto p-4 space-y-3 bg-slate-50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[84%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-slate-900 text-white rounded-br-md'
                    : 'bg-white text-slate-700 border border-slate-200 rounded-bl-md'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Loader className="w-4 h-4 animate-spin" /> EnviroAgent is checking the evidence...
              </div>
            )}
          </div>

          <div className="p-3 border-t border-slate-100 bg-white">
            <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
              {quickPrompts.map(prompt => (
                <button key={prompt} onClick={() => ask(prompt)}
                  className="whitespace-nowrap rounded-full border border-slate-200 px-3 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-50">
                  {prompt}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && ask()}
                placeholder="Ask about ESG trust, evidence, or compliance..."
                className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-300" />
              <button onClick={() => ask()} disabled={loading || !input.trim()}
                className="h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center disabled:opacity-40">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      )}

      {!open && (
        <button onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-40 h-14 px-5 rounded-2xl bg-slate-950 hover:bg-slate-800 text-white shadow-2xl flex items-center gap-3 font-bold">
          <Sparkles className="w-5 h-5 text-teal-300" />
          <span className="hidden sm:inline">Ask EnviroAgent</span>
          <MessageSquare className="w-5 h-5" />
        </button>
      )}
    </>
  )
}

function AppShell() {
  const location = useLocation()
  const [shellContext, setShellContext] = useState({
    platform: 'EnvirozoneAI Data Intelligence',
  })
  const page = PAGE_TITLES[location.pathname] || 'EnvirozoneAI'

  return (
    <div className="min-h-screen bg-[#f6f7f4] text-slate-900">
      <TopNav shellContext={shellContext} setShellContext={setShellContext} />
      <main className="mx-auto w-full max-w-[1540px] px-6 py-7">
        <div className="mb-7">
          <div className="flex items-center gap-3 text-[11px] font-black tracking-[0.18em] uppercase text-slate-500">
            <span className="h-px w-8 bg-slate-300" />
            <span>AI Sustainability Intelligence</span>
          </div>
          <h1 className="mt-3 text-[34px] font-black tracking-normal text-slate-950">{page}</h1>
        </div>

        <Routes>
          <Route path="/"               element={<Dashboard />} />
          <Route path="/suppliers"      element={<SupplierPortal />} />
          <Route path="/documents"      element={<DocumentVault />} />
          <Route path="/authenticate"   element={<AuthenticationCentre />} />
          <Route path="/history"        element={<ProcessingHistory />} />
          <Route path="/lineage"        element={<DataLineage />} />
          <Route path="/quality"        element={<DataQuality />} />
          <Route path="/explainability" element={<AIExplainability />} />
          <Route path="/audit"          element={<AuditTrail />} />
          <Route path="/georisk"        element={<GeoRiskMap />} />
          <Route path="/eudr"           element={<EUDRCompliance />} />
          <Route path="/carbon"         element={<CarbonCalculator />} />
          <Route path="/benchmark"      element={<BenchmarkComparison />} />
          <Route path="/news"           element={<ESGNewsFeed />} />
          <Route path="/reporting"      element={<ReportingHub />} />
        </Routes>
      </main>
      <EnviroAgent shellContext={shellContext} />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  )
}
