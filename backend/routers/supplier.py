from fastapi import APIRouter
from services.gemini_service import get_supplier_risk_analysis
from services.database import get_all_suppliers, get_supplier, add_supplier, update_supplier_status, get_supplier_summary

router = APIRouter()

STATUS_COLORS = {"approved":"green","needs_review":"amber","rejected":"red","pending":"gray"}

@router.get("/list")
def get_suppliers():
    suppliers = get_all_suppliers()
    for s in suppliers:
        s["status_color"] = STATUS_COLORS.get(s["status"],"gray")
    summary = get_supplier_summary()
    return {"suppliers": suppliers, "summary": summary}

@router.get("/summary")
def supplier_summary():
    return get_supplier_summary()

@router.get("/{supplier_id}")
def get_one_supplier(supplier_id: str):
    s = get_supplier(supplier_id)
    return s if s else {"error":"Not found"}

@router.post("/add")
def create_supplier(supplier: dict):
    new_s = add_supplier(supplier)
    return {"success": True, "supplier": new_s}

@router.put("/{supplier_id}/status")
def update_status(supplier_id: str, body: dict):
    update_supplier_status(supplier_id, body.get("status","pending"), body.get("note",""))
    return {"success": True, "supplier": get_supplier(supplier_id)}

@router.get("/{supplier_id}/risk-analysis")
def get_supplier_risk(supplier_id: str):
    supplier = get_supplier(supplier_id)
    if not supplier:
        return {"error": "Supplier not found"}
    risk_analysis = get_supplier_risk_analysis(
        supplier_name=supplier["name"],
        quality_score=supplier["trust_score"],
        certification=supplier["certification"],
        country=supplier["country"],
        commodity=supplier["commodity"]
    )
    overall_risk = "low" if supplier["trust_score"]>=80 else "medium" if supplier["trust_score"]>=60 else "high"
    return {"supplier": supplier, "risk_analysis": risk_analysis, "overall_risk": overall_risk}
