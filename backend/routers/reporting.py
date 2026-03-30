from fastapi import APIRouter
from services.gemini_service import get_gemini_response

router = APIRouter()

CONTROLS = [
    {"id": 1, "name": "Data Completeness Check", "description": "All mandatory ESG fields populated", "status": "pass", "weight": 20},
    {"id": 2, "name": "AI Model Audit Log Present", "description": "All AI decisions have explainability records", "status": "pass", "weight": 15},
    {"id": 3, "name": "Supplier Sign-off", "description": "All suppliers have confirmed data accuracy", "status": "fail", "weight": 20, "gap": "2 suppliers pending"},
    {"id": 4, "name": "Third-Party Verification", "description": "External assurance engaged for material topics", "status": "pass", "weight": 15},
    {"id": 5, "name": "Emission Factor References", "description": "All calculations cite approved emission factors", "status": "pass", "weight": 10},
    {"id": 6, "name": "Scope 3 Methodology Doc", "description": "Category-level methodology documented", "status": "warning", "weight": 10, "gap": "Categories 4 & 11 need update"},
    {"id": 7, "name": "Anomaly Resolution", "description": "All high-severity anomalies resolved", "status": "fail", "weight": 10, "gap": "2 open high-severity anomalies"},
]

EMISSIONS_SUMMARY = {
    "scope1": {"value": 1247.3, "unit": "tCO2e", "change": "+2.1%", "trend": "up"},
    "scope2": {"value": 892.5, "unit": "tCO2e", "change": "-5.3%", "trend": "down"},
    "scope3": {"value": 8420.0, "unit": "tCO2e", "change": "+1.8%", "trend": "up"},
    "total": {"value": 10559.8, "unit": "tCO2e", "change": "+0.8%", "trend": "up"},
    "reporting_period": "Q1 2025",
    "base_year": "2022",
    "base_year_total": 11200.0
}

FRAMEWORKS = ["CSRD", "SEC Climate", "GRI Standards", "TCFD", "CDP"]

@router.get("/controls")
def get_controls():
    passed = sum(1 for c in CONTROLS if c["status"] == "pass")
    score = sum(c["weight"] for c in CONTROLS if c["status"] == "pass")
    return {
        "controls": CONTROLS,
        "passed": passed,
        "total": len(CONTROLS),
        "assurance_score": score
    }

@router.get("/emissions-summary")
def get_emissions_summary():
    return EMISSIONS_SUMMARY

@router.get("/frameworks")
def get_frameworks():
    return {"frameworks": FRAMEWORKS}

@router.get("/ai-readiness")
def get_ai_readiness():
    failed = [c for c in CONTROLS if c["status"] == "fail"]
    warnings = [c for c in CONTROLS if c["status"] == "warning"]
    gaps = [c.get("gap", "") for c in failed + warnings if c.get("gap")]
    prompt = f"Generate an ESG assurance readiness summary. Gaps identified: {', '.join(gaps)}. Assurance score is 78/100. What are the top 3 priority actions to achieve full CSRD readiness? Keep it under 100 words."
    analysis = get_gemini_response(prompt)
    return {
        "assurance_score": 78,
        "gaps": gaps,
        "ai_recommendations": analysis,
        "estimated_readiness_date": "2025-04-15",
        "frameworks_covered": ["CSRD", "GRI Standards"]
    }

@router.get("/generate-report")
def generate_report(framework: str = "CSRD", period: str = "Q1 2025"):
    prompt = f"Generate a brief {framework} ESG disclosure summary for {period} with total emissions of 10,559.8 tCO2e. Include key highlights and compliance status in under 150 words."
    report_text = get_gemini_response(prompt)
    return {
        "framework": framework,
        "period": period,
        "status": "generated",
        "report_summary": report_text,
        "emissions_data": EMISSIONS_SUMMARY,
        "generated_at": "2025-03-18T12:00:00Z"
    }
