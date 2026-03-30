from fastapi import APIRouter
from services.gemini_service import generate_audit_summary

router = APIRouter()

AUDIT_LOGS = [
    {"id": 1, "timestamp": "2025-03-18T10:30:00Z", "user": "analyst@company.com", "action": "updated", "entity": "Scope 2 Emissions", "old_value": "892.1 tCO2e", "new_value": "892.5 tCO2e", "reason": "Corrected meter reading from Building C", "system": "ESG Platform", "ip": "192.168.1.10"},
    {"id": 2, "timestamp": "2025-03-18T09:15:00Z", "user": "system@esgplatform.com", "action": "flagged", "entity": "Scope 2 Electricity Data", "old_value": None, "new_value": "Anomaly: 34% spike", "reason": "Automated anomaly detection triggered", "system": "AI Monitor", "ip": "system"},
    {"id": 3, "timestamp": "2025-03-17T16:45:00Z", "user": "manager@company.com", "action": "approved", "entity": "Supplier A Q1 Submission", "old_value": "pending", "new_value": "approved", "reason": "Third-party verification complete", "system": "ESG Platform", "ip": "192.168.1.25"},
    {"id": 4, "timestamp": "2025-03-17T14:20:00Z", "user": "supplier_b@vendor.com", "action": "submitted", "entity": "Supplier B Q1 Data", "old_value": None, "new_value": "430 records uploaded", "reason": "Q1 2025 mandatory submission", "system": "Supplier Portal", "ip": "203.0.113.5"},
    {"id": 5, "timestamp": "2025-03-16T11:00:00Z", "user": "analyst@company.com", "action": "recalculated", "entity": "Scope 3 Category 11 Emissions", "old_value": "2140.0 tCO2e", "new_value": "2287.5 tCO2e", "reason": "Updated emission factor from IPCC 2024 guidelines", "system": "Calculation Engine", "ip": "192.168.1.10"},
    {"id": 6, "timestamp": "2025-03-15T08:30:00Z", "user": "system@esgplatform.com", "action": "ingested", "entity": "Supplier A ERP Data", "old_value": None, "new_value": "1240 records synced via API", "reason": "Scheduled daily sync", "system": "Data Pipeline", "ip": "system"},
    {"id": 7, "timestamp": "2025-03-14T17:00:00Z", "user": "auditor@external.com", "action": "reviewed", "entity": "FY2024 ESG Report Draft", "old_value": "draft", "new_value": "under_review", "reason": "External assurance engagement initiated", "system": "ESG Platform", "ip": "45.32.100.15"},
    {"id": 8, "timestamp": "2025-03-13T09:00:00Z", "user": "manager@company.com", "action": "rejected", "entity": "Supplier C Submission", "old_value": "pending", "new_value": "rejected", "reason": "Missing Scope 3 downstream data, resubmission required", "system": "ESG Platform", "ip": "192.168.1.25"},
]

ACTION_COLORS = {
    "updated": "blue",
    "flagged": "red",
    "approved": "green",
    "submitted": "purple",
    "recalculated": "orange",
    "ingested": "teal",
    "reviewed": "gray",
    "rejected": "red"
}

@router.get("/logs")
def get_audit_logs(skip: int = 0, limit: int = 20):
    logs_with_colors = [{**log, "color": ACTION_COLORS.get(log["action"], "gray")} for log in AUDIT_LOGS]
    return {
        "logs": logs_with_colors[skip:skip+limit],
        "total": len(AUDIT_LOGS),
        "actions_summary": {
            "total_changes": len(AUDIT_LOGS),
            "approvals": sum(1 for l in AUDIT_LOGS if l["action"] == "approved"),
            "rejections": sum(1 for l in AUDIT_LOGS if l["action"] == "rejected"),
            "system_actions": sum(1 for l in AUDIT_LOGS if l["user"] == "system@esgplatform.com"),
        }
    }

@router.get("/ai-summary")
def get_audit_ai_summary():
    recent_logs = [f"{l['timestamp']}: {l['user']} {l['action']} {l['entity']}" for l in AUDIT_LOGS[:5]]
    summary = generate_audit_summary(recent_logs)
    return {"summary": summary, "period": "Last 7 days", "total_events": len(AUDIT_LOGS)}
