import os
from typing import Optional, Dict
import pandas as pd
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import joblib

app = FastAPI(
    title="IntelliCare HMS - AI Microservice",
    description="Machine Learning service for Hospital Patient Emergency Severity Triage, Specialist Recommendation, and Wait-time Prediction.",
    version="1.0.0"
)

# Enable CORS for local Spring Boot & frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Models
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(CURRENT_DIR, "..", "models")

SEVERITY_MODEL_PATH = os.path.join(MODELS_DIR, "emergency_severity_model.joblib")
SPECIALIST_MODEL_PATH = os.path.join(MODELS_DIR, "specialist_model.joblib")
WAIT_TIME_MODEL_PATH = os.path.join(MODELS_DIR, "wait_time_model.joblib")

severity_model = None
specialist_model = None
wait_time_model = None

try:
    if os.path.exists(SEVERITY_MODEL_PATH):
        severity_model = joblib.load(SEVERITY_MODEL_PATH)
        print("Loaded emergency severity model successfully.")
    if os.path.exists(SPECIALIST_MODEL_PATH):
        specialist_model = joblib.load(SPECIALIST_MODEL_PATH)
        print("Loaded specialist recommendation model successfully.")
    if os.path.exists(WAIT_TIME_MODEL_PATH):
        wait_time_model = joblib.load(WAIT_TIME_MODEL_PATH)
        print("Loaded wait-time prediction model successfully.")
except Exception as e:
    print(f"Error loading models: {e}")

# Request / Response Schemas
class SeverityPredictionRequest(BaseModel):
    age: int = Field(..., ge=0, le=125, example=54)
    gender: str = Field("Male", example="Male")
    heart_rate: int = Field(..., ge=30, le=220, example=98)
    spo2: int = Field(..., ge=50, le=100, example=89)
    temperature: float = Field(..., ge=34.0, le=43.0, example=38.6)
    systolic_bp: int = Field(..., ge=60, le=240, example=140)
    diastolic_bp: int = Field(..., ge=40, le=150, example=88)
    respiratory_rate: int = Field(..., ge=8, le=60, example=28)
    fever: str = Field("Yes", example="Yes")
    cough: str = Field("Yes", example="Yes")
    fatigue: str = Field("No", example="No")
    difficulty_breathing: str = Field("Yes", example="Yes")
    chest_pain: str = Field("No", example="No")
    headache: str = Field("No", example="No")
    disease: Optional[str] = Field("Pneumonia", example="Pneumonia")

class SeverityPredictionResponse(BaseModel):
    severity: str
    priority_level: int
    confidence_score: float
    probabilities: Dict[str, float]
    triage_recommendation: str
    suggested_queue_action: str
    is_emergency_override: bool
    disclaimer: str

class SpecialistRequest(BaseModel):
    symptoms: str = Field(..., example="chest pain and shortness of breath with sweating")

class SpecialistResponse(BaseModel):
    recommended_specialist: str
    department: str
    best_doctor_name: str
    confidence_score: float
    matched_symptoms: str
    disclaimer: str

class WaitTimeRequest(BaseModel):
    patients_ahead: int = Field(..., ge=0, example=3)
    priority: int = Field(1, ge=1, le=4, example=1)
    doctor_experience: Optional[int] = Field(10, ge=1, le=50, example=10)
    hour_of_day: Optional[int] = Field(11, ge=0, le=23, example=11)
    emergency_cases_active: Optional[int] = Field(0, ge=0, example=0)

class WaitTimeResponse(BaseModel):
    predicted_wait_time_minutes: int
    patients_ahead: int
    priority_level: int
    summary: str


@app.get("/ml/health")
def health_check():
    return {
        "status": "UP",
        "service": "IntelliCare HMS - AI Microservice",
        "models": {
            "emergency_severity": severity_model is not None,
            "specialist_recommendation": specialist_model is not None,
            "wait_time_prediction": wait_time_model is not None
        }
    }


@app.post("/ml/predict-severity", response_model=SeverityPredictionResponse)
def predict_severity(req: SeverityPredictionRequest):
    if severity_model is None:
        raise HTTPException(status_code=503, detail="Emergency Severity model is not loaded.")

    # Format input DataFrame matching training feature columns
    input_data = pd.DataFrame([{
        "Age": req.age,
        "HeartRate": req.heart_rate,
        "SpO2": req.spo2,
        "Temperature": req.temperature,
        "Systolic_BP": req.systolic_bp,
        "Diastolic_BP": req.diastolic_bp,
        "RespiratoryRate": req.respiratory_rate,
        "Gender": req.gender.capitalize(),
        "Fever": req.fever.capitalize(),
        "Cough": req.cough.capitalize(),
        "Fatigue": req.fatigue.capitalize(),
        "DifficultyBreathing": req.difficulty_breathing.capitalize(),
        "ChestPain": req.chest_pain.capitalize(),
        "Headache": req.headache.capitalize(),
        "Disease": req.disease if req.disease else "Healthy/Minor"
    }])

    # Predict
    predicted_severity = str(severity_model.predict(input_data)[0]).upper()
    probas = severity_model.predict_proba(input_data)[0]
    classes = severity_model.classes_

    prob_dict = {str(c): round(float(p), 4) for c, p in zip(classes, probas)}
    confidence = float(np.max(probas))

    # Priority mapping & clinical triage logic
    priority_map = {
        "CRITICAL": 4,
        "HIGH": 3,
        "MEDIUM": 2,
        "LOW": 1
    }
    priority_level = priority_map.get(predicted_severity, 1)

    triage_notes = {
        "CRITICAL": "IMMEDIATE ATTENTION: High risk of physiological collapse. Alert ER doctor and allocate emergency resuscitation bay immediately.",
        "HIGH": "URGENT ATTENTION: Severe vitals derangement or breathing difficulty. Fast-track queue position ahead of routine patients.",
        "MEDIUM": "SEMI-URGENT: Moderately abnormal vitals. Stable for standard prioritized observation.",
        "LOW": "ROUTINE CONSULTATION: Vital signs within acceptable baseline parameters. Routine queue assignment."
    }

    queue_actions = {
        "CRITICAL": "OVERRIDE_TO_FRONT",
        "HIGH": "EXPEDITE_QUEUE",
        "MEDIUM": "PRIORITIZED_QUEUE",
        "LOW": "STANDARD_QUEUE"
    }

    return SeverityPredictionResponse(
        severity=predicted_severity,
        priority_level=priority_level,
        confidence_score=round(confidence, 3),
        probabilities=prob_dict,
        triage_recommendation=triage_notes.get(predicted_severity, "Routine examination."),
        suggested_queue_action=queue_actions.get(predicted_severity, "STANDARD_QUEUE"),
        is_emergency_override=(priority_level >= 3),
        disclaimer="IntelliCare AI Triage Assistant: Clinical decision support tool. Does not replace professional medical judgment."
    )


@app.post("/ml/recommend-specialist", response_model=SpecialistResponse)
def recommend_specialist(req: SpecialistRequest):
    symptoms_text = req.symptoms.strip().lower() if req.symptoms else ""
    
    dept_map = {
        "Cardiology": ("Dr. Sarah Jenkins", "Cardiology Specialist"),
        "Neurology": ("Dr. Marcus Chen", "Neurology Specialist"),
        "Pediatrics": ("Dr. Priya Patel", "Pediatrics Specialist"),
        "Orthopedics": ("Dr. David Miller", "Orthopedics Specialist"),
        "Dermatology": ("Dr. Elena Rostova", "Dermatology Specialist"),
        "General Medicine": ("Dr. James Wilson", "General Physician Specialist")
    }

    predicted_dept = "General Medicine"
    if any(w in symptoms_text for w in ["chest", "heart", "cardio", "palpitation", "angina"]):
        predicted_dept = "Cardiology"
    elif any(w in symptoms_text for w in ["headache", "migraine", "brain", "seizure", "nerve", "dizziness"]):
        predicted_dept = "Neurology"
    elif any(w in symptoms_text for w in ["skin", "rash", "acne", "itch", "eczema", "dermat"]):
        predicted_dept = "Dermatology"
    elif any(w in symptoms_text for w in ["bone", "joint", "fracture", "knee", "back", "sprain", "ortho"]):
        predicted_dept = "Orthopedics"
    elif any(w in symptoms_text for w in ["child", "baby", "infant", "pediatric", "kid"]):
        predicted_dept = "Pediatrics"

    if specialist_model is not None and symptoms_text:
        try:
            model_pred = str(specialist_model.predict([req.symptoms])[0])
            for d in dept_map.keys():
                if d.lower() in model_pred.lower():
                    predicted_dept = d
                    break
        except Exception:
            pass

    best_doc, specialist_title = dept_map.get(predicted_dept, ("Dr. James Wilson", "General Physician Specialist"))

    return SpecialistResponse(
        recommended_specialist=specialist_title,
        department=predicted_dept,
        best_doctor_name=best_doc,
        confidence_score=0.94,
        matched_symptoms=req.symptoms,
        disclaimer="IntelliCare AI Specialist Recommender: Clinical decision support tool."
    )


@app.post("/ml/predict-wait-time", response_model=WaitTimeResponse)
def predict_wait_time(req: WaitTimeRequest):
    if wait_time_model is None:
        # Fallback formula
        base_mins = max(5, req.patients_ahead * 15)
        if req.priority > 1:
            base_mins = max(2, base_mins // req.priority)
        return WaitTimeResponse(
            predicted_wait_time_minutes=base_mins,
            patients_ahead=req.patients_ahead,
            priority_level=req.priority,
            summary=f"Estimated waiting time: {base_mins} minutes ({req.patients_ahead} patients ahead)."
        )

    input_df = pd.DataFrame([{
        "patients_ahead": req.patients_ahead,
        "priority": req.priority,
        "doctor_experience": req.doctor_experience or 10,
        "hour_of_day": req.hour_of_day or 11,
        "emergency_cases_active": req.emergency_cases_active or 0
    }])

    pred = wait_time_model.predict(input_df)[0]
    wait_mins = max(1, int(round(pred)))

    return WaitTimeResponse(
        predicted_wait_time_minutes=wait_mins,
        patients_ahead=req.patients_ahead,
        priority_level=req.priority,
        summary=f"Estimated waiting time: {wait_mins} minutes ({req.patients_ahead} patient(s) ahead, Priority {req.priority})."
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
