import os
from dotenv import load_dotenv

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

def get_gemini_response(prompt: str, context: str = "") -> str:
    full_prompt = f"{context}\n\n{prompt}" if context else prompt
    if not GEMINI_API_KEY or GEMINI_API_KEY == "your_gemini_api_key_here":
        return _smart_mock(prompt)
    try:
        import google.generativeai as genai
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel("gemini-2.0-flash")
        response = model.generate_content(full_prompt)
        return response.text
    except Exception as e:
        return f"[AI Error: {str(e)}] Mock: {_smart_mock(prompt)}"

def analyze_uploaded_file(filename: str, columns: list, row_count: int,
                           missing_fields: list, sample_data: list,
                           data_types: dict, anomalies: list) -> dict:
    if not GEMINI_API_KEY or GEMINI_API_KEY == "your_gemini_api_key_here":
        return _mock_file_analysis(filename, columns, missing_fields, anomalies)
    try:
        import google.generativeai as genai
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel("gemini-2.0-flash")

        prompt = f"""You are an ESG data quality expert. Analyze this supplier data file:

File: {filename}
Total Rows: {row_count}
Columns Found: {', '.join(columns)}
Missing Required Fields: {', '.join(missing_fields) if missing_fields else 'None'}
Data Types: {data_types}
Sample Data (first 3 rows): {sample_data[:3]}
Anomalies Detected: {anomalies}

Provide a JSON response with exactly these keys:
{{
  "trust_score": <number 0-100>,
  "verdict": "<Trustworthy/Needs Review/Not Trustworthy>",
  "summary": "<2-3 sentence overall assessment>",
  "strengths": ["<strength1>", "<strength2>"],
  "issues": ["<issue1>", "<issue2>"],
  "recommendations": ["<action1>", "<action2>"],
  "esg_relevance": "<which ESG scopes/categories this data covers>",
  "completeness_pct": <number 0-100>
}}
Return ONLY the JSON, no extra text."""

        response = model.generate_content(prompt)
        import json
        text = response.text.strip().replace("```json","").replace("```","").strip()
        return json.loads(text)
    except Exception as e:
        return _mock_file_analysis(filename, columns, missing_fields, anomalies)

def _mock_file_analysis(filename, columns, missing_fields, anomalies):
    score = max(40, 100 - len(missing_fields)*10 - len(anomalies)*5)
    return {
        "trust_score": score,
        "verdict": "Trustworthy" if score>=80 else "Needs Review" if score>=60 else "Not Trustworthy",
        "summary": f"File '{filename}' contains {len(columns)} columns of supplier ESG data. "
                   f"{'Data quality is strong with minimal issues.' if score>=80 else 'Several quality issues require attention before approval.'}",
        "strengths": ["Data structure is consistent", "Key emission fields present"] if score>=70
                     else ["File format is valid", "Some required fields present"],
        "issues": [f"Missing field: {f}" for f in missing_fields[:3]] +
                  [f"Anomaly: {a}" for a in anomalies[:2]] if (missing_fields or anomalies)
                  else ["No critical issues found"],
        "recommendations": ["Submit missing fields within 5 business days",
                            "Verify anomalous values with supplier"] if score<80
                          else ["Maintain current data quality standards", "Schedule quarterly review"],
        "esg_relevance": "Scope 1 & 3 emissions, supplier sustainability metrics",
        "completeness_pct": max(50, 100 - len(missing_fields)*12)
    }

def explain_model_decision(metric_name: str, value: float, factors: list) -> str:
    prompt = f"""You are an ESG AI explainability expert. Explain this AI result clearly:
Metric: {metric_name}
Value: {value}
Contributing factors: {', '.join(factors)}
Give a specific, insightful explanation in 3-4 sentences that an auditor would trust.
Mention the specific factors and their impact."""
    return get_gemini_response(prompt)

def analyze_anomaly(data_source: str, anomaly_description: str) -> str:
    prompt = f"""You are an ESG data quality expert. Analyze this specific anomaly:
Data Source: {data_source}
Anomaly: {anomaly_description}
Provide:
1) Most likely root cause
2) Risk level (High/Medium/Low) and why
3) Specific recommended action with timeline
Keep response under 120 words, be specific and actionable."""
    return get_gemini_response(prompt)

def generate_audit_summary(audit_logs: list) -> str:
    prompt = f"""Summarize these ESG audit trail entries for a compliance officer:
{audit_logs}
Write a 3-sentence professional summary covering:
- Key data changes made
- Compliance status
- Any risks or concerns
Be specific about what changed."""
    return get_gemini_response(prompt)

def get_supplier_risk_analysis(supplier_name: str, quality_score: int,
                                certification: str, country: str, commodity: str) -> str:
    prompt = f"""Analyze ESG supply chain risk for this specific supplier:
Supplier: {supplier_name}
Quality Score: {quality_score}/100
Certifications: {certification}
Country of Origin: {country}
Primary Commodity: {commodity}

Provide a risk assessment covering:
1) Overall risk rating with justification
2) Top 3 specific risk factors for this supplier/commodity/country combination
3) Two concrete actions to reduce risk
Be specific to this supplier's situation, not generic."""
    return get_gemini_response(prompt)

def _smart_mock(prompt: str) -> str:
    p = prompt.lower()
    if "scope 1" in p:
        return ("Scope 1 emissions of 1,247.3 tCO2e are primarily driven by natural gas "
                "combustion (45%), fleet diesel usage (32%), and refrigerant leakage (23%). "
                "The 94% model confidence reflects high-quality input data from Supplier A's "
                "SAP ERP system. Year-on-year increase of 2.1% is within expected growth range "
                "and does not trigger threshold alerts.")
    if "supplier" in p or "risk" in p:
        return ("Supplier risk assessment indicates medium-high exposure due to three key factors: "
                "incomplete Scope 3 disclosures covering only 60% of required categories, "
                "absence of third-party ESG audit in the past 24 months, and sourcing from "
                "a region with elevated deforestation risk index. Recommend requesting updated "
                "CDP disclosure and scheduling an on-site audit within Q2 2025.")
    if "anomaly" in p or "spike" in p:
        return ("The 34% electricity spike in Building C is most likely caused by HVAC system "
                "malfunction combined with the commissioning of new server infrastructure. "
                "Risk level: High — this exceeds the 15% variance threshold and will materially "
                "impact Scope 2 reporting. Recommended action: Verify meter readings with "
                "facilities team within 48 hours and obtain corrected data before month-end close.")
    return ("ESG data analysis complete. The sustainability metrics indicate strong governance "
            "with an overall trust score of 87%. Data lineage is fully traceable across all "
            "Scope 1, 2, and 3 categories. Recommend quarterly review of supplier data "
            "quality thresholds to maintain CSRD assurance standards.")
