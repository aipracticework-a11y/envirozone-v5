import os
from dotenv import load_dotenv

load_dotenv()

QDRANT_URL = os.getenv("QDRANT_URL", "")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY", "")

# Mock ESG data for semantic search when Qdrant is not configured
MOCK_ESG_KNOWLEDGE = [
    {"id": 1, "text": "Scope 1 emissions are direct greenhouse gas emissions from owned or controlled sources including fuel combustion in boilers and vehicles.", "category": "emissions"},
    {"id": 2, "text": "Scope 2 emissions are indirect emissions from purchased electricity, steam, heating and cooling consumed by the company.", "category": "emissions"},
    {"id": 3, "text": "Scope 3 emissions include all other indirect emissions in the company value chain including supplier activities and product use.", "category": "emissions"},
    {"id": 4, "text": "CSRD requires large companies to disclose sustainability information including environmental, social and governance data from 2024.", "category": "regulation"},
    {"id": 5, "text": "SEC Climate disclosure rules require public companies to report material climate risks and greenhouse gas emissions.", "category": "regulation"},
    {"id": 6, "text": "Data lineage tracks the origin, movement and transformation of data from source to report ensuring full traceability.", "category": "governance"},
    {"id": 7, "text": "ESG data quality controls include completeness checks, range validation, anomaly detection and cross-source reconciliation.", "category": "quality"},
    {"id": 8, "text": "Supplier ESG risk scoring considers emissions disclosure quality, certification status, geographic risk and data timeliness.", "category": "supplier"},
]

def search_esg_knowledge(query: str, top_k: int = 3) -> list:
    """Search ESG knowledge base. Uses Qdrant if configured, otherwise mock search."""
    if not QDRANT_URL or QDRANT_URL == "your_qdrant_cluster_url_here":
        return _mock_search(query, top_k)
    try:
        from qdrant_client import QdrantClient
        client = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY)
        # In real implementation, embed query and search
        return _mock_search(query, top_k)
    except Exception:
        return _mock_search(query, top_k)

def _mock_search(query: str, top_k: int) -> list:
    query_lower = query.lower()
    results = []
    for item in MOCK_ESG_KNOWLEDGE:
        score = sum(1 for word in query_lower.split() if word in item["text"].lower())
        if score > 0:
            results.append({**item, "relevance_score": round(score / len(query_lower.split()), 2)})
    results.sort(key=lambda x: x["relevance_score"], reverse=True)
    return results[:top_k] if results else MOCK_ESG_KNOWLEDGE[:top_k]
