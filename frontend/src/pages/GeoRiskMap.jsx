import { useState } from 'react'
import { Globe } from 'lucide-react'

const SUPPLIERS = [
  { id: 1, name: 'Supplier A', country: 'Indonesia', commodity: 'Palm Oil', lat: -2.5, lng: 118.0, risk: 'high',   score: 34, flag: '🇮🇩' },
  { id: 2, name: 'Supplier B', country: 'Brazil',    commodity: 'Timber',   lat: -8.0, lng: -55.0, risk: 'high',   score: 28, flag: '🇧🇷' },
  { id: 3, name: 'Supplier C', country: 'Ivory Coast',commodity: 'Cocoa',   lat: 7.5,  lng: -5.5,  risk: 'medium', score: 62, flag: '🇨🇮' },
  { id: 4, name: 'Supplier D', country: 'Vietnam',   commodity: 'Coffee',   lat: 16.0, lng: 106.0, risk: 'medium', score: 58, flag: '🇻🇳' },
  { id: 5, name: 'Supplier E', country: 'India',     commodity: 'Cotton',   lat: 20.0, lng: 78.0,  risk: 'low',    score: 81, flag: '🇮🇳' },
  { id: 6, name: 'Supplier F', country: 'Germany',   commodity: 'Barley',   lat: 51.0, lng: 10.0,  risk: 'low',    score: 94, flag: '🇩🇪' },
  { id: 7, name: 'Supplier G', country: 'USA',       commodity: 'Almonds',  lat: 37.0, lng: -120.0,risk: 'low',    score: 88, flag: '🇺🇸' },
  { id: 8, name: 'Supplier H', country: 'Malaysia',  commodity: 'Palm Oil', lat: 4.0,  lng: 109.0, risk: 'high',   score: 31, flag: '🇲🇾' },
]

const RISK_REGIONS = [
  { name: 'Amazon Basin',       risk: 'critical', issue: 'Deforestation hotspot — Soya & Timber', color: 'bg-red-600' },
  { name: 'Borneo & Sumatra',   risk: 'critical', issue: 'Palm Oil deforestation — High EUDR risk', color: 'bg-red-600' },
  { name: 'West Africa',        risk: 'high',     issue: 'Cocoa expansion threatening forests', color: 'bg-orange-500' },
  { name: 'Mekong Delta',       risk: 'high',     issue: 'Coffee & water stress risk', color: 'bg-orange-500' },
  { name: 'Central Asia',       risk: 'medium',   issue: 'Cotton water usage concerns', color: 'bg-amber-500' },
  { name: 'Western Europe',     risk: 'low',      issue: 'Strong regulatory environment', color: 'bg-green-500' },
]

const RISK_COLOR = { high: 'text-red-600', medium: 'text-amber-600', low: 'text-green-600', critical: 'text-red-700' }
const RISK_BG    = { high: 'bg-red-50 border-red-200', medium: 'bg-amber-50 border-amber-200', low: 'bg-green-50 border-green-200' }
const RISK_DOT   = { high: 'bg-red-500', medium: 'bg-amber-500', low: 'bg-green-500' }

export default function GeoRiskMap() {
  const [selected, setSelected] = useState(null)
  const [filter, setFilter]     = useState('all')

  const filtered = filter === 'all' ? SUPPLIERS : SUPPLIERS.filter(s => s.risk === filter)
  const high   = SUPPLIERS.filter(s => s.risk === 'high').length
  const medium = SUPPLIERS.filter(s => s.risk === 'medium').length
  const low    = SUPPLIERS.filter(s => s.risk === 'low').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Globe className="w-6 h-6 text-blue-500" /> Geolocation Risk Map
        </h1>
        <p className="text-slate-500 mt-1">Global supplier locations with ESG risk overlay by commodity and region</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card bg-red-50 border-red-200 text-center cursor-pointer hover:shadow-md" onClick={() => setFilter(filter === 'high' ? 'all' : 'high')}>
          <div className="text-3xl font-bold text-red-600">{high}</div>
          <div className="text-sm text-red-700 font-medium mt-1">🔴 High Risk Suppliers</div>
        </div>
        <div className="card bg-amber-50 border-amber-200 text-center cursor-pointer hover:shadow-md" onClick={() => setFilter(filter === 'medium' ? 'all' : 'medium')}>
          <div className="text-3xl font-bold text-amber-600">{medium}</div>
          <div className="text-sm text-amber-700 font-medium mt-1">🟡 Medium Risk</div>
        </div>
        <div className="card bg-green-50 border-green-200 text-center cursor-pointer hover:shadow-md" onClick={() => setFilter(filter === 'low' ? 'all' : 'low')}>
          <div className="text-3xl font-bold text-green-600">{low}</div>
          <div className="text-sm text-green-700 font-medium mt-1">🟢 Low Risk</div>
        </div>
      </div>

      {/* Visual World Map Representation */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-700">Supplier Risk Map</h2>
          <div className="flex gap-2 text-xs">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500 inline-block" />High</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />Medium</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500 inline-block" />Low</span>
          </div>
        </div>

        {/* Map Background */}
        <div className="relative bg-gradient-to-b from-blue-100 to-blue-200 rounded-2xl overflow-hidden" style={{ height: 420 }}>
          {/* Ocean background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-300/30 to-blue-500/20" />

          {/* Continent shapes (simplified SVG) */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 420">
            {/* North America */}
            <ellipse cx="180" cy="160" rx="110" ry="90" fill="#d4edda" stroke="#94d3a2" strokeWidth="1" />
            {/* South America */}
            <ellipse cx="230" cy="290" rx="70" ry="90" fill="#d4edda" stroke="#94d3a2" strokeWidth="1" />
            {/* Europe */}
            <ellipse cx="490" cy="130" rx="60" ry="55" fill="#d4edda" stroke="#94d3a2" strokeWidth="1" />
            {/* Africa */}
            <ellipse cx="490" cy="260" rx="75" ry="100" fill="#d4edda" stroke="#94d3a2" strokeWidth="1" />
            {/* Asia */}
            <ellipse cx="720" cy="160" rx="160" ry="100" fill="#d4edda" stroke="#94d3a2" strokeWidth="1" />
            {/* Australia */}
            <ellipse cx="820" cy="300" rx="65" ry="50" fill="#d4edda" stroke="#94d3a2" strokeWidth="1" />
          </svg>

          {/* Supplier Dots - positioned approximately */}
          {filtered.map(s => {
            // Convert lat/lng to approximate x/y on our map
            const x = ((s.lng + 180) / 360) * 1000
            const y = ((90 - s.lat) / 180) * 420
            return (
              <div key={s.id}
                onClick={() => setSelected(selected?.id === s.id ? null : s)}
                style={{ left: `${(x/1000)*100}%`, top: `${(y/420)*100}%` }}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-10">
                <div className={`w-4 h-4 rounded-full ${RISK_DOT[s.risk]} border-2 border-white shadow-lg hover:scale-150 transition-all ${selected?.id === s.id ? 'scale-150 ring-2 ring-white' : ''}`} />
                <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-20">
                  {s.flag} {s.name} — {s.commodity}
                </div>
              </div>
            )
          })}
        </div>

        {/* Selected Supplier Detail */}
        {selected && (
          <div className={`mt-4 p-4 rounded-xl border ${RISK_BG[selected.risk]}`}>
            <div className="flex items-start justify-between">
              <div>
                <div className="font-bold text-slate-800 text-lg">{selected.flag} {selected.name}</div>
                <div className="text-sm text-slate-500">{selected.country} · {selected.commodity}</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${RISK_COLOR[selected.risk]}`}>{selected.score}</div>
                <div className="text-xs text-slate-400">ESG Score</div>
              </div>
            </div>
            <div className={`mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${RISK_BG[selected.risk]}`}>
              <span className={`w-2 h-2 rounded-full ${RISK_DOT[selected.risk]}`} />
              <span className={RISK_COLOR[selected.risk]}>{selected.risk.toUpperCase()} RISK</span>
            </div>
          </div>
        )}
      </div>

      {/* Risk Regions */}
      <div className="card">
        <h2 className="font-semibold text-slate-700 mb-4">High Risk Regions — ESG Watch List</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {RISK_REGIONS.map((r, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${r.color}`} />
              <div>
                <div className="font-semibold text-slate-800 text-sm">{r.name}</div>
                <div className="text-xs text-slate-500 mt-0.5">{r.issue}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Supplier List */}
      <div className="card">
        <h2 className="font-semibold text-slate-700 mb-4">All Suppliers — Location & Risk</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-slate-400 text-left">
              <th className="pb-3 pr-4">Supplier</th>
              <th className="pb-3 pr-4">Country</th>
              <th className="pb-3 pr-4">Commodity</th>
              <th className="pb-3 pr-4">ESG Score</th>
              <th className="pb-3">Risk Level</th>
            </tr></thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id} className="border-b last:border-0 hover:bg-slate-50 cursor-pointer" onClick={() => setSelected(s)}>
                  <td className="py-3 pr-4 font-medium">{s.flag} {s.name}</td>
                  <td className="py-3 pr-4 text-slate-500">{s.country}</td>
                  <td className="py-3 pr-4 text-slate-500">{s.commodity}</td>
                  <td className="py-3 pr-4 font-bold">{s.score}</td>
                  <td className="py-3">
                    <span className={`flex items-center gap-1 font-semibold text-xs ${RISK_COLOR[s.risk]}`}>
                      <span className={`w-2 h-2 rounded-full ${RISK_DOT[s.risk]}`} />
                      {s.risk.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
