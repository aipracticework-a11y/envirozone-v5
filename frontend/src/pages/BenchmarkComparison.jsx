import { BarChart3 } from 'lucide-react'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

const BENCHMARK_DATA = [
  { metric: 'Data Quality',      yours: 85, industry: 72, leader: 94 },
  { metric: 'AI Transparency',   yours: 84, industry: 61, leader: 92 },
  { metric: 'Supplier Coverage', yours: 78, industry: 65, leader: 96 },
  { metric: 'Audit Readiness',   yours: 78, industry: 70, leader: 95 },
  { metric: 'EUDR Compliance',   yours: 62, industry: 55, leader: 89 },
  { metric: 'Carbon Tracking',   yours: 74, industry: 68, leader: 91 },
]

const RADAR_DATA = BENCHMARK_DATA.map(d => ({ subject: d.metric, You: d.yours, Industry: d.industry, Leader: d.leader }))

const PEERS = [
  { name: 'Your Company',     overall: 80, dataQuality: 85, aiTransparency: 84, eudr: 62, carbon: 74, trend: '+5%' },
  { name: 'Industry Average', overall: 65, dataQuality: 72, aiTransparency: 61, eudr: 55, carbon: 68, trend: '+2%' },
  { name: 'Industry Leader',  overall: 93, dataQuality: 94, aiTransparency: 92, eudr: 89, carbon: 91, trend: '+8%' },
  { name: 'Peer Company A',   overall: 71, dataQuality: 75, aiTransparency: 68, eudr: 60, carbon: 72, trend: '+3%' },
  { name: 'Peer Company B',   overall: 58, dataQuality: 61, aiTransparency: 55, eudr: 48, carbon: 59, trend: '-1%' },
]

export default function BenchmarkComparison() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-indigo-500" /> Benchmark Comparison
        </h1>
        <p className="text-slate-500 mt-1">Compare your ESG data intelligence scores against industry peers and leaders</p>
      </div>

      {/* Top Score Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Your Overall Score', value: 80, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-200', note: '+15 vs industry avg' },
          { label: 'Industry Average',   value: 65, color: 'text-slate-600',  bg: 'bg-slate-50 border-slate-200',  note: 'Baseline' },
          { label: 'Industry Leader',    value: 93, color: 'text-green-600',  bg: 'bg-green-50 border-green-200',  note: 'Target to beat' },
        ].map(s => (
          <div key={s.label} className={`card text-center ${s.bg}`}>
            <div className={`text-4xl font-black ${s.color}`}>{s.value}</div>
            <div className="text-sm font-semibold text-slate-600 mt-1">{s.label}</div>
            <div className="text-xs text-slate-400 mt-1">{s.note}</div>
          </div>
        ))}
      </div>

      {/* Radar Chart */}
      <div className="card">
        <h2 className="font-semibold text-slate-700 mb-4">Performance Radar — You vs Industry vs Leader</h2>
        <ResponsiveContainer width="100%" height={340}>
          <RadarChart data={RADAR_DATA}>
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
            <Radar name="You"      dataKey="You"      stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
            <Radar name="Industry" dataKey="Industry" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.15} />
            <Radar name="Leader"   dataKey="Leader"   stroke="#22c55e" fill="#22c55e" fillOpacity={0.15} />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Bar Comparison */}
      <div className="card">
        <h2 className="font-semibold text-slate-700 mb-4">Metric-by-Metric Comparison</h2>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={BENCHMARK_DATA}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="metric" tick={{ fontSize: 11 }} />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Legend />
            <Bar dataKey="yours"    name="Your Company"     fill="#6366f1" radius={[4,4,0,0]} />
            <Bar dataKey="industry" name="Industry Average" fill="#94a3b8" radius={[4,4,0,0]} />
            <Bar dataKey="leader"   name="Industry Leader"  fill="#22c55e" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Peer Table */}
      <div className="card">
        <h2 className="font-semibold text-slate-700 mb-4">Peer Company Comparison Table</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-slate-400 text-left">
              <th className="pb-3 pr-4">Company</th>
              <th className="pb-3 pr-4">Overall</th>
              <th className="pb-3 pr-4">Data Quality</th>
              <th className="pb-3 pr-4">AI Transparency</th>
              <th className="pb-3 pr-4">EUDR</th>
              <th className="pb-3 pr-4">Carbon</th>
              <th className="pb-3">Trend</th>
            </tr></thead>
            <tbody>
              {PEERS.map((p, i) => (
                <tr key={i} className={`border-b last:border-0 ${i === 0 ? 'bg-indigo-50 font-semibold' : 'hover:bg-slate-50'}`}>
                  <td className="py-3 pr-4">{i === 0 ? '⭐ ' : ''}{p.name}</td>
                  <td className="py-3 pr-4"><span className={`font-bold ${p.overall >= 80 ? 'text-green-600' : p.overall >= 65 ? 'text-amber-600' : 'text-red-500'}`}>{p.overall}</span></td>
                  <td className="py-3 pr-4">{p.dataQuality}</td>
                  <td className="py-3 pr-4">{p.aiTransparency}</td>
                  <td className="py-3 pr-4">{p.eudr}</td>
                  <td className="py-3 pr-4">{p.carbon}</td>
                  <td className="py-3"><span className={p.trend.startsWith('+') ? 'text-green-600' : 'text-red-500'}>{p.trend}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Gap Analysis */}
      <div className="card bg-indigo-50 border-indigo-200">
        <h2 className="font-semibold text-indigo-700 mb-3">📊 Gap Analysis — To Reach Industry Leader</h2>
        <div className="space-y-2">
          {BENCHMARK_DATA.map(d => {
            const gap = d.leader - d.yours
            return (
              <div key={d.metric} className="flex items-center gap-3">
                <div className="w-32 text-sm text-slate-600 flex-shrink-0">{d.metric}</div>
                <div className="flex-1 bg-white rounded-full h-3 relative overflow-hidden">
                  <div className="absolute inset-y-0 left-0 bg-green-200 rounded-full" style={{ width: `${d.leader}%` }} />
                  <div className="absolute inset-y-0 left-0 bg-indigo-500 rounded-full" style={{ width: `${d.yours}%` }} />
                </div>
                <div className="text-xs font-semibold text-slate-500 w-16 text-right">
                  {gap > 0 ? <span className="text-red-500">-{gap} pts</span> : <span className="text-green-600">✓ Ahead</span>}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
