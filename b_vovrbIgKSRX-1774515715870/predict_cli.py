import sys
import os
import json

# Force UTF-8 encoding for standard output to avoid UnicodeEncodeError on Windows
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Silence any print statements from the imported ML module 
# so they don't corrupt the JSON response!
old_stdout = sys.stdout
sys.stdout = open(os.devnull, 'w', encoding='utf-8')

import smart_irrigation_ml
from smart_irrigation_ml import predict, load_models

# Restore stdout for the final JSON payload
sys.stdout = old_stdout

def main():
    try:
        input_data = json.loads(sys.argv[1])
        md, mw, le, stats = load_models("./irrigation_models")
        
        result = predict(
            N=float(input_data.get('N', 80)),
            P=float(input_data.get('P', 40)),
            K=float(input_data.get('K', 60)),
            ph=float(input_data.get('ph', 6.5)),
            temperature=float(input_data.get('temperature', 25)),
            humidity=float(input_data.get('humidity', 50)),
            rainfall=float(input_data.get('rainfall', 10)),
            soil_moisture=float(input_data.get('soil_moisture', 400)),
            crop_days=int(input_data.get('crop_days', 30)),
            crop_type=input_data.get('crop_type', 'wheat'),
            model_days=md,
            model_water=mw,
            le_crop=le,
            stats=stats,
        )
        print(json.dumps({"status": "success", "data": result}))
    except Exception as e:
        print(json.dumps({"status": "error", "message": str(e)}))

if __name__ == "__main__":
    main()
