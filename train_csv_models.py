import os
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
import joblib

# 1. Save CSV
csv_data = """Patient_ID,Age,Gender,HeartRate,SpO2,Temperature,Systolic_BP,Diastolic_BP,RespiratoryRate,Fever,Cough,Fatigue,DifficultyBreathing,ChestPain,Headache,Disease,Severity
P0001,24,Male,61,97,38.5,140,79,27,Yes,Yes,No,No,No,No,Pneumonia,MEDIUM
P0002,74,Male,95,97,36.8,163,90,26,No,No,Yes,Yes,No,No,Gastroenteritis,HIGH
P0003,65,Female,95,99,36.0,135,88,25,No,No,No,No,No,No,Migraine,LOW
P0004,50,Female,79,93,39.1,119,65,32,Yes,Yes,Yes,No,No,No,Pneumonia,CRITICAL
P0005,49,Female,92,91,38.3,141,94,21,Yes,Yes,No,Yes,No,No,Influenza,HIGH
P0006,80,Female,85,90,36.3,146,86,20,No,Yes,No,No,No,Yes,Asthma,MEDIUM
P0007,24,Male,81,100,37.3,117,75,25,Yes,No,No,No,No,No,Migraine,MEDIUM
P0008,68,Female,65,97,37.7,148,74,15,No,No,Yes,Yes,No,No,Gastroenteritis,MEDIUM
P0009,32,Female,86,100,36.7,107,98,12,No,No,Yes,No,No,No,Gastroenteritis,LOW
P0010,24,Male,64,97,36.8,109,102,17,No,Yes,No,Yes,No,No,Asthma,MEDIUM
P0011,56,Female,62,93,38.3,133,100,21,Yes,No,Yes,No,No,No,Pneumonia,MEDIUM
P0012,89,Male,87,90,36.3,144,88,15,No,No,No,Yes,No,No,COPD,HIGH
P0013,71,Female,84,86,37.6,144,87,18,No,No,Yes,Yes,No,No,Pneumonia,HIGH
P0014,73,Female,84,100,37.9,154,99,16,No,No,Yes,No,No,No,Gastroenteritis,LOW
P0015,70,Female,79,90,37.8,109,81,19,Yes,Yes,Yes,No,No,No,Pneumonia,HIGH
P0016,75,Female,112,93,37.5,136,90,29,Yes,No,Yes,No,Yes,Yes,COVID-19,CRITICAL
P0017,55,Male,88,90,36.6,157,83,22,No,No,Yes,Yes,No,No,COPD,MEDIUM
P0018,27,Female,88,92,37.3,110,97,25,No,Yes,No,Yes,No,Yes,Asthma,HIGH
P0019,79,Female,91,95,36.2,132,103,21,No,No,No,No,No,No,Cardiac,LOW
P0020,50,Female,98,90,36.9,89,78,21,No,Yes,Yes,Yes,No,No,Asthma,HIGH
P0021,54,Female,86,91,39.0,128,96,21,Yes,No,Yes,No,Yes,Yes,Viral Infection,HIGH
P0022,45,Male,84,100,38.8,132,79,19,Yes,Yes,Yes,No,No,No,Viral Infection,MEDIUM
P0023,31,Female,88,100,38.2,129,73,16,Yes,Yes,Yes,No,No,No,Viral Infection,MEDIUM
P0024,85,Male,66,93,37.4,130,87,11,No,No,No,No,Yes,No,Cardiac,HIGH
P0025,75,Female,65,97,37.4,142,90,21,No,No,No,No,Yes,No,Cardiac,MEDIUM
P0026,65,Male,87,100,36.7,141,79,11,No,No,No,No,Yes,No,Cardiac,MEDIUM
P0027,47,Male,82,92,37.2,124,74,24,No,Yes,No,Yes,No,No,Asthma,HIGH
P0028,78,Male,95,92,39.0,120,70,24,Yes,Yes,Yes,No,No,No,COVID-19,HIGH
P0029,57,Female,87,100,36.5,135,77,11,No,No,No,No,Yes,No,Cardiac,HIGH
P0030,50,Male,93,89,38.2,111,82,23,Yes,Yes,No,Yes,No,Yes,Influenza,CRITICAL
P0031,50,Male,69,95,38.1,95,90,23,Yes,Yes,Yes,Yes,No,No,Influenza,HIGH
P0032,34,Female,78,99,37.9,131,87,18,Yes,Yes,Yes,No,No,Yes,Viral Infection,LOW
P0033,24,Male,68,99,37.9,122,82,23,No,Yes,No,Yes,No,No,Influenza,MEDIUM
P0034,58,Male,91,93,36.9,138,66,19,No,Yes,No,Yes,No,No,COPD,MEDIUM
P0035,82,Male,65,94,36.9,136,81,22,No,No,No,Yes,No,No,Cardiac,HIGH
"""

# Store path
data_dir = "ml-service/data"
os.makedirs(data_dir, exist_ok=True)
models_dir = "ml-service/models"
os.makedirs(models_dir, exist_ok=True)

csv_file_path = os.path.join(data_dir, "emergency_severity_dataset.csv")

# Train Specialist Model with comprehensive symptom mapping
specialist_training_data = [
    # Neurology (Migraine, Headache, Seizures, Dizziness, Numbness)
    ("migraine", "Neurology"),
    ("migrane", "Neurology"),
    ("severe headache with nausea and light sensitivity", "Neurology"),
    ("one-sided throbbing headache", "Neurology"),
    ("dizziness, fainting, loss of balance, head pain", "Neurology"),
    ("seizure, blackout, tingling and numbness", "Neurology"),
    
    # Cardiology (Chest pain, Heart, Palpitations, High BP)
    ("cardiac", "Cardiology"),
    ("chest pain", "Cardiology"),
    ("chest pain and shortness of breath with sweating", "Cardiology"),
    ("tightness in chest radiating to left arm", "Cardiology"),
    ("palpitations, irregular heartbeat, high blood pressure", "Cardiology"),
    
    # Dermatology (Rash, Acne, Skin, Eczema, Itching)
    ("skin rash", "Dermatology"),
    ("itchy red skin rash with dry flaky patches", "Dermatology"),
    ("severe acne breakouts on face and neck", "Dermatology"),
    ("eczema flare-up with burning sensation and peeling skin", "Dermatology"),
    
    # Orthopedics (Fracture, Joint pain, Bone, Knee pain, Back pain)
    ("fracture", "Orthopedics"),
    ("bone fracture in arm after fall", "Orthopedics"),
    ("acute knee pain with swelling and joint dislocation", "Orthopedics"),
    ("lower back pain with shooting nerve pain down leg", "Orthopedics"),
    
    # Pediatrics (Child, Infant, Baby fever)
    ("infant with high fever and continuous crying", "Pediatrics"),
    ("child barking cough and fever", "Pediatrics"),
    ("pediatric fever and vomiting", "Pediatrics"),
    
    # General Medicine / Pulmonology (Cough, Fever, Flu, Asthma, Pneumonia)
    ("cough", "General Medicine"),
    ("fever", "General Medicine"),
    ("influenza", "General Medicine"),
    ("pneumonia with high fever and cough", "General Medicine"),
    ("asthma wheezing and chest tightness", "General Medicine"),
    ("viral infection, body ache and fever", "General Medicine"),
    ("gastroenteritis, stomach pain and vomiting", "General Medicine")
]

spec_df = pd.DataFrame(specialist_training_data, columns=["symptoms", "specialist"])
spec_pipeline = Pipeline([
    ("tfidf", TfidfVectorizer(ngram_range=(1, 2), stop_words="english", min_df=1)),
    ("classifier", LogisticRegression(C=5.0, max_iter=200, random_state=42))
])
spec_pipeline.fit(spec_df["symptoms"], spec_df["specialist"])
joblib.dump(spec_pipeline, os.path.join(models_dir, "specialist_model.joblib"))
print("Trained and saved specialist_model.joblib!")

# Emergency Severity Model (Dummy Random Forest trained on synthetic sample for fast response)
X_sev = pd.DataFrame([
    [24, 61, 97, 38.5, 140, 79, 27, "Male", "Yes", "Yes", "No", "No", "No", "No", "Pneumonia"],
    [74, 95, 97, 36.8, 163, 90, 26, "Male", "No", "No", "Yes", "Yes", "No", "No", "Gastroenteritis"],
    [65, 95, 99, 36.0, 135, 88, 25, "Female", "No", "No", "No", "No", "No", "No", "Migraine"],
    [50, 79, 93, 39.1, 119, 65, 32, "Female", "Yes", "Yes", "Yes", "No", "No", "No", "Pneumonia"],
    [75, 112, 93, 37.5, 136, 90, 29, "Female", "Yes", "No", "Yes", "No", "Yes", "Yes", "COVID-19"]
], columns=["Age", "HeartRate", "SpO2", "Temperature", "Systolic_BP", "Diastolic_BP", "RespiratoryRate", "Gender", "Fever", "Cough", "Fatigue", "DifficultyBreathing", "ChestPain", "Headache", "Disease"])

y_sev = ["MEDIUM", "HIGH", "LOW", "CRITICAL", "CRITICAL"]

sev_pipeline = Pipeline([
    ("clf", RandomForestClassifier(n_estimators=10, random_state=42))
])
# Encode categorical columns for RF
from sklearn.preprocessing import OrdinalEncoder
from sklearn.compose import ColumnTransformer

cat_cols = ["Gender", "Fever", "Cough", "Fatigue", "DifficultyBreathing", "ChestPain", "Headache", "Disease"]
num_cols = ["Age", "HeartRate", "SpO2", "Temperature", "Systolic_BP", "Diastolic_BP", "RespiratoryRate"]

preprocessor = ColumnTransformer(
    transformers=[
        ("num", "passthrough", num_cols),
        ("cat", OrdinalEncoder(handle_unknown="use_encoded_value", unknown_value=-1), cat_cols)
    ]
)

sev_full_pipeline = Pipeline([
    ("pre", preprocessor),
    ("clf", RandomForestClassifier(n_estimators=10, random_state=42))
])

sev_full_pipeline.fit(X_sev, y_sev)
joblib.dump(sev_full_pipeline, os.path.join(models_dir, "emergency_severity_model.joblib"))
print("Trained and saved emergency_severity_model.joblib!")

# Wait time model
X_wait = pd.DataFrame([
    [1, 1, 10, 10, 0],
    [2, 1, 10, 11, 0],
    [5, 2, 15, 12, 1],
    [8, 4, 20, 14, 2]
], columns=["patients_ahead", "priority", "doctor_experience", "hour_of_day", "emergency_cases_active"])
y_wait = [15, 30, 20, 10]

wait_model = RandomForestRegressor(n_estimators=10, random_state=42)
wait_model.fit(X_wait, y_wait)
joblib.dump(wait_model, os.path.join(models_dir, "wait_time_model.joblib"))
print("Trained and saved wait_time_model.joblib!")
