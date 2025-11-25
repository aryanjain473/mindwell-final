# tools/emotion_tool.py
"""
Inference wrapper for our saved emotion model.
Exposes: predict_emotion(text) -> dict with keys: emotion, polarity, risk, confidence
"""

import os
import json
from pathlib import Path
import joblib
import math

BASE = Path(__file__).resolve().parents[1] / "ml_model"
MODEL_PATH = BASE / "emotion_model.pkl"
LABEL_MAP_PATH = BASE / "label_map.json"

# Lazy load
_pipeline = None
_label_map = None

def _load():
    global _pipeline, _label_map
    if _pipeline is None:
        if not MODEL_PATH.exists():
            raise FileNotFoundError(f"Model not found at {MODEL_PATH}. Run ml_model/train_emotion_model.py first.")
        _pipeline = joblib.load(MODEL_PATH)
    if _label_map is None:
        if LABEL_MAP_PATH.exists():
            with open(LABEL_MAP_PATH, "r", encoding="utf-8") as f:
                _label_map = json.load(f)
        else:
            _label_map = {"polarity_map": {}, "risk_map": {}}
    return _pipeline, _label_map

def _map_polarity_and_risk(emotion: str, label_map: dict):
    polarity = label_map.get("polarity_map", {}).get(emotion, "neutral")
    risk = label_map.get("risk_map", {}).get(emotion, "low")
    return polarity, risk

def predict_emotion(text: str):
    """
    Returns:
    {
      "emotion": "sadness",
      "polarity": "negative",
      "risk": "medium",
      "confidence": 0.87
    }
    """
    pipeline, label_map = _load()

    # pipeline.predict_proba is available if classifier supports it.
    # We attempt to call predict_proba; if not present, fallback to 1.0 confidence.
    try:
        probs = pipeline.predict_proba([text])[0]
        pred_idx = int(probs.argmax())
        labels = pipeline.classes_
        emotion = labels[pred_idx]
        confidence = float(probs[pred_idx])
    except Exception:
        # fallback
        emotion = pipeline.predict([text])[0]
        confidence = 1.0

    polarity, risk = _map_polarity_and_risk(emotion, label_map)
    return {
        "emotion": str(emotion),
        "polarity": str(polarity),
        "risk": str(risk),
        "confidence": float(confidence)
    }

# convenience alias
analyze_emotion = predict_emotion
