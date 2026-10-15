"""SentinelAI Cyber Defense - intrusion detection model training (NSL-KDD).

Run:
    pip install pandas scikit-learn joblib numpy
    python train.py

Pehli baar chalane par NSL-KDD dataset (~22 MB) khud download ho jayega.
Output: model.pkl aur metrics.json isi folder me banenge.
"""
import gzip
import json
import urllib.request
from pathlib import Path

import numpy as np
import pandas as pd
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import (accuracy_score, precision_score, recall_score,
                             f1_score, confusion_matrix)

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(exist_ok=True)

FILES = {
    "KDDTrain.txt": "https://raw.githubusercontent.com/defcom17/NSL_KDD/master/KDDTrain%2B.txt",
    "KDDTest.txt": "https://raw.githubusercontent.com/defcom17/NSL_KDD/master/KDDTest%2B.txt",
}


def download_datasets():
    for name, url in FILES.items():
        dest = DATA_DIR / name
        if dest.exists() and dest.stat().st_size > 0:
            print(f"[skip] {name} pehle se maujood hai")
            continue
        print(f"[download] {name} ...")
        urllib.request.urlretrieve(url, dest)
        print(f"[ok] {name} ({dest.stat().st_size // 1024} KB)")


COLS = ["duration", "protocol_type", "service", "flag", "src_bytes", "dst_bytes", "land",
        "wrong_fragment", "urgent", "hot", "num_failed_logins", "logged_in",
        "num_compromised", "root_shell", "su_attempted", "num_root", "num_file_creations",
        "num_shells", "num_access_files", "num_outbound_cmds", "is_host_login",
        "is_guest_login", "count", "srv_count", "serror_rate", "srv_serror_rate",
        "rerror_rate", "srv_rerror_rate", "same_srv_rate", "diff_srv_rate",
        "srv_diff_host_rate", "dst_host_count", "dst_host_srv_count",
        "dst_host_same_srv_rate", "dst_host_diff_srv_rate",
        "dst_host_same_src_port_rate", "dst_host_srv_diff_host_rate",
        "dst_host_serror_rate", "dst_host_srv_serror_rate", "dst_host_rerror_rate",
        "dst_host_srv_rerror_rate", "label", "difficulty"]

# NSL-KDD attack -> SentinelAI ke attack vectors me mapping
DOS = {"back", "land", "neptune", "pod", "smurf", "teardrop", "apache2",
       "processtable", "udpstorm", "mailbomb"}
PROBE = {"ipsweep", "nmap", "portsweep", "satan", "saint", "mscan"}
R2L = {"ftp_write", "guess_passwd", "imap", "multihop", "phf", "spy", "warezclient",
       "warezmaster", "xlock", "xsnoop", "sendmail", "named", "snmpguess",
       "snmpgetattack", "httptunnel", "worm"}
U2R = {"buffer_overflow", "loadmodule", "perl", "rootkit", "ps", "sqlattack", "xterm"}


def vector_of(label):
    if label in DOS:
        return "DDoS"
    if label in PROBE:
        return "Recon"
    if label in R2L:
        return "Brute Force" if label == "guess_passwd" else ("SQL Injection" if label == "sqlattack" else "R2L")
    if label in U2R:
        return "Malware" if label in {"buffer_overflow", "loadmodule", "rootkit"} else "U2R"
    return label


def load(path):
    df = pd.read_csv(path, header=None, names=COLS)
    df = df.drop(columns=["difficulty"])
    df["label"] = df["label"].astype(str).str.strip()
    df["attack_vector"] = df["label"].apply(lambda l: "Normal" if l == "normal" else vector_of(l))
    df["y"] = (df["label"] != "normal").astype(int)   # 1 = attack, 0 = normal
    return df


def main():
    download_datasets()

    train_df = load(DATA_DIR / "KDDTrain.txt")
    test_df = load(DATA_DIR / "KDDTest.txt")
    print(f"train rows={len(train_df)} attack_rate={train_df.y.mean():.3f} | "
          f"test rows={len(test_df)} attack_rate={test_df.y.mean():.3f}")

    CAT = ["protocol_type", "service", "flag"]
    drop = ["label", "attack_vector", "y"]
    Xtr = pd.get_dummies(train_df.drop(columns=drop), columns=CAT)
    Xte = pd.get_dummies(test_df.drop(columns=drop), columns=CAT)
    Xte = Xte.reindex(columns=Xtr.columns, fill_value=0)

    scaler = StandardScaler()
    Xtr_s = scaler.fit_transform(Xtr)
    Xte_s = scaler.transform(Xte)
    print("features:", Xtr_s.shape[1])

    clf = RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1)
    clf.fit(Xtr_s, train_df["y"].values)
    pred = clf.predict(Xte_s)
    y = test_df["y"].values

    cm = confusion_matrix(y, pred).tolist()
    metrics = {
        "dataset": "NSL-KDD (CICIDS2017-style network intrusion dataset, public)",
        "dataset_url": "https://raw.githubusercontent.com/defcom17/NSL_KDD/master/",
        "train_rows": int(len(train_df)),
        "test_rows": int(len(test_df)),
        "features": int(Xtr_s.shape[1]),
        "model": "RandomForestClassifier(n_estimators=100, random_state=42)",
        "classes": ["Normal", "Attack"],
        "accuracy": round(float(accuracy_score(y, pred)), 4),
        "precision": round(float(precision_score(y, pred)), 4),
        "recall": round(float(recall_score(y, pred)), 4),
        "f1": round(float(f1_score(y, pred)), 4),
        "confusion_matrix": {"tn": cm[0][0], "fp": cm[0][1], "fn": cm[1][0], "tp": cm[1][1]},
        "attack_vector_distribution_test": test_df["attack_vector"].value_counts().to_dict(),
        "top_features": [Xtr.columns[i] for i in np.argsort(clf.feature_importances_)[::-1][:10]],
    }
    print(json.dumps(metrics, indent=2))

    joblib.dump({"model": clf, "scaler": scaler, "feature_names": list(Xtr.columns)},
                BASE_DIR / "model.pkl")
    with open(BASE_DIR / "metrics.json", "w") as f:
        json.dump(metrics, f, indent=2)
    print(f"saved: {BASE_DIR / 'model.pkl'} + {BASE_DIR / 'metrics.json'}")


if __name__ == "__main__":
    main()
