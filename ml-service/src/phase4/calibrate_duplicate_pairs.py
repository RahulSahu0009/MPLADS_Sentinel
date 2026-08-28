"""
calibrate_duplicate_pairs.py

Phase 4.3B Pairwise Discrimination Calibration.

Fast, deterministic, zero-leakage calibration:
- Positive pairs come only from frozen duplicate groups.
- Negative pairs come only from records with no duplicate_group_id.
- Candidate negatives are blocked before fuzzy matching.
- Uses RapidFuzz vectorized cdist for text similarity.
"""

import os
import json
import hashlib
import numpy as np
import pandas as pd
from rapidfuzz import process, fuzz


TARGET_NEGATIVE_MULTIPLIER = 10
TEXT_CANDIDATE_THRESHOLD = 0.50
MAX_NEGATIVES = 500
RANDOM_SEED = 42


def compute_file_sha256(filepath: str) -> str:
    h = hashlib.sha256()

    with open(filepath, "rb") as f:
        for block in iter(lambda: f.read(1024 * 1024), b""):
            h.update(block)

    return h.hexdigest()


def normalize_text(series: pd.Series) -> pd.Series:
    return (
        series.fillna("")
        .astype(str)
        .str.lower()
        .str.replace(r"\s+", " ", regex=True)
        .str.strip()
    )


def add_derived_columns(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()

    df["clean_desc"] = normalize_text(df["project_description"])

    df["dt_start"] = pd.to_datetime(
        df["start_date"],
        errors="coerce"
    )

    df["amount"] = pd.to_numeric(
        df["sanctioned_amount"],
        errors="coerce"
    )

    return df


def pair_features(df: pd.DataFrame, left_idx, right_idx):
    """
    Vectorized pair feature calculation.
    """

    left = df.loc[left_idx].reset_index(drop=True)
    right = df.loc[right_idx].reset_index(drop=True)

    text_similarity = np.array([
        fuzz.ratio(a, b) / 100.0
        for a, b in zip(
            left["clean_desc"],
            right["clean_desc"]
        )
    ])

    amount_a = left["amount"].to_numpy(dtype=float)
    amount_b = right["amount"].to_numpy(dtype=float)

    denominator = np.maximum(
        np.maximum(np.abs(amount_a), np.abs(amount_b)),
        1.0
    )

    amount_difference_pct = (
        np.abs(amount_a - amount_b)
        / denominator
        * 100.0
    )

    date_a = left["dt_start"]
    date_b = right["dt_start"]

    date_gap_days = (
        (date_a - date_b)
        .abs()
        .dt.total_seconds()
        .div(86400)
        .fillna(9999.0)
        .to_numpy()
    )

    return pd.DataFrame({
        "text_similarity": np.round(text_similarity, 4),
        "same_location": (
            left["location_id"].to_numpy()
            == right["location_id"].to_numpy()
        ),
        "same_constituency": (
            left["constituency"].to_numpy()
            == right["constituency"].to_numpy()
        ),
        "same_work_type": (
            left["work_type"].to_numpy()
            == right["work_type"].to_numpy()
        ),
        "amount_difference_pct": np.round(
            amount_difference_pct,
            4
        ),
        "date_gap_days": date_gap_days,
    })


def generate_positive_pairs(df: pd.DataFrame) -> pd.DataFrame:
    """
    Positive pairs are generated exclusively within true duplicate groups.
    """

    dup_mask = (
        df["duplicate_group_id"].notna()
        & df["duplicate_group_id"].ne("")
        & df["duplicate_group_id"].ne("none")
    )

    dup_df = df.loc[dup_mask]

    pairs = []

    for group_id, group in dup_df.groupby(
        "duplicate_group_id",
        sort=True
    ):
        indices = group.index.to_numpy()

        # General implementation supports groups > 2.
        if len(indices) < 2:
            continue

        ii, jj = np.triu_indices(
            len(indices),
            k=1
        )

        pairs.extend(
            zip(
                indices[ii],
                indices[jj]
            )
        )

    if not pairs:
        return pd.DataFrame()

    left_idx = [p[0] for p in pairs]
    right_idx = [p[1] for p in pairs]

    features = pair_features(
        df,
        left_idx,
        right_idx
    )

    features.insert(
        0,
        "pair_type",
        "POSITIVE"
    )

    return features


def generate_negative_candidates(df: pd.DataFrame):
    """
    Generate hard-negative candidates using cheap blocking.

    We deliberately DO NOT use duplicate_group_id as a feature.
    It is used only to define ground-truth populations for calibration.
    """

    normal_mask = (
        df["duplicate_group_id"].isna()
        | df["duplicate_group_id"].eq("")
        | df["duplicate_group_id"].eq("none")
    )

    normal = df.loc[normal_mask].copy()

    # Deterministic sampling.
    normal = normal.sample(
        frac=1.0,
        random_state=RANDOM_SEED
    )

    # Candidate pairs are constructed inside administrative blocks.
    blocks = normal.groupby(
        ["constituency", "work_type"],
        dropna=False
    )

    candidates = []

    for _, block in blocks:

        if len(block) < 2:
            continue

        # Small bounded block prevents combinatorial explosion.
        block = block.head(40)

        idx = block.index.to_numpy()

        ii, jj = np.triu_indices(
            len(idx),
            k=1
        )

        candidates.extend(
            zip(
                idx[ii],
                idx[jj]
            )
        )

        if len(candidates) >= MAX_NEGATIVES * 20:
            break

    return candidates


def generate_hard_negatives(df: pd.DataFrame, target: int):
    """
    Evaluate candidate negative pairs and retain the most
    duplicate-like legitimate pairs.
    """

    candidates = generate_negative_candidates(df)

    if not candidates:
        return pd.DataFrame()

    left_idx = [p[0] for p in candidates]
    right_idx = [p[1] for p in candidates]

    features = pair_features(
        df,
        left_idx,
        right_idx
    )

    # Hard-negative ranking:
    #
    # 1. High text similarity
    # 2. Same location
    # 3. Close dates
    # 4. Similar financial scale
    #
    # This deliberately finds legitimate pairs that look most like duplicates.

    features["hardness"] = (
        features["text_similarity"] * 100
        + features["same_location"].astype(int) * 25
        + features["same_constituency"].astype(int) * 10
        + features["same_work_type"].astype(int) * 10
        - np.minimum(
            features["date_gap_days"],
            100
        ) * 0.10
        - np.minimum(
            features["amount_difference_pct"],
            100
        ) * 0.05
    )

    # Keep only meaningful textual candidates OR strong relational collisions.
    candidate_mask = (
        (features["text_similarity"] >= TEXT_CANDIDATE_THRESHOLD)
        | features["same_location"]
    )

    features = features.loc[candidate_mask]

    features = (
        features
        .sort_values(
            "hardness",
            ascending=False
        )
        .head(target)
        .copy()
    )

    features.insert(
        0,
        "pair_type",
        "HARD_NEGATIVE"
    )

    return features.drop(
        columns=["hardness"]
    )


def run_pair_discrimination():

    print("=" * 70)
    print("🔬 PHASE 4.3B: FAST PAIRWISE DISCRIMINATION CALIBRATION")
    print("=" * 70)

    root_dir = os.path.abspath(
        os.path.join(
            os.path.dirname(__file__),
            "../.."
        )
    )

    artifacts_dir = os.path.join(
        root_dir,
        "artifacts"
    )

    raw_csv_path = os.path.join(
        root_dir,
        "data",
        "raw",
        "synthetic_projects_v1.0.csv"
    )

    manifest_path = os.path.join(
        artifacts_dir,
        "manifest.json"
    )

    if not os.path.exists(raw_csv_path):
        raise FileNotFoundError(
            "CRITICAL: Raw dataset missing."
        )

    if not os.path.exists(manifest_path):
        raise FileNotFoundError(
            "CRITICAL: Manifest missing."
        )

    with open(manifest_path, "r") as f:
        manifest = json.load(f)

    actual_hash = compute_file_sha256(
        raw_csv_path
    )

    if actual_hash != manifest.get(
        "dataset_sha256"
    ):
        raise ValueError(
            "CRITICAL PROVENANCE FAILURE: "
            "Dataset hash mismatch."
        )

    print("✅ Cryptographic Manifest Verified.")

    df = pd.read_csv(
        raw_csv_path
    )

    required = [
        "duplicate_group_id",
        "project_description",
        "location_id",
        "constituency",
        "work_type",
        "sanctioned_amount",
        "start_date",
    ]

    missing = [
        c for c in required
        if c not in df.columns
    ]

    if missing:
        raise KeyError(
            f"CRITICAL: Missing columns: {missing}"
        )

    df = add_derived_columns(df)

    # ---------------------------------------------------------
    # POSITIVES
    # ---------------------------------------------------------

    print("🔄 Generating positive duplicate pairs...")

    positive = generate_positive_pairs(df)

    print(
        f"✅ Positive pairs: {len(positive)}"
    )

    # ---------------------------------------------------------
    # NEGATIVES
    # ---------------------------------------------------------

    target_negatives = min(
        len(positive) * TARGET_NEGATIVE_MULTIPLIER,
        MAX_NEGATIVES
    )

    print(
        f"🔄 Mining {target_negatives} "
        "hard negatives..."
    )

    negative = generate_hard_negatives(
        df,
        target_negatives
    )

    print(
        f"✅ Hard negatives: {len(negative)}"
    )

    # ---------------------------------------------------------
    # FINAL DATASET
    # ---------------------------------------------------------

    pairs = pd.concat(
        [
            positive,
            negative
        ],
        ignore_index=True
    )

    if pairs.empty:
        raise RuntimeError(
            "CRITICAL: No calibration pairs generated."
        )

    print("\n" + "=" * 70)
    print(
        "📊 PAIRWISE DISCRIMINATION SUMMARY"
    )
    print("=" * 70)

    summary = (
        pairs
        .groupby("pair_type")
        .agg(
            pair_count=("pair_type", "size"),
            text_similarity_median=(
                "text_similarity",
                "median"
            ),
            text_similarity_min=(
                "text_similarity",
                "min"
            ),
            same_location_rate=(
                "same_location",
                "mean"
            ),
            same_constituency_rate=(
                "same_constituency",
                "mean"
            ),
            same_work_type_rate=(
                "same_work_type",
                "mean"
            ),
            amount_difference_median=(
                "amount_difference_pct",
                "median"
            ),
            date_gap_median=(
                "date_gap_days",
                "median"
            ),
        )
    )

    print(summary.to_string())

    print("=" * 70)

    output_path = os.path.join(
        artifacts_dir,
        "duplicate_pair_discrimination_report.json"
    )

    os.makedirs(
        artifacts_dir,
        exist_ok=True
    )

    pairs.to_json(
        output_path,
        orient="records",
        indent=4
    )

    print(
        f"📄 Report written to:\n{output_path}"
    )

    print("=" * 70)


if __name__ == "__main__":
    run_pair_discrimination()