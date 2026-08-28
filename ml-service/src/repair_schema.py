import os
import json
import hashlib
import pandas as pd

root_dir = os.path.abspath(os.path.join(os.getcwd(), ".."))
proc_dir = os.path.join(root_dir, "data", "processed")
artifacts_dir = os.path.join(root_dir, "artifacts")

schema_path = os.path.join(artifacts_dir, "feature_schema.json")
manifest_path = os.path.join(artifacts_dir, "manifest.json")

def compute_file_sha256(filepath: str) -> str:
    sha256_hash = hashlib.sha256()
    with open(filepath, "rb") as f:
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()

print("🛠️ REPAIRING FEATURE SCHEMA ARTIFACT...")

try:
    # 1. Extract exact features from frozen parquet
    df_train = pd.read_parquet(os.path.join(proc_dir, "X_train_ml.parquet"))
    features = list(df_train.columns)
    
    # 2. Save to feature_schema.json
    with open(schema_path, "w") as f:
        json.dump({"features": features}, f, indent=4)
    print(f"✅ Created feature_schema.json with {len(features)} features.")
    
    # 3. Hash the new file
    new_hash = compute_file_sha256(schema_path)
    
    # 4. Patch the manifest securely
    with open(manifest_path, "r") as f:
        manifest = json.load(f)
        
    manifest["feature_schema_hash"] = new_hash
    
    with open(manifest_path, "w") as f:
        json.dump(manifest, f, indent=4)
        
    print(f"✅ Manifest cryptographically updated with schema hash: {new_hash[:8]}...")
    print("🚀 You are cleared to run the autopsy!")

except Exception as e:
    print(f"❌ Repair failed: {e}")