# SentinelAI — Cyber Defense Model

## Dataset
- **NSL-KDD** — CICIDS2017-style network intrusion detection dataset (public, bina Kaggle auth ke liye GitHub mirror se liya).
- Train: **125,973 rows** (KDDTrain+), Test: **22,544 rows** (KDDTest+ — isme naye/unknown attack types hain, isliye ye hard benchmark hai).
- Label: `Normal` vs `Attack` (binary).
- NSL-KDD attacks ko SentinelAI ke 4 attack vectors se map kiya gaya hai:
  - DoS attacks (neptune, smurf, ...) → **DDoS**
  - guess_passwd → **Brute Force**
  - sqlattack → **SQL Injection**
  - buffer_overflow / rootkit waghera → **Malware**
  - Probe attacks → Recon

## Model
- **RandomForestClassifier** — 100 trees, random_state=42
- Preprocessing: `protocol_type`, `service`, `flag` ka one-hot encoding (total **122 features**), numeric features par `StandardScaler`.

## Results (official NSL-KDD test split par)
| Metric | Score |
|---|---|
| Accuracy | **0.7648** |
| Precision | **0.9670** |
| Recall | 0.6075 |
| F1 | 0.7462 |

Confusion matrix — TN: 9445, FP: 266, FN: 5037, TP: 7796.
Top features: `src_bytes`, `dst_bytes`, `flag_SF`, `dst_host_same_srv_rate`, `dst_host_srv_count`, `logged_in`.

> Note: KDDTest+ me aise attacks hain jo training me kabhi nahi dekhe — isliye recall low hai. Ye dataset ka known hard part hai; precision 96.7% ka matlab hai false alarms bahut kam hain (SOC dashboard ke liye important).

## Files
- `model.pkl` — joblib bundle: `{model, scaler, feature_names}`. Single connection row ko `feature_names` ke order me vector banakar `scaler` → `model.predict()` se use karo.
- `metrics.json` — poore metrics + attack-vector distribution.

## Load example
```python
import joblib
bundle = joblib.load("model.pkl")
pred = bundle["model"].predict(bundle["scaler"].transform([row_vector]))  # 0=Normal, 1=Attack
```
