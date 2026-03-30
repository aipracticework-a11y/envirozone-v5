import { useEffect, useState } from 'react'
import { getDataSources, getAnomalies, getQualityRules, getQualityTrend, analyzeAnomaly, resolveAnomaly } from '../api/client'
import { ShieldCheck, AlertTriangle, TrendingUp, Loader } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const STATUS_DOT = { green:'bg-green-500', amber:'bg-amber-500', red:'bg-red-500' }
const STATUS_BG  = { green:'bg-green-50 border-green-200', amber:'bg-amber-50 border-amber-200', red:'bg-red-50 border-red-200' }
const SEV_BADGE  = { high:'badge-red', medium:'badge-amber', low:'badge-gray' }

export default function DataQuality() {
  const [sources, setSources]     = useState([])
  const [anomalies, setAnomalies] = useState([])
  const [rules, setRules]         = useState([])
  const [trend, setTrend]         = useState([])
  const [aiMap, setAiMap]         = useState({})
  const [loadingAI, setLoadingAI] = useState({})
  const [resolving, setResolving] = useState({})
  const [loading, setLoading]     = useState(true)
  const [summary, setSummary]     = useState({})
  const [toast, setToast]         = useState('')

  useEffect(() => {
    Promise.all([getDataSources(), getAnomalies(), getQualityRules(), getQualityTrend()]).then(([s,a,r,t]) => {
      setSources(s.data.sources); setSummary(s.data.summary)
      setAnomalies(a.data.anomalies); setRules(r.data.rules); setTrend(t.data.trend)
      setLoading(false)
    })
  }, [])

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const handleAnalyze = (id) => {
    setLoadingAI(p => ({ ...p, [id]: true }))
    analyzeAnomaly(id).then(r => {
      setAiMap(p => ({ ...p, [id]: r.data.ai_analysis }))
      setLoadingAI(p => ({ ...p, [id]: false }))
    })
  }

  const handleResolve = async (id, status) => {
    setResolving(p => ({ ...p, [id]: true }))
    try {
      await resolveAnomaly(id, { status, note: 'Resolved by analyst' })
      setAnomalies(prev => prev.map(a => a.id === id ? { ...a, status } : a))
      showToast('Anomaly marked as ' + status)
    } finally {
      setResolving(p => ({ ...p, [id]: false }))
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-slate-400">Loading...</div>

  return (
    <div className="space-y-6">
      {toast && <div className="fixed top-4 right-4 bg-green-600 text-white px-5 py-3 rounded-xl shadow-lg z-50 font-medium">{toast}</div>}

      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-green-500" /> Data Quality Monitor
        </h1>
        <p className="text-slate-500 mt-1">Real-time validation, anomaly detection and quality scoring</p>
      </div>

      {/* Traffic lights */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="card bg-green-50 border-green-200">
          <div className="text-3xl font-bold text-green-600">{summary.green}</div>
          <div className="text-sm text-green-700 font-medium mt-1">🟢 Passed</div>
        </div>
        <div className="card bg-amber-50 border-amber-200">
          <div className="text-3xl font-bold text-amber-600">{summary.amber}</div>
          <div className="text-sm text-amber-700 font-medium mt-1">🟡 Warnings</div>
        </div>
        <div className="card bg-red-50 border-red-200">
          <div className="text-3xl font-bold text-red-600">{summary.red}</div>
          <div className="text-sm text-red-700 font-medium mt-1">🔴 Critical</div>
        </div>
      </div>

      {/* Data Sources */}
      <div className="card">
        <h2 className="font-semibold text-slate-700 mb-4">Data Source Status</h2>
        <div className="space-y-3">
          {sources.map(s => (
            <div key={s.id} className={`flex items-center justify-between p-4 rounded-xl border ${STATUS_BG[s.status]}`}>
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${STATUS_DOT[s.status]}`} />
                <div>
                  <div className="font-medium text-slate-800">{s.name}</div>
                  <div className="text-xs text-slate-500">{s.scope} · {s.records.toLocaleString()} records</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {s.issues > 0 && <span className="badge-red">{s.issues} issues</span>}
                <div className="text-right">
                  <div className="font-bold text-slate-800">{s.quality_score}</div>
                  <div className="text-xs text-slate-400">quality score</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Anomalies */}
      <div className="card">
        <h2 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-500" /> Active Anomalies
        </h2>
        <div className="space-y-4">
          {anomalies.map(a => (
            <div key={a.id} className="border rounded-xl p-4 hover:shadow-sm transition-all">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={SEV_BADGE[a.severity]}>{a.severity}</span>
                    <span className="text-xs text-slate-400">{a.type.replace('_', ' ')}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${a.status === 'open' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                      {a.status}
                    </span>
                  </div>
                  <div className="font-medium text-slate-800">{a.description}</div>
                  <div className="text-xs text-slate-400 mt-1">{a.source} · {new Date(a.detected_at).toLocaleString()}</div>
                </div>
                <div className="flex gap-2 ml-4 flex-shrink-0 flex-wrap justify-end">
                  <button
                    onClick={() => handleAnalyze(a.id)}
                    disabled={loadingAI[a.id]}
                    className="bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-purple-200 disabled:opacity-50 flex items-center gap-1">
                    {loadingAI[a.id] ? <><Loader className="w-3 h-3 animate-spin" />Analyzing</> : '🤖 Analyze'}
                  </button>
                  {a.status === 'open' && (
                    <button
                      onClick={() => handleResolve(a.id, 'resolved')}
                      disabled={resolving[a.id]}
                      className="bg-green-100 text-green-700 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-green-200 disabled:opacity-50">
                      ✅ Resolve
                    </button>
                  )}
                  {a.status === 'open' && (
                    <button
                      onClick={() => handleResolve(a.id, 'false_positive')}
                      disabled={resolving[a.id]}
                      className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-slate-200">
                      False +ve
                    </button>
                  )}
                </div>
              </div>
              {aiMap[a.id] && (
                <div className="mt-3 bg-purple-50 border border-purple-200 p-3 rounded-lg text-sm text-slate-700">
                  <strong className="text-purple-700">AI Analysis: </strong>{aiMap[a.id]}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Trend + Rules */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Quality Score Trend (6 months)
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis domain={[60, 100]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="quality_score" stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} name="Quality Score" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h2 className="font-semibold text-slate-700 mb-4">Validation Rules</h2>
          <div className="space-y-2">
            {rules.map(r => (
              <div key={r.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <span className="text-lg">{r.status === 'pass' ? '✅' : r.status === 'fail' ? '❌' : '⚠️'}</span>
                <div>
                  <div className="text-sm font-medium text-slate-800">{r.name}</div>
                  <div className="text-xs text-slate-400">{r.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
