from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import lineage, explainability, quality, audit, supplier, reporting, fileprocessor, authentication
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
    return {
        "trust_score":         round(avg_trust) if uploads else 87,
        "data_quality_score":  92,
        "audit_readiness_score":78,
        "ai_confidence_score": 84,
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
