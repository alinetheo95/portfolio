"""
slim_csvs.py  (updated — covers linechart.js, underestimated.js, eui.js, nyc_top10.js)

Run from the root of your project (where the /dataset folder lives):
    python slim_csvs.py

Outputs go to ./dataset/slim/ as both .csv and .json

eui.js note:
  Unlike the other charts, eui.js does NOT pre-filter to DC-only rows before
  loading — it needs all Office buildings (including non-DC) to compute the
  average non-DC EUI baseline. So for the 22_23_24 file we keep:
    - ALL rows for 2024 (any property type) — eui.js needs these
    - DC-only rows for 2022 and 2023 — linechart.js / underestimated.js need these
"""

import csv
import json
import os

INPUT_DIR  = "./dataset"
OUTPUT_DIR = "./dataset/slim"
os.makedirs(OUTPUT_DIR, exist_ok=True)


def parse_number(value):
    if not value:
        return 0
    s = str(value).strip().replace(",", "")
    if s.lower() in ("", "not available", "n/a"):
        return 0
    try:
        return float(s)
    except ValueError:
        return 0


def is_data_center(row, col="Data Center - Gross Floor Area (ft²)"):
    return parse_number(row.get(col, "")) > 0


# ── energy_nyc_20.csv / energy_nyc_21.csv ────────────────────────────────────
# Used by: linechart.js only
# Keep:    DC rows only (isDataCenter filter)
# Inject:  Calendar Year (column absent in source files)

COLS_20_21 = [
    "Property Name",
    "Site Energy Use (kBtu)",
    "Data Center - IT Source Energy (kBtu)",
    "Total GHG Emissions (Metric Tons CO2e)",
    "Data Center - Gross Floor Area (ft²)",
]

# ── energy_nyc_22_23_24.csv ──────────────────────────────────────────────────
# Used by: linechart.js, underestimated.js, eui.js
#
# eui.js needs ALL 2024 rows (DC + non-DC office) to compute the avg non-DC EUI.
# The other charts only need DC rows.
# Strategy: keep ALL rows for year == 2024; keep DC-only rows for 2022 & 2023.

COLS_22_23_24 = [
    "Calendar Year",
    "Property Name",
    "Primary Property Type - Self Selected",
    "Site Energy Use (kBtu)",
    "Data Center - IT Source Energy (kBtu)",
    "Electricity Use - Grid Purchase (kBtu)",
    "Total (Location-Based) GHG Emissions (Metric Tons CO2e)",
    "Data Center - Gross Floor Area (ft²)",
    "Largest Property Use Type - Gross Floor Area (ft²)",
    "Site EUI (kBtu/ft²)",
]


def slim_single_year(input_filename, output_stem, inject_year):
    """Slim a single-year file (20 or 21): keep DC rows, inject Calendar Year."""
    input_path = os.path.join(INPUT_DIR, input_filename)
    if not os.path.exists(input_path):
        print(f"[SKIP] {input_path} not found")
        return

    rows_out = []
    with open(input_path, newline="", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for col in COLS_20_21:
            if col not in (reader.fieldnames or []):
                print(f"  [WARN] Column not found in {input_filename}: '{col}'")

        for row in reader:
            if not is_data_center(row):
                continue
            slim = {"Calendar Year": inject_year}
            for col in COLS_20_21:
                slim[col] = row.get(col, "")
            rows_out.append(slim)

    _write(output_stem, rows_out, input_path)


def slim_22_23_24(input_filename, output_stem):
    """
    Slim the combined 22/23/24 file.
    - Year 2024: keep ALL rows (eui.js needs non-DC offices too)
    - Year 2022/2023: keep DC-only rows
    """
    input_path = os.path.join(INPUT_DIR, input_filename)
    if not os.path.exists(input_path):
        print(f"[SKIP] {input_path} not found")
        return

    rows_out = []
    with open(input_path, newline="", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for col in COLS_22_23_24:
            if col not in (reader.fieldnames or []):
                print(f"  [WARN] Column not found in {input_filename}: '{col}'")

        for row in reader:
            year_str = row.get("Calendar Year", "").strip()
            try:
                year = int(float(year_str))
            except ValueError:
                continue  # skip rows with unparseable year

            # eui.js needs all 2024 rows; other charts need DC-only for 2022/2023
            if year == 2024:
                keep = True
            else:
                keep = is_data_center(row)

            if not keep:
                continue

            slim = {}
            for col in COLS_22_23_24:
                slim[col] = row.get(col, "")
            rows_out.append(slim)

    _write(output_stem, rows_out, input_path)


def _write(output_stem, rows_out, input_path):
    """Write slim CSV and JSON, print size comparison."""
    if not rows_out:
        print(f"[WARN] No rows matched for {output_stem}")
        return

    out_cols = list(rows_out[0].keys())

    csv_path = os.path.join(OUTPUT_DIR, output_stem + ".csv")
    with open(csv_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=out_cols)
        writer.writeheader()
        writer.writerows(rows_out)

    json_path = os.path.join(OUTPUT_DIR, output_stem + ".json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(rows_out, f, separators=(",", ":"))

    orig_kb  = os.path.getsize(input_path)  / 1024
    csv_kb   = os.path.getsize(csv_path)    / 1024
    json_kb  = os.path.getsize(json_path)   / 1024
    pct_csv  = (1 - csv_kb  / orig_kb) * 100
    pct_json = (1 - json_kb / orig_kb) * 100

    print(f"\n✓  {os.path.basename(input_path)}")
    print(f"   Original : {orig_kb / 1024:.2f} MB")
    print(f"   Slim CSV : {csv_kb:.1f} KB  ({len(rows_out)} rows kept)  ↓{pct_csv:.0f}%")
    print(f"   Slim JSON: {json_kb:.1f} KB  ↓{pct_json:.0f}%")


# ── Run ──────────────────────────────────────────────────────────────────────

slim_single_year("energy_nyc_20.csv", "slim_energy_nyc_20", inject_year=2020)
slim_single_year("energy_nyc_21.csv", "slim_energy_nyc_21", inject_year=2021)
slim_22_23_24("energy_nyc_22_23_24.csv", "slim_energy_nyc_22_23_24")

print("""
Done. Files written to ./dataset/slim/

── Next steps ──────────────────────────────────────────────────────────────
1. Drop-in CSV replacement (only the path changes in each JS file):

   linechart.js:
     const file20 = "dataset/slim/slim_energy_nyc_20.csv";
     const file21 = "dataset/slim/slim_energy_nyc_21.csv";
     const file22 = "dataset/slim/slim_energy_nyc_22_23_24.csv";

   underestimated.js:
     const file = "./dataset/slim/slim_energy_nyc_22_23_24.csv";

   eui.js:
     const file24 = "dataset/slim/slim_energy_nyc_22_23_24.csv";

2. Switch to JSON (even smaller — swap d3.csv → d3.json, see js_json_loaders.md)

3. nyc_top10.js uses a SEPARATE file (nyc_top10_dc_gfa_increase_2023_2024.csv)
   which is already pre-aggregated (10 rows). No slimming needed — it also has
   hardcoded fallback data so it won't break if the file is missing.
""")
