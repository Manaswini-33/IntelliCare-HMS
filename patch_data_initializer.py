import re

path = 'src/main/java/com/hospital/management/common/DataInitializer.java'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

new_doctors = """        // 3. Seed Doctors across multiple departments
        Doctor d1 = doctorRepository.save(new Doctor(null, "Dr. Sarah Jenkins", "sarah.jenkins@intellicare.com", "9876500001", "Cardiology", "Cardiology Dept", 14, "Available"));
        Doctor d1_2 = doctorRepository.save(new Doctor(null, "Dr. Anthony Vance", "anthony.vance@intellicare.com", "9876500011", "Cardiology", "Cardiology Dept", 18, "Available"));
        Doctor d2 = doctorRepository.save(new Doctor(null, "Dr. Marcus Chen", "marcus.chen@intellicare.com", "9876500002", "Neurology", "Neurology Dept", 12, "Available"));
        Doctor d2_2 = doctorRepository.save(new Doctor(null, "Dr. Evelyn Reed", "evelyn.reed@intellicare.com", "9876500012", "Neurology", "Neurology Dept", 15, "Available"));
        Doctor d3 = doctorRepository.save(new Doctor(null, "Dr. Priya Patel", "priya.patel@intellicare.com", "9876500003", "Pediatrics", "Pediatrics Dept", 9, "Available"));
        Doctor d4 = doctorRepository.save(new Doctor(null, "Dr. David Miller", "david.miller@intellicare.com", "9876500004", "Orthopedics", "Orthopedics Dept", 16, "Available"));
        Doctor d4_2 = doctorRepository.save(new Doctor(null, "Dr. Robert Taylor", "robert.taylor@intellicare.com", "9876500014", "Orthopedics", "Orthopedics Dept", 11, "Available"));
        Doctor d5 = doctorRepository.save(new Doctor(null, "Dr. Elena Rostova", "elena.rostova@intellicare.com", "9876500005", "Dermatology", "Dermatology Dept", 8, "Available"));
        Doctor d6 = doctorRepository.save(new Doctor(null, "Dr. James Wilson", "james.wilson@intellicare.com", "9876500006", "General Medicine", "Outpatient Clinic", 20, "Available"));
"""

content = re.sub(r'// 3\. Seed Doctors.*?(?=// 4\. Seed Medicines)', new_doctors + "\n\n", content, flags=re.DOTALL)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated DataInitializer.java with expanded doctor list!")
