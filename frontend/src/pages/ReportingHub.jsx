import { useEffect, useState } from 'react'
import { getControls, getEmissions, getAIReadiness, generateReport } from '../api/client'
import { FileBarChart2, Loader, TrendingUp, TrendingDown } from 'lucide-react'

export default function ReportingHub() {
  const [controls, setControls] = useState([])
  const [score, setScore] = useState(0)
  const [emissions, setEmissions] = useState(null)
  const [readiness, setReadiness] = useState(null)
  const [report, setReport] = useState(null)
  const [framework, setFramework] = useState('CSRD')
  const [loadingReport, setLoadingReport] = useState(false)
  const [loadingReadiness, setLoadingReadiness] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getControls(), getEmissions()]).then(([c, e]) => {
      setControls(c.data.controls); setScore(c.data.assurance_score); setEmissions(e.data); setLoading(false)
    })
  }, [])

  const handleReadiness = () => {
    setLoadingReadiness(true)
    getAIReadiness().then(r => { setReadiness(r.data); setLoadingReadiness(false) })
  }

  const handleGenerate = () => {
    setLoadingReport(true)
    generateReport(framework).then(r => { setReport(r.data); setLoadingReport(false) })
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-slate-400">Loading...</div>

  const ScoreGauge = () => (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-36 h-36">
        <svg viewBox="0 0 36 36" className="w-36 h-36 -rotate-90">
          <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="3" />
          <circle cx="18" cy="18" r="15.9" fill="none" stroke={score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444'} strokeWidth="3"
            strokeDasharray={`${score} ${100 - score}`} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-slate-800">{score}</span>
          <span className="text-xs text-slate-400">/ 100</span>
        </div>
      </div>
      <div className="text-sm font-medium text-slate-600 mt-2">Assurance Score</div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><FileBarChart2 className="w-6 h-6 text-teal-500" /> Assurance & Reporting Hub</h1>
        <p className="text-slate-500 mt-1">CSRD, SEC Climate & GRI ready disclosures with full assurance controls</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Score Gauge */}
        <div className="card flex items-center justify-center"><ScoreGauge /></div>

        {/* Emissions Summary */}
        {emissions && (
          <div className="card xl:col-span-2">
            <h2 className="font-semibold text-slate-700 mb-4">Emissions Summary — {emissions.reporting_period}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['scope1','scope2','scope3','total'].map(key => (
                <div key={key} className="bg-slate-50 p-4 rounded-xl text-center">
                  <div className="text-xs text-slate-400 font-medium uppercase mb-1">{key === 'total' ? 'Total' : key.replace('scope', 'Scope ')}</div>
                  <div className="text-xl font-bold text-slate-800">{emissions[key].value.toLocaleString()}</div>
                  <div className="text-xs text-slate-400">{emissions[key].unit}</div>
                  <div className={`text-xs font-medium mt-1 flex items-center justify-center gap-1 ${emissions[key].trend === 'down' ? 'text-green-600' : 'text-red-500'}`}>
                    {emissions[key].trend === 'down' ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                    {emissions[key].change}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Controls Checklist */}
      <div className="card">
        <h2 className="font-semibold text-slate-700 mb-4">Assurance Controls Checklist</h2>
        <div className="space-y-3">
          {controls.map(c => (
            <div key={c.id} className={`flex items-start gap-4 p-4 rounded-xl border ${c.status === 'pass' ? 'bg-green-50 border-green-200' : c.status === 'fail' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
              <span className="text-2xl flex-shrink-0">{c.status === 'pass' ? '✅' : c.status === 'fail' ? '❌' : '⚠️'}</span>
              <div className="flex-1">
                <div className="font-medium text-slate-800">{c.name}</div>
                <div className="text-sm text-slate-500">{c.description}</div>
                {c.gap && <div className="text-sm text-red-600 font-medium mt-1">Gap: {c.gap}</div>}
              </div>
              <div className="text-sm font-medium text-slate-500 flex-shrink-0">Weight: {c.weight}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Readiness + Report Generator */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-semibold text-slate-700 mb-3">AI Readiness Assessment</h2>
          <p className="text-sm text-slate-500 mb-4">Get AI-powered recommendations to close gaps and reach full CSRD readiness.</p>
          <button onClick={handleReadiness} disabled={loadingReadiness} className="w-full bg-purple-600 text-white py-2 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2">
            {loadingReadiness ? <><Loader className="w-4 h-4 animate-spin" /> Analyzing...</> : '🤖 Run AI Readiness Check'}
          </button>
          {readiness && (
            <div className="mt-4 bg-purple-50 border border-purple-200 p-4 rounded-xl space-y-2">
              <div className="font-semibold text-purple-700">Recommendations</div>
              <p className="text-sm text-slate-700">{readiness.ai_recommendations}</p>
              <div className="text-xs text-slate-400">Estimated readiness date: <strong>{readiness.estimated_readiness_date}</strong></div>
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="font-semibold text-slate-700 mb-3">Generate Disclosure Report</h2>
          <div className="flex gap-3 mb-4">
            {['CSRD', 'SEC Climate', 'GRI Standards', 'TCFD'].map(f => (
              <button key={f} onClick={() => setFramework(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${framework === f ? 'bg-teal-600 text-white border-teal-600' : 'text-slate-600 border-slate-300 hover:border-teal-400'}`}>{f}</button>
            ))}
          </div>
          <button onClick={handleGenerate} disabled={loadingReport} className="w-full bg-teal-600 text-white py-2 rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50 flex items-center justify-center gap-2">
            {loadingReport ? <><Loader className="w-4 h-4 animate-spin" /> Generating...</> : `📄 Generate ${framework} Report`}
          </button>
          {report && (
            <div className="mt-4 bg-teal-50 border border-teal-200 p-4 rounded-xl">
              <div className="font-semibold text-teal-700 mb-2">{report.framework} — {report.period}</div>
              <p className="text-sm text-slate-700">{report.report_summary}</p>
              <div className="text-xs text-slate-400 mt-2">Generated: {new Date(report.generated_at).toLocaleString()}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
