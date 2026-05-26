import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getDashboard } from '../api/client'
import {
  Activity, AlertTriangle, ArrowUpRight, Bot, CheckCircle, ClipboardCheck,
  Database, FileSearch, GitBranch, Loader, ShieldCheck, Sparkles, Target,
  TrendingUp, Users
} from 'lucide-react'

function ScoreDial({ score }) {
  const color = score >= 80 ? '#0f766e' : score >= 60 ? '#d97706' : '#dc2626'
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const dash = (score / 100) * circumference
  return (
    <div className="relative h-36 w-36 shrink-0">
      <svg viewBox="0 0 140 140" className="h-36 w-36 rotate-[-90deg]">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="12" />
        <circle cx="70" cy="70" r={radius} fill="none" stroke={color} strokeWidth="12"
          strokeDasharray={`${dash} ${circumference - dash}`} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-4xl font-black text-slate-950">{score}</div>
        <div className="text-xs font-bold text-slate-400">/100</div>
      </div>
    </div>
  )
}

function ScoreBreakdown({ items = [] }) {
  return (
    <div className="space-y-4">
      {items.map(item => (
        <div key={item.key}>
          <div className="flex items-center justify-between gap-4 text-sm">
            <div>
              <div className="font-bold text-slate-800">{item.label}</div>
              <div className="text-xs text-slate-500">{item.evidence}</div>
            </div>
            <div className="text-right shrink-0">
              <div className="font-black text-slate-900">{item.contribution}</div>
              <div className="text-[11px] text-slate-400">of {item.weight}</div>
            </div>
          </div>
          <div className="mt-2 h-2 rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full rounded-full bg-teal-600" style={{ width: `${item.score}%` }} />
          </div>
          <div className="mt-1 flex justify-between text-[11px] font-semibold text-slate-400">
            <span>{item.score}/100 raw score</span>
            <span>{item.weight}% weight</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function MiniMetric({ icon: Icon, label, value, tone }) {
  const tones = {
    teal: 'bg-teal-50 text-teal-700 border-teal-100',
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    purple: 'bg-purple-50 text-purple-700 border-purple-100',
  }
  return (
    <div className={`rounded-2xl border p-4 ${tones[tone]}`}>
      <Icon className="w-5 h-5 mb-3" />
      <div className="text-2xl font-black">{value}</div>
      <div className="text-xs font-bold text-slate-500 mt-1">{label}</div>
    </div>
  )
}

function PriorityCard({ item, index }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-black uppercase tracking-wide text-teal-700">Priority {index + 1}</div>
          <div className="mt-1 font-bold text-slate-900">{item.title}</div>
        </div>
        <span className="rounded-full bg-green-50 px-2 py-1 text-[11px] font-black text-green-700">{item.impact}</span>
      </div>
      <p className="mt-3 text-sm text-slate-600">{item.action}</p>
      <div className="mt-3 text-xs font-semibold text-slate-400">Owner: {item.owner}</div>
    </div>
  )
}

function WorkflowStep({ step }) {
  const statusColor = step.status === 'complete' ? 'bg-green-500' : step.status === 'review' ? 'bg-amber-500' : 'bg-teal-600'
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <div className="font-bold text-sm text-slate-800">{step.step}</div>
        <span className="text-xs font-black text-slate-400 uppercase">{step.status}</span>
      </div>
      <div className="mt-3 h-2 rounded-full bg-slate-100 overflow-hidden">
        <div className={`h-full rounded-full ${statusColor}`} style={{ width: `${step.progress}%` }} />
      </div>
      <div className="mt-2 text-xs font-semibold text-slate-500">{step.progress}% ready</div>
    </div>
  )
}

function AlertItem({ alert }) {
  const colors = { high: 'border-l-red-500 bg-red-50', medium: 'border-l-amber-500 bg-amber-50', low: 'border-l-blue-500 bg-blue-50' }
  return (
    <div className={`border-l-4 p-3 rounded-r-xl ${colors[alert.severity]}`}>
      <p className="text-sm font-semibold text-slate-700">{alert.message}</p>
      <p className="text-xs text-slate-400 mt-1">{alert.time}</p>
    </div>
  )
}

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboard().then(r => { setData(r.data); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-slate-400"><Loader className="w-5 h-5 animate-spin mr-2" />Loading dashboard...</div>
  }
  if (!data) return <div className="text-red-500">Failed to load dashboard.</div>
  const trustBreakdown = data.trust_score_breakdown || [
    { key:'data_completeness', label:'Data Completeness', score:data.data_quality_score, weight:20, contribution:18.4, evidence:'Required ESG fields and supplier data coverage.' },
    { key:'standards_validation', label:'Standards Validation', score:data.trust_score, weight:25, contribution:21.8, evidence:data.authentication_standard || 'IPCC, DEFRA, EUDR, and GHG Protocol checks.' },
    { key:'traceability', label:'Lineage & Traceability', score:data.audit_readiness_score, weight:20, contribution:15.6, evidence:'Upload history, lineage, and audit trail coverage.' },
    { key:'anomaly_controls', label:'Anomaly Controls', score:82, weight:15, contribution:12.3, evidence:'Active anomaly detection and resolution workflow.' },
    { key:'certification_proof', label:'Certification Proof', score:80, weight:10, contribution:8.0, evidence:'Supplier certification and registry relevance.' },
    { key:'ai_explainability', label:'AI Explainability', score:data.ai_confidence_score, weight:10, contribution:8.4, evidence:'AI explanations and guarded assistant responses.' },
  ]
  const trustPriorities = data.trust_score_priorities || [
    { title:'Resolve active anomalies', impact:'+3 trust points', action:'Investigate open spikes and missing supplier fields.', owner:'Data Quality' },
    { title:'Add score evidence', impact:'+4 trust points', action:'Attach standard checks, file lineage, and certification proof.', owner:'Authentication' },
    { title:'Prepare audit pack', impact:'+2 trust points', action:'Generate summary evidence for auditor review.', owner:'Reporting Hub' },
  ]
  const assuranceWorkflow = data.assurance_workflow || [
    { step:'Ingest supplier files', status:'complete', progress:100 },
    { step:'Validate standards', status:'active', progress:data.trust_score },
    { step:'Explain AI decisions', status:'active', progress:data.ai_confidence_score },
    { step:'Prepare audit evidence', status:'review', progress:data.audit_readiness_score },
  ]

  return (
    <div className="space-y-7">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid xl:grid-cols-[1.1fr_1.3fr] gap-8">
          <div className="flex items-start gap-6">
            <ScoreDial score={data.trust_score} />
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-black text-teal-800">
                <ShieldCheck className="w-3.5 h-3.5" /> Assurance cockpit
              </div>
              <h2 className="mt-4 text-3xl font-black text-slate-950">Can this ESG data be trusted?</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                This dashboard explains the trust score using completeness, standards validation, lineage,
                anomaly controls, certification proof, and AI explainability.
              </p>
              <div className="mt-4 rounded-2xl bg-slate-50 p-3 text-xs font-semibold text-slate-600">
                {data.trust_score_formula}
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link to="/authenticate" className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800">
                  View Trust Score <ArrowUpRight className="w-4 h-4" />
                </Link>
                <Link to="/documents" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">
                  Upload Evidence <FileSearch className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-slate-900">Trust score breakdown</h3>
              <span className="text-xs font-bold text-slate-400">Weighted contribution</span>
            </div>
            <ScoreBreakdown items={trustBreakdown} />
          </div>
        </div>
      </section>

      <section className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
        <MiniMetric icon={Database} label="Data Quality Score" value={`${data.data_quality_score}/100`} tone="blue" />
        <MiniMetric icon={ClipboardCheck} label="Audit Readiness" value={`${data.audit_readiness_score}/100`} tone="purple" />
        <MiniMetric icon={Bot} label="AI Confidence" value={`${data.ai_confidence_score}/100`} tone="amber" />
        <MiniMetric icon={Users} label="Active Suppliers" value={data.total_suppliers} tone="teal" />
      </section>

      <section className="grid xl:grid-cols-[1fr_0.8fr] gap-5">
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-teal-700" />
            <h2 className="font-black text-slate-900">What should improve next?</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {trustPriorities.map((item, index) => <PriorityCard key={item.title} item={item} index={index} />)}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-teal-700" />
            <h2 className="font-black text-slate-900">Assurance workflow</h2>
          </div>
          <div className="space-y-3">
            {assuranceWorkflow.map(step => <WorkflowStep key={step.step} step={step} />)}
          </div>
        </div>
      </section>

      <section className="grid xl:grid-cols-[0.8fr_1.2fr] gap-5">
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h2 className="font-black text-slate-900">Attention required</h2>
          </div>
          <div className="space-y-3">
            {data.recent_alerts.map(a => <AlertItem key={a.id} alert={a} />)}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-teal-700" />
            <h2 className="font-black text-slate-900">Core trust capabilities</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { title:'Traceability', text:'Follow data from source file to report output.', icon:GitBranch, link:'/lineage' },
              { title:'Explainability', text:'Explain AI estimates, supplier risks, and score decisions.', icon:Bot, link:'/explainability' },
              { title:'Controls', text:'Monitor anomalies, validation rules, and audit evidence.', icon:CheckCircle, link:'/quality' },
            ].map(item => (
              <Link key={item.title} to={item.link} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 hover:bg-white hover:shadow-sm">
                <item.icon className="w-5 h-5 text-teal-700 mb-3" />
                <div className="font-bold text-slate-900">{item.title}</div>
                <div className="text-sm text-slate-500 mt-1">{item.text}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <p className="text-xs text-slate-400">Last updated: {new Date(data.last_updated).toLocaleString()}</p>
    </div>
  )
}
