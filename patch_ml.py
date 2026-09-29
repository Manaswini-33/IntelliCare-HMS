import os
import re

# 1. Update Python ML main.py to return best doctor and department
main_py_path = 'ml-service/app/main.py'
with open(main_py_path, 'r', encoding='utf-8') as f:
    content = f.read()

new_schema = """class SpecialistResponse(BaseModel):
    recommended_specialist: str
    department: str
    best_doctor_name: str
    confidence_score: float
    matched_symptoms: str
    disclaimer: str"""

content = re.sub(r'class SpecialistResponse\(BaseModel\):.*?(?=class WaitTimeRequest)', new_schema + "\n\n", content, flags=re.DOTALL)

new_endpoint = """@app.post("/ml/recommend-specialist", response_model=SpecialistResponse)
def recommend_specialist(req: SpecialistRequest):
    if specialist_model is None:
        raise HTTPException(status_code=503, detail="Specialist Recommendation model is not loaded.")

    symptoms_text = req.symptoms.strip()
    if not symptoms_text:
        return SpecialistResponse(
            recommended_specialist="General Physician",
            department="General Medicine",
            best_doctor_name="Dr. James Wilson",
            confidence_score=1.0,
            matched_symptoms="",
            disclaimer="Recommendation assistance feature. Not a formal diagnosis."
        )

    predicted_spec = str(specialist_model.predict([symptoms_text])[0])
    probas = specialist_model.predict_proba([symptoms_text])[0]
    confidence = float(np.max(probas))

    doctor_map = {
        "Cardiology": "Dr. Sarah Jenkins",
        "Neurology": "Dr. Marcus Chen",
        "Pediatrics": "Dr. Priya Patel",
        "Orthopedics": "Dr. David Miller",
        "Dermatology": "Dr. Elena Rostova",
        "General Medicine": "Dr. James Wilson",
        "Pulmonology": "Dr. James Wilson",
        "Gastroenterology": "Dr. James Wilson",
        "Ophthalmology": "Dr. Marcus Chen"
    }

    best_doc = doctor_map.get(predicted_spec, "Dr. James Wilson")

    return SpecialistResponse(
        recommended_specialist=f"{predicted_spec} Specialist",
        department=predicted_spec,
        best_doctor_name=best_doc,
        confidence_score=round(confidence, 3),
        matched_symptoms=symptoms_text,
        disclaimer="IntelliCare AI Specialist Recommender: Assistance feature to guide clinic navigation."
    )"""

content = re.sub(r'@app\.post\("/ml/recommend-specialist".*?(?=@app\.post\("/ml/predict-wait-time"\))', new_endpoint + "\n\n", content, flags=re.DOTALL)

with open(main_py_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated ml-service/app/main.py!")
