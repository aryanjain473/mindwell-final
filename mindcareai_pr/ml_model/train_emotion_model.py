import pandas as pd
import numpy as np
import json
import joblib

from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.svm import LinearSVC
from sklearn.pipeline import Pipeline
from sklearn.ensemble import VotingClassifier
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score

import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
import re
import difflib
from pathlib import Path

# =========================
# NLTK setup
# =========================
nltk.download("stopwords")
nltk.download("wordnet")

# =========================
# Load Dataset
# =========================
df = pd.read_csv("C:/Users/Dhruv/Desktop/mindcareai_project/ml_model/data/isear.csv")

# normalize text and labels
df["Content"] = df["Content"].astype(str)
df["Emotion"] = df["Emotion"].astype(str).str.lower().str.strip()

# fix simple typos in emotion labels
_known = ["joy", "sadness", "anger", "fear", "shame", "disgust", "guilt"]

def _fix(lbl: str) -> str:
    if not isinstance(lbl, str) or lbl == "":
        return lbl
    m = difflib.get_close_matches(lbl, _known, n=1, cutoff=0.6)
    return m[0] if m else lbl

df["Emotion"] = df["Emotion"].apply(_fix)

# drop rows with missing text or labels
df = df[df["Content"].notna() & df["Emotion"].notna() & (df["Emotion"] != "")].copy()

# Iteratively drop labels with <2 examples
while True:
    label_counts = df["Emotion"].value_counts()
    print("Label counts:\n", label_counts)
    low_labels = label_counts[label_counts < 2].index.tolist()
    if not low_labels:
        break
    print(f"Dropping labels with fewer than 2 examples: {low_labels}")
    df = df[~df["Emotion"].isin(low_labels)].copy()
    if df.empty:
        raise ValueError("No data left after dropping rare labels.")

texts = df["Content"].astype(str)
labels = df["Emotion"].astype(str)

# =========================
# Preprocessing Function
# =========================
stop_words = set(stopwords.words("english"))
lemmatizer = WordNetLemmatizer()

def clean_text(text):
    text = text.lower()
    text = re.sub(r"http\S+|www\S+", "", text)  # remove URLs
    text = re.sub(r"[^a-z\s]", "", text)        # remove punctuation/numbers
    tokens = text.split()
    tokens = [lemmatizer.lemmatize(w) for w in tokens if w not in stop_words]
    return " ".join(tokens)

texts_cleaned = texts.apply(clean_text)

# =========================
# Train/Test Split
# =========================
counts = labels.value_counts()
if any(counts < 2):
    print("⚠️ Some classes have <2 samples → non-stratified split.")
    strat_param = None
else:
    strat_param = labels

X_train, X_test, y_train, y_test = train_test_split(
    texts_cleaned, labels, test_size=0.2, stratify=strat_param, random_state=42
)

# =========================
# Ensemble Pipeline
# =========================
tfidf = TfidfVectorizer(ngram_range=(1, 3), max_features=75000)

log_reg = LogisticRegression(max_iter=300, class_weight="balanced", C=1)
svm = LinearSVC(C=1, class_weight="balanced")

ensemble = VotingClassifier(
    estimators=[
        ("log_reg", log_reg),
        ("svm", svm),
    ],
    voting="hard"
)

pipeline = Pipeline([
    ("tfidf", tfidf),
    ("ensemble", ensemble)
])

# Train
pipeline.fit(X_train, y_train)

# Predict
y_pred = pipeline.predict(X_test)

# =========================
# Evaluation
# =========================
print("\n=== Classification Report (Ensemble) ===")
print(classification_report(y_test, y_pred))

print("\n=== Confusion Matrix (Ensemble) ===")
print(confusion_matrix(y_test, y_pred))

acc = accuracy_score(y_test, y_pred)
print(f"\n🎯 Final Test Accuracy (Ensemble): {acc:.4f}")

# =========================
# Save Model & Metadata
# =========================
# Ensure output directory exists (ml_model folder next to this script)
out_dir = Path(__file__).resolve().parent
out_dir.mkdir(parents=True, exist_ok=True)
model_path = out_dir / "emotion_model.pkl"
label_map_path = out_dir / "label_map.json"
test_preds_path = out_dir / "test_predictions.csv"

joblib.dump(pipeline, model_path)
print(f"Saved model to {model_path}")

label_map = {
    "polarity_map": {
        "joy": "positive",
        "fear": "negative",
        "anger": "negative",
        "sadness": "negative",
        "disgust": "negative",
        "shame": "negative",
        "guilt": "negative"
    },
    "risk_map": {
        "joy": "low",
        "fear": "medium",
        "anger": "medium",
        "sadness": "high",
        "disgust": "medium",
        "shame": "high",
        "guilt": "high"
    }
}

with open(label_map_path, "w", encoding="utf-8") as f:
    json.dump(label_map, f, indent=4)

# save test predictions
results_df = pd.DataFrame({"text": X_test, "gold": y_test, "pred": y_pred})
results_df.to_csv(test_preds_path, index=False)

print(f"\n✅ Ensemble model, label_map.json, and test_predictions.csv saved to {out_dir}!")
