from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import lineage, explainability, quality, audit, supplier, reporting, fileprocessor, authentication, agent
from services.database import init_db

app = FastAPI(title="EnvirozoneAI Data Intelligence", version="5.0.0")

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

@app.on_event("startup")
def startup():
    init_db()

app.include_router(lineage.router,        prefix="/api/lineage",        tags=["Data Lineage"])
app.include_router(explainability.router, prefix="/api/explainability", tags=["AI Explainability"])
app.include_router(quality.router,        prefix="/api/quality",        tags=["Data Quality"])
app.include_router(audit.router,          prefix="/api/audit",          tags=["Audit Trail"])
app.include_router(supplier.router,       prefix="/api/supplier",       tags=["Supplier Portal"])
app.include_router(reporting.router,      prefix="/api/reporting",      tags=["Reporting Hub"])
app.include_router(fileprocessor.router,  prefix="/api/files",          tags=["File Processing"])
app.include_router(authentication.router, prefix="/api/auth",           tags=["Authentication Engine"])
app.include_router(agent.router,          prefix="/api/agent",          tags=["EnviroAgent"])

@app.get("/")
def root():
    return {"app":"EnvirozoneAI Data Intelligence","version":"5.0.0","status":"running"}

@app.get("/api/dashboard/summary")
def dashboard_summary():
    from services.database import get_supplier_summary, get_all_uploads
    summary = get_supplier_summary()
    uploads = get_all_uploads()
    files_processed = len(uploads)
    avg_trust = sum(u["trust_score"] for u in uploads) / max(len(uploads),1) if uploads else 87
    trust_score = round(avg_trust) if uploads else 87
    trust_breakdown = [
        {
            "key": "data_completeness",
            "label": "Data Completeness",
            "score": 91,
            "weight": 20,
            "contribution": 18.2,
            "evidence": "Required supplier, period, country, unit, and emissions fields are mostly present.",
        },
        {
            "key": "standards_validation",
            "label": "Standards Validation",
            "score": 84,
            "weight": 25,
            "contribution": 21.0,
            "evidence": "Files are checked against IPCC/DEFRA, GHG Protocol, and EUDR requirements.",
        },
        {
            "key": "traceability",
            "label": "Lineage & Traceability",
            "score": 86,
            "weight": 20,
            "contribution": 17.2,
            "evidence": "Upload history, supplier records, and lineage views support source-to-report traceability.",
        },
        {
            "key": "anomaly_controls",
            "label": "Anomaly Controls",
            "score": 78,
            "weight": 15,
            "contribution": 11.7,
            "evidence": "Active anomaly checks identify spikes, missing fields, and unusual supplier values.",
        },
        {
            "key": "certification_proof",
            "label": "Certification Proof",
            "score": 80,
            "weight": 10,
            "contribution": 8.0,
            "evidence": "Supplier certifications are checked for registry relevance and commodity fit.",
        },
        {
            "key": "ai_explainability",
            "label": "AI Explainability",
            "score": 88,
            "weight": 10,
            "contribution": 8.8,
            "evidence": "AI summaries, decision explanations, and guardrails support transparent AI use.",
        },
    ]
    return {
        "trust_score":         trust_score,
        "data_quality_score":  92,
        "audit_readiness_score":78,
        "ai_confidence_score": 84,
        "trust_score_formula": "Trust Score = sum(component score x component weight)",
        "trust_score_breakdown": trust_breakdown,
        "trust_score_priorities": [
            {
                "title": "Reduce active anomalies",
                "impact": "+3 to +5 trust points",
                "action": "Review unresolved spikes and missing supplier fields before assurance review.",
                "owner": "Data Quality",
            },
            {
                "title": "Strengthen certification evidence",
                "impact": "+2 to +4 trust points",
                "action": "Attach registry-valid certificates for regulated commodities.",
                "owner": "Supplier Portal",
            },
            {
                "title": "Complete EUDR evidence",
                "impact": "+4 to +8 trust points",
                "action": "Add geolocation and due diligence references for EUDR commodities.",
                "owner": "Authentication",
            },
        ],
        "assurance_workflow": [
            {"step": "Ingest supplier files", "status": "complete", "progress": 100},
            {"step": "Validate standards", "status": "active", "progress": 84},
            {"step": "Explain AI decisions", "status": "active", "progress": 88},
            {"step": "Prepare audit evidence", "status": "review", "progress": 78},
        ],
        "total_suppliers":     summary["total"],
        "active_anomalies":    3,
        "pending_approvals":   summary["pending_review"],
        "files_processed":     files_processed,
        "avg_supplier_trust":  summary["avg_trust_score"],
        "last_updated":        "2025-03-19T10:30:00Z",
        "authentication_standard": "IPCC AR6 + DEFRA 2024 + EUDR Article 3 + GFW",
        "recent_alerts": [
            {"id":1,"type":"anomaly","message":"Scope 2 electricity spike detected in Building C","severity":"high","time":"2 hours ago"},
            {"id":2,"type":"warning","message":"PalmSource RSPO certificate expiring June 2025","severity":"medium","time":"5 hours ago"},
            {"id":3,"type":"info","message":"DEFRA 2024 emission factors updated in authentication engine","severity":"low","time":"1 day ago"},
        ]
    }
