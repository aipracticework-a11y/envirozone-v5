import { useEffect, useState } from 'react'
import { getSuppliers, getSupplierRisk, addSupplier, updateSupplierStatus } from '../api/client'
import { Truck, Loader, X, Plus, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

const STATUS_BADGE = { approved:'badge-green', needs_review:'badge-amber', rejected:'badge-red', pending:'badge-gray' }
const STATUS_LABEL = { approved:'✅ Approved', needs_review:'⚠️ Needs Review', rejected:'❌ Rejected', pending:'⏳ Pending' }

function ProgressBar({ value }) {
  const color = value>=90?'bg-green-500':value>=60?'bg-amber-500':value>=30?'bg-orange-500':'bg-red-500'
  return <div className="w-full bg-slate-200 rounded-full h-2"><div className={`${color} h-2 rounded-full transition-all`} style={{width:`${value}%`}} /></div>
}

function RiskPanel({ supplier, onClose }) {
  const [risk, setRisk]     = useState(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    getSupplierRisk(supplier.id).then(r => { setRisk(r.data); setLoading(false) })
  }, [supplier.id])
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b bg-[#0a1628] rounded-t-2xl">
          <h3 className="font-bold text-white">AI Risk Analysis</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-white" /></button>
        </div>
        {loading ? <div className="p-8 text-center text-slate-400"><Loader className="w-8 h-8 animate-spin mx-auto mb-3" />Analysing supplier risk...</div>
        : risk && (
          <div className="p-6 space-y-4">
            <div>
              <h4 className="font-bold text-slate-800 text-lg">{risk.supplier.name}</h4>
              <div className="flex gap-2 mt-2 flex-wrap">
                <span className={STATUS_BADGE[risk.supplier.status]}>{STATUS_LABEL[risk.supplier.status]}</span>
                <span className={`text-sm font-semibold px-3 py-1 rounded-full ${risk.overall_risk==='low'?'bg-green-100 text-green-700':risk.overall_risk==='medium'?'bg-amber-100 text-amber-700':'bg-red-100 text-red-700'}`}>
                  {risk.overall_risk.toUpperCase()} RISK
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[['Country',risk.supplier.country],['Certification',risk.supplier.certification],['Quality Score',`${risk.supplier.quality_score}/100`],['Commodity',risk.supplier.commodity]].map(([k,v])=>(
                <div key={k} className="bg-slate-50 p-3 rounded-lg"><div className="text-slate-400">{k}</div><div className="font-medium mt-1">{v}</div></div>
              ))}
            </div>
            <div className="bg-purple-50 border border-purple-200 p-4 rounded-xl">
              <div className="font-semibold text-purple-700 mb-2">🤖 Gemini AI Risk Analysis</div>
              <p className="text-sm text-slate-700 whitespace-pre-line">{risk.risk_analysis}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function AddSupplierModal({ onClose, onAdd }) {
  const [form, setForm] = useState({ name:'', contact:'', country:'', commodity:'', certification:'None', scope:'Scope 3' })
  const [saving, setSaving] = useState(false)
  const handle = (e) => setForm(p => ({...p, [e.target.name]: e.target.value}))
  const submit = async () => {
    if (!form.name || !form.contact || !form.country) return
    setSaving(true)
    try { const r = await addSupplier(form); onAdd(r.data.supplier); onClose() }
    catch { setSaving(false) }
  }
  const fields = [
    { name:'name', label:'Supplier Name', placeholder:'e.g. GreenTech Manufacturing' },
    { name:'contact', label:'Contact Email', placeholder:'esg@supplier.com' },
    { name:'country', label:'Country', placeholder:'e.g. Germany' },
    { name:'commodity', label:'Primary Commodity', placeholder:'e.g. Palm Oil, Timber' },
    { name:'certification', label:'Certification', placeholder:'e.g. ISO 14001' },
  ]
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 bg-[#0a1628] rounded-t-2xl">
          <h3 className="font-bold text-white">Add New Supplier</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-white" /></button>
        </div>
        <div className="p-6 space-y-4">
          {fields.map(f => (
            <div key={f.name}>
              <label className="text-sm font-medium text-slate-600 block mb-1">{f.label}</label>
              <input name={f.name} value={form[f.name]} onChange={handle} placeholder={f.placeholder}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
            </div>
          ))}
          <div>
            <label className="text-sm font-medium text-slate-600 block mb-1">Scope</label>
            <select name="scope" value={form.scope} onChange={handle}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400">
              <option>Scope 1</option><option>Scope 2</option><option>Scope 3</option><option>Scope 1 & 3</option>
            </select>
          </div>
          <button onClick={submit} disabled={saving || !form.name}
            className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2">
            {saving ? <><Loader className="w-4 h-4 animate-spin" />Saving...</> : '✅ Add Supplier'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function SupplierPortal() {
  const [suppliers, setSuppliers]   = useState([])
  const [summary, setSummary]       = useState({})
  const [selected, setSelected]     = useState(null)
  const [showAdd, setShowAdd]       = useState(false)
  const [updating, setUpdating]     = useState(null)
  const [loading, setLoading]       = useState(true)
  const [toast, setToast]           = useState('')

  useEffect(() => {
    getSuppliers().then(r => { setSuppliers(r.data.suppliers); setSummary(r.data.summary); setLoading(false) })
  }, [])

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const handleStatus = async (id, status) => {
    setUpdating(id)
    try {
      await updateSupplierStatus(id, { status })
      setSuppliers(prev => prev.map(s => s.id===id ? {...s, status} : s))
      showToast(`Supplier status updated to ${status}`)
    } finally { setUpdating(null) }
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-slate-400">Loading...</div>

  return (
    <div className="space-y-6">
      {toast && <div className="fixed top-4 right-4 bg-green-600 text-white px-5 py-3 rounded-xl shadow-lg z-50 font-medium">{toast}</div>}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><Truck className="w-6 h-6 text-amber-500" /> Supplier Portal</h1>
          <p className="text-slate-500 mt-1">Onboard, manage and risk-assess your ESG supply chain partners</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-green-700">
          <Plus className="w-4 h-4" /> Add Supplier
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 text-center">
        {[['Total',summary.total,'text-slate-800'],['Approved',summary.approved,'text-green-600'],['Pending Review',summary.pending_review,'text-amber-600'],['Rejected',summary.rejected,'text-red-600']].map(([l,v,c])=>(
          <div key={l} className="card"><div className={`text-3xl font-bold ${c}`}>{v}</div><div className="text-sm text-slate-500 mt-1">{l}</div></div>
        ))}
      </div>

      <div className="card">
        <h2 className="font-semibold text-slate-700 mb-4">Supplier List</h2>
        <div className="space-y-4">
          {suppliers.map(s => (
            <div key={s.id} className="border rounded-xl p-5 hover:shadow-sm transition-all">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-semibold text-slate-800 text-lg">{s.name}</div>
                  <div className="text-xs text-slate-400">{s.contact} · {s.country} · {s.commodity}</div>
                </div>
                <span className={STATUS_BADGE[s.status]}>{STATUS_LABEL[s.status]}</span>
              </div>
              <div className="grid grid-cols-4 gap-4 text-sm mb-3">
                <div><div className="text-slate-400">Scope</div><div className="font-medium">{s.scope}</div></div>
                <div><div className="text-slate-400">Quality</div><div className={`font-bold ${s.quality_score>=80?'text-green-600':s.quality_score>=60?'text-amber-600':'text-red-600'}`}>{s.quality_score}/100</div></div>
                <div><div className="text-slate-400">Certification</div><div className="font-medium text-xs">{s.certification}</div></div>
                <div><div className="text-slate-400">Last Submission</div><div className="font-medium">{s.last_submission||'Never'}</div></div>
              </div>
              <div className="mb-3">
                <div className="flex justify-between text-xs text-slate-400 mb-1"><span>Submission Progress</span><span>{s.progress}%</span></div>
                <ProgressBar value={s.progress} />
              </div>
              <div className="flex gap-2 flex-wrap">
                <button onClick={() => setSelected(s)} className="bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-purple-200">🤖 AI Risk Analysis</button>
                {s.status !== 'approved' && (
                  <button onClick={() => handleStatus(s.id, 'approved')} disabled={updating===s.id}
                    className="bg-green-100 text-green-700 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-green-200 flex items-center gap-1 disabled:opacity-50">
                    {updating===s.id ? <Loader className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />} Approve
                  </button>
                )}
                {s.status !== 'rejected' && (
                  <button onClick={() => handleStatus(s.id, 'rejected')} disabled={updating===s.id}
                    className="bg-red-100 text-red-700 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-red-200 flex items-center gap-1 disabled:opacity-50">
                    <XCircle className="w-3 h-3" /> Reject
                  </button>
                )}
                {s.status !== 'needs_review' && s.status !== 'approved' && (
                  <button onClick={() => handleStatus(s.id, 'needs_review')} disabled={updating===s.id}
                    className="bg-amber-100 text-amber-700 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-amber-200 flex items-center gap-1 disabled:opacity-50">
                    <AlertTriangle className="w-3 h-3" /> Flag for Review
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {selected && <RiskPanel supplier={selected} onClose={() => setSelected(null)} />}
      {showAdd && <AddSupplierModal onClose={() => setShowAdd(false)} onAdd={(s) => { setSuppliers(p => [...p, s]); showToast('Supplier added successfully!') }} />}
    </div>
  )
}
