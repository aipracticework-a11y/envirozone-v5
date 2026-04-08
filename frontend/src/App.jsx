import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Truck, FolderOpen, GitBranch, ShieldCheck,
  Brain, ClipboardList, Globe, CheckSquare, Calculator,
  BarChart3, Newspaper, FileBarChart2, Lock, History
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

const NAV = [
  { to:'/',              icon:LayoutDashboard, label:'Dashboard',             section:'platform' },
  { to:'/suppliers',     icon:Truck,           label:'Supplier Portal',    section:'workflow' },
  { to:'/documents',     icon:FolderOpen,      label:'Upload & Verify',    section:'workflow' },
  { to:'/authenticate',  icon:Lock,            label:'Authentication',     section:'workflow' },
  { to:'/history',       icon:History,         label:'Processing History', section:'workflow' },
  { to:'/lineage',       icon:GitBranch,       label:'Data Lineage',       section:'workflow' },
  { to:'/quality',       icon:ShieldCheck,     label:'Data Quality',       section:'workflow' },
  { to:'/explainability',icon:Brain,           label:'AI Explainability',  section:'workflow' },
  { to:'/audit',         icon:ClipboardList,   label:'Audit Trail',        section:'workflow' },
  { to:'/georisk',       icon:Globe,           label:'Geo Risk Map',       section:'intelligence' },
  { to:'/eudr',          icon:CheckSquare,     label:'EUDR Compliance',   section:'intelligence' },
  { to:'/carbon',        icon:Calculator,      label:'Carbon Calculator', section:'intelligence' },
  { to:'/benchmark',     icon:BarChart3,       label:'Benchmark',         section:'intelligence' },
  { to:'/news',          icon:Newspaper,       label:'ESG News',          section:'intelligence' },
  { to:'/reporting',     icon:FileBarChart2,   label:'Reporting Hub',     section:'reporting'    },
]

const SECTION_LABELS = {
  platform:'Platform', workflow:'ESG Workflow',
  intelligence:'Intelligence', reporting:'Reporting',
}

function TCSLogo() {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
          <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 6-8 6l-1-1c4-4 7-5 7-5C16 1 9 5 9 12l-1.5 4.5L5 22"/>
        </svg>
      </div>
      <div>
        <div>
  {/* <div className="leading-tight">
    <span className="text-white font-black text-sm tracking-tight">TCS Envirozone</span>
    <sup className="text-green-400 font-black text-xs">AI</sup>
    <span className="text-white font-black text-sm"> 4.0</span>
  </div>
  <div className="text-slate-400 text-xs">Data Intelligence</div> */}

  {/* NEW LOGO */}
  <div className="leading-tight">
    <span className="text-green-400 font-black text-sm tracking-tight">ESG</span>
    <span className="text-white font-black text-sm"> Data Intelligence</span>
  </div>
  <div className="text-slate-400 text-xs">Powered by TCS</div>
</div>
      </div>
    </div>
  )
}

function Sidebar() {
  const grouped = NAV.reduce((acc, item) => {
    if (!acc[item.section]) acc[item.section] = []
    acc[item.section].push(item)
    return acc
  }, {})
  return (
    <div className="w-64 h-screen bg-[#0a1628] flex flex-col fixed left-0 top-0 z-10 overflow-y-auto">
      <div className="p-5 border-b border-white/10"><TCSLogo /></div>
      <nav className="flex-1 p-3 space-y-4">
        {Object.entries(grouped).map(([section, items]) => (
          <div key={section}>
            <div className="text-xs text-slate-500 uppercase font-semibold px-3 mb-1">{SECTION_LABELS[section]}</div>
            <div className="space-y-0.5">
              {items.map(({ to, icon: Icon, label }) => (
                <NavLink key={to} to={to} end={to === '/'}
                  className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs">{label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
      <div className="p-4 border-t border-white/10 text-xs text-slate-500 text-center">© 2025 TCS EnvirozoneAI v5.0</div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex">
        <Sidebar />
        <main className="ml-64 flex-1 min-h-screen bg-slate-50 p-8">
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
      </div>
    </BrowserRouter>
  )
}
