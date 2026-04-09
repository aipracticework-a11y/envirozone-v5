import { useState, useRef } from 'react'
import { ShieldCheck, Upload, Loader, CheckCircle, XCircle, AlertTriangle, BookOpen, ExternalLink } from 'lucide-react'
import axios from 'axios'

const API = axios.create({ baseURL: 'https://envirozone-v5.onrender.com', timeout: 120000 })

const COMMODITIES = ['Palm Oil','Timber','Cocoa','Coffee','Soya','Cotton','Almonds','Barley','Energy']
const CERTIFICATIONS = ['None','RSPO Full','RSPO Partial','FSC 100%','FSC Mix','ISO 14001','Rainforest Alliance','SA8000']
const SCOPES = ['Scope 1','Scope 2','Scope 3']

const ScoreRing = ({ score, size = 'lg' }) => {
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444'
  const s = size === 'lg' ? 100 : 64
  const r = size === 'lg' ? 42 : 26
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={s} height={s}>
        <circle cx={s/2} cy={s/2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={size==='lg'?8:6} />
        <circle cx={s/2} cy={s/2} r={r} fill="none" stroke={color} strokeWidth={size==='lg'?8:6}
          strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
          transform={`rotate(-90 ${s/2} ${s/2})`} />
      </svg>
      <div className="absolute text-center">
        <div style={{ color, fontSize: size==='lg'?22:14, fontWeight:900, lineHeight:1 }}>{score}</div>
        {size==='lg' && <div style={{ fontSize:10, color:'#94a3b8' }}>/100</div>}
      </div>
    </div>
  )
}

const StatusIcon = ({ status }) => {
  if (status === 'passed' || status === 'valid' || status === 'compliant') return <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
  if (status === 'failed' || status === 'non_compliant' || status === 'no_certification') return <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
  return <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
}

const StatusBg = (status) => {
  if (['passed','valid','compliant','not_applicable'].includes(status)) return 'bg-green-50 border-green-200'
  if (['failed','non_compliant','no_certification'].includes(status)) return 'bg-red-50 border-red-200'
  return 'bg-amber-50 border-amber-200'
}

export default function AuthenticationCentre() {
  const [form, setForm] = useState({ commodity:'Palm Oil', certification:'RSPO Partial', scope:'Scope 3', country:'Indonesia', supplier_name:'' })
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [standards, setStandards] = useState(null)
  const [showStandards, setShowStandards] = useState(false)
  const [activeTab, setActiveTab] = useState('ipcc')
  const fileRef = useRef()

  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const loadStandards = async () => {
    if (!standards) {
      const r = await API.get('/api/auth/standards')
      setStandards(r.data)
    }
    setShowStandards(p => !p)
  }

  const authenticate = async () => {
    if (!file) { setError('Please upload a file to authenticate'); return }
    setLoading(true); setError(''); setResult(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('commodity', form.commodity)
      fd.append('certification', form.certification)
      fd.append('country', form.country)
      fd.append('scope', form.scope)
      fd.append('supplier_name', form.supplier_name || file.name)
      const r = await API.post('/api/auth/authenticate', fd, { headers: { 'Content-Type':'multipart/form-data' } })
      setResult(r.data)
    } catch(e) {
      setError('Authentication failed. Make sure backend is running on port 8001.')
    } finally {
      setLoading(false) }
  }

  const ts = result?.trust_score
  const layers = result?.authentication_layers

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-green-600" /> Authentication Centre
          </h1>
          <p className="text-slate-500 mt-1">
            Verify supplier data against <strong>IPCC AR6</strong>, <strong>DEFRA 2024</strong>, <strong>EUDR Article 3</strong> & <strong>GHG Protocol</strong>
          </p>
        </div>
        <button onClick={loadStandards} className="flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-200">
          <BookOpen className="w-4 h-4" /> {showStandards ? 'Hide' : 'View'} Standards
        </button>
      </div>

      {/* Standards Reference Panel */}
      {showStandards && standards && (
        <div className="card bg-blue-50 border-blue-200">
          <div className="font-semibold text-blue-800 mb-3 text-lg">📚 Authentication Standards Reference</div>
          <div className="flex gap-2 mb-4 flex-wrap">
            {['ipcc','eudr','ghg','cert'].map(t => (
              <button key={t} onClick={() => setActiveTab(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${activeTab===t ? 'bg-blue-600 text-white' : 'bg-white text-blue-700 border border-blue-200'}`}>
                {t==='ipcc'?'IPCC/DEFRA Benchmarks':t==='eudr'?'EUDR Article 3':t==='ghg'?'GHG Protocol':'Certifications'}
              </button>
            ))}
          </div>
          {activeTab === 'ipcc' && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs bg-white rounded-xl overflow-hidden">
                <thead><tr className="bg-blue-600 text-white">
                  <th className="p-2 text-left">Commodity</th>
                  <th className="p-2 text-center">Min</th>
                  <th className="p-2 text-center">Central</th>
                  <th className="p-2 text-center">Max</th>
                  <th className="p-2 text-left">Unit</th>
                  <th className="p-2 text-left">Source</th>
                </tr></thead>
                <tbody>
                  {Object.entries(standards.ipcc_emission_factors).map(([k, v]) => (
                    <tr key={k} className="border-b hover:bg-blue-50">
                      <td className="p-2 font-semibold capitalize">{k}</td>
                      <td className="p-2 text-center text-green-600">{v.min}</td>
                      <td className="p-2 text-center font-bold text-blue-700">{v.central}</td>
                      <td className="p-2 text-center text-red-600">{v.max}</td>
                      <td className="p-2 text-slate-500">{v.unit}</td>
                      <td className="p-2 text-slate-400">{v.source}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {activeTab === 'eudr' && (
            <div className="space-y-2">
              {standards.eudr_requirements.map(r => (
                <div key={r.id} className="flex gap-3 bg-white p-3 rounded-lg">
                  <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded flex-shrink-0">{r.id}</span>
                  <div>
                    <div className="font-semibold text-slate-800 text-xs">{r.article} — {r.requirement}</div>
                    <div className="text-slate-500 text-xs mt-0.5">{r.description}</div>
                  </div>
                  <span className="ml-auto text-xs text-slate-400 flex-shrink-0">{r.weight}pts</span>
                </div>
              ))}
            </div>
          )}
          {activeTab === 'ghg' && (
            <div className="space-y-3">
              {Object.entries(standards.ghg_protocol_fields).map(([scope, fields]) => (
                <div key={scope} className="bg-white p-3 rounded-lg">
                  <div className="font-semibold text-slate-700 text-sm mb-2 capitalize">{scope.replace('_',' ')}</div>
                  <div className="flex flex-wrap gap-1">
                    {fields.map(f => <span key={f} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs">{f}</span>)}
                  </div>
                </div>
              ))}
            </div>
          )}
          {activeTab === 'cert' && (
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(standards.certification_standards).filter(([k]) => k !== 'none').map(([k, v]) => (
                <div key={k} className="bg-white p-3 rounded-lg">
                  <div className="font-semibold text-slate-800 text-sm">{v.full_name}</div>
                  <div className="text-xs text-slate-500 mt-1">Applies to: {v.applicable_commodities.join(', ')}</div>
                  <div className="text-xs text-slate-500">Valid: {v.validity_years} years</div>
                  {v.verifiable_at && (
                    <a href={v.verifiable_at} target="_blank" rel="noreferrer"
                      className="text-xs text-blue-600 flex items-center gap-1 mt-1 hover:underline">
                      <ExternalLink className="w-3 h-3" /> Verify online
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Input Form */}
      <div className="card">
        <h2 className="font-semibold text-slate-700 mb-4">Configure Authentication Parameters</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-5">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Supplier Name</label>
            <input name="supplier_name" value={form.supplier_name} onChange={handle} placeholder="e.g. GreenTech Manufacturing"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Commodity</label>
            <select name="commodity" value={form.commodity} onChange={handle}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400">
              {COMMODITIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Country of Origin</label>
            <input name="country" value={form.country} onChange={handle} placeholder="e.g. Indonesia"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Certification</label>
            <select name="certification" value={form.certification} onChange={handle}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400">
              {CERTIFICATIONS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">GHG Scope</label>
            <select name="scope" value={form.scope} onChange={handle}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400">
              {SCOPES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Data File</label>
            <div onClick={() => fileRef.current.click()}
              className={`border rounded-lg px-3 py-2 text-sm cursor-pointer transition-all ${file ? 'bg-green-50 border-green-400 text-green-700' : 'border-dashed border-slate-300 text-slate-400 hover:border-green-400'}`}>
              {file ? `✅ ${file.name}` : '📁 Click to upload Excel/CSV'}
            </div>
            <input ref={fileRef} type="file" accept=".xlsx,.csv" className="hidden" onChange={e => setFile(e.target.files[0])} />
          </div>
        </div>

        <button onClick={authenticate} disabled={loading || !file}
          className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold text-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-3">
          {loading ? <><Loader className="w-5 h-5 animate-spin" /> Authenticating against IPCC, EUDR & GHG Protocol...</>
                   : <><ShieldCheck className="w-5 h-5" /> Authenticate Data</>}
        </button>

        {error && <div className="mt-3 bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-sm">❌ {error}</div>}
      </div>

      {/* Results */}
      {result && ts && layers && (
        <div className="space-y-5">
          {/* Overall Score */}
          <div className={`card border-2 ${ts.final_score>=80?'bg-green-50 border-green-300':ts.final_score>=60?'bg-amber-50 border-amber-300':'bg-red-50 border-red-300'}`}>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="text-2xl font-black text-slate-800">{ts.verdict}</div>
                <div className="text-slate-500 text-sm mt-1">{result.supplier_name} — {result.commodity} — {result.country}</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {ts.standards_used.map((s,i) => (
                    <span key={i} className="bg-white/70 text-xs text-slate-600 px-2 py-1 rounded-full border border-slate-200">{s}</span>
                  ))}
                </div>
              </div>
              <ScoreRing score={ts.final_score} size="lg" />
            </div>
          </div>

          {/* Component Score Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { key:'ipcc_emission_accuracy', label:'IPCC/DEFRA', sub:'Emission Factors', color:'text-blue-600'  },
              { key:'eudr_compliance',         label:'EUDR Art.3', sub:'Deforestation',    color:'text-green-600' },
              { key:'ghg_protocol',            label:'GHG Protocol', sub:'Completeness',   color:'text-purple-600'},
              { key:'certification_validity',  label:'Certification', sub:'Registry Check', color:'text-amber-600' },
            ].map(card => (
              <div key={card.key} className="card text-center">
                <ScoreRing score={ts.component_scores[card.key]} size="sm" />
                <div className={`font-bold text-sm mt-2 ${card.color}`}>{card.label}</div>
                <div className="text-xs text-slate-400">{card.sub}</div>
                <div className="text-xs text-slate-400 mt-1">{ts.weights[card.key]}% weight</div>
              </div>
            ))}
          </div>

          {/* AI Audit Summary */}
          <div className="card bg-purple-50 border-purple-200">
            <div className="font-semibold text-purple-700 mb-2 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Gemini AI Audit Narrative
            </div>
            <p className="text-sm text-slate-700">{result.ai_audit_summary}</p>
          </div>

          {/* Layer 1: IPCC/DEFRA */}
          <div className={`card border ${StatusBg(layers.ipcc_defra.status)}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <StatusIcon status={layers.ipcc_defra.status} />
                <div>
                  <div className="font-bold text-slate-800">Layer 1 — IPCC AR6 & DEFRA 2024 Emission Factor Validation</div>
                  <div className="text-xs text-slate-500">{layers.ipcc_defra.reference}</div>
                </div>
              </div>
              <ScoreRing score={layers.ipcc_defra.score} size="sm" />
            </div>
            {layers.ipcc_defra.benchmark && (
              <div className="bg-white/80 rounded-xl p-4 mb-3">
                <div className="text-xs font-semibold text-slate-500 uppercase mb-2">Benchmark Reference — {result.commodity}</div>
                <div className="grid grid-cols-3 gap-3 text-center text-sm">
                  <div className="bg-green-50 p-2 rounded-lg">
                    <div className="font-bold text-green-600">{layers.ipcc_defra.benchmark.min}</div>
                    <div className="text-xs text-slate-400">Min Range</div>
                  </div>
                  <div className="bg-blue-50 p-2 rounded-lg">
                    <div className="font-bold text-blue-700">{layers.ipcc_defra.benchmark.central}</div>
                    <div className="text-xs text-slate-400">Central Value</div>
                  </div>
                  <div className="bg-red-50 p-2 rounded-lg">
                    <div className="font-bold text-red-500">{layers.ipcc_defra.benchmark.max}</div>
                    <div className="text-xs text-slate-400">Max Range</div>
                  </div>
                </div>
                <div className="mt-2 text-xs text-slate-500">Unit: {layers.ipcc_defra.benchmark.unit} · Scope: {layers.ipcc_defra.benchmark.scope}</div>
                <div className="mt-1 text-xs text-slate-400 italic">{layers.ipcc_defra.benchmark.notes}</div>
              </div>
            )}
            {layers.ipcc_defra.findings?.map((f,i) => (
              <div key={i} className="text-sm text-slate-700 py-0.5">→ {f}</div>
            ))}
          </div>

          {/* Layer 2: EUDR Article 3 */}
          <div className={`card border ${StatusBg(layers.eudr_article3.status)}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <StatusIcon status={layers.eudr_article3.status} />
                <div>
                  <div className="font-bold text-slate-800">Layer 2 — EUDR Article 3 Compliance Check</div>
                  <div className="text-xs text-slate-500">{layers.eudr_article3.reference}</div>
                </div>
              </div>
              <ScoreRing score={layers.eudr_article3.score} size="sm" />
            </div>
            {layers.eudr_article3.is_eudr_regulated && (
              <>
                <div className="flex gap-4 text-sm mb-3">
                  <span className="badge-green">{layers.eudr_article3.requirements_passed} Passed</span>
                  <span className="badge-red">{layers.eudr_article3.requirements_failed} Failed</span>
                  <span className="text-xs text-slate-400">Deadline: {layers.eudr_article3.deadline}</span>
                </div>
                <div className="space-y-2">
                  {layers.eudr_article3.requirements?.map(req => (
                    <div key={req.id} className={`flex items-start gap-3 p-3 rounded-lg ${req.status==='passed'?'bg-green-50':'bg-red-50'}`}>
                      {req.status==='passed'
                        ? <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        : <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />}
                      <div className="flex-1">
                        <div className="text-xs font-bold text-slate-600">{req.article}</div>
                        <div className="text-sm font-medium text-slate-800">{req.requirement}</div>
                        <div className="text-xs text-slate-500">{req.description}</div>
                        {req.gap && <div className="text-xs text-red-600 mt-0.5 font-medium">Gap: {req.gap}</div>}
                      </div>
                      <span className="text-xs text-slate-400 flex-shrink-0">{req.weight}pts</span>
                    </div>
                  ))}
                </div>
                {layers.eudr_article3.penalty && (
                  <div className="mt-3 bg-red-50 border border-red-200 p-3 rounded-xl text-xs text-red-700">
                    ⚠️ <strong>Penalty for non-compliance:</strong> {layers.eudr_article3.penalty}
                  </div>
                )}
              </>
            )}
            {!layers.eudr_article3.is_eudr_regulated && (
              <div className="text-sm text-green-700 bg-green-50 p-3 rounded-lg">
                ✅ {layers.eudr_article3.message}
              </div>
            )}
          </div>

          {/* Layer 3: GHG Protocol */}
          <div className={`card border ${StatusBg(layers.ghg_protocol.status)}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <StatusIcon status={layers.ghg_protocol.status} />
                <div>
                  <div className="font-bold text-slate-800">Layer 3 — GHG Protocol Completeness Check</div>
                  <div className="text-xs text-slate-500">{layers.ghg_protocol.reference}</div>
                </div>
              </div>
              <ScoreRing score={layers.ghg_protocol.score} size="sm" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-semibold text-green-700 mb-2">✅ Fields Present</div>
                <div className="flex flex-wrap gap-1">
                  {layers.ghg_protocol.fields_present?.map(f => (
                    <span key={f} className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs">{f}</span>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold text-red-700 mb-2">❌ Missing Fields</div>
                <div className="flex flex-wrap gap-1">
                  {layers.ghg_protocol.fields_missing?.length > 0
                    ? layers.ghg_protocol.fields_missing.map(f => (
                        <span key={f} className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs">{f}</span>
                      ))
                    : <span className="text-xs text-green-600">No missing fields!</span>
                  }
                </div>
              </div>
            </div>
          </div>

          {/* Layer 4: Certification */}
          <div className={`card border ${StatusBg(layers.certification.status)}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <StatusIcon status={layers.certification.status} />
                <div>
                  <div className="font-bold text-slate-800">Layer 4 — Certification Registry Validation</div>
                  <div className="text-xs text-slate-500">{layers.certification.reference}</div>
                </div>
              </div>
              <ScoreRing score={layers.certification.score} size="sm" />
            </div>
            <div className="space-y-2">
              {layers.certification.findings?.map((f,i) => (
                <div key={i} className="text-sm text-slate-700 flex items-start gap-2">
                  <span className="text-green-500 flex-shrink-0">→</span>{f}
                </div>
              ))}
            </div>
            {layers.certification.verification_url && (
              <a href={layers.certification.verification_url} target="_blank" rel="noreferrer"
                className="mt-3 flex items-center gap-2 text-blue-600 text-sm hover:underline">
                <ExternalLink className="w-4 h-4" /> Verify certificate online
              </a>
            )}
            {layers.certification.recommendation && (
              <div className="mt-3 bg-amber-50 border border-amber-200 p-3 rounded-xl text-sm text-amber-700">
                💡 {layers.certification.recommendation}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!result && !loading && (
        <div className="card text-center py-16">
          <ShieldCheck className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <div className="text-slate-400 font-medium text-lg">Upload a file and click Authenticate</div>
          <div className="text-slate-300 text-sm mt-2">
            Data will be verified against IPCC AR6, DEFRA 2024, EUDR Article 3 & GHG Protocol
          </div>
        </div>
      )}
    </div>
  )
}
