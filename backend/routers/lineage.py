from fastapi import APIRouter
from services.gemini_service import get_gemini_response

router = APIRouter()

LINEAGE_NODES = [
    {"id": "supplier_a", "label": "Supplier A\n(SAP ERP)", "type": "source", "category": "supplier", "x": 50, "y": 100},
    {"id": "supplier_b", "label": "Supplier B\n(Excel Upload)", "type": "source", "category": "supplier", "x": 50, "y": 250},
    {"id": "packaging", "label": "Packaging\nVendor", "type": "source", "category": "supplier", "x": 50, "y": 400},
    {"id": "electricity", "label": "Electricity\nProvider", "type": "source", "category": "utility", "x": 50, "y": 550},
    {"id": "scope1_calc", "label": "Scope 1\nCalculation", "type": "process", "category": "calculation", "x": 300, "y": 100},
    {"id": "scope2_calc", "label": "Scope 2\nCalculation", "type": "process", "category": "calculation", "x": 300, "y": 300},
    {"id": "scope3_calc", "label": "Scope 3\nCalculation", "type": "process", "category": "calculation", "x": 300, "y": 500},
    {"id": "validation", "label": "Data Quality\nValidation", "type": "process", "category": "quality", "x": 550, "y": 300},
    {"id": "aggregation", "label": "ESG\nAggregation", "type": "process", "category": "aggregation", "x": 750, "y": 300},
    {"id": "esg_report", "label": "ESG Report\n(CSRD/SEC)", "type": "output", "category": "report", "x": 950, "y": 300},
]

LINEAGE_EDGES = [
    {"id": "e1", "source": "supplier_a", "target": "scope1_calc", "label": "Fuel Data"},
    {"id": "e2", "source": "supplier_b", "target": "scope3_calc", "label": "Supply Chain"},
    {"id": "e3", "source": "packaging", "target": "scope3_calc", "label": "Packaging Data"},
    {"id": "e4", "source": "electricity", "target": "scope2_calc", "label": "kWh Data"},
    {"id": "e5", "source": "scope1_calc", "target": "validation", "label": "tCO2e"},
    {"id": "e6", "source": "scope2_calc", "target": "validation", "label": "tCO2e"},
    {"id": "e7", "source": "scope3_calc", "target": "validation", "label": "tCO2e"},
    {"id": "e8", "source": "validation", "target": "aggregation", "label": "Validated Data"},
    {"id": "e9", "source": "aggregation", "target": "esg_report", "label": "Final Metrics"},
]

NODE_DETAILS = {
    "supplier_a": {
        "name": "Supplier A - SAP ERP Integration",
        "source_system": "SAP S/4HANA via REST API",
        "last_updated": "2025-03-15T08:30:00Z",
        "submitted_by": "supplier_a@company.com",
        "confidence": 96,
        "records": 1240,
        "scope": "Scope 1 & 3",
        "status": "verified",
        "transformations": ["Unit conversion (MJ to tCO2e)", "Currency normalization", "Date standardization"]
    },
    "supplier_b": {
        "name": "Supplier B - Manual Upload",
        "source_system": "Excel file upload (manual)",
        "last_updated": "2025-03-10T14:20:00Z",
        "submitted_by": "supplier_b@company.com",
        "confidence": 71,
        "records": 430,
        "scope": "Scope 3",
        "status": "needs_review",
        "transformations": ["Missing field imputation", "Outlier removal", "Category mapping"]
    },
    "scope2_calc": {
        "name": "Scope 2 Calculation Engine",
        "source_system": "Internal Python model v2.3",
        "last_updated": "2025-03-18T06:00:00Z",
        "submitted_by": "system@esgplatform.com",
        "confidence": 89,
        "records": 8760,
        "scope": "Scope 2",
        "status": "verified",
        "transformations": ["Market-based method applied", "Location-based fallback", "Grid emission factor lookup"]
    },
}

@router.get("/graph")
def get_lineage_graph():
    return {
        "nodes": LINEAGE_NODES,
        "edges": LINEAGE_EDGES,
        "summary": {
            "total_sources": 4,
            "total_transformations": 5,
            "data_points_traced": 10430,
            "last_full_trace": "2025-03-18T06:00:00Z"
        }
    }

@router.get("/node/{node_id}")
def get_node_detail(node_id: str):
    detail = NODE_DETAILS.get(node_id, {
        "name": node_id.replace("_", " ").title(),
        "source_system": "Internal system",
        "last_updated": "2025-03-18T00:00:00Z",
        "submitted_by": "system@esgplatform.com",
        "confidence": 88,
        "records": 500,
        "scope": "Mixed",
        "status": "verified",
        "transformations": ["Standard transformation applied"]
    })
    return detail

@router.get("/ai-summary/{node_id}")
def get_lineage_ai_summary(node_id: str):
    prompt = f"Explain the data lineage and provenance for ESG data node '{node_id}' in a sustainability reporting context. Keep it under 80 words."
    summary = get_gemini_response(prompt)
    return {"node_id": node_id, "ai_summary": summary}
