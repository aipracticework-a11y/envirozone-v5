from fastapi import APIRouter
from services.gemini_service import analyze_anomaly

router = APIRouter()

DATA_SOURCES = [
    {"id": 1, "name": "Supplier A - ERP Data", "scope": "Scope 1 & 3", "status": "green", "quality_score": 96, "last_checked": "2025-03-18T06:00:00Z", "issues": 0, "records": 1240},
    {"id": 2, "name": "Scope 2 Electricity", "scope": "Scope 2", "status": "red", "quality_score": 61, "last_checked": "2025-03-18T06:00:00Z", "issues": 2, "records": 8760},
    {"id": 3, "name": "Supplier B - Manual Upload", "scope": "Scope 3", "status": "amber", "quality_score": 74, "last_checked": "2025-03-17T14:00:00Z", "issues": 3, "records": 430},
    {"id": 4, "name": "Packaging Vendor Data", "scope": "Scope 3", "status": "green", "quality_score": 91, "last_checked": "2025-03-18T06:00:00Z", "issues": 0, "records": 210},
    {"id": 5, "name": "Fleet Management System", "scope": "Scope 1", "status": "amber", "quality_score": 83, "last_checked": "2025-03-18T05:00:00Z", "issues": 1, "records": 3600},
    {"id": 6, "name": "Refrigerant Logs", "scope": "Scope 1", "status": "green", "quality_score": 99, "last_checked": "2025-03-18T06:00:00Z", "issues": 0, "records": 52},
]

ANOMALIES = [
    {"id": 1, "source": "Scope 2 Electricity", "type": "spike", "description": "34% spike in electricity consumption detected vs previous month", "severity": "high", "detected_at": "2025-03-18T04:15:00Z", "status": "open", "value": 1247, "expected": 930},
    {"id": 2, "source": "Scope 2 Electricity", "type": "missing_data", "description": "3 days of meter readings missing for Building C", "severity": "high", "detected_at": "2025-03-17T22:00:00Z", "status": "open", "value": 0, "expected": 45},
    {"id": 3, "source": "Supplier B - Manual Upload", "type": "missing_fields", "description": "Unit of measure missing for 28 records", "severity": "medium", "detected_at": "2025-03-17T14:20:00Z", "status": "open", "value": 28, "expected": 0},
    {"id": 4, "source": "Supplier B - Manual Upload", "type": "outlier", "description": "Transport emissions value 5x above category average", "severity": "medium", "detected_at": "2025-03-17T14:20:00Z", "status": "open", "value": 450, "expected": 90},
    {"id": 5, "source": "Supplier B - Manual Upload", "type": "format_error", "description": "Date format inconsistency in 12 records (DD/MM vs MM/DD)", "severity": "low", "detected_at": "2025-03-17T14:20:00Z", "status": "open", "value": 12, "expected": 0},
    {"id": 6, "source": "Fleet Management System", "type": "late_submission", "description": "Fleet data for March week 2 submitted 5 days late", "severity": "low", "detected_at": "2025-03-15T00:00:00Z", "status": "acknowledged", "value": 5, "expected": 0},
]

QUALITY_RULES = [
    {"id": 1, "name": "Scope 1 Year-on-Year Change", "description": "Scope 1 value cannot exceed previous year by more than 50%", "status": "pass"},
    {"id": 2, "name": "Unit of Measure Required", "description": "All supplier data must have unit of measure defined", "status": "fail"},
    {"id": 3, "name": "Emission Factor Reference", "description": "Each calculation must reference a valid emission factor", "status": "pass"},
    {"id": 4, "name": "Submission Timeliness", "description": "Data must be submitted within 30 days of period end", "status": "warning"},
    {"id": 5, "name": "Double Counting Check", "description": "Same activity data cannot appear in multiple scopes", "status": "pass"},
    {"id": 6, "name": "Completeness Threshold", "description": "Data completeness must exceed 95% for all critical fields", "status": "warning"},
]

TREND_DATA = [
    {"month": "Oct", "quality_score": 81, "anomalies": 7},
    {"month": "Nov", "quality_score": 84, "anomalies": 5},
    {"month": "Dec", "quality_score": 79, "anomalies": 9},
    {"month": "Jan", "quality_score": 87, "anomalies": 4},
    {"month": "Feb", "quality_score": 90, "anomalies": 2},
    {"month": "Mar", "quality_score": 85, "anomalies": 6},
]

@router.get("/sources")
def get_data_sources():
    total = len(DATA_SOURCES)
    green = sum(1 for s in DATA_SOURCES if s["status"] == "green")
    amber = sum(1 for s in DATA_SOURCES if s["status"] == "amber")
    red = sum(1 for s in DATA_SOURCES if s["status"] == "red")
    return {"sources": DATA_SOURCES, "summary": {"total": total, "green": green, "amber": amber, "red": red}}

@router.get("/anomalies")
def get_anomalies():
    open_count = sum(1 for a in ANOMALIES if a["status"] == "open")
    return {"anomalies": ANOMALIES, "open_count": open_count, "total": len(ANOMALIES)}

@router.get("/anomaly/{anomaly_id}/analyze")
def analyze_anomaly_ai(anomaly_id: int):
    anomaly = next((a for a in ANOMALIES if a["id"] == anomaly_id), None)
    if not anomaly:
        return {"error": "Anomaly not found"}
    analysis = analyze_anomaly(anomaly["source"], anomaly["description"])
    return {"anomaly": anomaly, "ai_analysis": analysis}

@router.get("/rules")
def get_quality_rules():
    passed = sum(1 for r in QUALITY_RULES if r["status"] == "pass")
    return {"rules": QUALITY_RULES, "passed": passed, "total": len(QUALITY_RULES)}

@router.get("/trend")
def get_quality_trend():
    return {"trend": TREND_DATA}

@router.put("/anomaly/{anomaly_id}/resolve")
def resolve_anomaly(anomaly_id: int, body: dict):
    for a in ANOMALIES:
        if a["id"] == anomaly_id:
            a["status"] = body.get("status", "resolved")
            a["resolution_note"] = body.get("note", "")
            return {"success": True, "anomaly": a}
    return {"error": "Not found"}
