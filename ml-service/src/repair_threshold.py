import os
import json

root_dir = os.path.abspath(os.path.join(os.getcwd(), ".."))
thresh_path = os.path.join(root_dir, "artifacts", "threshold.json")

print("🛠️ MAPPING 'exact_threshold' TO 'threshold_value'...")

try:
    with open(thresh_path, "r") as f:
        data = json.load(f)
        
    # Map the exact key found in your JSON
    val = data.get("exact_threshold")
           
    if val is None:
        print("❌ Could not find 'exact_threshold' in the JSON!")
        exit(1)
        
    # Standardize the JSON for the autopsy script
    data["threshold_value"] = val
    data["experiment_id"] = "Exp_C"
    
    with open(thresh_path, "w") as f:
        json.dump(data, f, indent=4)
        
    print(f"✅ Repaired threshold.json. Threshold locked at: {val}")
    print("🚀 You are cleared to run the autopsy!")

except Exception as e:
    print(f"❌ Repair failed: {e}")