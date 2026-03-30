import { useState, useRef } from 'react'
import { FolderOpen, Upload, CheckCircle, Loader, XCircle, FileText, Download, Eye, AlertTriangle } from 'lucide-react'
import { uploadFile, getFileTemplate } from '../api/client'

const STEPS = [
  { id:1, label:'📤 File Received',       desc:'Securely received and stored' },
  { id:2, label:'🔍 Format Validation',   desc:'Checking file type and structure' },
  { id:3, label:'📊 Data Extraction',     desc:'Reading rows, columns and data types' },
  { id:4, label:'🔎 Completeness Check',  desc:'Identifying missing required ESG fields' },
  { id:5, label:'⚠️ Anomaly Detection',   desc:'Scanning for outliers and duplicates' },
  { id:6, label:'🤖 AI Trust Analysis',   desc:'Gemini AI analysing data trustworthiness' },
  { id:7, label:'🌿 ESG Mapping',         desc:'Mapping to ESG scopes and categories' },
  { id:8, label:'📋 Trust Score',         desc:'Generating final trust verdict' },
]

const EXISTING = [
  { id:1, name:'GreenTech_Q1_2025.xlsx', supplier:'GreenTech Manufacturing', commodity:'Barley',   trust:96, status:'approved', date:'2025-03-15', rows:1240, cols:12 },
  { id:2, name:'FastLog_ESG_Data.csv',   supplier:'FastLog Logistics',       commodity:'Cotton',   trust:71, status:'review',   date:'2025-03-17', rows:430,  cols:8  },
  { id:3, name:'PackRight_Cert.xlsx',    supplier:'PackRight Packaging',     commodity:'Timber',   trust:91, status:'approved', date:'2025-03-12', rows:210,  cols:10 },
  { id:4, name:'PowerGrid_Data.csv',     supplier:'PowerGrid Utilities',     commodity:'Energy',   trust:45, status:'rejected', date:'2025-03-13', rows:890,  cols:6  },
]

const STATUS_BADGE = { approved:'badge-green', review:'badge-amber', rejected:'badge-red' }
const TRUST_COLOR  = (t) => t>=80 ? 'text-green-600' : t>=60 ? 'text-amber-600' : 'text-red-600'
const TRUST_BG     = (t) => t>=80 ? 'bg-green-50 border-green-300' : t>=60 ? 'bg-amber-50 border-amber-300' : 'bg-red-50 border-red-300'

export default function DocumentVault() {
  const [step, setStep]           = useState(0)
  const [processing, setProcessing] = useState(false)
  const [result, setResult]       = useState(null)
  const [dragOver, setDragOver]   = useState(false)
  const [supplierName, setSupplierName] = useState('')
  const [template, setTemplate]   = useState(null)
  const [showTemplate, setShowTemplate] = useState(false)
  const [error, setError]         = useState('')
  const fileRef = useRef()

  const processFile = async (file) => {
    if (!file) return
    setProcessing(true); setResult(null); setError(''); setStep(0)

    // Simulate step-by-step progress while waiting for real API
    let s = 0
    const stepInterval = setInterval(() => {
      s++
      setStep(s)
      if (s >= STEPS.length - 1) clearInterval(stepInterval)
    }, 700)

    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('supplier_name', supplierName || file.name)
      const res = await uploadFile(fd)
      clearInterval(stepInterval)
      setStep(STEPS.length)
      setResult(res.data)
    } catch (err) {
      clearInterval(stepInterval)
      setError('Processing failed. Make sure backend is running on port 8001.')
    } finally {
      setProcessing(false)
    }
  }

  const handleDrop = (e) => { e.preventDefault(); setDragOver(false); processFile(e.dataTransfer.files[0]) }

  const loadTemplate = async () => {
    const res = await getFileTemplate()
    setTemplate(res.data)
    setShowTemplate(true)
  }

  const ai = result?.ai_analysis

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <FolderOpen className="w-6 h-6 text-amber-500" /> Document Vault
          </h1>
          <p className="text-slate-500 mt-1">Upload supplier Excel/CSV files — watch AI verify and trust-score them in real time</p>
        </div>
        <button onClick={loadTemplate} className="flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-200">
          <Download className="w-4 h-4" /> View Template
        </button>
      </div>

      {/* Template Info */}
      {showTemplate && template && (
        <div className="card bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-blue-700">📋 Required Columns for ESG Submission</h3>
            <button onClick={() => setShowTemplate(false)} className="text-blue-400 hover:text-blue-600 text-sm">Close ✕</button>
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            {template.required_columns.map(c => (
              <span key={c} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">{c}</span>
            ))}
          </div>
          <div className="bg-white rounded-lg p-3 text-xs font-mono text-slate-600 overflow-x-auto">
            Example row: {JSON.stringify(template.example_row)}
          </div>
        </div>
      )}

      {/* Supplier Name Input */}
      <div className="card">
        <label className="text-sm font-medium text-slate-600 mb-2 block">Supplier Name (optional)</label>
        <input value={supplierName} onChange={e => setSupplierName(e.target.value)}
          placeholder="e.g. GreenTech Manufacturing"
          className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
      </div>

      {/* Upload Zone */}
      <div onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)} onDrop={handleDrop}
        onClick={() => !processing && fileRef.current.click()}
        className={`border-2 border-dashed rounded-2xl p-14 text-center transition-all ${dragOver ? 'border-amber-500 bg-amber-50' : 'border-slate-300 hover:border-amber-400 hover:bg-slate-50'} ${processing ? 'opacity-60 cursor-wait' : 'cursor-pointer'}`}>
        <Upload className="w-14 h-14 text-slate-300 mx-auto mb-4" />
        <div className="font-bold text-slate-700 text-xl">Drop your supplier file here</div>
        <div className="text-slate-400 text-sm mt-2">or click to browse</div>
        <div className="flex justify-center gap-3 mt-4">
          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">📊 Excel (.xlsx)</span>
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">📄 CSV (.csv)</span>
        </div>
        <input ref={fileRef} type="file" className="hidden" accept=".xlsx,.csv" onChange={e => processFile(e.target.files[0])} />
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm">❌ {error}</div>}

      {/* Live Steps */}
      {(processing || result) && (
        <div className="card">
          <h2 className="font-semibold text-slate-700 mb-5">🔄 Live Processing Lifecycle</h2>
          <div className="space-y-2">
            {STEPS.map((s, i) => {
              const num     = i + 1
              const done    = step > num || (!processing && result)
              const active  = step === num && processing
              const pending = step < num
              return (
                <div key={s.id} className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-300 ${done ? 'bg-green-50 border border-green-200' : active ? 'bg-blue-50 border border-blue-300' : 'bg-slate-50 border border-slate-100'}`}>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold transition-all ${done ? 'bg-green-500' : active ? 'bg-blue-500' : 'bg-slate-300'}`}>
                    {done ? <CheckCircle className="w-5 h-5" /> : active ? <Loader className="w-4 h-4 animate-spin" /> : <span className="text-xs">{num}</span>}
                  </div>
                  <div className="flex-1">
                    <div className={`font-semibold text-sm ${done ? 'text-green-700' : active ? 'text-blue-700' : 'text-slate-400'}`}>{s.label}</div>
                    <div className="text-xs text-slate-400">{s.desc}</div>
                  </div>
                  {done && <span className="text-green-500 text-xs font-medium">✓ Done</span>}
                  {active && <span className="text-blue-500 text-xs font-medium animate-pulse">Processing...</span>}
                </div>
              )
            })}
          </div>

          {/* Real Results */}
          {result && ai && (
            <div className={`mt-6 p-6 rounded-2xl border-2 ${TRUST_BG(ai.trust_score)}`}>
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-2xl font-black text-slate-800">{ai.verdict}</div>
                  <div className="text-slate-500 text-sm mt-1">{result.filename} — {result.supplier_name}</div>
                </div>
                <div className="text-center bg-white rounded-2xl p-3 shadow-sm">
                  <div className={`text-4xl font-black ${TRUST_COLOR(ai.trust_score)}`}>{ai.trust_score}</div>
                  <div className="text-xs text-slate-400">/ 100 Trust</div>
                </div>
              </div>

              {/* File Stats */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-white/70 p-3 rounded-xl text-center">
                  <div className="font-bold text-slate-800 text-xl">{result.file_stats?.rows?.toLocaleString()}</div>
                  <div className="text-xs text-slate-400">Rows</div>
                </div>
                <div className="bg-white/70 p-3 rounded-xl text-center">
                  <div className="font-bold text-slate-800 text-xl">{result.file_stats?.columns}</div>
                  <div className="text-xs text-slate-400">Columns</div>
                </div>
                <div className="bg-white/70 p-3 rounded-xl text-center">
                  <div className={`font-bold text-xl ${TRUST_COLOR(result.file_stats?.completeness)}`}>{result.file_stats?.completeness}%</div>
                  <div className="text-xs text-slate-400">Complete</div>
                </div>
              </div>

              {/* Columns Found */}
              <div className="bg-white/70 p-4 rounded-xl mb-4">
                <div className="text-sm font-semibold text-slate-600 mb-2">Columns Detected in Your File</div>
                <div className="flex flex-wrap gap-2">
                  {result.columns?.map(c => <span key={c} className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">{c}</span>)}
                </div>
              </div>

              {/* Missing ESG Fields */}
              {result.missing_esg_fields?.length > 0 && (
                <div className="bg-red-50 border border-red-200 p-4 rounded-xl mb-4">
                  <div className="text-red-700 font-semibold text-sm mb-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Missing Required ESG Fields</div>
                  <div className="flex flex-wrap gap-2">
                    {result.missing_esg_fields.map(f => <span key={f} className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs">{f}</span>)}
                  </div>
                </div>
              )}

              {/* Anomalies */}
              {result.anomalies?.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl mb-4">
                  <div className="text-amber-700 font-semibold text-sm mb-2">⚠️ Anomalies Detected</div>
                  {result.anomalies.map((a, i) => <div key={i} className="text-xs text-amber-700 py-0.5">• {a}</div>)}
                </div>
              )}

              {/* AI Summary */}
              <div className="bg-purple-50 border border-purple-200 p-4 rounded-xl mb-4">
                <div className="text-purple-700 font-semibold text-sm mb-2">🤖 Gemini AI Assessment</div>
                <p className="text-sm text-slate-700">{ai.summary}</p>
                <div className="mt-2 text-xs text-slate-500">ESG Coverage: {ai.esg_relevance}</div>
              </div>

              {/* Strengths & Issues */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="font-semibold text-green-700 text-sm mb-2">✅ Strengths</div>
                  {ai.strengths?.map((s,i) => <div key={i} className="text-xs text-slate-600 py-1 flex gap-2"><CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />{s}</div>)}
                </div>
                <div>
                  <div className="font-semibold text-red-700 text-sm mb-2">❌ Issues</div>
                  {ai.issues?.map((s,i) => <div key={i} className="text-xs text-slate-600 py-1 flex gap-2"><XCircle className="w-3 h-3 text-red-400 mt-0.5 flex-shrink-0" />{s}</div>)}
                </div>
              </div>

              {/* Recommendations */}
              <div className="mt-4 bg-white/70 p-4 rounded-xl">
                <div className="font-semibold text-slate-600 text-sm mb-2">📌 Recommendations</div>
                {ai.recommendations?.map((r,i) => <div key={i} className="text-xs text-slate-600 py-0.5">→ {r}</div>)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Existing Documents */}
      <div className="card">
        <h2 className="font-semibold text-slate-700 mb-4">Previously Processed Files</h2>
        <div className="space-y-3">
          {EXISTING.map(doc => (
            <div key={doc.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:shadow-sm transition-all">
              <div className="flex items-center gap-3">
                <FileText className="w-9 h-9 text-amber-400 flex-shrink-0" />
                <div>
                  <div className="font-medium text-slate-800">{doc.name}</div>
                  <div className="text-xs text-slate-400">{doc.supplier} · {doc.commodity} · {doc.rows.toLocaleString()} rows · {doc.cols} cols · {doc.date}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-center">
                  <div className={`font-bold text-lg ${TRUST_COLOR(doc.trust)}`}>{doc.trust}</div>
                  <div className="text-xs text-slate-400">trust</div>
                </div>
                <span className={STATUS_BADGE[doc.status]}>{doc.status}</span>
                <button className="p-2 hover:bg-slate-200 rounded-lg"><Eye className="w-4 h-4 text-slate-400" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
