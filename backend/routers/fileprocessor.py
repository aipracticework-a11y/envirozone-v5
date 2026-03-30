from fastapi import APIRouter, UploadFile, File, Form
from services.gemini_service import analyze_uploaded_file, get_gemini_response
from services.defra_service import run_defra_check_on_dataframe
from services.gfw_service import check_deforestation, extract_coordinates_from_df
from services.database import save_upload_record, get_all_uploads, get_upload_by_id, update_supplier_trust, get_all_suppliers
import io, os, uuid

router = APIRouter()

REQUIRED_ESG_COLUMNS = [
    "supplier_name","emission_value","unit","scope",
    "reporting_period","data_source","country","commodity"
]

UPLOAD_DIR = os.path.join(os.path.dirname(__file__),"..","uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

def detect_anomalies(df) -> list:
    anomalies = []
    try:
        for col in df.select_dtypes(include='number').columns:
            mean, std = df[col].mean(), df[col].std()
            if std > 0:
                n = len(df[abs(df[col]-mean) > 3*std])
                if n > 0:
                    anomalies.append(f"Column '{col}': {n} outlier(s) beyond 3 sigma")
        dupes = df.duplicated().sum()
        if dupes > 0:
            anomalies.append(f"{dupes} duplicate rows detected")
        null_cols = [c for c in df.columns if df[c].isnull().all()]
        for c in null_cols:
            anomalies.append(f"Column '{c}' is entirely empty")
    except Exception:
        pass
    return anomalies

def parse_file(content: bytes, filename: str) -> dict:
    try:
        import pandas as pd
        df = pd.read_csv(io.BytesIO(content)) if filename.endswith(".csv") else pd.read_excel(io.BytesIO(content))
        columns   = list(df.columns)
        col_lower = [c.lower().replace(" ","_") for c in columns]
        missing   = [r for r in REQUIRED_ESG_COLUMNS if r not in col_lower]
        data_types= {col: str(df[col].dtype) for col in columns}
        null_counts={col: int(df[col].isnull().sum()) for col in columns if df[col].isnull().sum()>0}
        anomalies = detect_anomalies(df)
        completeness = round((1 - df.isnull().sum().sum()/(df.shape[0]*df.shape[1]))*100, 1)
        sample = [{k: str(v) for k,v in row.items()} for _,row in df.head(3).iterrows()]
        return {
            "success":True,"df":df,"columns":columns,"row_count":len(df),
            "col_count":len(columns),"missing_esg_fields":missing,
            "data_types":data_types,"null_counts":null_counts,
            "anomalies":anomalies,"completeness":completeness,"sample_data":sample,
        }
    except Exception as e:
        return {"success":False,"error":str(e)}

def find_supplier_id(supplier_name: str) -> str:
    suppliers = get_all_suppliers()
    name_lower = supplier_name.lower()
    for s in suppliers:
        if s["name"].lower() in name_lower or name_lower in s["name"].lower():
            return s["id"]
    return ""

@router.post("/upload")
async def upload_and_analyze(
    file: UploadFile = File(...),
    supplier_name: str = Form(default="Unknown Supplier"),
    commodity: str = Form(default=""),
    country: str = Form(default=""),
):
    content  = await file.read()
    filename = file.filename
    file_size= len(content)

    safe_name = f"{uuid.uuid4()}_{filename}"
    file_path = os.path.join(UPLOAD_DIR, safe_name)
    with open(file_path, "wb") as f:
        f.write(content)

    parsed = parse_file(content, filename)
    if not parsed["success"]:
        return {"status":"error","message":parsed["error"]}

    df = parsed["df"]
    col_lower = {c.lower().replace(" ","_"): c for c in parsed["columns"]}

    if not commodity:
        for key in ["commodity","product","material"]:
            if key in col_lower:
                try:
                    commodity = str(df[col_lower[key]].dropna().iloc[0])
                    break
                except Exception:
                    pass

    if not country:
        for key in ["country","country_of_origin","origin"]:
            if key in col_lower:
                try:
                    country = str(df[col_lower[key]].dropna().iloc[0])
                    break
                except Exception:
                    pass

    defra_result = run_defra_check_on_dataframe(df, country)

    lat, lng = extract_coordinates_from_df(df)
    if lat is not None and lng is not None and commodity:
        gfw_result = check_deforestation(lat, lng, commodity, country)
    else:
        gfw_result = {
            "status":"no_coordinates","passed":None,"score":None,
            "message":"No GPS coordinates found. Add 'latitude' and 'longitude' columns for deforestation verification.",
            "data_source":"GFW — coordinates required"
        }

    ai_result = analyze_uploaded_file(
        filename=filename, columns=parsed["columns"],
        row_count=parsed["row_count"], missing_fields=parsed["missing_esg_fields"],
        sample_data=parsed["sample_data"], data_types=parsed["data_types"],
        anomalies=parsed["anomalies"],
    )

    scores = [ai_result.get("trust_score",50) if isinstance(ai_result,dict) else 50]
    if defra_result.get("checks_performed",0) > 0:
        scores.append(defra_result.get("overall_score",50))
    if gfw_result.get("score") is not None:
        scores.append(gfw_result["score"])

    trust_score = int(sum(scores)/len(scores))
    auth_status = "authenticated" if trust_score>=80 else "partial" if trust_score>=60 else "failed"

    supplier_id = find_supplier_id(supplier_name)
    if supplier_id:
        update_supplier_trust(supplier_id, trust_score, gfw_result.get("eudr_status",""))

    ai_summary = get_gemini_response(
        f"ESG data authenticated for '{supplier_name}', commodity '{commodity}', country '{country}'. "
        f"Trust score: {trust_score}/100. DEFRA: {defra_result.get('message','N/A')}. "
        f"GFW: {gfw_result.get('finding','N/A')}. Missing fields: {parsed['missing_esg_fields']}. "
        f"Write a 3-sentence professional audit summary with key findings and recommended actions."
    )

    record_id = save_upload_record({
        "supplier_id":supplier_id,"supplier_name":supplier_name,
        "filename":safe_name,"original_filename":filename,"file_path":file_path,
        "file_size":file_size,"commodity":commodity,"country":country,
        "certification":"","scope":"","trust_score":trust_score,"auth_status":auth_status,
        "rows":parsed["row_count"],"columns":parsed["col_count"],
        "completeness":parsed["completeness"],"missing_fields":parsed["missing_esg_fields"],
        "anomalies":parsed["anomalies"],"defra_result":defra_result,
        "gfw_result":gfw_result,"eudr_result":{},"ghg_result":{},"cert_result":{},
        "ai_summary":ai_summary,
    })

    return {
        "status":"success","record_id":record_id,"filename":filename,
        "supplier_name":supplier_name,"commodity":commodity,"country":country,
        "file_stats":{"rows":parsed["row_count"],"columns":parsed["col_count"],
                      "completeness":parsed["completeness"],"file_size_kb":round(file_size/1024,1)},
        "columns":parsed["columns"],"missing_esg_fields":parsed["missing_esg_fields"],
        "null_counts":parsed["null_counts"],"anomalies":parsed["anomalies"],
        "sample_data":parsed["sample_data"],"defra_verification":defra_result,
        "gfw_verification":gfw_result,"ai_analysis":ai_result,"ai_summary":ai_summary,
        "trust_score":trust_score,"auth_status":auth_status,
    }

@router.get("/history")
def get_upload_history(supplier_id: str = None):
    uploads = get_all_uploads(supplier_id)
    return {"uploads":uploads,"total":len(uploads)}

@router.get("/history/{record_id}")
def get_upload_detail(record_id: str):
    record = get_upload_by_id(record_id)
    return record if record else {"error":"Record not found"}

@router.get("/template")
def get_template_info():
    return {
        "required_columns": REQUIRED_ESG_COLUMNS,
        "optional_for_defra": ["activity_type","quantity","fuel_type"],
        "optional_for_gfw": ["latitude","longitude"],
        "example_row": {
            "supplier_name":"GreenTech Manufacturing","emission_value":125.4,
            "unit":"tCO2e","scope":"Scope 3","reporting_period":"Q1 2025",
            "data_source":"SAP ERP","country":"Germany","commodity":"Barley",
            "activity_type":"natural gas","quantity":682,
            "latitude":51.1657,"longitude":10.4515,
        }
    }
