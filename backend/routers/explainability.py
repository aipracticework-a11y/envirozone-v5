from fastapi import APIRouter
from services.gemini_service import explain_model_decision, get_gemini_response

router = APIRouter()

AI_MODELS = [
    {
        "id": "emissions_estimator_v3",
        "name": "Emissions Estimator",
        "version": "v3.2.1",
        "type": "Regression",
        "accuracy": 94.2,
        "last_trained": "2025-02-01",
        "data_points": 45000,
        "status": "active",
        "description": "Estimates tCO2e from activity data using IPCC emission factors"
    },
    {
        "id": "supplier_risk_v2",
        "name": "Supplier Risk Scorer",
        "version": "v2.0.4",
        "type": "Classification",
        "accuracy": 88.7,
        "last_trained": "2025-01-15",
        "data_points": 12000,
        "status": "active",
        "description": "Scores supplier ESG risk from 0-100 based on disclosures"
    },
    {
        "id": "forecast_model_v1",
        "name": "Emissions Forecast Model",
        "version": "v1.3.0",
        "type": "Time-Series",
        "accuracy": 82.1,
        "last_trained": "2025-03-01",
        "data_points": 8760,
        "status": "active",
        "description": "12-month emissions forecast with confidence intervals"
    },
]

AI_ESTIMATES = [
    {
        "id": 1,
        "metric": "Scope 1 Emissions - Q1 2025",
        "model": "emissions_estimator_v3",
        "value": 1247.3,
        "unit": "tCO2e",
        "confidence": 94,
        "status": "high_confidence",
        "factors": ["Natural gas consumption: 45%", "Fleet fuel usage: 32%", "Refrigerants: 23%"],
        "data_sources": ["Supplier A ERP", "Fleet Management System"],
        "generated_at": "2025-03-15T09:00:00Z"
    },
    {
        "id": 2,
        "metric": "Supplier B Risk Score",
        "model": "supplier_risk_v2",
        "value": 72,
        "unit": "score/100",
        "confidence": 84,
        "status": "medium_confidence",
        "factors": ["Incomplete Scope 3 disclosures: 40%", "No third-party audit: 35%", "Geographic risk: 25%"],
        "data_sources": ["Supplier B Submission", "CDP Database"],
        "generated_at": "2025-03-14T14:30:00Z"
    },
    {
        "id": 3,
        "metric": "Q4 2025 Emissions Forecast",
        "model": "forecast_model_v1",
        "value": 5840.0,
        "unit": "tCO2e",
        "confidence": 78,
        "status": "medium_confidence",
        "factors": ["Historical trend: 60%", "Seasonal adjustment: 25%", "Business growth factor: 15%"],
        "data_sources": ["Historical ESG Data 2022-2024", "Business Plan 2025"],
        "generated_at": "2025-03-10T11:00:00Z"
    },
    {
        "id": 4,
        "metric": "Scope 2 Emissions - Q1 2025",
        "model": "emissions_estimator_v3",
        "value": 892.5,
        "unit": "tCO2e",
        "confidence": 97,
        "status": "high_confidence",
        "factors": ["Electricity consumption: 78%", "District heating: 22%"],
        "data_sources": ["Electricity Provider API", "Facility Management"],
        "generated_at": "2025-03-15T09:05:00Z"
    },
]

@router.get("/models")
def get_models():
    return {"models": AI_MODELS, "total": len(AI_MODELS)}

@router.get("/estimates")
def get_estimates():
    return {"estimates": AI_ESTIMATES, "total": len(AI_ESTIMATES)}

@router.get("/explain/{estimate_id}")
def explain_estimate(estimate_id: int):
    estimate = next((e for e in AI_ESTIMATES if e["id"] == estimate_id), None)
    if not estimate:
        return {"error": "Estimate not found"}
    explanation = explain_model_decision(
        metric_name=estimate["metric"],
        value=estimate["value"],
        factors=estimate["factors"]
    )
    return {
        "estimate": estimate,
        "ai_explanation": explanation,
        "explainability_score": estimate["confidence"],
        "audit_ready": estimate["confidence"] >= 80
    }

@router.get("/search")
def semantic_search(query: str):
    from services.qdrant_service import search_esg_knowledge
    results = search_esg_knowledge(query)
    ai_answer = get_gemini_response(f"Answer this ESG question concisely in 2 sentences: {query}")
    return {
        "query": query,
        "ai_answer": ai_answer,
        "knowledge_results": results
    }
