import { useEffect, useState } from 'react'
import { getAuditLogs, getAuditSummary } from '../api/client'
import { ClipboardList, Loader } from 'lucide-react'

const COLOR_MAP = { blue:'bg-blue-500', red:'bg-red-500', green:'bg-green-500', purple:'bg-purple-500', orange:'bg-orange-500', teal:'bg-teal-500', gray:'bg-slate-400' }
const ACTION_EMOJI = { updated:'✏️', flagged:'🚩', approved:'✅', submitted:'📤', recalculated:'🔄', ingested:'📥', reviewed:'👁️', rejected:'❌' }

export default function AuditTrail() {
  const [logs, setLogs] = useState([])
  const [summary, setSummary] = useState(null)
  const [aiSummary, setAiSummary] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    getAuditLogs().then(r => { setLogs(r.data.logs); setSummary(r.data.actions_summary); setLoading(false) })
  }, [])

  const loadAI = () => {
    setAiLoading(true)
    getAuditSummary().then(r => { setAiSummary(r.data.summary); setAiLoading(false) })
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-slate-400">Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><ClipboardList className="w-6 h-6 text-green-500" /> Audit Trail</h1>
          <p className="text-slate-500 mt-1">Full chronological log of all data changes and approvals</p>
        </div>
        <button onClick={loadAI} disabled={aiLoading} className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2">
          {aiLoading ? <><Loader className="w-4 h-4 animate-spin" /> Generating</> : '🤖 AI Summary'}
        </button>
      </div>

      {/* Stats */}
      {summary && (
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total Events', value: summary.total_changes, color: 'text-slate-800' },
            { label: 'Approvals', value: summary.approvals, color: 'text-green-600' },
            { label: 'Rejections', value: summary.rejections, color: 'text-red-600' },
            { label: 'System Actions', value: summary.system_actions, color: 'text-blue-600' },
          ].map(s => (
            <div key={s.label} className="card text-center">
              <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-sm text-slate-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* AI Summary */}
      {aiSummary && (
        <div className="bg-purple-50 border border-purple-200 p-5 rounded-xl">
          <div className="font-semibold text-purple-700 mb-2">🤖 AI Audit Summary</div>
          <p className="text-sm text-slate-700">{aiSummary}</p>
        </div>
      )}

      {/* Timeline */}
      <div className="card">
        <h2 className="font-semibold text-slate-700 mb-6">Activity Timeline — Click any entry to expand</h2>
        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-200" />
          <div className="space-y-4">
            {logs.map(log => (
              <div key={log.id} className="relative flex gap-4">
                <div className={`relative z-10 w-12 h-12 rounded-full ${COLOR_MAP[log.color] || 'bg-slate-400'} flex items-center justify-center text-white flex-shrink-0 text-lg`}>
                  {ACTION_EMOJI[log.action] || '•'}
                </div>
                <div className="flex-1 pb-4">
                  <div className="bg-slate-50 rounded-xl p-4 hover:shadow-sm cursor-pointer transition-all" onClick={() => setExpanded(expanded === log.id ? null : log.id)}>
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-semibold text-slate-800 capitalize">{log.action}</span>
                        <span className="text-slate-600"> — </span>
                        <span className="font-medium text-slate-700">{log.entity}</span>
                      </div>
                      <span className="text-xs text-slate-400 flex-shrink-0 ml-4">{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                    <div className="text-sm text-slate-500 mt-1">by <strong>{log.user}</strong> via {log.system}</div>
                    {expanded === log.id && (
                      <div className="mt-3 pt-3 border-t space-y-2 text-sm">
                        {log.old_value && <div><span className="text-slate-400">Before:</span> <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded">{log.old_value}</span></div>}
                        {log.new_value && <div><span className="text-slate-400">After:</span> <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded">{log.new_value}</span></div>}
                        <div><span className="text-slate-400">Reason:</span> <span className="text-slate-700">{log.reason}</span></div>
                        <div><span className="text-slate-400">IP:</span> <span className="font-mono text-xs text-slate-600">{log.ip}</span></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
