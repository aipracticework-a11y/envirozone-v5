import { useState } from 'react'
import { Calculator, Loader } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const EMISSION_FACTORS = {
  'Palm Oil':  { factor: 3.02, unit: 'kg CO2e/kg', transport: 0.15, processing: 0.42 },
  'Timber':    { factor: 0.45, unit: 'kg CO2e/kg', transport: 0.08, processing: 0.12 },
  'Cocoa':     { factor: 2.10, unit: 'kg CO2e/kg', transport: 0.22, processing: 0.38 },
  'Coffee':    { factor: 4.45, unit: 'kg CO2e/kg', transport: 0.18, processing: 0.55 },
  'Soya':      { factor: 0.49, unit: 'kg CO2e/kg', transport: 0.11, processing: 0.09 },
  'Cotton':    { factor: 5.90, unit: 'kg CO2e/kg', transport: 0.14, processing: 1.20 },
  'Almonds':   { factor: 2.30, unit: 'kg CO2e/kg', transport: 0.10, processing: 0.28 },
  'Barley':    { factor: 0.35, unit: 'kg CO2e/kg', transport: 0.06, processing: 0.07 },
}

export default function CarbonCalculator() {
  const [commodity, setCommodity] = useState('Coffee')
  const [quantity, setQuantity] = useState(1000)
  const [transport, setTransport] = useState('sea')
  const [calculated, setCalculated] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const calculate = () => {
    setLoading(true)
    setTimeout(() => {
      const ef = EMISSION_FACTORS[commodity]
      const transportMultiplier = transport === 'air' ? 4.5 : transport === 'road' ? 1.8 : 1.0
      const production   = ef.factor * quantity
      const transportCO2 = ef.transport * quantity * transportMultiplier
      const processing   = ef.processing * quantity
      const total        = production + transportCO2 + processing

      setResult({
        commodity, quantity, transport,
        breakdown: [
          { name: 'Production', value: Math.round(production), fill: '#ef4444' },
          { name: 'Transport',  value: Math.round(transportCO2), fill: '#f59e0b' },
          { name: 'Processing', value: Math.round(processing), fill: '#3b82f6' },
        ],
        total:        Math.round(total),
        per_kg:       (total / quantity).toFixed(2),
        trees_needed: Math.round(total / 21),
        car_equiv:    Math.round(total / 180),
        offset_cost:  Math.round(total * 0.015),
      })
      setLoading(false)
      setCalculated(true)
    }, 1500)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Calculator className="w-6 h-6 text-blue-500" /> Carbon Footprint Calculator
        </h1>
        <p className="text-slate-500 mt-1">Estimate CO2e emissions per commodity across your supply chain</p>
      </div>

      {/* Input Form */}
      <div className="card">
        <h2 className="font-semibold text-slate-700 mb-5">Calculate Emissions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          <div>
            <label className="text-sm font-medium text-slate-600 mb-2 block">Commodity</label>
            <select value={commodity} onChange={e => setCommodity(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
              {Object.keys(EMISSION_FACTORS).map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600 mb-2 block">Quantity (kg)</label>
            <input type="number" value={quantity} onChange={e => setQuantity(Number(e.target.value))}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600 mb-2 block">Transport Mode</label>
            <select value={transport} onChange={e => setTransport(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
              <option value="sea">🚢 Sea Freight</option>
              <option value="road">🚛 Road Freight</option>
              <option value="air">✈️ Air Freight</option>
            </select>
          </div>
        </div>
        <div className="bg-slate-50 rounded-xl p-4 mb-5 text-sm">
          <div className="font-medium text-slate-600 mb-2">Emission Factor Reference</div>
          <div className="text-slate-700">
            <strong>{commodity}:</strong> {EMISSION_FACTORS[commodity].factor} kg CO2e per kg
            <span className="text-slate-400 ml-3">Source: IPCC 2024 Guidelines</span>
          </div>
        </div>
        <button onClick={calculate} disabled={loading}
          className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
          {loading ? <><Loader className="w-4 h-4 animate-spin" /> Calculating...</> : '🧮 Calculate Carbon Footprint'}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card text-center bg-red-50 border-red-200">
              <div className="text-3xl font-bold text-red-600">{result.total.toLocaleString()}</div>
              <div className="text-sm text-red-700 mt-1">kg CO2e Total</div>
            </div>
            <div className="card text-center bg-blue-50 border-blue-200">
              <div className="text-3xl font-bold text-blue-600">{result.per_kg}</div>
              <div className="text-sm text-blue-700 mt-1">kg CO2e per kg</div>
            </div>
            <div className="card text-center bg-green-50 border-green-200">
              <div className="text-3xl font-bold text-green-600">{result.trees_needed.toLocaleString()}</div>
              <div className="text-sm text-green-700 mt-1">🌳 Trees to Offset</div>
            </div>
            <div className="card text-center bg-amber-50 border-amber-200">
              <div className="text-3xl font-bold text-amber-600">${result.offset_cost}</div>
              <div className="text-sm text-amber-700 mt-1">Offset Cost (est.)</div>
            </div>
          </div>

          <div className="card">
            <h2 className="font-semibold text-slate-700 mb-4">Emissions Breakdown</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={result.breakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(v) => [`${v} kg CO2e`, 'Emissions']} />
                <Bar dataKey="value" radius={[6,6,0,0]}>
                  {result.breakdown.map((entry, i) => (
                    <rect key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card bg-green-50 border-green-200">
            <h2 className="font-semibold text-green-700 mb-2">🌍 Environmental Equivalent</h2>
            <p className="text-sm text-slate-700">
              Your <strong>{result.quantity.toLocaleString()} kg</strong> of <strong>{result.commodity}</strong> generates
              approximately <strong>{result.total.toLocaleString()} kg CO2e</strong> — equivalent to
              driving a car for <strong>{result.car_equiv.toLocaleString()} km</strong>.
              You would need to plant <strong>{result.trees_needed.toLocaleString()} trees</strong> to offset this,
              or purchase carbon credits at an estimated cost of <strong>${result.offset_cost}</strong>.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
