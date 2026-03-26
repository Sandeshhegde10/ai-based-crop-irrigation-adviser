"""
Quick verification: checks that all model files exist and predictions work.
"""
import os, joblib
from smart_irrigation_ml import predict

SAVE_DIR = "./irrigation_models"
expected = [
    "model_irrigation_days.joblib",
    "model_water_amount.joblib",
    "le_crop.joblib",
    "feature_stats.joblib",
]

print("=" * 55)
print("  MODEL VERIFICATION")
print("=" * 55)

# 1. File check
print("\n[1] Saved model files:")
all_ok = True
for f in expected:
    path = os.path.join(SAVE_DIR, f)
    ok   = os.path.exists(path)
    size = os.path.getsize(path) if ok else 0
    status = "OK" if ok else "MISSING"
    print(f"    {status:7s}  {f}  ({size:,} bytes)")
    if not ok:
        all_ok = False

# 2. Load check
print("\n[2] Loading artefacts ...")
md    = joblib.load(os.path.join(SAVE_DIR, "model_irrigation_days.joblib"))
mw    = joblib.load(os.path.join(SAVE_DIR, "model_water_amount.joblib"))
le    = joblib.load(os.path.join(SAVE_DIR, "le_crop.joblib"))
stats = joblib.load(os.path.join(SAVE_DIR, "feature_stats.joblib"))
print("    All 4 artefacts loaded successfully")
print(f"    Known crops : {list(le.classes_)}")
print(f"    Soil-moisture range used during training: "
      f"{stats['soil_moisture_min']:.0f} - {stats['soil_moisture_max']:.0f}")

# 3. Live prediction check
print("\n[3] Sample predictions:")
print(f"    {'Crop':<14} {'Irr.Interval':>13} {'Water/cycle':>13}")
print("    " + "-" * 43)

cases = [
    dict(N=80,  P=40, K=60,  ph=6.8, temperature=30, humidity=22,
         rainfall=50,  soil_moisture=300, crop_days=45, crop_type="wheat"),
    dict(N=85,  P=45, K=40,  ph=6.5, temperature=33, humidity=17,
         rainfall=200, soil_moisture=650, crop_days=30, crop_type="rice"),
    dict(N=70,  P=35, K=90,  ph=5.8, temperature=18, humidity=65,
         rainfall=80,  soil_moisture=400, crop_days=50, crop_type="potato"),
    dict(N=130, P=60, K=180, ph=6.0, temperature=32, humidity=68,
         rainfall=100, soil_moisture=540, crop_days=80, crop_type="sugarcane"),
    dict(N=105, P=18, K=30,  ph=6.0, temperature=24, humidity=30,
         rainfall=180, soil_moisture=450, crop_days=25, crop_type="coffee"),
    dict(N=75,  P=45, K=18,  ph=6.3, temperature=31, humidity=25,
         rainfall=90,  soil_moisture=430, crop_days=60, crop_type="maize"),
]

for c in cases:
    r = predict(**c, model_days=md, model_water=mw, le_crop=le, stats=stats)
    print(f"    {c['crop_type']:<14} {r['irrigation_days']:>10.1f} days"
          f" {r['water_amount']:>10.1f} L")

print("    " + "-" * 43)
print("\n[RESULT]", "ALL CHECKS PASSED - Model is fully built!" if all_ok
      else "Some files are missing - re-run smart_irrigation_ml.py")
print("=" * 55)
