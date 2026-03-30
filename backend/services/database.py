"""
EnvirozoneAI Database Layer
============================
SQLite-based persistence for suppliers, file uploads, and processing history.
Zero external dependencies — built into Python.
"""

import sqlite3
import json
import os
import uuid
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "envirozone.db")
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "uploads")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Create all tables and seed initial data if empty."""
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    conn = get_db()
    c = conn.cursor()

    # Suppliers table
    c.execute("""
        CREATE TABLE IF NOT EXISTS suppliers (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            contact TEXT,
            country TEXT,
            region TEXT,
            commodity TEXT,
            secondary_commodities TEXT,
            scope TEXT,
            certification TEXT,
            certification_number TEXT,
            certification_expiry TEXT,
            status TEXT DEFAULT 'pending',
            trust_score INTEGER DEFAULT 0,
            files_submitted INTEGER DEFAULT 0,
            last_submission TEXT,
            eudr_status TEXT DEFAULT 'unknown',
            added_by TEXT DEFAULT 'system',
            created_at TEXT,
            updated_at TEXT,
            notes TEXT
        )
    """)

    # File uploads / processing history table
    c.execute("""
        CREATE TABLE IF NOT EXISTS file_uploads (
            id TEXT PRIMARY KEY,
            supplier_id TEXT,
            supplier_name TEXT,
            filename TEXT,
            original_filename TEXT,
            file_path TEXT,
            file_size INTEGER,
            commodity TEXT,
            country TEXT,
            certification TEXT,
            scope TEXT,
            uploaded_at TEXT,
            trust_score INTEGER,
            auth_status TEXT,
            rows INTEGER,
            columns INTEGER,
            completeness REAL,
            missing_fields TEXT,
            anomalies TEXT,
            defra_result TEXT,
            gfw_result TEXT,
            eudr_result TEXT,
            ghg_result TEXT,
            cert_result TEXT,
            ai_summary TEXT,
            full_result TEXT
        )
    """)

    conn.commit()

    # Seed initial suppliers if empty
    count = c.execute("SELECT COUNT(*) FROM suppliers").fetchone()[0]
    if count == 0:
        _seed_suppliers(c)
        conn.commit()

    conn.close()

def _seed_suppliers(c):
    suppliers = [
        {
            "id": str(uuid.uuid4()), "name": "GreenTech Manufacturing",
            "contact": "esg@greentech.com", "country": "Germany", "region": "Europe",
            "commodity": "Barley", "secondary_commodities": "Wheat",
            "scope": "Scope 1 & 3", "certification": "ISO 14001",
            "certification_number": "ISO-DE-2021-4471", "certification_expiry": "2026-06-30",
            "status": "approved", "trust_score": 96, "files_submitted": 4,
            "last_submission": "2025-03-15", "eudr_status": "not_applicable",
            "added_by": "admin", "created_at": "2024-01-10T09:00:00Z",
            "updated_at": "2025-03-15T08:30:00Z", "notes": "Top performing supplier"
        },
        {
            "id": str(uuid.uuid4()), "name": "FastLog Logistics",
            "contact": "sustainability@fastlog.com", "country": "India", "region": "Asia Pacific",
            "commodity": "Cotton", "secondary_commodities": "",
            "scope": "Scope 3", "certification": "None",
            "certification_number": "", "certification_expiry": "",
            "status": "needs_review", "trust_score": 67, "files_submitted": 2,
            "last_submission": "2025-03-17", "eudr_status": "not_applicable",
            "added_by": "admin", "created_at": "2024-03-01T10:00:00Z",
            "updated_at": "2025-03-17T14:00:00Z", "notes": "Missing Scope 3 documentation"
        },
        {
            "id": str(uuid.uuid4()), "name": "PackRight Packaging",
            "contact": "esg@packright.com", "country": "United Kingdom", "region": "Europe",
            "commodity": "Timber", "secondary_commodities": "Paper",
            "scope": "Scope 3", "certification": "FSC 100%",
            "certification_number": "FSC-C098765", "certification_expiry": "2027-03-15",
            "status": "approved", "trust_score": 91, "files_submitted": 3,
            "last_submission": "2025-03-12", "eudr_status": "compliant",
            "added_by": "admin", "created_at": "2024-02-15T09:00:00Z",
            "updated_at": "2025-03-12T12:00:00Z", "notes": "EUDR compliant, FSC certified"
        },
        {
            "id": str(uuid.uuid4()), "name": "PowerGrid Utilities",
            "contact": "data@powergrid.com", "country": "USA", "region": "Americas",
            "commodity": "Energy", "secondary_commodities": "",
            "scope": "Scope 2", "certification": "None",
            "certification_number": "", "certification_expiry": "",
            "status": "rejected", "trust_score": 31, "files_submitted": 1,
            "last_submission": "2025-03-13", "eudr_status": "not_applicable",
            "added_by": "admin", "created_at": "2024-04-01T09:00:00Z",
            "updated_at": "2025-03-13T16:00:00Z", "notes": "Data quality too low — resubmit required"
        },
        {
            "id": str(uuid.uuid4()), "name": "AgroFarm Inputs",
            "contact": "esg@agrofarm.com", "country": "Brazil", "region": "Americas",
            "commodity": "Soya", "secondary_commodities": "Corn",
            "scope": "Scope 3", "certification": "Rainforest Alliance",
            "certification_number": "RA-BR-2023-8821", "certification_expiry": "2026-01-31",
            "status": "pending", "trust_score": 0, "files_submitted": 0,
            "last_submission": "", "eudr_status": "non_compliant",
            "added_by": "admin", "created_at": "2025-01-15T09:00:00Z",
            "updated_at": "2025-01-15T09:00:00Z", "notes": "Onboarding in progress — EUDR gaps identified"
        },
        {
            "id": str(uuid.uuid4()), "name": "PalmSource Indonesia",
            "contact": "esg@palmsource.com", "country": "Indonesia", "region": "Asia Pacific",
            "commodity": "Palm Oil", "secondary_commodities": "Palm Kernel",
            "scope": "Scope 3", "certification": "RSPO Partial",
            "certification_number": "RSPO-ID-2022-5543", "certification_expiry": "2025-06-30",
            "status": "needs_review", "trust_score": 54, "files_submitted": 2,
            "last_submission": "2025-03-08", "eudr_status": "partial",
            "added_by": "admin", "created_at": "2024-06-01T09:00:00Z",
            "updated_at": "2025-03-08T11:00:00Z", "notes": "RSPO cert expiring June 2025 — renewal required"
        },
        {
            "id": str(uuid.uuid4()), "name": "CocoaWorld Ghana",
            "contact": "data@cocoaworld.com", "country": "Ghana", "region": "Africa",
            "commodity": "Cocoa", "secondary_commodities": "",
            "scope": "Scope 3", "certification": "Rainforest Alliance",
            "certification_number": "RA-GH-2024-1122", "certification_expiry": "2027-02-28",
            "status": "approved", "trust_score": 82, "files_submitted": 3,
            "last_submission": "2025-03-14", "eudr_status": "partial",
            "added_by": "admin", "created_at": "2024-05-10T09:00:00Z",
            "updated_at": "2025-03-14T10:00:00Z", "notes": "Geolocation data needed for full EUDR compliance"
        },
        {
            "id": str(uuid.uuid4()), "name": "VietCoffee Exports",
            "contact": "esg@vietcoffee.vn", "country": "Vietnam", "region": "Asia Pacific",
            "commodity": "Coffee", "secondary_commodities": "",
            "scope": "Scope 3", "certification": "Rainforest Alliance",
            "certification_number": "RA-VN-2023-3341", "certification_expiry": "2026-09-30",
            "status": "approved", "trust_score": 79, "files_submitted": 2,
            "last_submission": "2025-03-10", "eudr_status": "partial",
            "added_by": "admin", "created_at": "2024-07-01T09:00:00Z",
            "updated_at": "2025-03-10T09:00:00Z", "notes": "GPS coordinates pending for 3 farms"
        },
    ]
    now = datetime.utcnow().isoformat()
    for s in suppliers:
        c.execute("""INSERT OR IGNORE INTO suppliers VALUES (
            :id,:name,:contact,:country,:region,:commodity,:secondary_commodities,
            :scope,:certification,:certification_number,:certification_expiry,
            :status,:trust_score,:files_submitted,:last_submission,:eudr_status,
            :added_by,:created_at,:updated_at,:notes
        )""", s)

# ── SUPPLIER CRUD ─────────────────────────────────────────────────────────────

def get_all_suppliers():
    conn = get_db()
    rows = conn.execute("SELECT * FROM suppliers ORDER BY created_at DESC").fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_supplier(supplier_id: str):
    conn = get_db()
    row = conn.execute("SELECT * FROM suppliers WHERE id=?", (supplier_id,)).fetchone()
    conn.close()
    return dict(row) if row else None

def add_supplier(data: dict) -> dict:
    conn = get_db()
    new_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()
    conn.execute("""INSERT INTO suppliers VALUES (
        ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?
    )""", (
        new_id, data.get("name",""), data.get("contact",""),
        data.get("country",""), data.get("region",""),
        data.get("commodity",""), data.get("secondary_commodities",""),
        data.get("scope","Scope 3"), data.get("certification","None"),
        data.get("certification_number",""), data.get("certification_expiry",""),
        "pending", 0, 0, None, "unknown", "user", now, now,
        data.get("notes","")
    ))
    conn.commit()
    conn.close()
    return get_supplier(new_id)

def update_supplier_status(supplier_id: str, status: str, note: str = ""):
    conn = get_db()
    now = datetime.utcnow().isoformat()
    conn.execute(
        "UPDATE suppliers SET status=?, updated_at=?, notes=COALESCE(NULLIF(?,''), notes) WHERE id=?",
        (status, now, note, supplier_id)
    )
    conn.commit()
    conn.close()

def update_supplier_trust(supplier_id: str, trust_score: int, eudr_status: str = ""):
    conn = get_db()
    now = datetime.utcnow().isoformat()
    conn.execute("""
        UPDATE suppliers
        SET trust_score=?, updated_at=?, files_submitted=files_submitted+1,
            last_submission=?,
            eudr_status=COALESCE(NULLIF(?,''), eudr_status)
        WHERE id=?
    """, (trust_score, now, now[:10], eudr_status, supplier_id))
    conn.commit()
    conn.close()

def get_supplier_summary():
    conn = get_db()
    total    = conn.execute("SELECT COUNT(*) FROM suppliers").fetchone()[0]
    approved = conn.execute("SELECT COUNT(*) FROM suppliers WHERE status='approved'").fetchone()[0]
    pending  = conn.execute("SELECT COUNT(*) FROM suppliers WHERE status IN ('pending','needs_review')").fetchone()[0]
    rejected = conn.execute("SELECT COUNT(*) FROM suppliers WHERE status='rejected'").fetchone()[0]
    avg_trust= conn.execute("SELECT AVG(trust_score) FROM suppliers WHERE trust_score>0").fetchone()[0]
    conn.close()
    return {
        "total": total, "approved": approved,
        "pending_review": pending, "rejected": rejected,
        "avg_trust_score": round(avg_trust or 0, 1)
    }

# ── FILE UPLOAD HISTORY ───────────────────────────────────────────────────────

def save_upload_record(data: dict) -> str:
    conn = get_db()
    record_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()
    conn.execute("""INSERT INTO file_uploads VALUES (
        ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?
    )""", (
        record_id,
        data.get("supplier_id", ""),
        data.get("supplier_name", ""),
        data.get("filename", ""),
        data.get("original_filename", ""),
        data.get("file_path", ""),
        data.get("file_size", 0),
        data.get("commodity", ""),
        data.get("country", ""),
        data.get("certification", ""),
        data.get("scope", ""),
        now,
        data.get("trust_score", 0),
        data.get("auth_status", ""),
        data.get("rows", 0),
        data.get("columns", 0),
        data.get("completeness", 0),
        json.dumps(data.get("missing_fields", [])),
        json.dumps(data.get("anomalies", [])),
        json.dumps(data.get("defra_result", {})),
        json.dumps(data.get("gfw_result", {})),
        json.dumps(data.get("eudr_result", {})),
        json.dumps(data.get("ghg_result", {})),
        json.dumps(data.get("cert_result", {})),
        data.get("ai_summary", ""),
        json.dumps(data.get("full_result", {})),
    ))
    conn.commit()
    conn.close()
    return record_id

def get_all_uploads(supplier_id: str = None):
    conn = get_db()
    if supplier_id:
        rows = conn.execute(
            "SELECT * FROM file_uploads WHERE supplier_id=? ORDER BY uploaded_at DESC",
            (supplier_id,)
        ).fetchall()
    else:
        rows = conn.execute(
            "SELECT * FROM file_uploads ORDER BY uploaded_at DESC LIMIT 50"
        ).fetchall()
    conn.close()
    result = []
    for r in rows:
        d = dict(r)
        for field in ["missing_fields","anomalies","defra_result","gfw_result",
                      "eudr_result","ghg_result","cert_result"]:
            try:
                d[field] = json.loads(d[field] or "{}")
            except Exception:
                d[field] = {}
        result.append(d)
    return result

def get_upload_by_id(upload_id: str):
    conn = get_db()
    row = conn.execute("SELECT * FROM file_uploads WHERE id=?", (upload_id,)).fetchone()
    conn.close()
    if not row:
        return None
    d = dict(row)
    for field in ["missing_fields","anomalies","defra_result","gfw_result",
                  "eudr_result","ghg_result","cert_result"]:
        try:
            d[field] = json.loads(d[field] or "{}")
        except Exception:
            d[field] = {}
    return d
