package com.hospital.management.common;

import com.hospital.management.doctor.Doctor;
import com.hospital.management.doctor.DoctorRepository;
import com.hospital.management.pharmacy.Medicine;
import com.hospital.management.pharmacy.PharmacyRepository;
import com.hospital.management.security.Role;
import com.hospital.management.security.User;
import com.hospital.management.security.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Autowired private UserRepository userRepository;
    @Autowired private DoctorRepository doctorRepository;
    @Autowired private PharmacyRepository medicineRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        logger.info("Initializing IntelliCare HMS Staff Roles, Rooms & Formularies (Idempotent)...");

        try {
            jdbcTemplate.execute("ALTER TABLE appointments MODIFY COLUMN status VARCHAR(50) NOT NULL DEFAULT 'SCHEDULED'");
            jdbcTemplate.execute("ALTER TABLE notifications MODIFY COLUMN type VARCHAR(50) NOT NULL");
        } catch (Exception e) {
            logger.warn("Schema modification note: {}", e.getMessage());
        }

        String defaultPass = passwordEncoder.encode("password123");

        // 1. Seed System Staff Roles & Credentials (Preserving all staff accounts)
        seedUserIfNotExists("doctor", defaultPass, "doctor@intellicare.com", Role.DOCTOR, 1L, null);
        seedUserIfNotExists("receptionist", defaultPass, "receptionist@intellicare.com", Role.RECEPTIONIST, null, null);
        seedUserIfNotExists("labtech", defaultPass, "labtech@intellicare.com", Role.LAB_TECHNICIAN, null, null);
        seedUserIfNotExists("pharmacist", defaultPass, "pharmacist@intellicare.com", Role.PHARMACIST, null, null);
        seedUserIfNotExists("admin", defaultPass, "admin@intellicare.com", Role.ADMIN, null, null);

        // 4-digit Staff Role Logins
        seedUserIfNotExists("3001", defaultPass, "receptionist.3001@intellicare.com", Role.RECEPTIONIST, null, null);
        seedUserIfNotExists("3002", defaultPass, "receptionist.3002@intellicare.com", Role.RECEPTIONIST, null, null);

        seedUserIfNotExists("4001", defaultPass, "labtech.4001@intellicare.com", Role.LAB_TECHNICIAN, null, null);
        seedUserIfNotExists("5001", defaultPass, "pharmacist.5001@intellicare.com", Role.PHARMACIST, null, null);
        seedUserIfNotExists("6001", defaultPass, "admin.6001@intellicare.com", Role.ADMIN, null, null);

        // 2. Seed Doctors across Floors 1, 2, and 3
        // FLOOR 1: General Medicine (103 - 106) & Dental Sciences (107 - 109)
        Doctor d21 = seedDoctorIfNotExists("Dr. James Wilson", "james.wilson@intellicare.com", "9876500021", "General Medicine", "Outpatient Clinic", 20, "Available", "Room 103", "MBBS, MD (Internal Medicine), FACP", 4.95);
        Doctor d22 = seedDoctorIfNotExists("Dr. Rajesh Sharma", "rajesh.sharma@intellicare.com", "9876500022", "General Medicine", "Outpatient Clinic", 15, "Available", "Room 104", "MBBS, MD (General Medicine)", 4.9);
        Doctor d23 = seedDoctorIfNotExists("Dr. Laura Davis", "laura.davis@intellicare.com", "9876500023", "General Medicine", "Outpatient Clinic", 11, "Available", "Room 105", "MBBS, DNB (Family Medicine)", 4.8);
        Doctor d24 = seedDoctorIfNotExists("Dr. Kevin White", "kevin.white@intellicare.com", "9876500024", "General Medicine", "Outpatient Clinic", 9, "Available", "Room 106", "MBBS, MD (General Medicine)", 4.75);

        // Dental Sciences (2025 - 2027) on Floor 1
        Doctor d25 = seedDoctorIfNotExists("Dr. Ananya Rao", "ananya.rao@intellicare.com", "9876500025", "Dentistry", "Dental Sciences", 12, "Available", "Room 107", "BDS, MDS (Oral & Maxillofacial Surgery)", 4.92);
        Doctor d26 = seedDoctorIfNotExists("Dr. Vikram Malhotra", "vikram.malhotra@intellicare.com", "9876500026", "Dentistry", "Dental Sciences", 9, "Available", "Room 108", "BDS, MDS (Orthodontics & Dentofacial Orthopedics)", 4.88);
        Doctor d27 = seedDoctorIfNotExists("Dr. Neha Sharma", "neha.sharma@intellicare.com", "9876500027", "Dentistry", "Dental Sciences", 14, "Available", "Room 109", "BDS, MDS (Conservative Dentistry & Endodontics)", 4.95);

        // FLOOR 2: Cardiology (202 - 205) & Neurology (206 - 209)
        Doctor d1 = seedDoctorIfNotExists("Dr. Sarah Jenkins", "sarah.jenkins@intellicare.com", "9876500001", "Cardiology", "Cardiology Dept", 14, "Available", "Room 202", "MBBS, MD, DM (Cardiology), FACC", 4.9);
        Doctor d2 = seedDoctorIfNotExists("Dr. Anthony Vance", "anthony.vance@intellicare.com", "9876500002", "Cardiology", "Cardiology Dept", 18, "Available", "Room 203", "MBBS, MD (Cardiology), FSCAI", 4.95);
        Doctor d3 = seedDoctorIfNotExists("Dr. Robert Martinez", "robert.martinez@intellicare.com", "9876500003", "Cardiology", "Cardiology Dept", 11, "Available", "Room 204", "MBBS, MD (Cardiology)", 4.8);
        Doctor d4 = seedDoctorIfNotExists("Dr. Lisa Ray", "lisa.ray@intellicare.com", "9876500004", "Cardiology", "Cardiology Dept", 8, "Available", "Room 205", "MBBS, DNB (Cardiology)", 4.75);

        Doctor d5 = seedDoctorIfNotExists("Dr. Marcus Chen", "marcus.chen@intellicare.com", "9876500005", "Neurology", "Neurology Dept", 12, "Available", "Room 206", "MBBS, MD, DM (Neurology)", 4.9);
        Doctor d6 = seedDoctorIfNotExists("Dr. Evelyn Reed", "evelyn.reed@intellicare.com", "9876500006", "Neurology", "Neurology Dept", 15, "Available", "Room 207", "MBBS, MD (Neurology), PhD", 4.95);
        Doctor d7 = seedDoctorIfNotExists("Dr. Alan Cooper", "alan.cooper@intellicare.com", "9876500007", "Neurology", "Neurology Dept", 9, "Available", "Room 208", "MBBS, MD (Neurology)", 4.8);
        Doctor d8 = seedDoctorIfNotExists("Dr. Maya Lin", "maya.lin@intellicare.com", "9876500008", "Neurology", "Neurology Dept", 13, "Available", "Room 209", "MBBS, DNB (Neurology)", 4.85);

        // FLOOR 3: Pediatrics (301 - 304), Orthopedics (305 - 308), Dermatology (309 - 312)
        Doctor d9 = seedDoctorIfNotExists("Dr. Priya Patel", "priya.patel@intellicare.com", "9876500009", "Pediatrics", "Pediatrics Dept", 9, "Available", "Room 301", "MBBS, MD (Pediatrics), FAAP", 4.85);
        Doctor d10 = seedDoctorIfNotExists("Dr. Samuel Clark", "samuel.clark@intellicare.com", "9876500010", "Pediatrics", "Pediatrics Dept", 14, "Available", "Room 302", "MBBS, MD, DCH (Pediatrics)", 4.9);
        Doctor d11 = seedDoctorIfNotExists("Dr. Zoe Bennett", "zoe.bennett@intellicare.com", "9876500011", "Pediatrics", "Pediatrics Dept", 7, "Available", "Room 303", "MBBS, MD (Pediatrics)", 4.75);
        Doctor d12 = seedDoctorIfNotExists("Dr. Daniel Kim", "daniel.kim@intellicare.com", "9876500012", "Pediatrics", "Pediatrics Dept", 16, "Available", "Room 304", "MBBS, MD (Pediatrics), Fellow Neonatology", 4.95);

        Doctor d13 = seedDoctorIfNotExists("Dr. David Miller", "david.miller@intellicare.com", "9876500013", "Orthopedics", "Orthopedics Dept", 16, "Available", "Room 305", "MBBS, MS (Orthopedics), MCh", 4.95);
        Doctor d14 = seedDoctorIfNotExists("Dr. Robert Taylor", "robert.taylor@intellicare.com", "9876500014", "Orthopedics", "Orthopedics Dept", 11, "Available", "Room 306", "MBBS, MS (Orthopedics)", 4.8);
        Doctor d15 = seedDoctorIfNotExists("Dr. Rebecca Moore", "rebecca.moore@intellicare.com", "9876500015", "Orthopedics", "Orthopedics Dept", 10, "Available", "Room 307", "MBBS, DNB (Orthopedics)", 4.85);
        Doctor d16 = seedDoctorIfNotExists("Dr. Brian Adams", "brian.adams@intellicare.com", "9876500016", "Orthopedics", "Orthopedics Dept", 13, "Available", "Room 308", "MBBS, MS (Orthopedics), Arthroscopy Fellow", 4.9);

        Doctor d17 = seedDoctorIfNotExists("Dr. Elena Rostova", "elena.rostova@intellicare.com", "9876500017", "Dermatology", "Dermatology Dept", 8, "Available", "Room 309", "MBBS, MD (Dermatology), FAAD", 4.85);
        Doctor d18 = seedDoctorIfNotExists("Dr. Sophia Green", "sophia.green@intellicare.com", "9876500018", "Dermatology", "Dermatology Dept", 12, "Available", "Room 310", "MBBS, MD (Dermatology)", 4.9);
        Doctor d19 = seedDoctorIfNotExists("Dr. Nathan Scott", "nathan.scott@intellicare.com", "9876500019", "Dermatology", "Dermatology Dept", 6, "Available", "Room 311", "MBBS, DVD (Dermatology)", 4.7);
        Doctor d20 = seedDoctorIfNotExists("Dr. Chloe Taylor", "chloe.taylor@intellicare.com", "9876500020", "Dermatology", "Dermatology Dept", 15, "Available", "Room 312", "MBBS, MD (Dermatology), Cosmetic Fellow", 4.95);

        // Seed 4-digit User Accounts for all 27 Doctors (2001 - 2027)
        Doctor[] allDoctors = {d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13, d14, d15, d16, d17, d18, d19, d20, d21, d22, d23, d24, d25, d26, d27};
        for (int i = 0; i < allDoctors.length; i++) {
            String docIdStr = String.valueOf(2001 + i);
            seedUserIfNotExists(docIdStr, defaultPass, allDoctors[i].getEmail(), Role.DOCTOR, allDoctors[i].getDoctorId(), null);
        }

        // 3. Seed Medicines (Comprehensive catalog covering multiple symptom & illness categories)
        // Category: Analgesics / Fever & Pain
        seedMedicineIfNotExists("Paracetamol 500mg", "Fever & Pain", 350, "1 tab twice daily", LocalDate.now().plusYears(2), 5.00);
        seedMedicineIfNotExists("Ibuprofen 400mg", "Fever & Pain", 220, "1 tab after food", LocalDate.now().plusYears(2), 8.50);
        seedMedicineIfNotExists("Tramadol 50mg", "Severe Pain", 90, "1 tab as prescribed", LocalDate.now().plusYears(2), 22.00);

        // Category: Cardiovascular & Hypertension
        seedMedicineIfNotExists("Aspirin 75mg", "Cardiovascular", 180, "1 tab once daily", LocalDate.now().plusYears(2), 8.00);
        seedMedicineIfNotExists("Atorvastatin 20mg", "Cardiovascular", 160, "1 tab at bedtime", LocalDate.now().plusYears(2), 18.00);
        seedMedicineIfNotExists("Amlodipine 5mg", "Cardiovascular", 200, "1 tab once daily", LocalDate.now().plusYears(2), 12.00);
        seedMedicineIfNotExists("Metoprolol 25mg", "Cardiovascular", 140, "1 tab twice daily", LocalDate.now().plusYears(2), 16.00);
        seedMedicineIfNotExists("Clopidogrel 75mg", "Cardiovascular", 110, "1 tab once daily", LocalDate.now().plusYears(2), 24.00);
        seedMedicineIfNotExists("Nitroglycerin 0.4mg", "Cardiovascular", 75, "1 sublingual tab on chest pain", LocalDate.now().plusYears(1), 35.00);

        // Category: Respiratory & Asthma
        seedMedicineIfNotExists("Salbutamol Inhaler", "Respiratory & Asthma", 65, "2 puffs as needed", LocalDate.now().plusYears(1), 32.00);
        seedMedicineIfNotExists("Budesonide 200mcg Inhaler", "Respiratory & Asthma", 50, "2 puffs twice daily", LocalDate.now().plusYears(1), 48.00);
        seedMedicineIfNotExists("Montelukast 10mg", "Respiratory & Asthma", 130, "1 tab at bedtime", LocalDate.now().plusYears(2), 19.50);
        seedMedicineIfNotExists("Dextromethorphan Syrup 100ml", "Cough & Cold", 85, "10ml thrice daily", LocalDate.now().plusYears(2), 28.00);

        // Category: Antibiotics & Anti-Infectives
        seedMedicineIfNotExists("Amoxicillin 250mg", "Antibiotics", 120, "1 cap thrice daily", LocalDate.now().plusYears(1), 12.50);
        seedMedicineIfNotExists("Amoxicillin-Clavulanate 625mg", "Antibiotics", 140, "1 tab twice daily after food", LocalDate.now().plusYears(2), 26.00);
        seedMedicineIfNotExists("Azithromycin 500mg", "Antibiotics", 95, "1 tab once daily for 3 days", LocalDate.now().plusYears(2), 34.00);
        seedMedicineIfNotExists("Ciprofloxacin 500mg", "Antibiotics", 110, "1 tab twice daily", LocalDate.now().plusYears(2), 18.50);
        seedMedicineIfNotExists("Cefixime 200mg", "Antibiotics", 100, "1 tab twice daily", LocalDate.now().plusYears(2), 29.00);
        seedMedicineIfNotExists("Doxycycline 100mg", "Antibiotics", 80, "1 cap twice daily with water", LocalDate.now().plusYears(2), 15.00);
        seedMedicineIfNotExists("Penicillin V 250mg", "Antibiotics", 60, "1 tab every 6 hrs", LocalDate.now().plusYears(1), 14.00);

        // Category: Diabetes & Endocrine
        seedMedicineIfNotExists("Metformin 500mg", "Diabetes", 200, "1 tab with meals", LocalDate.now().plusYears(2), 15.00);
        seedMedicineIfNotExists("Glimepiride 2mg", "Diabetes", 150, "1 tab before breakfast", LocalDate.now().plusYears(2), 14.00);
        seedMedicineIfNotExists("Insulin Glargine 100IU", "Diabetes", 40, "Inject as per blood sugar chart", LocalDate.now().plusYears(1), 85.00);

        // Category: Gastrointestinal & Acidity
        seedMedicineIfNotExists("Pantoprazole 40mg", "Gastrointestinal", 240, "1 tab before breakfast", LocalDate.now().plusYears(2), 11.00);
        seedMedicineIfNotExists("Ondansetron 4mg", "Gastrointestinal", 160, "1 tab on nausea", LocalDate.now().plusYears(2), 9.00);
        seedMedicineIfNotExists("ORS Electrolyte Sachet", "Gastrointestinal", 300, "Dissolve 1 sachet in 1L water", LocalDate.now().plusYears(3), 4.50);

        // Category: Allergies & Dermatology
        seedMedicineIfNotExists("Cetirizine 10mg", "Allergies & Skin", 260, "1 tab at bedtime", LocalDate.now().plusYears(2), 6.50);
        seedMedicineIfNotExists("Hydrocortisone 1% Cream", "Allergies & Skin", 90, "Apply twice daily to affected area", LocalDate.now().plusYears(2), 16.50);
        seedMedicineIfNotExists("Mupirocin 2% Ointment", "Allergies & Skin", 70, "Apply to skin lesion thrice daily", LocalDate.now().plusYears(2), 22.00);

        // Category: Neurology
        seedMedicineIfNotExists("Gabapentin 300mg", "Neurology", 110, "1 cap at bedtime", LocalDate.now().plusYears(2), 25.00);
        seedMedicineIfNotExists("Levetiracetam 500mg", "Neurology", 80, "1 tab twice daily", LocalDate.now().plusYears(2), 38.00);

        // Category: Dental Care (6 specific dental care medications)
        seedMedicineIfNotExists("Amoxicillin-Clavulanate 625mg (Dental)", "Dentistry & Oral Care", 180, "1 tab twice daily after food", LocalDate.now().plusYears(2), 28.00);
        seedMedicineIfNotExists("Metronidazole 400mg", "Dentistry & Oral Care", 160, "1 tab thrice daily after meals", LocalDate.now().plusYears(2), 14.50);
        seedMedicineIfNotExists("Ketorolac Tromethamine 10mg DT", "Dentistry & Oral Care", 140, "1 dispersible tab in half glass water on severe toothache", LocalDate.now().plusYears(2), 18.00);
        seedMedicineIfNotExists("Chlorhexidine Gluconate 0.2% Rinse", "Dentistry & Oral Care", 120, "10ml oral rinse for 60 seconds twice daily", LocalDate.now().plusYears(2), 35.00);
        seedMedicineIfNotExists("Triamcinolone 0.1% Dental Paste", "Dentistry & Oral Care", 80, "Apply thin film to mouth ulcer at bedtime", LocalDate.now().plusYears(2), 24.00);
        seedMedicineIfNotExists("Lidocaine 2% + Adrenaline Inj", "Dentistry & Oral Care", 95, "Local anesthetic infiltration for dental procedures", LocalDate.now().plusYears(1), 42.00);

        logger.info("IntelliCare HMS Demo Database seeded successfully!");
    }

    private void seedMedicineIfNotExists(String name, String category, Integer stock, String dosage, LocalDate expiry, Double price) {
        if (medicineRepository.findByMedicineNameIgnoreCase(name).isEmpty()) {
            medicineRepository.save(new Medicine(null, name, category, stock, dosage, expiry, price));
        }
    }

    private User seedUserIfNotExists(String username, String encodedPass, String email, Role role, Long employeeId, Long patientId) {
        var opt = userRepository.findByUsername(username);
        if (opt.isPresent()) {
            User u = opt.get();
            boolean changed = false;
            if (employeeId != null && !employeeId.equals(u.getEmployeeId())) {
                u.setEmployeeId(employeeId);
                changed = true;
            }
            if (patientId != null && !patientId.equals(u.getPatientId())) {
                u.setPatientId(patientId);
                changed = true;
            }
            if (u.getRole() != role) {
                u.setRole(role);
                changed = true;
            }
            if (role != Role.PATIENT && !passwordEncoder.matches("password123", u.getPassword())) {
                u.setPassword(encodedPass);
                changed = true;
            }
            if (changed) {
                u = userRepository.save(u);
            }
            return u;
        }
        User u = new User();
        u.setUsername(username);
        u.setPassword(encodedPass);
        u.setEmail(email);
        u.setRole(role);
        u.setEmployeeId(employeeId);
        u.setPatientId(patientId);
        u.setEnabled(true);
        return userRepository.save(u);
    }

    private Doctor seedDoctorIfNotExists(String name, String email, String phone, String specialization, String department, Integer experience, String availability, String roomNumber, String qualification, Double rating) {
        var existing = doctorRepository.findByNameContainingIgnoreCase(name);
        if (!existing.isEmpty()) {
            Doctor doc = existing.get(0);
            boolean updated = false;
            if (doc.getRoomNumber() == null || !doc.getRoomNumber().equals(roomNumber)) {
                doc.setRoomNumber(roomNumber);
                updated = true;
            }
            if (doc.getQualification() == null || !doc.getQualification().equals(qualification)) {
                doc.setQualification(qualification);
                updated = true;
            }
            if (doc.getRating() == null) {
                doc.setRating(rating);
                updated = true;
            }
            if (doc.getExperience() == null) {
                doc.setExperience(experience);
                updated = true;
            }
            if (updated) {
                doc = doctorRepository.save(doc);
            }
            return doc;
        }
        Doctor d = new Doctor(null, name, email, phone, specialization, department, experience, availability, roomNumber, qualification, rating);
        return doctorRepository.save(d);
    }
}
