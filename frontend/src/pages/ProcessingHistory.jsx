import { useEffect, useState } from 'react'
import { History, FileText, CheckCircle, XCircle, AlertTriangle, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react'
import axios from 'axios'

const API = axios.create({ baseURL: 'http://localhost:8001', timeout: 30000 })

const TRUST_COLOR = (t) => t >= 80 ? 'text-green-600' : t >= 60 ? 'text-amber-600' : 'text-red-600'
const TRUST_BG    = (t) => t >= 80 ? 'bg-green-50 border-green-200' : t >= 60 ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'
const STATUS_ICON = (s) => s === 'authenticated'
  ? <CheckCircle className="w-5 h-5 text-green-500" />
  : s === 'partial'
  ? <AlertTriangle className="w-5 h-5 text-amber-500" />
  : <XCircle className="w-5 h-5 text-red-500" />

export default function ProcessingHistory() {
  const [uploads, setUploads]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [filter, setFilter]     = useState('all')

  const load = () => {
    setLoading(true)
    API.get('/api/files/history').then(r => {
      setUploads(r.data.uploads || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const filtered = filter === 'all' ? uploads
    : uploads.filter(u => u.auth_status === filter)

  const stats = {
    total:         uploads.length,
    authenticated: uploads.filter(u => u.auth_status === 'authenticated').length,
    partial:       uploads.filter(u => u.auth_status === 'partial').length,
    failed:        uploads.filter(u => u.auth_status === 'failed').length,
    avg_trust:     uploads.length > 0 ? Math.round(uploads.reduce((s,u) => s + u.trust_score, 0) / uploads.length) : 0,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <History className="w-6 h-6 text-blue-500" /> File Processing History
          </h1>
          <p className="text-slate-500 mt-1">All uploaded supplier files with authentication results — persisted in database</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-200">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4 text-center">
        {[
          { label:'Total Files',     value:stats.total,         color:'text-slate-800' },
          { label:'Authenticated',   value:stats.authenticated, color:'text-green-600' },
          { label:'Partial',         value:stats.partial,       color:'text-amber-600' },
          { label:'Failed',          value:stats.failed,        color:'text-red-600'   },
          { label:'Avg Trust Score', value:stats.avg_trust,     color:'text-blue-600'  },
        ].map(s => (
          <div key={s.label} className="card">
            <div className={`text-3xl font-bold ${s.color}`}>{s.value}{s.label.includes('Score') ? '/100' : ''}</div>
            <div className="text-xs text-slate-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {['all','authenticated','partial','failed'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${filter === f ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300'}`}>
            {f === 'all' ? 'All Files' : f}
          </button>
        ))}
      </div>

      {/* File List */}
      {loading ? (
        <div className="flex items-center justify-center h-40 text-slate-400">Loading history...</div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-16">
          <History className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <div className="text-slate-400 font-medium text-lg">No files processed yet</div>
          <div className="text-slate-300 text-sm mt-2">Upload supplier files in the Upload & Verify screen to see history here</div>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(upload => (
            <div key={upload.id} className={`border rounded-2xl overflow-hidden transition-all ${TRUST_BG(upload.trust_score)}`}>
              {/* Header Row */}
              <div className="flex items-center justify-between p-4 cursor-pointer"
                onClick={() => setExpanded(expanded === upload.id ? null : upload.id)}>
                <div className="flex items-center gap-4">
                  <FileText className="w-8 h-8 text-slate-400 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-slate-800">{upload.original_filename}</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {upload.supplier_name} · {upload.commodity || 'Unknown commodity'} ·
                      {upload.country || 'Unknown country'} ·
                      {new Date(upload.uploaded_at).toLocaleString()}
                    </div>
                    <div className="flex gap-2 mt-1">
                      {upload.rows > 0 && <span className="badge-blue">{upload.rows.toLocaleString()} rows</span>}
                      {upload.columns > 0 && <span className="badge-gray">{upload.columns} columns</span>}
                      {upload.completeness > 0 && <span className="badge-green">{upload.completeness}% complete</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  {STATUS_ICON(upload.auth_status)}
                  <div className="text-center">
                    <div className={`text-2xl font-black ${TRUST_COLOR(upload.trust_score)}`}>{upload.trust_score}</div>
                    <div className="text-xs text-slate-400">/100</div>
                  </div>
                  {expanded === upload.id ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                </div>
              </div>

              {/* Expanded Detail */}
              {expanded === upload.id && (
                <div className="border-t bg-white/80 p-5 space-y-4">
                  {/* AI Summary */}
                  {upload.ai_summary && (
                    <div className="bg-purple-50 border border-purple-200 p-4 rounded-xl">
                      <div className="font-semibold text-purple-700 text-sm mb-1">🤖 AI Audit Summary</div>
                      <p className="text-sm text-slate-700">{upload.ai_summary}</p>
                    </div>
                  )}

                  {/* DEFRA Result */}
                  {upload.defra_result && upload.defra_result.checks_performed > 0 && (
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
                      <div className="font-semibold text-blue-700 text-sm mb-2">
                        📊 DEFRA 2024 Verification — {upload.defra_result.checks_performed} checks
                      </div>
                      <div className="flex gap-3 text-sm mb-2">
                        <span className="badge-green">{upload.defra_result.passed} passed</span>
                        <span className="badge-amber">{upload.defra_result.warnings} warnings</span>
                        <span className="badge-red">{upload.defra_result.failed} failed</span>
                      </div>
                      {upload.defra_result.checks?.slice(0,3).map((check, i) => (
                        <div key={i} className="text-xs text-slate-600 py-0.5">→ {check.verdict}</div>
                      ))}
                    </div>
                  )}

                  {/* GFW Result */}
                  {upload.gfw_result && upload.gfw_result.status !== 'no_coordinates' && (
                    <div className={`p-4 rounded-xl border ${
                      upload.gfw_result.status === 'compliant' ? 'bg-green-50 border-green-200' :
                      upload.gfw_result.status === 'high_risk' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'
                    }`}>
                      <div className="font-semibold text-slate-700 text-sm mb-1">🌍 Global Forest Watch Verification</div>
                      <p className="text-sm text-slate-700">{upload.gfw_result.finding}</p>
                      {upload.gfw_result.gfw_data && (
                        <div className="flex gap-4 mt-2 text-xs text-slate-500">
                          <span>Alerts: {upload.gfw_result.gfw_data.alerts_count}</span>
                          <span>Area lost: {upload.gfw_result.gfw_data.area_hectares} ha</span>
                          <span>Region: {upload.gfw_result.region}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Missing Fields */}
                  {Array.isArray(upload.missing_fields) && upload.missing_fields.length > 0 && (
                    <div className="bg-red-50 border border-red-200 p-3 rounded-xl">
                      <div className="text-red-700 font-semibold text-sm mb-2">❌ Missing Required ESG Fields</div>
                      <div className="flex flex-wrap gap-1">
                        {upload.missing_fields.map(f => (
                          <span key={f} className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs">{f}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Anomalies */}
                  {Array.isArray(upload.anomalies) && upload.anomalies.length > 0 && (
                    <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl">
                      <div className="text-amber-700 font-semibold text-sm mb-2">⚠️ Anomalies Detected</div>
                      {upload.anomalies.map((a, i) => (
                        <div key={i} className="text-xs text-amber-700 py-0.5">• {a}</div>
                      ))}
                    </div>
                  )}

                  {/* File metadata */}
                  <div className="text-xs text-slate-400 flex gap-4">
                    <span>File ID: {upload.id.slice(0,8)}...</span>
                    <span>Size: {upload.file_size ? Math.round(upload.file_size/1024) + ' KB' : 'N/A'}</span>
                    <span>Processed: {new Date(upload.uploaded_at).toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
