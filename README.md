# AI-Based Crop Irrigation Adviser 🌱💧

An intelligent Machine Learning pipeline that recommends optimal **irrigation intervals** and **water quantities** for different crops based on soil properties, weather conditions, and crop growth stage.

---

## 🚀 Features

- Trained on **real agricultural datasets**
- Predicts **2 outputs**:
  - `irrigation_days` — How often to irrigate (days)
  - `water_amount` — Water needed per cycle (litres)
- Uses **XGBoost** (fallback: RandomForest)
- Supports **10 crop types**: Wheat, Rice, Maize, Potato, Sugarcane, Coffee, Groundnuts, Garden Flowers, Pulse, Maize
- Engineered features: Water Retention Index, Soil Quality Index

---

## 📁 Project Structure

```
hackathon/
├── smart_irrigation_ml.py      # Main ML pipeline
├── verify_model.py             # Quick verification script
├── Crop_recommendation.csv     # Dataset 1: Soil/nutrient data
├── datasets - datasets.csv     # Dataset 2: Irrigation schedule data
├── irrigation_models/          # Saved models (generated after training)
│   ├── model_irrigation_days.joblib
│   ├── model_water_amount.joblib
│   ├── le_crop.joblib
│   └── feature_stats.joblib
└── README.md
```

---

## 📥 Inputs

| Parameter | Description | Example |
|-----------|-------------|---------|
| `N` | Nitrogen (kg/ha) | `80` |
| `P` | Phosphorus (kg/ha) | `40` |
| `K` | Potassium (kg/ha) | `60` |
| `ph` | Soil pH | `6.8` |
| `temperature` | Air temperature (°C) | `30` |
| `humidity` | Relative humidity (%) | `22` |
| `rainfall` | Rainfall (mm) | `50` |
| `soil_moisture` | Soil moisture reading | `300` |
| `crop_days` | Days since sowing | `45` |
| `crop_type` | Crop name | `"wheat"` |

## 📤 Output

```python
{
    'irrigation_days': 7.5,   # Irrigate every 7.5 days
    'water_amount': 320.0     # Use 320 litres per cycle
}
```

---

## 🛠️ Setup & Usage

### 1. Install dependencies
```bash
pip install pandas numpy scikit-learn xgboost joblib
```

### 2. Train the model
```bash
python smart_irrigation_ml.py
```

### 3. Use in your code
```python
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
# → {'irrigation_days': 7.5, 'water_amount': 320.0}
```

---

## 🧠 Model Details

| Model | Target | Algorithm | Metric |
|-------|--------|-----------|--------|
| Model 1 | `irrigation_days` | XGBRegressor | MAE (days) |
| Model 2 | `water_amount` | XGBRegressor | MAE (litres) |

### Engineered Features
- **Water Retention Index** = `0.6 × soil_moisture_norm + 0.4 × humidity_norm`
- **Soil Quality Index** = weighted combination of pH score + NPK score

---

## 📊 Datasets Used

1. **Crop_recommendation.csv** — 2200 rows of soil nutrient profiles per crop (N, P, K, pH, humidity, rainfall, label)
2. **datasets - datasets.csv** — 501 rows of real irrigation schedules (CropType, CropDays, SoilMoisture, Irrigation flag)

---

## 👨‍💻 Built for Hackathon

Smart Irrigation Recommendation System using AI/ML to help farmers make data-driven irrigation decisions.
