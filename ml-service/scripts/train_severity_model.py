import os
import json
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix
import joblib

def train_model():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(current_dir, "..", "data", "Patient Severity(1).csv")
    models_dir = os.path.join(current_dir, "..", "models")
    os.makedirs(models_dir, exist_ok=True)
    
    model_output_path = os.path.join(models_dir, "emergency_severity_model.joblib")
    metrics_output_path = os.path.join(models_dir, "severity_model_metrics.json")

    print(f"Loading patient severity dataset from: {data_path}")
    if not os.path.exists(data_path):
        fallback = os.path.join(current_dir, "..", "data", "emergency_severity_dataset.csv")
        print(f"Patient Severity(1).csv not found, falling back to: {fallback}")
        data_path = fallback

    df = pd.read_csv(data_path)
    print(f"Dataset successfully loaded. Dimensions: {df.shape[0]} rows x {df.shape[1]} columns")
    print(f"Columns: {list(df.columns)}")

    # Exclude Patient_ID if present
    if "Patient_ID" in df.columns:
        df = df.drop(columns=["Patient_ID"])

    # Features and Target
    numeric_features = [
        "Age", "HeartRate", "SpO2", "Temperature", 
        "Systolic_BP", "Diastolic_BP", "RespiratoryRate"
    ]
    categorical_features = [
        "Gender", "Fever", "Cough", "Fatigue", 
        "DifficultyBreathing", "ChestPain", "Headache", "Disease"
    ]
    target_column = "Severity"

    # Filter to valid available columns
    numeric_features = [c for c in numeric_features if c in df.columns]
    categorical_features = [c for c in categorical_features if c in df.columns]

    X = df[numeric_features + categorical_features]
    y = df[target_column].astype(str).str.upper().str.strip()

    print(f"Target Severity Distribution:\n{y.value_counts()}")

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    numeric_transformer = StandardScaler()
    categorical_transformer = OneHotEncoder(handle_unknown="ignore")

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", numeric_transformer, numeric_features),
            ("cat", categorical_transformer, categorical_features),
        ]
    )

    pipeline = Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            ("classifier", RandomForestClassifier(
                n_estimators=150,
                max_depth=16,
                min_samples_split=4,
                random_state=42,
                n_jobs=-1
            )),
        ]
    )

    print("\nTraining Random Forest Emergency Severity Pipeline...")
    pipeline.fit(X_train, y_train)

    y_pred = pipeline.predict(X_test)
    accuracy = float(accuracy_score(y_test, y_pred))
    report_dict = classification_report(y_test, y_pred, output_dict=True)
    report_text = classification_report(y_test, y_pred)
    cm = confusion_matrix(y_test, y_pred, labels=sorted(list(y.unique()))).tolist()

    print("\n========================================================")
    print(f"TRAINING COMPLETE - TEST ACCURACY: {accuracy * 100:.2f}%")
    print("========================================================")
    print("\nClassification Report:\n", report_text)

    # Save trained joblib model
    joblib.dump(pipeline, model_output_path)
    print(f"Model saved to: {model_output_path}")

    # Save comprehensive metrics JSON
    metrics = {
        "dataset_rows": len(df),
        "test_rows": len(y_test),
        "accuracy": round(accuracy, 4),
        "labels": sorted(list(y.unique())),
        "confusion_matrix": cm,
        "classification_report": report_dict,
        "numeric_features": numeric_features,
        "categorical_features": categorical_features,
    }

    with open(metrics_output_path, "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2)

    print(f"Evaluation metrics saved to: {metrics_output_path}")

if __name__ == "__main__":
    train_model()
