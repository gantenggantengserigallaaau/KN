"""FASE T — ALAT BUKTI REGRESI (dipakai POC T4, bukan sekadar catatan).

Rencana §7 FASE T menuntut: *"3 SPK makloon lama dibuka & dihitung ulang →
`estimate` (`expected_output_qty`, `explain[]`, biaya) **identik byte-per-byte**
dengan sebelum fase."*

Kalau snapshotnya diambil SESUDAH kode berubah, ia tidak membuktikan apa pun —
ia hanya merekam keadaan baru. Jadi berkas ini dijalankan **dua kali**:

    python backend/_fase_t_snapshot.py before   # sebelum satu baris pun diubah
    python backend/_fase_t_snapshot.py after    # sesudah FASE T selesai
    python backend/_fase_t_snapshot.py diff     # bandingkan (0 = identik)

Yang direkam sengaja SEMPIT: hanya field yang menentukan angka & penjelasan
(estimate, expected/actual qty, tarif, biaya, HPP). Field yang MEMANG bertambah
di FASE T (`stage_code`, `changes_stage`, `material_flow`) tidak direkam —
kalau direkam, penambahan yang diminta rencana akan terbaca sebagai kemunduran.
"""
import asyncio
import json
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))

OUT = pathlib.Path(__file__).resolve().parent.parent / ".logs" / "fase_t"

# Field per langkah yang WAJIB tidak berubah (angka & jejak audit).
STEP_KEYS = (
    "seq", "process_type", "makloon_id", "makloon_name", "target_use",
    "input_product_id", "input_qty", "input_unit",
    "output_product_id", "output_unit",
    "byproduct_product_id", "byproduct_pct",
    "yield_factor", "yield_override_reason",
    "waste_pct", "shrinkage_pct", "shrinkage_source", "tolerance_pct",
    "estimate", "expected_output_qty", "expected_byproduct_qty",
    "actual_output_qty", "actual_byproduct_qty",
    "tariff_basis", "tariff_rate", "tariff", "tariff_plan", "tariff_original",
    "tariff_base_equivalent", "aux_cost",
    "material_value", "service_value", "output_value", "output_unit_cost",
    "status",
)
ORDER_KEYS = ("mko_number", "mode", "material_qty", "material_unit", "status",
              "planned_service_cost", "forecast", "costing")


async def collect() -> dict:
    from db import db
    rows = await db.makloon_orders.find({}, {"_id": 0}).sort("mko_number", 1).to_list(500)
    out = {}
    for o in rows:
        snap = {k: o.get(k) for k in ORDER_KEYS}
        snap["steps"] = [{k: s.get(k) for k in STEP_KEYS} for s in o.get("steps") or []]
        out[o.get("mko_number") or o.get("id")] = snap
    return out


async def main() -> int:
    mode = (sys.argv[1] if len(sys.argv) > 1 else "before").lower()
    OUT.mkdir(parents=True, exist_ok=True)
    if mode in ("before", "after"):
        data = await collect()
        path = OUT / f"spk_{mode}.json"
        path.write_text(json.dumps(data, indent=2, sort_keys=True, ensure_ascii=False))
        print(f"[{mode}] {len(data)} SPK direkam → {path}")
        return 0
    if mode == "diff":
        a = json.loads((OUT / "spk_before.json").read_text())
        b = json.loads((OUT / "spk_after.json").read_text())
        if a == b:
            print(f"IDENTIK — {len(a)} SPK, angka & explain[] tidak bergeser sedikit pun.")
            return 0
        print("BERBEDA — rincian:")
        for key in sorted(set(a) | set(b)):
            if a.get(key) != b.get(key):
                print(f"  · {key}")
                ta = json.dumps(a.get(key), indent=2, sort_keys=True, ensure_ascii=False).splitlines()
                tb = json.dumps(b.get(key), indent=2, sort_keys=True, ensure_ascii=False).splitlines()
                import difflib
                for ln in list(difflib.unified_diff(ta, tb, "before", "after", lineterm=""))[:40]:
                    print("    " + ln)
        return 1
    print(f"mode tidak dikenal: {mode} (pakai before|after|diff)")
    return 2


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
