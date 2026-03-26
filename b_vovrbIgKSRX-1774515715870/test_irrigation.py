from smart_irrigation_ml import predict, train_pipeline

md, mw, le, stats = train_pipeline()

print("\nKnown crop classes:", le.classes_.tolist())

cases = [
    dict(N=80,  P=40, K=60,  ph=6.8, temperature=30, humidity=22, rainfall=50,  soil_moisture=300, crop_days=45, crop_type="wheat"),
    dict(N=85,  P=45, K=40,  ph=6.5, temperature=33, humidity=17, rainfall=200, soil_moisture=650, crop_days=30, crop_type="rice"),
    dict(N=70,  P=35, K=90,  ph=5.8, temperature=18, humidity=65, rainfall=80,  soil_moisture=400, crop_days=50, crop_type="potato"),
    dict(N=130, P=60, K=180, ph=6.0, temperature=32, humidity=68, rainfall=100, soil_moisture=540, crop_days=80, crop_type="sugarcane"),
    dict(N=105, P=18, K=30,  ph=6.0, temperature=24, humidity=30, rainfall=180, soil_moisture=450, crop_days=25, crop_type="coffee"),
    dict(N=75,  P=45, K=18,  ph=6.3, temperature=31, humidity=25, rainfall=90,  soil_moisture=430, crop_days=60, crop_type="maize"),
]

print("\n" + "-" * 70)
print(f"{'Crop':<12} {'Moisture':>8} {'Temp':>5} {'Days':>5} | {'Irr.Days':>9} {'Water(L)':>10}")
print("-" * 70)
for c in cases:
    r = predict(**c, model_days=md, model_water=mw, le_crop=le, stats=stats)
    print(
        f"{c['crop_type']:<12} {c['soil_moisture']:>8} {c['temperature']:>5} "
        f"{c['crop_days']:>5} | {r['irrigation_days']:>9.1f} {r['water_amount']:>10.1f}"
    )
print("-" * 70)
