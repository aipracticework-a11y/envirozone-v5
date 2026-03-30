import { useEffect, useState } from 'react'
import { getEstimates, getModels, explainEstimate, semanticSearch } from '../api/client'
import { Brain, Search, Loader, X, CheckCircle, AlertCircle } from 'lucide-react'

function ConfidenceBar({ value }) {
  const color = value >= 90 ? 'bg-green-500' : value >= 75 ? 'bg-amber-500' : 'bg-red-500'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-slate-200 rounded-full h-2">
        <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-sm font-bold text-slate-700">{value}%</span>
    </div>
  )
}

function ExplainPanel({ estimate, onClose }) {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    explainEstimate(estimate.id).then(r => { setResult(r.data); setLoading(false) })
  }, [estimate.id])

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b bg-[#0f2340] rounded-t-2xl">
          <h3 className="font-bold text-white text-lg">🤖 AI Explanation</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-white" /></button>
        </div>
        {loading ? <div className="p-8 text-center text-slate-400"><Loader className="w-8 h-8 animate-spin mx-auto mb-3" />Generating AI explanation...</div> : result && (
          <div className="p-6 space-y-5">
            <div>
              <h4 className="font-bold text-slate-800 text-xl">{result.estimate.metric}</h4>
              <p className="text-3xl font-bold text-green-600 mt-1">{result.estimate.value} <span className="text-lg text-slate-400">{result.estimate.unit}</span></p>
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-600 mb-2">Model Confidence</div>
              <ConfidenceBar value={result.estimate.confidence} />
            </div>
            <div className="bg-purple-50 border border-purple-200 p-4 rounded-xl">
              <div className="font-semibold text-purple-800 mb-2">🤖 Why did the AI give this result?</div>
              <p className="text-sm text-slate-700 leading-relaxed">{result.ai_explanation}</p>
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-600 mb-2">Contributing Factors</div>
              {result.estimate.factors.map((f, i) => (
                <div key={i} className="flex items-center gap-2 py-2 border-b last:border-0">
                  <div className="w-3 h-3 rounded-full bg-blue-400 flex-shrink-0" />
                  <span className="text-sm text-slate-700">{f}</span>
                </div>
              ))}
            </div>
            <div className="bg-slate-50 p-4 rounded-xl text-sm space-y-2">
              <div className="font-semibold text-slate-600">Model Details</div>
              <div className="flex gap-2"><span className="text-slate-400">Model:</span><span className="font-medium">{result.estimate.model}</span></div>
              <div className="flex gap-2"><span className="text-slate-400">Data Sources:</span><span className="font-medium">{result.estimate.data_sources.join(', ')}</span></div>
              <div className="flex gap-2"><span className="text-slate-400">Generated:</span><span>{new Date(result.estimate.generated_at).toLocaleString()}</span></div>
            </div>
            <div className={`flex items-center gap-2 p-3 rounded-xl ${result.audit_ready ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
              {result.audit_ready ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <span className="font-medium text-sm">{result.audit_ready ? 'Audit Ready — Confidence above 80%' : 'Review Required — Confidence below 80%'}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function AIExplainability() {
  const [estimates, setEstimates] = useState([])
  const [models, setModels] = useState([])
  const [selected, setSelected] = useState(null)
  const [query, setQuery] = useState('')
  const [searchResult, setSearchResult] = useState(null)
  const [searching, setSearching] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getEstimates(), getModels()]).then(([e, m]) => {
      setEstimates(e.data.estimates); setModels(m.data.models); setLoading(false)
    })
  }, [])

  const handleSearch = () => {
    if (!query.trim()) return
    setSearching(true)
    semanticSearch(query).then(r => { setSearchResult(r.data); setSearching(false) })
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-slate-400">Loading...</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><Brain className="w-6 h-6 text-purple-500" /> AI Explainability & Model Transparency</h1>
        <p className="text-slate-500 mt-1">Understand every AI-generated estimate, score and forecast</p>
      </div>

      {/* Semantic Search */}
      <div className="card">
        <h2 className="font-semibold text-slate-700 mb-3 flex items-center gap-2"><Search className="w-4 h-4" /> Ask the ESG Knowledge Base</h2>
        <div className="flex gap-3">
          <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="e.g. What is Scope 3 Category 11? How is supplier risk calculated?"
            className="flex-1 border border-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
          <button onClick={handleSearch} disabled={searching} className="bg-purple-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2">
            {searching ? <Loader className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />} Ask AI
          </button>
        </div>
        {searchResult && (
          <div className="mt-4 space-y-3">
            <div className="bg-purple-50 border border-purple-200 p-4 rounded-xl">
              <div className="font-semibold text-purple-700 text-sm mb-1">🤖 AI Answer</div>
              <p className="text-sm text-slate-700">{searchResult.ai_answer}</p>
            </div>
            {searchResult.knowledge_results?.map((r, i) => (
              <div key={i} className="bg-slate-50 p-3 rounded-lg text-sm">
                <span className="badge-blue mr-2">{r.category}</span>
                <span className="text-slate-600">{r.text}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Estimates Table */}
      <div className="card">
        <h2 className="font-semibold text-slate-700 mb-4">AI-Generated Estimates — Click "Explain" to see why</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-slate-400 text-left">
              <th className="pb-3 pr-4">Metric</th><th className="pb-3 pr-4">Value</th><th className="pb-3 pr-4">Model</th><th className="pb-3 pr-4 w-40">Confidence</th><th className="pb-3">Action</th>
            </tr></thead>
            <tbody>
              {estimates.map(e => (
                <tr key={e.id} className="border-b last:border-0 hover:bg-slate-50">
                  <td className="py-3 pr-4 font-medium text-slate-800">{e.metric}</td>
                  <td className="py-3 pr-4 font-bold text-green-700">{e.value} <span className="text-xs text-slate-400">{e.unit}</span></td>
                  <td className="py-3 pr-4 text-slate-500 text-xs">{e.model}</td>
                  <td className="py-3 pr-4 w-40"><ConfidenceBar value={e.confidence} /></td>
                  <td className="py-3">
                    <button onClick={() => setSelected(e)} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-lg text-xs font-semibold hover:bg-purple-200">Explain →</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Model Registry */}
      <div className="card">
        <h2 className="font-semibold text-slate-700 mb-4">AI Model Registry</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {models.map(m => (
            <div key={m.id} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold text-slate-800">{m.name}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{m.version} · {m.type}</div>
                </div>
                <span className="badge-green">{m.status}</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">{m.description}</p>
              <div className="mt-3 pt-3 border-t flex justify-between text-xs text-slate-500">
                <span>Accuracy: <strong className="text-green-600">{m.accuracy}%</strong></span>
                <span>Trained: {m.last_trained}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selected && <ExplainPanel estimate={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
