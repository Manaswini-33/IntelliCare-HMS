import os
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_absolute_error, r2_score
import joblib

def main():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    models_dir = os.path.join(current_dir, "..", "models")
    os.makedirs(models_dir, exist_ok=True)
    model_output_path = os.path.join(models_dir, "wait_time_model.joblib")

    np.random.seed(42)
    n_samples = 3000

    # Synthetic realistic queue features
    patients_ahead = np.random.randint(0, 15, size=n_samples)
    priority = np.random.choice([1, 2, 3, 4], size=n_samples, p=[0.6, 0.25, 0.1, 0.05]) # 1=Normal, 2=Medium, 3=High, 4=Critical
    doctor_exp = np.random.randint(2, 30, size=n_samples)
    hour_of_day = np.random.randint(8, 18, size=n_samples) # 8 AM to 6 PM
    emergency_cases_active = np.random.randint(0, 4, size=n_samples)

    # Base consultation: 14 mins per patient ahead
    # Faster for senior doctors (-0.2 mins per year of exp)
    # Peak hour surge (10-12 and 14-16 add +10 mins delay)
    # Priority reduces patient wait (Priority 4 immediate wait ~ 2 mins; Priority 3 cut in half)
    # Emergency cases in ER add delay to routine queues
    base_wait = patients_ahead * (16.0 - 0.15 * doctor_exp)
    peak_surge = np.where(((hour_of_day >= 10) & (hour_of_day <= 12)) | ((hour_of_day >= 14) & (hour_of_day <= 16)), 8.0, 0.0)
    emergency_delay = emergency_cases_active * 6.0
    
    raw_wait = base_wait + peak_surge + emergency_delay + np.random.normal(0, 3, size=n_samples)

    # Priority adjustments:
    # Priority 4 (Critical): 2-5 minutes
    # Priority 3 (High): 10-15 minutes max
    # Priority 2: 25% discount
    actual_wait = np.zeros(n_samples)
    for i in range(n_samples):
        if priority[i] == 4:
            actual_wait[i] = max(1.0, np.random.uniform(1.0, 5.0))
        elif priority[i] == 3:
            actual_wait[i] = max(4.0, raw_wait[i] * 0.35)
        elif priority[i] == 2:
            actual_wait[i] = max(8.0, raw_wait[i] * 0.70)
        else:
            actual_wait[i] = max(5.0, raw_wait[i])

    X = pd.DataFrame({
        "patients_ahead": patients_ahead,
        "priority": priority,
        "doctor_experience": doctor_exp,
        "hour_of_day": hour_of_day,
        "emergency_cases_active": emergency_cases_active
    })
    y = np.round(actual_wait, 1)

    pipeline = Pipeline([
        ("scaler", StandardScaler()),
        ("regressor", RandomForestRegressor(n_estimators=100, max_depth=12, random_state=42))
    ])

    print("Training Patient Waiting Time Regressor (Random Forest)...")
    pipeline.fit(X, y)

    y_pred = pipeline.predict(X)
    mae = mean_absolute_error(y, y_pred)
    r2 = r2_score(y, y_pred)
    print(f"Wait Time Model Trained - MAE: {mae:.2f} mins, R2 Score: {r2:.3f}")

    joblib.dump(pipeline, model_output_path)
    print(f"Saved wait-time model to: {model_output_path}")

if __name__ == "__main__":
    main()
