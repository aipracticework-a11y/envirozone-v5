import { useState } from 'react'
import { CheckSquare, Loader, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

const COMMODITIES = [
  { id: 1, name: 'Palm Oil',  risk: 'high',   deforestation: 92, suppliers: ['Supplier A', 'Supplier D'], countries: ['Indonesia', 'Malaysia'], eudr_status: 'non_compliant' },
  { id: 2, name: 'Timber',    risk: 'high',   deforestation: 88, suppliers: ['Supplier B'], countries: ['Brazil', 'Indonesia'], eudr_status: 'non_compliant' },
  { id: 3, name: 'Cocoa',     risk: 'medium', deforestation: 61, suppliers: ['Supplier C'], countries: ['Ivory Coast', 'Ghana'], eudr_status: 'partial' },
  { id: 4, name: 'Coffee',    risk: 'medium', deforestation: 54, suppliers: ['Supplier E'], countries: ['Vietnam', 'Colombia'], eudr_status: 'partial' },
  { id: 5, name: 'Soya',      risk: 'high',   deforestation: 78, suppliers: ['Supplier D'], countries: ['Brazil', 'Argentina'], eudr_status: 'non_compliant' },
  { id: 6, name: 'Cotton',    risk: 'low',    deforestation: 23, suppliers: ['Supplier F'], countries: ['India', 'USA'], eudr_status: 'compliant' },
  { id: 7, name: 'Almonds',   risk: 'low',    deforestation: 15, suppliers: ['Supplier G'], countries: ['USA', 'Spain'], eudr_status: 'compliant' },
  { id: 8, name: 'Barley',    risk: 'low',    deforestation: 12, suppliers: ['Supplier H'], countries: ['Germany', 'France'], eudr_status: 'compliant' },
]

const RISK_COLOR = { high: 'badge-red', medium: 'badge-amber', low: 'badge-green' }
const STATUS_ICON = {
  compliant:     <CheckCircle className="w-5 h-5 text-green-500" />,
  partial:       <AlertTriangle className="w-5 h-5 text-amber-500" />,
  non_compliant: <XCircle className="w-5 h-5 text-red-500" />,
}
const STATUS_LABEL = { compliant: 'Compliant', partial: 'Partial', non_compliant: 'Non-Compliant' }
const STATUS_BG    = { compliant: 'bg-green-50 border-green-200', partial: 'bg-amber-50 border-amber-200', non_compliant: 'bg-red-50 border-red-200' }

export default function EUDRCompliance() {
  const [selected, setSelected] = useState(null)
  const [checking, setChecking] = useState(false)
  const [result, setResult] = useState(null)

  const runCheck = (commodity) => {
    setSelected(commodity)
    setChecking(true)
    setResult(null)
    setTimeout(() => {
      setResult({
        commodity: commodity.name,
        overall: commodity.eudr_status,
        checks: [
          { name: 'Geolocation data available', status: commodity.risk !== 'high' },
          { name: 'No protected forest overlap', status: commodity.deforestation < 50 },
          { name: 'Due diligence statement submitted', status: commodity.eudr_status === 'compliant' },
          { name: 'Supply chain traceability verified', status: commodity.risk === 'low' },
          { name: 'Operator reference number present', status: commodity.eudr_status !== 'non_compliant' },
        ],
        recommendation: commodity.eudr_status === 'compliant'
          ? 'This commodity supply chain is EUDR compliant. Maintain current documentation standards and conduct annual reviews.'
          : commodity.eudr_status === 'partial'
          ? 'Partial compliance detected. Missing due diligence statements for 2 suppliers. Submit operator reference numbers by Q2 2025 to achieve full compliance.'
          : 'Non-compliant with EU Deforestation Regulation. Immediate action required: obtain geolocation data, verify no protected forest overlap, and submit full due diligence statement before December 2025 deadline.'
      })
      setChecking(false)
    }, 2000)
  }

  const compliant = COMMODITIES.filter(c => c.eudr_status === 'compliant').length
  const partial   = COMMODITIES.filter(c => c.eudr_status === 'partial').length
  const nonComp   = COMMODITIES.filter(c => c.eudr_status === 'non_compliant').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <CheckSquare className="w-6 h-6 text-green-600" /> EUDR Compliance Checker
        </h1>
        <p className="text-slate-500 mt-1">EU Deforestation Regulation compliance status for all commodities</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card bg-green-50 border-green-200 text-center">
          <div className="text-3xl font-bold text-green-600">{compliant}</div>
          <div className="text-sm text-green-700 font-medium mt-1">✅ Compliant</div>
        </div>
        <div className="card bg-amber-50 border-amber-200 text-center">
          <div className="text-3xl font-bold text-amber-600">{partial}</div>
          <div className="text-sm text-amber-700 font-medium mt-1">⚠️ Partial</div>
        </div>
        <div className="card bg-red-50 border-red-200 text-center">
          <div className="text-3xl font-bold text-red-600">{nonComp}</div>
          <div className="text-sm text-red-700 font-medium mt-1">❌ Non-Compliant</div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl text-sm text-blue-800">
        <strong>ℹ️ About EUDR:</strong> The EU Deforestation Regulation requires companies to ensure products sold in the EU have not contributed to deforestation or forest degradation. Applies to: cattle, cocoa, coffee, palm oil, soya, wood, rubber and derived products. Deadline: December 2025.
      </div>

      {/* Commodity Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {COMMODITIES.map(c => (
          <div key={c.id} className={`border rounded-xl p-4 cursor-pointer hover:shadow-md transition-all ${STATUS_BG[c.eudr_status]}`}
            onClick={() => runCheck(c)}>
            <div className="flex items-start justify-between mb-3">
              <div className="text-2xl">{c.name === 'Palm Oil' ? '🌴' : c.name === 'Timber' ? '🪵' : c.name === 'Cocoa' ? '🍫' : c.name === 'Coffee' ? '☕' : c.name === 'Soya' ? '🌱' : c.name === 'Cotton' ? '🌿' : c.name === 'Almonds' ? '🌰' : '🌾'}</div>
              {STATUS_ICON[c.eudr_status]}
            </div>
            <div className="font-bold text-slate-800">{c.name}</div>
            <div className="text-xs text-slate-500 mt-1">{c.countries.join(', ')}</div>
            <div className="mt-2 flex items-center justify-between">
              <span className={RISK_COLOR[c.risk]}>{c.risk} risk</span>
              <span className="text-xs text-slate-500">🌲 {c.deforestation}%</span>
            </div>
            <div className="mt-3 w-full bg-slate-200 rounded-full h-1.5">
              <div className={`h-1.5 rounded-full ${c.deforestation > 70 ? 'bg-red-500' : c.deforestation > 40 ? 'bg-amber-500' : 'bg-green-500'}`}
                style={{ width: `${c.deforestation}%` }} />
            </div>
            <div className="text-xs text-slate-400 mt-1">Deforestation risk score</div>
            <button className="mt-3 w-full bg-white border border-current text-xs font-semibold py-1.5 rounded-lg hover:opacity-80 transition-all">
              Run EUDR Check →
            </button>
          </div>
        ))}
      </div>

      {/* Result Panel */}
      {(checking || result) && (
        <div className="card">
          <h2 className="font-semibold text-slate-700 mb-4">
            EUDR Check Results — {selected?.name}
          </h2>
          {checking ? (
            <div className="flex items-center gap-3 text-slate-500 py-8 justify-center">
              <Loader className="w-6 h-6 animate-spin text-green-500" />
              <span>Running EUDR compliance checks...</span>
            </div>
          ) : result && (
            <div className="space-y-4">
              <div className={`flex items-center gap-3 p-4 rounded-xl border ${STATUS_BG[result.overall]}`}>
                {STATUS_ICON[result.overall]}
                <div>
                  <div className="font-bold text-slate-800">Overall Status: {STATUS_LABEL[result.overall]}</div>
                  <div className="text-sm text-slate-600 mt-0.5">{result.recommendation}</div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {result.checks.map((check, i) => (
                  <div key={i} className={`flex items-center gap-3 p-3 rounded-lg border ${check.status ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    {check.status
                      ? <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      : <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />}
                    <span className="text-sm text-slate-700">{check.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
