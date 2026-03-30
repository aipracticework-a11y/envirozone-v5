import { useEffect, useState } from 'react'
import { getLineageGraph, getNodeDetail, getNodeAI } from '../api/client'
import { GitBranch, X, Loader } from 'lucide-react'

const NODE_COLORS = {
  source:      { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af' },
  process:     { bg: '#fef3c7', border: '#f59e0b', text: '#92400e' },
  output:      { bg: '#dcfce7', border: '#22c55e', text: '#14532d' },
}

function LineageNode({ node, onClick }) {
  const style = NODE_COLORS[node.type] || NODE_COLORS.process
  return (
    <div
      onClick={() => onClick(node)}
      style={{ left: node.x, top: node.y, borderColor: style.border, backgroundColor: style.bg }}
      className="absolute w-36 p-3 rounded-xl border-2 cursor-pointer hover:shadow-lg transition-all text-center z-10"
    >
      <div style={{ color: style.text }} className="text-xs font-bold leading-tight whitespace-pre-line">{node.label}</div>
      <div style={{ backgroundColor: style.border }} className="mt-2 text-white text-xs px-2 py-0.5 rounded-full capitalize">{node.type}</div>
    </div>
  )
}

function EdgeLines({ edges, nodes }) {
  const nodeMap = {}
  nodes.forEach(n => { nodeMap[n.id] = n })
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
      {edges.map(edge => {
        const s = nodeMap[edge.source]; const t = nodeMap[edge.target]
        if (!s || !t) return null
        const x1 = s.x + 72; const y1 = s.y + 40; const x2 = t.x; const y2 = t.y + 40
        const mx = (x1 + x2) / 2
        return (
          <g key={edge.id}>
            <path d={`M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`} fill="none" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrow)" />
            <text x={mx} y={(y1 + y2) / 2 - 5} textAnchor="middle" fontSize="10" fill="#64748b">{edge.label}</text>
          </g>
        )
      })}
      <defs>
        <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill="#94a3b8" />
        </marker>
      </defs>
    </svg>
  )
}

function NodeDetailPanel({ nodeId, onClose }) {
  const [detail, setDetail] = useState(null)
  const [aiSummary, setAiSummary] = useState('')
  const [loading, setLoading] = useState(true)
  const [aiLoading, setAiLoading] = useState(false)

  useEffect(() => {
    if (!nodeId) return
    setLoading(true); setAiSummary('')
    getNodeDetail(nodeId).then(r => { setDetail(r.data); setLoading(false) })
  }, [nodeId])

  const loadAI = () => {
    setAiLoading(true)
    getNodeAI(nodeId).then(r => { setAiSummary(r.data.ai_summary); setAiLoading(false) })
  }

  const statusBadge = detail?.status === 'verified'
    ? <span className="badge-green">✓ Verified</span>
    : <span className="badge-amber">⚠ Needs Review</span>

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 overflow-y-auto">
      <div className="flex items-center justify-between p-5 border-b bg-[#0f2340]">
        <h3 className="font-bold text-white">Node Details</h3>
        <button onClick={onClose} className="text-white hover:text-slate-300"><X className="w-5 h-5" /></button>
      </div>
      {loading ? <div className="p-8 text-slate-400 text-center">Loading...</div> : detail && (
        <div className="p-5 space-y-4">
          <div>
            <h4 className="font-bold text-slate-800 text-lg">{detail.name}</h4>
            <div className="mt-1">{statusBadge}</div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-slate-50 p-3 rounded-lg"><div className="text-slate-400">Source System</div><div className="font-medium mt-1 text-slate-700 text-xs">{detail.source_system}</div></div>
            <div className="bg-slate-50 p-3 rounded-lg"><div className="text-slate-400">Records</div><div className="font-bold mt-1 text-slate-800">{detail.records?.toLocaleString()}</div></div>
            <div className="bg-slate-50 p-3 rounded-lg"><div className="text-slate-400">Confidence</div><div className="font-bold mt-1 text-green-600">{detail.confidence}%</div></div>
            <div className="bg-slate-50 p-3 rounded-lg"><div className="text-slate-400">Scope</div><div className="font-medium mt-1 text-slate-700">{detail.scope}</div></div>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg text-sm">
            <div className="text-slate-400 mb-2">Transformations Applied</div>
            {detail.transformations?.map((t, i) => <div key={i} className="text-slate-700 flex gap-2">• {t}</div>)}
          </div>
          <div className="bg-slate-50 p-3 rounded-lg text-sm">
            <div className="text-slate-400 mb-1">Submitted By</div>
            <div className="text-slate-700">{detail.submitted_by}</div>
            <div className="text-xs text-slate-400 mt-1">{new Date(detail.last_updated).toLocaleString()}</div>
          </div>
          {!aiSummary && (
            <button onClick={loadAI} disabled={aiLoading} className="w-full bg-purple-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2">
              {aiLoading ? <><Loader className="w-4 h-4 animate-spin" /> Analyzing...</> : '🤖 Get AI Explanation'}
            </button>
          )}
          {aiSummary && (
            <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
              <div className="text-purple-700 font-semibold text-sm mb-2">🤖 AI Insight</div>
              <p className="text-sm text-slate-700">{aiSummary}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function DataLineage() {
  const [graph, setGraph] = useState(null)
  const [selectedNode, setSelectedNode] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getLineageGraph().then(r => { setGraph(r.data); setLoading(false) })
  }, [])

  if (loading) return <div className="flex items-center justify-center h-64 text-slate-400">Loading lineage graph...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><GitBranch className="w-6 h-6 text-blue-500" /> Data Lineage & Traceability</h1>
          <p className="text-slate-500 mt-1">End-to-end data provenance across Scope 1/2/3, suppliers & packaging</p>
        </div>
        {graph && (
          <div className="flex gap-4 text-sm">
            <span className="badge-blue">{graph.summary.total_sources} Sources</span>
            <span className="badge-amber">{graph.summary.total_transformations} Transforms</span>
            <span className="badge-green">{graph.summary.data_points_traced.toLocaleString()} Data Points</span>
          </div>
        )}
      </div>

      <div className="card">
        <div className="flex gap-4 mb-4 text-xs">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-300 inline-block" /> Source</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-300 inline-block" /> Process</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-300 inline-block" /> Output</span>
          <span className="text-slate-400 ml-2">Click any node for details</span>
        </div>
        <div className="relative bg-slate-50 rounded-xl overflow-auto" style={{ height: 680 }}>
          {graph && <>
            <EdgeLines edges={graph.edges} nodes={graph.nodes} />
            {graph.nodes.map(node => <LineageNode key={node.id} node={node} onClick={n => setSelectedNode(n.id)} />)}
          </>}
        </div>
      </div>

      {selectedNode && <NodeDetailPanel nodeId={selectedNode} onClose={() => setSelectedNode(null)} />}
    </div>
  )
}
