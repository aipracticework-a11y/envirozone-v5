import { useEffect, useState } from 'react'
import { getDashboard } from '../api/client'
import { TrendingUp, AlertTriangle, CheckCircle, Clock, Users, Activity } from 'lucide-react'

function ScoreCard({ label, score, color }) {
  const colors = { green: 'bg-green-500', blue: 'bg-blue-500', purple: 'bg-purple-500', orange: 'bg-orange-500' }
  return (
    <div className="card flex items-center gap-5">
      <div className={`w-16 h-16 rounded-full ${colors[color]} flex items-center justify-center text-white font-bold text-xl flex-shrink-0`}>
        {score}
      </div>
      <div>
        <div className="text-sm text-slate-500 font-medium">{label}</div>
        <div className="text-2xl font-bold text-slate-800">{score}<span className="text-base font-normal text-slate-400">/100</span></div>
      </div>
    </div>
  )
}

function AlertItem({ alert }) {
  const colors = { high: 'border-l-red-500 bg-red-50', medium: 'border-l-amber-500 bg-amber-50', low: 'border-l-blue-500 bg-blue-50' }
  const icons = { high: <AlertTriangle className="w-4 h-4 text-red-500" />, medium: <Clock className="w-4 h-4 text-amber-500" />, low: <CheckCircle className="w-4 h-4 text-blue-500" /> }
  return (
    <div className={`border-l-4 p-3 rounded-r-lg ${colors[alert.severity]}`}>
      <div className="flex items-start gap-2">
        {icons[alert.severity]}
        <div>
          <p className="text-sm font-medium text-slate-700">{alert.message}</p>
          <p className="text-xs text-slate-400 mt-1">{alert.time}</p>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboard().then(r => { setData(r.data); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center h-64 text-slate-400">Loading dashboard...</div>
  if (!data) return <div className="text-red-500">Failed to load. Make sure the backend is running on port 8000.</div>

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">EnvirozoneAI Data Intelligence</h1>
        <p className="text-slate-500 mt-1">ESG Supply Chain Trust & Governance Platform | Powered by TCS</p>
      </div>

      {/* Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        <ScoreCard label="Overall Trust Score"    score={data.trust_score}         color="green" />
        <ScoreCard label="Data Quality Score"     score={data.data_quality_score}  color="blue" />
        <ScoreCard label="Audit Readiness"        score={data.audit_readiness_score} color="purple" />
        <ScoreCard label="AI Confidence Score"    score={data.ai_confidence_score} color="orange" />
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-5">
        <div className="card text-center">
          <Users className="w-7 h-7 text-green-500 mx-auto mb-2" />
          <div className="text-3xl font-bold text-slate-800">{data.total_suppliers}</div>
          <div className="text-sm text-slate-500">Active Suppliers</div>
        </div>
        <div className="card text-center">
          <AlertTriangle className="w-7 h-7 text-red-500 mx-auto mb-2" />
          <div className="text-3xl font-bold text-slate-800">{data.active_anomalies}</div>
          <div className="text-sm text-slate-500">Active Anomalies</div>
        </div>
        <div className="card text-center">
          <Activity className="w-7 h-7 text-amber-500 mx-auto mb-2" />
          <div className="text-3xl font-bold text-slate-800">{data.pending_approvals}</div>
          <div className="text-sm text-slate-500">Pending Approvals</div>
        </div>
      </div>

      {/* Module Cards */}
      <div>
        <h2 className="text-lg font-semibold text-slate-700 mb-4">Platform Modules</h2>
        <div className="grid grid-cols-2 xl:grid-cols-3 gap-5">
          {[
            { title: 'Data Lineage', desc: 'Trace data from source to report', link: '/lineage', color: 'bg-blue-50 border-blue-200', icon: '🔗' },
            { title: 'AI Explainability', desc: 'Understand every AI decision', link: '/explainability', color: 'bg-purple-50 border-purple-200', icon: '🤖' },
            { title: 'Data Quality', desc: 'Monitor anomalies & validation', link: '/quality', color: 'bg-red-50 border-red-200', icon: '✅' },
            { title: 'Audit Trail', desc: 'Full chronological change log', link: '/audit', color: 'bg-green-50 border-green-200', icon: '📋' },
            { title: 'Supplier Portal', desc: 'Manage & score suppliers', link: '/suppliers', color: 'bg-amber-50 border-amber-200', icon: '🏭' },
            { title: 'Reporting Hub', desc: 'CSRD & SEC ready reports', link: '/reporting', color: 'bg-teal-50 border-teal-200', icon: '📄' },
          ].map(m => (
            <a href={m.link} key={m.title} className={`border rounded-xl p-5 ${m.color} hover:shadow-md transition-all cursor-pointer block`}>
              <div className="text-3xl mb-2">{m.icon}</div>
              <div className="font-semibold text-slate-800">{m.title}</div>
              <div className="text-sm text-slate-500 mt-1">{m.desc}</div>
            </a>
          ))}
        </div>
      </div>

      {/* Alerts */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <h2 className="font-semibold text-slate-700">Recent Alerts</h2>
        </div>
        <div className="space-y-3">
          {data.recent_alerts.map(a => <AlertItem key={a.id} alert={a} />)}
        </div>
      </div>

      <p className="text-xs text-slate-400">Last updated: {new Date(data.last_updated).toLocaleString()}</p>
    </div>
  )
}
