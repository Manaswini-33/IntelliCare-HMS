import os
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report
import joblib

def main():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    models_dir = os.path.join(current_dir, "..", "models")
    os.makedirs(models_dir, exist_ok=True)
    model_output_path = os.path.join(models_dir, "specialist_model.joblib")

    # Curated clinical symptom dataset mapped to medical specializations
    data = [
        # Cardiology
        ("chest pain and shortness of breath with sweating", "Cardiology"),
        ("tightness in chest radiating to left arm and jaw", "Cardiology"),
        ("palpitations and rapid irregular heartbeat", "Cardiology"),
        ("high blood pressure with severe dizziness and heart pounding", "Cardiology"),
        ("angina, shortness of breath on exertion", "Cardiology"),
        ("swollen ankles, difficulty breathing when lying flat", "Cardiology"),
        ("sharp chest pain during physical activity", "Cardiology"),
        
        # Dermatology
        ("itchy red skin rash with dry flaky patches", "Dermatology"),
        ("severe acne breakouts on face and neck", "Dermatology"),
        ("eczema flare-up with burning sensation and peeling skin", "Dermatology"),
        ("changing mole with irregular borders and pigmentation", "Dermatology"),
        ("psoriasis on elbows and scalp with silvery scales", "Dermatology"),
        ("allergic skin hives, intense itching and redness", "Dermatology"),
        ("fungal nail infection with discoloration and thickening", "Dermatology"),
        
        # Orthopedics
        ("acute knee pain with swelling after sports injury", "Orthopedics"),
        ("lower back pain with shooting nerve pain down the leg", "Orthopedics"),
        ("fracture in forearm after falling on outstretched hand", "Orthopedics"),
        ("shoulder joint dislocation and severe limited mobility", "Orthopedics"),
        ("chronic osteoarthritis in hip joint with morning stiffness", "Orthopedics"),
        ("swollen wrist, possible ligament tear or bone fracture", "Orthopedics"),
        ("ankle sprain with bruising and inability to bear weight", "Orthopedics"),
        
        # Pediatrics
        ("infant with high fever and continuous crying", "Pediatrics"),
        ("child has persistent barking cough and fever", "Pediatrics"),
        ("toddler with severe diarrhea and dehydration symptoms", "Pediatrics"),
        ("pediatric chickenpox rash with blisters and itchiness", "Pediatrics"),
        ("baby refusing feeding with wheezing sounds", "Pediatrics"),
        ("child earache, tugging at ear with fever", "Pediatrics"),
        
        # Neurology
        ("one-sided throbbing headache with nausea and light sensitivity", "Neurology"),
        ("sudden loss of balance, slurred speech and facial drooping", "Neurology"),
        ("unexplained tremors in hands and muscle rigidity", "Neurology"),
        ("recurrent seizures and momentary blackout episodes", "Neurology"),
        ("tingling sensation, numbness in fingers and chronic nerve pain", "Neurology"),
        ("memory confusion, disorientation and chronic vertigo", "Neurology"),
        
        # Ophthalmology
        ("blurry vision and seeing halos around lights", "Ophthalmology"),
        ("severe eye pain with redness and yellow discharge", "Ophthalmology"),
        ("sudden floaters and flashes of light in right eye", "Ophthalmology"),
        ("itchy burning eyes with extreme light sensitivity and grit feeling", "Ophthalmology"),
        ("double vision and cloudy lens in left eye", "Ophthalmology"),
        
        # Pulmonology
        ("chronic cough with thick mucus and difficulty breathing", "Pulmonology"),
        ("asthma attack with wheezing and tight chest", "Pulmonology"),
        ("shortness of breath in chronic smoker, suspected COPD", "Pulmonology"),
        ("coughing up blood and persistent night sweats", "Pulmonology"),
        ("bronchitis with rattling chest and low oxygen levels", "Pulmonology"),
        
        # Gastroenterology
        ("burning stomach pain, severe acid reflux and nausea", "Gastroenterology"),
        ("severe right lower quadrant abdominal pain with fever", "Gastroenterology"),
        ("yellowing of eyes and skin with dark urine and jaundice", "Gastroenterology"),
        ("persistent bloody stool, cramping and abdominal bloating", "Gastroenterology"),
        ("intense epigastric pain radiating to back after fatty meals", "Gastroenterology"),
        
        # General Medicine
        ("mild seasonal cold, runny nose, sore throat and sneezing", "General Medicine"),
        ("low grade fever, body ache and general fatigue", "General Medicine"),
        ("routine annual health examination and wellness check", "General Medicine"),
        ("mild headache after long working hours without fever", "General Medicine"),
        ("general weakness, lack of appetite and mild fatigue", "General Medicine")
    ]

    df = pd.DataFrame(data, columns=["symptoms", "specialist"])

    pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(ngram_range=(1, 2), stop_words="english", min_df=1)),
        ("classifier", LogisticRegression(C=5.0, max_iter=200, random_state=42))
    ])

    print("Training Specialist Recommendation Model (TF-IDF + Logistic Regression)...")
    pipeline.fit(df["symptoms"], df["specialist"])

    # Test sample
    test_sample = ["chest pain and shortness of breath", "skin rash and itching", "knee fracture and joint pain"]
    preds = pipeline.predict(test_sample)
    for s, p in zip(test_sample, preds):
        print(f"Sample: '{s}' -> Predicted: {p}")

    joblib.dump(pipeline, model_output_path)
    print(f"Saved specialist model to: {model_output_path}")

if __name__ == "__main__":
    main()
