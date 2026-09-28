import os
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score
import joblib

def main():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(current_dir, "..", "data", "emergency_severity_dataset.csv")
    models_dir = os.path.join(current_dir, "..", "models")
    os.makedirs(models_dir, exist_ok=True)
    model_output_path = os.path.join(models_dir, "emergency_severity_model.joblib")

    print(f"Loading emergency dataset from: {data_path}")
    df = pd.read_csv(data_path)
    print(f"Dataset shape: {df.shape}")
    print(f"Severity distribution:\n{df['Severity'].value_counts()}")

    # Define feature columns
    numeric_features = [
        "Age", "HeartRate", "SpO2", "Temperature", 
        "Systolic_BP", "Diastolic_BP", "RespiratoryRate"
    ]
    categorical_features = [
        "Gender", "Fever", "Cough", "Fatigue", 
        "DifficultyBreathing", "ChestPain", "Headache", "Disease"
    ]
    target_column = "Severity"

    X = df[numeric_features + categorical_features]
    y = df[target_column]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # Preprocessing pipelines
    numeric_transformer = StandardScaler()
    categorical_transformer = OneHotEncoder(handle_unknown="ignore")

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", numeric_transformer, numeric_features),
            ("cat", categorical_transformer, categorical_features),
        ]
    )

    # Full pipeline with Random Forest Classifier
    pipeline = Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            ("classifier", RandomForestClassifier(n_estimators=120, max_depth=15, random_state=42)),
        ]
    )

    print("Training Emergency Severity Classification Model...")
    pipeline.fit(X_train, y_train)

    # Evaluation
    y_pred = pipeline.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"\n==========================================")
    print(f"Model Training Completed Successfully!")
    print(f"Test Accuracy: {accuracy * 100:.2f}%")
    print(f"==========================================\n")
    print("Classification Report:")
    print(classification_report(y_test, y_pred))

    # Save trained model pipeline
    joblib.dump(pipeline, model_output_path)
    print(f"Saved trained model pipeline to: {model_output_path}")

if __name__ == "__main__":
    main()
