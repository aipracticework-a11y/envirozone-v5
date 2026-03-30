import { useState } from 'react'
import { Newspaper, Loader, ExternalLink } from 'lucide-react'

const NEWS_ITEMS = [
  { id: 1, title: 'EU Deforestation Regulation: New Compliance Deadline Confirmed for December 2025', category: 'EUDR', commodity: 'Palm Oil, Timber, Cocoa', impact: 'high', date: '2025-03-18', source: 'European Commission', summary: 'The European Commission has confirmed the EUDR compliance deadline remains December 2025 for large operators. Companies must ensure all relevant commodities are deforestation-free with full geolocation data.', sentiment: 'warning' },
  { id: 2, title: 'Cocoa Prices Hit 46-Year High Amid West Africa Supply Concerns', category: 'Commodity', commodity: 'Cocoa', impact: 'high', date: '2025-03-17', source: 'Reuters', summary: 'Cocoa futures surged to record levels as poor harvests in Ivory Coast and Ghana reduce global supply. ESG-compliant sourcing becomes more competitive as demand outstrips certified supply.', sentiment: 'alert' },
  { id: 3, title: 'SEC Climate Disclosure Rules: Final Implementation Guidance Released', category: 'Regulation', commodity: 'All', impact: 'high', date: '2025-03-16', source: 'SEC.gov', summary: 'The US Securities and Exchange Commission released final guidance on climate disclosure requirements. Large accelerated filers must begin reporting Scope 1 and 2 emissions from FY2025.', sentiment: 'warning' },
  { id: 4, title: 'Palm Oil Sustainability: RSPO Certification Rates Improve in Indonesia', category: 'Sustainability', commodity: 'Palm Oil', impact: 'medium', date: '2025-03-15', source: 'RSPO', summary: 'Roundtable on Sustainable Palm Oil reports a 12% increase in certified production areas in Indonesia, signalling improving supply chain standards amid EUDR pressure.', sentiment: 'positive' },
  { id: 5, title: 'AI in ESG Reporting: Gemini and GPT-4 Transform Data Verification', category: 'Technology', commodity: 'All', impact: 'medium', date: '2025-03-14', source: 'ESG Today', summary: 'Major corporations are adopting AI-powered tools to automate ESG data verification, reducing manual effort by up to 70% while improving accuracy and audit trail quality.', sentiment: 'positive' },
  { id: 6, title: 'Amazon Deforestation Falls 50% in 2024 Under New Brazil Regulations', category: 'Environment', commodity: 'Soya, Timber', impact: 'medium', date: '2025-03-13', source: 'INPE Brazil', summary: 'Brazilian space agency reports significant decline in Amazon deforestation rates following enforcement of the new Forest Code. Soya and timber supply chain risk ratings may improve for certified suppliers.', sentiment: 'positive' },
  { id: 7, title: 'CSRD Reporting: First Wave Companies Begin Mandatory Disclosures', category: 'Regulation', commodity: 'All', impact: 'high', date: '2025-03-12', source: 'EFRAG', summary: 'Large EU companies with over 500 employees begin mandatory sustainability reporting under CSRD. Early submissions highlight data quality and supply chain traceability as key challenges.', sentiment: 'warning' },
  { id: 8, title: 'Coffee Farmers in Vietnam Adopt Regenerative Agriculture Practices', category: 'Sustainability', commodity: 'Coffee', impact: 'low', date: '2025-03-11', source: 'Rainforest Alliance', summary: 'Over 15,000 coffee farmers in Vietnam have adopted regenerative agriculture practices supported by Rainforest Alliance certification, reducing carbon emissions and improving biodiversity.', sentiment: 'positive' },
]

const SENTIMENT_STYLE = {
  positive: { bg: 'bg-green-50 border-green-200', badge: 'badge-green',  icon: '✅' },
  warning:  { bg: 'bg-amber-50 border-amber-200', badge: 'badge-amber',  icon: '⚠️' },
  alert:    { bg: 'bg-red-50 border-red-200',     badge: 'badge-red',    icon: '🚨' },
}
const IMPACT_BADGE = { high: 'badge-red', medium: 'badge-amber', low: 'badge-green' }

const CATEGORIES = ['All', 'EUDR', 'Regulation', 'Sustainability', 'Commodity', 'Technology', 'Environment']

export default function ESGNewsFeed() {
  const [filter, setFilter]       = useState('All')
  const [expanded, setExpanded]   = useState(null)
  const [aiLoading, setAiLoading] = useState(null)
  const [aiInsights, setAiInsights] = useState({})

  const filtered = filter === 'All' ? NEWS_ITEMS : NEWS_ITEMS.filter(n => n.category === filter)

  const getAIInsight = (item) => {
    setAiLoading(item.id)
    setTimeout(() => {
      const insights = {
        1: 'EUDR deadline creates immediate action required for palm oil and timber suppliers. Recommend prioritising geolocation data collection for Supplier A and B within 30 days.',
        2: 'Cocoa price surge increases supplier financial stress risk. Monitor Supplier C payment terms and review contract conditions to maintain supply chain stability.',
        3: 'SEC disclosure requirements directly impact your Q1 2025 Scope 1 and 2 emissions reporting. Current data quality score of 85% meets the threshold.',
        4: 'RSPO certification improvement creates opportunity to upgrade Supplier A risk rating from high to medium. Request updated certification status.',
        5: 'AI verification adoption aligns with our platform capabilities. Position EnvirozoneAI as the solution for automated ESG data trust verification.',
        6: 'Amazon deforestation reduction may allow reassessment of Brazil-origin soya and timber risk scores. Schedule Q2 supplier review.',
        7: 'CSRD first wave reporting begins. Our audit trail and data lineage features directly address the key challenges identified.',
        8: 'Vietnam coffee sustainability improvement may positively impact Supplier D risk score in Q2 assessment.',
      }
      setAiInsights(p => ({ ...p, [item.id]: insights[item.id] || 'This news item has moderate impact on your ESG supply chain. Monitor for further developments and update supplier risk assessments accordingly.' }))
      setAiLoading(null)
    }, 1500)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Newspaper className="w-6 h-6 text-rose-500" /> ESG News Feed
          </h1>
          <p className="text-slate-500 mt-1">AI-curated latest ESG news by commodity, regulation and sustainability</p>
        </div>
        <div className="text-xs text-slate-400 bg-slate-100 px-3 py-1.5 rounded-full">
          🔄 Updated: {new Date().toLocaleDateString()}
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setFilter(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filter === cat ? 'bg-rose-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-rose-300'}`}>
            {cat}
          </button>
        ))}
      </div>

      {/* News Items */}
      <div className="space-y-4">
        {filtered.map(item => {
          const style = SENTIMENT_STYLE[item.sentiment]
          return (
            <div key={item.id} className={`border rounded-2xl p-5 transition-all hover:shadow-md ${style.bg}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-lg">{style.icon}</span>
                    <span className={IMPACT_BADGE[item.impact]}>{item.impact} impact</span>
                    <span className="badge-blue">{item.category}</span>
                    <span className="text-xs text-slate-400">📦 {item.commodity}</span>
                  </div>
                  <h3 className="font-bold text-slate-800 text-lg leading-snug cursor-pointer hover:text-rose-700"
                    onClick={() => setExpanded(expanded === item.id ? null : item.id)}>
                    {item.title}
                  </h3>
                  <div className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                    <span>📰 {item.source}</span>
                    <span>📅 {item.date}</span>
                  </div>
                </div>
              </div>

              {expanded === item.id && (
                <div className="mt-4 pt-4 border-t border-current/10">
                  <p className="text-sm text-slate-700 leading-relaxed">{item.summary}</p>
                  <div className="mt-4 flex gap-3">
                    <button onClick={() => getAIInsight(item)} disabled={aiLoading === item.id}
                      className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg text-xs font-semibold hover:bg-purple-200 disabled:opacity-50 flex items-center gap-2">
                      {aiLoading === item.id ? <><Loader className="w-3 h-3 animate-spin" />Analyzing...</> : '🤖 Get AI Impact Analysis'}
                    </button>
                    <button className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-xs font-semibold hover:bg-slate-50 flex items-center gap-2">
                      <ExternalLink className="w-3 h-3" /> Read Full Article
                    </button>
                  </div>
                  {aiInsights[item.id] && (
                    <div className="mt-3 bg-purple-50 border border-purple-200 p-4 rounded-xl">
                      <div className="text-purple-700 font-semibold text-sm mb-1">🤖 AI Impact on Your Supply Chain</div>
                      <p className="text-sm text-slate-700">{aiInsights[item.id]}</p>
                    </div>
                  )}
                </div>
              )}

              {expanded !== item.id && (
                <button onClick={() => setExpanded(item.id)}
                  className="mt-3 text-xs text-slate-400 hover:text-slate-600">
                  Read more →
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
