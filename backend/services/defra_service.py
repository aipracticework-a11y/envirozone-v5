"""
DEFRA 2024 GHG Conversion Factors — Recalculator Engine
=========================================================
Source: UK Government GHG Conversion Factors for Company Reporting 2024
Published by: Department for Environment, Food & Rural Affairs (DEFRA)
URL: https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2024

All factors in kg CO2e per unit stated.
"""

# ── DEFRA 2024 EMISSION FACTORS ───────────────────────────────────────────────
DEFRA_2024 = {
    # Fuels — Stationary Combustion
    "natural_gas":      {"factor": 0.18385, "unit_in": "kWh",    "description": "Natural gas (gross CV)", "scope": "Scope 1"},
    "lng":              {"factor": 0.18385, "unit_in": "kWh",    "description": "Liquefied Natural Gas",  "scope": "Scope 1"},
    "diesel":           {"factor": 2.68691, "unit_in": "litre",  "description": "Diesel (road)",          "scope": "Scope 1"},
    "petrol":           {"factor": 2.31390, "unit_in": "litre",  "description": "Petrol (road)",          "scope": "Scope 1"},
    "lpg":              {"factor": 1.55540, "unit_in": "litre",  "description": "LPG",                    "scope": "Scope 1"},
    "coal":             {"factor": 2.42300, "unit_in": "kg",     "description": "Coal (industrial)",      "scope": "Scope 1"},
    "fuel_oil":         {"factor": 2.95900, "unit_in": "litre",  "description": "Heavy fuel oil",         "scope": "Scope 1"},
    "biomass":          {"factor": 0.01490, "unit_in": "kWh",    "description": "Biomass (wood chips)",   "scope": "Scope 1"},
    # Electricity — Scope 2
    "electricity_uk":   {"factor": 0.20493, "unit_in": "kWh",   "description": "UK grid electricity",    "scope": "Scope 2"},
    "electricity_eu":   {"factor": 0.27600, "unit_in": "kWh",   "description": "EU average electricity", "scope": "Scope 2"},
    "electricity_us":   {"factor": 0.38600, "unit_in": "kWh",   "description": "US average electricity", "scope": "Scope 2"},
    "electricity_in":   {"factor": 0.71000, "unit_in": "kWh",   "description": "India grid electricity", "scope": "Scope 2"},
    "electricity_id":   {"factor": 0.87900, "unit_in": "kWh",   "description": "Indonesia electricity",  "scope": "Scope 2"},
    "electricity_br":   {"factor": 0.07400, "unit_in": "kWh",   "description": "Brazil electricity",     "scope": "Scope 2"},
    # Transport — Scope 3
    "air_freight":      {"factor": 1.16000, "unit_in": "tonne-km","description": "Air freight",           "scope": "Scope 3"},
    "sea_freight":      {"factor": 0.01600, "unit_in": "tonne-km","description": "Sea freight (average)", "scope": "Scope 3"},
    "road_freight_hgv": {"factor": 0.10700, "unit_in": "tonne-km","description": "Road freight HGV",     "scope": "Scope 3"},
    "rail_freight":     {"factor": 0.02800, "unit_in": "tonne-km","description": "Rail freight",          "scope": "Scope 3"},
    # Water & Waste — Scope 1/3
    "water_supply":     {"factor": 0.34400, "unit_in": "m3",    "description": "Water supply",           "scope": "Scope 3"},
    "water_treatment":  {"factor": 0.27200, "unit_in": "m3",    "description": "Water treatment",        "scope": "Scope 3"},
    "landfill_waste":   {"factor": 0.46700, "unit_in": "tonne", "description": "Waste to landfill",      "scope": "Scope 3"},
    "recycled_waste":   {"factor": 0.02100, "unit_in": "tonne", "description": "Waste — recycled",       "scope": "Scope 3"},
}

# ── TOLERANCE BANDS ───────────────────────────────────────────────────────────
TOLERANCE = {
    "pass":    10,   # ±10% — measurement uncertainty, acceptable
    "warning": 25,   # ±25% — investigation required
    # >25% = fail — likely error or misreporting
}

# ── COLUMN ALIASES — maps common supplier column names to DEFRA keys ──────────
COLUMN_ALIASES = {
    # Natural gas
    "natural gas": "natural_gas", "naturalgas": "natural_gas",
    "gas consumption": "natural_gas", "gas_consumption": "natural_gas",
    "lng": "lng",
    # Diesel
    "diesel": "diesel", "diesel consumption": "diesel",
    "diesel_consumption": "diesel", "diesel fuel": "diesel",
    # Electricity
    "electricity": "electricity_uk", "electricity consumption": "electricity_uk",
    "electricity_consumption": "electricity_uk", "power": "electricity_uk",
    "grid electricity": "electricity_uk",
    # Freight
    "air freight": "air_freight", "air_freight": "air_freight",
    "sea freight": "sea_freight", "sea_freight": "sea_freight",
    "road freight": "road_freight_hgv", "road_freight": "road_freight_hgv",
    "transport": "road_freight_hgv",
    # Other
    "coal": "coal", "lpg": "lpg", "petrol": "petrol",
    "water": "water_supply", "waste": "landfill_waste",
}

def identify_activity(column_name: str, country: str = "") -> str | None:
    """Try to identify DEFRA activity key from column name."""
    col = column_name.lower().strip()
    if col in COLUMN_ALIASES:
        return COLUMN_ALIASES[col]
    for alias, key in COLUMN_ALIASES.items():
        if alias in col or col in alias:
            # Country-specific electricity
            if key == "electricity_uk" and country:
                c = country.lower()
                if "india" in c:     return "electricity_in"
                if "indonesia" in c: return "electricity_id"
                if "brazil" in c:    return "electricity_br"
                if "us" in c or "america" in c: return "electricity_us"
                if any(eu in c for eu in ["germany","france","italy","spain","poland"]): return "electricity_eu"
            return key
    return None

def recalculate_emissions(
    activity_type: str,
    quantity: float,
    quantity_unit: str,
    reported_co2e: float,
    country: str = ""
) -> dict:
    """
    Core DEFRA recalculation function.
    Compares supplier-reported CO2e against DEFRA 2024 benchmark.
    """
    defra_key = identify_activity(activity_type, country)
    if not defra_key:
        return {
            "status": "unknown_activity",
            "message": f"No DEFRA 2024 factor found for activity: '{activity_type}'",
            "defra_key": None,
            "verified": False,
        }

    factor_data = DEFRA_2024[defra_key]
    expected_co2e = quantity * factor_data["factor"]

    if reported_co2e <= 0:
        return {
            "status": "no_reported_value",
            "message": "No emission value reported to compare against",
            "defra_factor": factor_data["factor"],
            "expected_co2e": round(expected_co2e, 4),
            "verified": False,
        }

    variance_pct = ((reported_co2e - expected_co2e) / expected_co2e) * 100

    if abs(variance_pct) <= TOLERANCE["pass"]:
        status = "passed"
        verdict = f"✅ WITHIN TOLERANCE — {abs(variance_pct):.1f}% variance (acceptable ≤10%)"
        score = 100
    elif abs(variance_pct) <= TOLERANCE["warning"]:
        status = "warning"
        verdict = f"⚠️ INVESTIGATE — {abs(variance_pct):.1f}% variance (threshold: 10-25%)"
        score = 65
    else:
        direction = "UNDERREPORTED" if variance_pct < 0 else "OVERREPORTED"
        status = "failed"
        verdict = f"❌ {direction} — {abs(variance_pct):.1f}% variance (threshold: >25%)"
        score = 20

    return {
        "status": status,
        "verified": status == "passed",
        "score": score,
        "activity_type": activity_type,
        "defra_key": defra_key,
        "defra_description": factor_data["description"],
        "defra_factor": factor_data["factor"],
        "defra_unit": factor_data["unit_in"],
        "defra_scope": factor_data["scope"],
        "quantity": quantity,
        "quantity_unit": quantity_unit,
        "reported_co2e_kg": reported_co2e,
        "expected_co2e_kg": round(expected_co2e, 4),
        "variance_pct": round(variance_pct, 2),
        "variance_kg": round(reported_co2e - expected_co2e, 4),
        "verdict": verdict,
        "reference": "DEFRA UK Government GHG Conversion Factors 2024, published March 2024",
        "tolerance_bands": TOLERANCE,
    }

def run_defra_check_on_dataframe(df, country: str = "") -> dict:
    """
    Scan an entire dataframe for activity columns and run DEFRA recalculation.
    Returns summary of all checks performed.
    """
    import pandas as pd
    checks = []
    overall_score = 100
    checks_run = 0

    # Try to find quantity columns
    emission_col = None
    quantity_col = None
    activity_col = None

    col_lower = {c.lower(): c for c in df.columns}

    # Find emission value column
    for possible in ["emission_value","co2e","ghg_value","emissions","co2","reported_emissions"]:
        if possible in col_lower:
            emission_col = col_lower[possible]
            break

    # Find activity type column
    for possible in ["activity_type","activity","fuel_type","energy_type","transport_mode"]:
        if possible in col_lower:
            activity_col = col_lower[possible]
            break

    # Find quantity column
    for possible in ["quantity","consumption","volume","amount","fuel_consumption"]:
        if possible in col_lower:
            quantity_col = col_lower[possible]
            break

    if activity_col and quantity_col and emission_col:
        for idx, row in df.head(10).iterrows():
            try:
                activity = str(row[activity_col])
                quantity = float(str(row[quantity_col]).replace(",",""))
                reported = float(str(row[emission_col]).replace(",",""))
                unit = str(row.get(col_lower.get("unit",""), "kWh"))

                result = recalculate_emissions(activity, quantity, unit, reported, country)
                if result.get("defra_key"):
                    checks.append({"row": int(idx)+1, **result})
                    checks_run += 1
                    if result["status"] == "failed":
                        overall_score -= 30
                    elif result["status"] == "warning":
                        overall_score -= 10
            except (ValueError, TypeError):
                continue

    passed = sum(1 for c in checks if c["status"] == "passed")
    failed = sum(1 for c in checks if c["status"] == "failed")
    warnings = sum(1 for c in checks if c["status"] == "warning")

    return {
        "checks_performed": checks_run,
        "passed": passed,
        "warnings": warnings,
        "failed": failed,
        "overall_score": max(0, min(100, overall_score)),
        "checks": checks,
        "has_activity_data": bool(activity_col and quantity_col and emission_col),
        "reference": "DEFRA UK Government GHG Conversion Factors 2024",
        "message": (
            f"DEFRA recalculation performed on {checks_run} activity rows. "
            f"{passed} passed, {warnings} warnings, {failed} failed."
        ) if checks_run > 0 else (
            "No activity + quantity + emission columns found for DEFRA recalculation. "
            "Add 'activity_type', 'quantity' and 'emission_value' columns for full verification."
        )
    }
