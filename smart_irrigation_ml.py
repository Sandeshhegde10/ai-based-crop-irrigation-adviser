"""
=============================================================
  Smart Irrigation Recommendation System — ML Pipeline
  Built on REAL datasets:
    • Crop_recommendation.csv   (N, P, K, pH, temp, humidity, rainfall, crop)
    • datasets - datasets.csv   (CropType, CropDays, SoilMoisture,
                                  temperature, Humidity, Irrigation flag)
=============================================================
  Predicts:
    • irrigation_days  – How often to irrigate (days)
    • water_amount     – Water required per cycle (litres)
=============================================================
"""

import os
import warnings
import numpy as np
import pandas as pd
import joblib

from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import mean_absolute_error

warnings.filterwarnings("ignore")

try:
    from xgboost import XGBRegressor
    USE_XGBOOST = True
    print("✅  XGBoost found — using XGBRegressor")
except ImportError:
    USE_XGBOOST = False
    print("⚠️  XGBoost not found — falling back to RandomForestRegressor")

# ── Paths ─────────────────────────────────────────────────────────────────────
CROP_REC_CSV   = "Crop_recommendation.csv"
IRRIGATION_CSV = "datasets - datasets.csv"
SAVE_DIR       = "./irrigation_models"
FEATURE_COLS   = [
    "N", "P", "K", "ph", "temperature", "humidity", "rainfall",
    "soil_moisture", "crop_days",
    "crop_type_enc",
    "water_retention_index", "soil_quality_index",
]


# ══════════════════════════════════════════════════════════════════════════════
# 1.  DATA LOADING & MERGING
# ══════════════════════════════════════════════════════════════════════════════

def load_and_merge() -> pd.DataFrame:
    """
    Load both CSVs and merge them by crop type to build a unified dataset.

    Strategy:
    - Crop_recommendation  → gives N, P, K, ph, humidity, rainfall per crop
    - datasets             → gives SoilMoisture, CropDays, Irrigation flag per crop
    - Merge on normalised crop name → one row per combination
    - Engineer targets:
        irrigation_days  = derived from CropDays and Irrigation flag pattern
        water_amount     = derived from SoilMoisture and land-area proxy
    """
    print("\n[1/4] Loading datasets …")

    # ── File 1: soil/nutrient data ────────────────────────────────────────────
    df_crop = pd.read_csv(CROP_REC_CSV)
    df_crop.columns = [c.strip().lower() for c in df_crop.columns]
    # columns after lower: n, p, k, temperature, humidity, ph, rainfall, label
    df_crop.rename(columns={
        "label": "crop_name",
        "n": "N", "p": "P", "k": "K",   # restore uppercase to match FEATURE_COLS
    }, inplace=True)
    df_crop["crop_name_norm"] = df_crop["crop_name"].str.lower().str.strip()

    # ── File 2: irrigation schedule data ─────────────────────────────────────
    df_irr = pd.read_csv(IRRIGATION_CSV)
    df_irr.columns = [c.strip() for c in df_irr.columns]
    # columns: CropType, CropDays, SoilMoisture, temperature, Humidity, Irrigation
    df_irr.rename(columns={
        "CropType"    : "crop_name_irr",
        "CropDays"    : "crop_days",
        "SoilMoisture": "soil_moisture",
        "temperature" : "temperature_irr",
        "Humidity"    : "humidity_irr",
        "Irrigation"  : "irrigation_flag",
    }, inplace=True)
    df_irr["crop_name_norm"] = df_irr["crop_name_irr"].str.lower().str.strip()

    print(f"      Crop-rec rows : {len(df_crop)}")
    print(f"      Irrigation rows: {len(df_irr)}")

    # ── Crop-name mapping (handle mismatches) ─────────────────────────────────
    name_map = {
        "groundnuts"    : "chickpea",   # map to nearest soil-profile crop
        "garden flowers": "mungbean",
        "paddy"         : "rice",
        "pulse"         : "pigeonpeas",
    }
    df_irr["crop_name_norm"] = df_irr["crop_name_norm"].replace(name_map)

    # ── Merge on crop name (many:many → cross-join per-crop aggregate) ────────
    # Aggregate df_crop by crop_name: take medians for numeric features
    agg_crop = df_crop.groupby("crop_name_norm").agg({
        "N"          : "median",
        "P"          : "median",
        "K"          : "median",
        "ph"         : "median",
        "humidity"   : "median",
        "rainfall"   : "median",
    }).reset_index()

    # Merge irrigation rows with aggregated crop soil data
    df = df_irr.merge(agg_crop, on="crop_name_norm", how="left")

    # Fill missing nutrient data for crops not in Crop_recommendation.csv
    # (Garden Flowers, Pulse → keeps NaN → we fill with global medians)
    for col in ["N", "P", "K", "ph", "humidity", "rainfall"]:
        df[col].fillna(df_crop[col].median(), inplace=True)

    # Use temperature from irrigation dataset (more crop-specific)
    df.rename(columns={"temperature_irr": "temperature"}, inplace=True)
    # humidity: prefer irrigation file's Humidity when available
    df["humidity"] = df["humidity_irr"].where(
        df["humidity_irr"].notna(), df["humidity"]
    )

    print(f"      Merged shape: {df.shape}")

    # ── Label-encode crop type ────────────────────────────────────────────────
    le_crop = LabelEncoder()
    df["crop_type_enc"] = le_crop.fit_transform(df["crop_name_norm"])

    # ── Feature engineering ───────────────────────────────────────────────────
    # Water retention index: high soil moisture + high humidity → retains water
    sm_norm   = (df["soil_moisture"] - df["soil_moisture"].min()) / \
                (df["soil_moisture"].max() - df["soil_moisture"].min() + 1e-9)
    hum_norm  = df["humidity"] / 100.0
    df["water_retention_index"] = 0.6 * sm_norm + 0.4 * hum_norm

    # Soil quality index: balanced N/P/K, near-neutral pH
    ph_score  = 1 - (df["ph"] - 6.5).abs() / 4.0
    npk_score = (
        (df["N"].clip(0, 140) / 140) * 0.4 +
        (df["P"].clip(0, 80)  / 80)  * 0.3 +
        (df["K"].clip(0, 200) / 200) * 0.3
    )
    df["soil_quality_index"] = ph_score * 0.5 + npk_score * 0.5

    # ── Target engineering ────────────────────────────────────────────────────
    #
    # irrigation_days: The dataset has CropDays (days since sowing) and an
    # Irrigation flag. We compute the INTERVAL between irrigation events per crop.
    #
    # For rows where irrigation=1, we look at the gap in crop_days between
    # successive irrigated records → that gap IS the interval.
    #
    print("      Engineering targets …")

    df_sorted = df.sort_values(["crop_name_norm", "crop_days"]).reset_index(drop=True)

    # Compute irrigation interval per crop
    intervals = []
    for crop, grp in df_sorted.groupby("crop_name_norm"):
        irr_days = grp.loc[grp["irrigation_flag"] == 1, "crop_days"].values
        if len(irr_days) > 1:
            gaps = np.diff(irr_days)
            gaps = gaps[gaps > 0]
            median_gap = np.median(gaps) if len(gaps) > 0 else 7.0
        else:
            median_gap = 7.0
        intervals.append({"crop_name_norm": crop, "median_irr_gap": median_gap})
    irr_gap_df = pd.DataFrame(intervals)
    df_sorted = df_sorted.merge(irr_gap_df, on="crop_name_norm", how="left")

    # irrigation_days per row: rows where irrigation=1 → actual gap, else typical
    # Add row-level perturbation based on soil moisture
    sm_factor = 1 - sm_norm * 0.4   # low moisture → shorter interval
    df_sorted["irrigation_days"] = (
        df_sorted["median_irr_gap"] * sm_factor +
        np.random.default_rng(42).normal(0, 0.3, len(df_sorted))
    ).clip(1, 30).round(1)

    # water_amount: proportional to soil_moisture deficit & crop_days
    # (higher soil moisture = field already wet = less water needed now;
    #  but at the moment of irrigation, we need enough to replenish)
    # Proxy: base 300 L + adjustment for moisture deficit and temperature
    base_water = 300.0
    temp_factor   = 1 + (df_sorted["temperature"] - 20) / 40   # heat → more water
    sm_deficit    = 1 - sm_norm                                 # drier → need more
    rainfall_max  = max(float(df_sorted["rainfall"].max()), 1.0)
    rain_factor   = 1 - (df_sorted["rainfall"].fillna(0) / rainfall_max) * 0.3
    df_sorted["water_amount"] = (
        base_water
        * temp_factor
        * (0.4 + 0.6 * sm_deficit)
        * rain_factor
        + np.random.default_rng(42).normal(0, 20, len(df_sorted))
    ).clip(50, 2000).round(1)

    print(f"      irrigation_days → min={df_sorted['irrigation_days'].min():.1f},"
          f" max={df_sorted['irrigation_days'].max():.1f},"
          f" mean={df_sorted['irrigation_days'].mean():.1f}")
    print(f"      water_amount    → min={df_sorted['water_amount'].min():.0f},"
          f" max={df_sorted['water_amount'].max():.0f},"
          f" mean={df_sorted['water_amount'].mean():.0f}")

    return df_sorted, le_crop


# ══════════════════════════════════════════════════════════════════════════════
# 2.  MODEL BUILDER
# ══════════════════════════════════════════════════════════════════════════════

def build_model():
    if USE_XGBOOST:
        return XGBRegressor(
            n_estimators=400,
            learning_rate=0.05,
            max_depth=6,
            subsample=0.8,
            colsample_bytree=0.8,
            random_state=42,
            n_jobs=-1,
            verbosity=0,
        )
    return RandomForestRegressor(
        n_estimators=400, max_depth=10, random_state=42, n_jobs=-1
    )


# ══════════════════════════════════════════════════════════════════════════════
# 3.  TRAINING PIPELINE
# ══════════════════════════════════════════════════════════════════════════════

def train_pipeline():
    df, le_crop = load_and_merge()

    print("\n[2/4] Preparing features …")
    # Drop rows where any feature or target is NaN
    needed = FEATURE_COLS + ["irrigation_days", "water_amount"]
    df = df.dropna(subset=needed)
    print(f"      Clean rows: {len(df)}")

    X = df[FEATURE_COLS]
    y_days  = df["irrigation_days"]
    y_water = df["water_amount"]

    X_train, X_test, yd_tr, yd_te, yw_tr, yw_te = train_test_split(
        X, y_days, y_water, test_size=0.2, random_state=42
    )
    print(f"      Train: {len(X_train)}  |  Test: {len(X_test)}")

    print("\n[3/4] Training models …")
    model_days = build_model()
    model_days.fit(X_train, yd_tr)
    mae_days = mean_absolute_error(yd_te, model_days.predict(X_test))
    print(f"      ✅  Model 1 (irrigation_days)  MAE: {mae_days:.3f} days")

    model_water = build_model()
    model_water.fit(X_train, yw_tr)
    mae_water = mean_absolute_error(yw_te, model_water.predict(X_test))
    print(f"      ✅  Model 2 (water_amount)     MAE: {mae_water:.1f} litres")

    print("\n[4/4] Saving models & encoders …")
    os.makedirs(SAVE_DIR, exist_ok=True)
    joblib.dump(model_days,  os.path.join(SAVE_DIR, "model_irrigation_days.joblib"))
    joblib.dump(model_water, os.path.join(SAVE_DIR, "model_water_amount.joblib"))
    joblib.dump(le_crop,     os.path.join(SAVE_DIR, "le_crop.joblib"))

    # Also save feature stats for normalisation at inference
    # Use df from train_pipeline scope (passed implicitly via closure)
    stats = {
        "soil_moisture_min": float(df["soil_moisture"].min()),
        "soil_moisture_max": float(df["soil_moisture"].max()),
        "humidity_min"     : 0.0,
        "humidity_max"     : 100.0,
        "rainfall_max"     : float(df["rainfall"].fillna(0).max()),
        "crop_classes"     : le_crop.classes_.tolist(),
    }
    joblib.dump(stats, os.path.join(SAVE_DIR, "feature_stats.joblib"))

    for f in sorted(os.listdir(SAVE_DIR)):
        print(f"      💾  {os.path.join(SAVE_DIR, f)}")

    print("\n" + "="*60)
    print("  TRAINING COMPLETE")
    print("="*60 + "\n")
    return model_days, model_water, le_crop, stats


# ══════════════════════════════════════════════════════════════════════════════
# 4.  PREDICTION FUNCTION
# ══════════════════════════════════════════════════════════════════════════════

def predict(
    *,
    N: float,
    P: float,
    K: float,
    ph: float,
    temperature: float,
    humidity: float,
    rainfall: float,
    soil_moisture: float,
    crop_days: int,
    crop_type: str,
    model_days=None,
    model_water=None,
    le_crop=None,
    stats=None,
    model_dir: str = SAVE_DIR,
) -> dict:
    """
    Predict irrigation schedule for a farm record.

    Parameters (all keyword-only)
    ──────────────────────────────
    N, P, K         : Nutrient levels (kg/ha)
    ph              : Soil pH
    temperature     : Air temperature (°C)
    humidity        : Relative humidity (%)
    rainfall        : Rainfall (mm)
    soil_moisture   : Volumetric soil moisture content (sensor unit)
    crop_days       : Days since crop was sown
    crop_type       : Crop name (case-insensitive)

    Returns
    ───────
    dict: { 'irrigation_days': float, 'water_amount': float }
    """
    if model_days is None:
        model_days  = joblib.load(os.path.join(model_dir, "model_irrigation_days.joblib"))
        model_water = joblib.load(os.path.join(model_dir, "model_water_amount.joblib"))
        le_crop     = joblib.load(os.path.join(model_dir, "le_crop.joblib"))
        stats       = joblib.load(os.path.join(model_dir, "feature_stats.joblib"))

    # Normalise soil moisture
    sm_min = stats["soil_moisture_min"]
    sm_max = stats["soil_moisture_max"]
    sm_norm = (soil_moisture - sm_min) / (sm_max - sm_min + 1e-9)
    sm_norm = float(np.clip(sm_norm, 0, 1))
    hum_norm = humidity / 100.0

    water_retention_index = 0.6 * sm_norm + 0.4 * hum_norm

    ph_score  = 1 - abs(ph - 6.5) / 4.0
    npk_score = (
        min(N / 140, 1) * 0.4 +
        min(P / 80,  1) * 0.3 +
        min(K / 200, 1) * 0.3
    )
    soil_quality_index = ph_score * 0.5 + npk_score * 0.5

    # Encode crop type
    crop_norm = crop_type.lower().strip()
    name_map  = {
        "groundnuts"    : "chickpea",
        "garden flowers": "mungbean",
        "paddy"         : "rice",
        "pulse"         : "pigeonpeas",
    }
    crop_norm = name_map.get(crop_norm, crop_norm)

    known_classes = list(le_crop.classes_)
    if crop_norm in known_classes:
        crop_enc = int(le_crop.transform([crop_norm])[0])
    else:
        # Fallback: use 0 (first class) and warn
        print(f"⚠️  Unknown crop '{crop_type}' — using default encoding")
        crop_enc = 0

    sample = pd.DataFrame([{
        "N"                   : N,
        "P"                   : P,
        "K"                   : K,
        "ph"                  : ph,
        "temperature"         : temperature,
        "humidity"            : humidity,
        "rainfall"            : rainfall,
        "soil_moisture"       : soil_moisture,
        "crop_days"           : crop_days,
        "crop_type_enc"       : crop_enc,
        "water_retention_index": water_retention_index,
        "soil_quality_index"  : soil_quality_index,
    }])

    days  = float(model_days.predict(sample[FEATURE_COLS])[0])
    water = float(model_water.predict(sample[FEATURE_COLS])[0])

    return {
        "irrigation_days": round(max(days, 1.0), 1),
        "water_amount"   : round(max(water, 50.0), 1),
    }


# ══════════════════════════════════════════════════════════════════════════════
# 5.  LOAD SAVED MODELS (helper)
# ══════════════════════════════════════════════════════════════════════════════

def load_models(model_dir: str = SAVE_DIR):
    return (
        joblib.load(os.path.join(model_dir, "model_irrigation_days.joblib")),
        joblib.load(os.path.join(model_dir, "model_water_amount.joblib")),
        joblib.load(os.path.join(model_dir, "le_crop.joblib")),
        joblib.load(os.path.join(model_dir, "feature_stats.joblib")),
    )


# ══════════════════════════════════════════════════════════════════════════════
# 6.  MAIN
# ══════════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    print("=" * 60)
    print("  SMART IRRIGATION RECOMMENDATION — REAL DATA PIPELINE")
    print("=" * 60)

    model_days, model_water, le_crop, stats = train_pipeline()

    # ── Sample predictions ────────────────────────────────────────────────────
    test_cases = [
        dict(
            label="🌾  Wheat  | loamy soil, 45 days old, dry",
            N=80, P=40, K=60, ph=6.8, temperature=30, humidity=22,
            rainfall=50, soil_moisture=300, crop_days=45, crop_type="wheat",
        ),
        dict(
            label="🌾  Paddy  | wet field, 30 days old",
            N=85, P=45, K=40, ph=6.5, temperature=33, humidity=17,
            rainfall=200, soil_moisture=650, crop_days=30, crop_type="paddy",
        ),
        dict(
            label="🥔  Potato | moderate moisture, 50 days",
            N=70, P=35, K=90, ph=5.8, temperature=18, humidity=65,
            rainfall=80, soil_moisture=400, crop_days=50, crop_type="potato",
        ),
        dict(
            label="🌿  Sugarcane | hot climate, 80 days",
            N=130, P=60, K=180, ph=6.0, temperature=32, humidity=68,
            rainfall=100, soil_moisture=540, crop_days=80, crop_type="sugarcane",
        ),
        dict(
            label="☕  Coffee | cool & humid, 25 days",
            N=105, P=18, K=30, ph=6.0, temperature=24, humidity=30,
            rainfall=180, soil_moisture=450, crop_days=25, crop_type="coffee",
        ),
        dict(
            label="🌽  Maize  | moderate, 60 days",
            N=75, P=45, K=18, ph=6.3, temperature=31, humidity=25,
            rainfall=90, soil_moisture=430, crop_days=60, crop_type="maize",
        ),
    ]

    print("=" * 60)
    print("  SAMPLE PREDICTIONS")
    print("=" * 60)

    for tc in test_cases:
        label = tc.pop("label")
        result = predict(
            **tc,
            model_days=model_days,
            model_water=model_water,
            le_crop=le_crop,
            stats=stats,
        )
        print(f"\n  {label}")
        print(f"    Crop Days : {tc['crop_days']}  |  "
              f"Soil Moisture: {tc['soil_moisture']}  |  "
              f"Temp: {tc['temperature']}°C")
        print(f"    ➤  Irrigate every  : {result['irrigation_days']} days")
        print(f"    ➤  Water per cycle : {result['water_amount']} litres")

    print("\n" + "=" * 60)
    print(f"  ✅  Models saved → {os.path.abspath(SAVE_DIR)}")
    print("=" * 60)

    print("""
  HOW TO REUSE IN ANOTHER SCRIPT
  ─────────────────────────────────
  from smart_irrigation_ml import predict, load_models

  md, mw, le, stats = load_models("./irrigation_models")

  result = predict(
      N=80, P=40, K=60, ph=6.8,
      temperature=30, humidity=22, rainfall=50,
      soil_moisture=300, crop_days=45,
      crop_type="wheat",
      model_days=md, model_water=mw,
      le_crop=le, stats=stats,
  )
  print(result)
  # → {'irrigation_days': X.X, 'water_amount': XXX.X}
""")
