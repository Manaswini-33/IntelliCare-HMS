package com.hospital.management.common;

import com.hospital.management.appointment.Appointment;
import com.hospital.management.appointment.AppointmentRepository;
import com.hospital.management.appointment.AppointmentStatus;
import com.hospital.management.billing.Bill;
import com.hospital.management.billing.BillingRepository;
import com.hospital.management.billing.PaymentStatus;
import com.hospital.management.doctor.Doctor;
import com.hospital.management.doctor.DoctorRepository;
import com.hospital.management.emergency.EmergencyCase;
import com.hospital.management.emergency.EmergencyRepository;
import com.hospital.management.laboratory.LabTest;
import com.hospital.management.laboratory.LabTestStatus;
import com.hospital.management.laboratory.LaboratoryRepository;
import com.hospital.management.medicalrecord.MedicalRecord;
import com.hospital.management.medicalrecord.MedicalRecordRepository;
import com.hospital.management.patient.Patient;
import com.hospital.management.patient.PatientRepository;
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
    @Autowired private PatientRepository patientRepository;
    @Autowired private DoctorRepository doctorRepository;
    @Autowired private PharmacyRepository medicineRepository;
    @Autowired private AppointmentRepository appointmentRepository;
    @Autowired private EmergencyRepository emergencyRepository;
    @Autowired private LaboratoryRepository laboratoryRepository;
    @Autowired private MedicalRecordRepository medicalRecordRepository;
    @Autowired private BillingRepository billingRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        logger.info("Initializing IntelliCare HMS Demo Data & Role Credentials (Idempotent)...");

        String defaultPass = passwordEncoder.encode("password123");

        // 1. Seed System Users (4-digit IDs & legacy aliases)
        seedUserIfNotExists("patient", defaultPass, "patient@intellicare.com", Role.PATIENT, null, 1L);
        seedUserIfNotExists("doctor", defaultPass, "doctor@intellicare.com", Role.DOCTOR, 1L, null);
        seedUserIfNotExists("receptionist", defaultPass, "receptionist@intellicare.com", Role.RECEPTIONIST, null, null);
        seedUserIfNotExists("labtech", defaultPass, "labtech@intellicare.com", Role.LAB_TECHNICIAN, null, null);
        seedUserIfNotExists("pharmacist", defaultPass, "pharmacist@intellicare.com", Role.PHARMACIST, null, null);
        seedUserIfNotExists("admin", defaultPass, "admin@intellicare.com", Role.ADMIN, null, null);

        // 4-digit Role Logins
        seedUserIfNotExists("1001", defaultPass, "patient.1001@intellicare.com", Role.PATIENT, null, 1L);
        seedUserIfNotExists("1002", defaultPass, "patient.1002@intellicare.com", Role.PATIENT, null, 2L);
        seedUserIfNotExists("1003", defaultPass, "patient.1003@intellicare.com", Role.PATIENT, null, 3L);
        seedUserIfNotExists("1004", defaultPass, "patient.1004@intellicare.com", Role.PATIENT, null, 4L);

        seedUserIfNotExists("3001", defaultPass, "receptionist.3001@intellicare.com", Role.RECEPTIONIST, null, null);
        seedUserIfNotExists("3002", defaultPass, "receptionist.3002@intellicare.com", Role.RECEPTIONIST, null, null);

        seedUserIfNotExists("4001", defaultPass, "labtech.4001@intellicare.com", Role.LAB_TECHNICIAN, null, null);
        seedUserIfNotExists("5001", defaultPass, "pharmacist.5001@intellicare.com", Role.PHARMACIST, null, null);
        seedUserIfNotExists("6001", defaultPass, "admin.6001@intellicare.com", Role.ADMIN, null, null);

        // 2. Seed Patients
        Patient p1 = seedPatientIfNotExists("John Smith", 45, "Male", "9876543210", "john@email.com", "123 Main St, New York", "O+", "Penicillin");
        Patient p2 = seedPatientIfNotExists("Emily Davis", 28, "Female", "9876543211", "emily@email.com", "456 Oak Ave, Los Angeles", "A+", "Aspirin");
        Patient p3 = seedPatientIfNotExists("Robert Brown", 65, "Male", "9876543212", "robert@email.com", "88 Broadway, Chicago", "B+", "None");
        Patient p4 = seedPatientIfNotExists("Sarah Wilson", 34, "Female", "9876543213", "sarah@email.com", "12 Pine St, Seattle", "AB+", "Sulfa Drugs");

        // 3. Seed 4 Doctors per Department (Total 24 Doctors across 6 Departments)
        // Cardiology (2001 - 2004)
        Doctor d1 = seedDoctorIfNotExists("Dr. Sarah Jenkins", "sarah.jenkins@intellicare.com", "9876500001", "Cardiology", "Cardiology Dept", 14, "Available", "Room 101", "MBBS, MD, DM (Cardiology), FACC", 4.9);
        Doctor d2 = seedDoctorIfNotExists("Dr. Anthony Vance", "anthony.vance@intellicare.com", "9876500002", "Cardiology", "Cardiology Dept", 18, "Available", "Room 102", "MBBS, MD (Cardiology), FSCAI", 4.95);
        Doctor d3 = seedDoctorIfNotExists("Dr. Robert Martinez", "robert.martinez@intellicare.com", "9876500003", "Cardiology", "Cardiology Dept", 11, "Available", "Room 103", "MBBS, MD (Cardiology)", 4.8);
        Doctor d4 = seedDoctorIfNotExists("Dr. Lisa Ray", "lisa.ray@intellicare.com", "9876500004", "Cardiology", "Cardiology Dept", 8, "Available", "Room 104", "MBBS, DNB (Cardiology)", 4.75);

        // Neurology (2005 - 2008)
        Doctor d5 = seedDoctorIfNotExists("Dr. Marcus Chen", "marcus.chen@intellicare.com", "9876500005", "Neurology", "Neurology Dept", 12, "Available", "Room 201", "MBBS, MD, DM (Neurology)", 4.9);
        Doctor d6 = seedDoctorIfNotExists("Dr. Evelyn Reed", "evelyn.reed@intellicare.com", "9876500006", "Neurology", "Neurology Dept", 15, "Available", "Room 202", "MBBS, MD (Neurology), PhD", 4.95);
        Doctor d7 = seedDoctorIfNotExists("Dr. Alan Cooper", "alan.cooper@intellicare.com", "9876500007", "Neurology", "Neurology Dept", 9, "Available", "Room 203", "MBBS, MD (Neurology)", 4.8);
        Doctor d8 = seedDoctorIfNotExists("Dr. Maya Lin", "maya.lin@intellicare.com", "9876500008", "Neurology", "Neurology Dept", 13, "Available", "Room 204", "MBBS, DNB (Neurology)", 4.85);

        // Pediatrics (2009 - 2012)
        Doctor d9 = seedDoctorIfNotExists("Dr. Priya Patel", "priya.patel@intellicare.com", "9876500009", "Pediatrics", "Pediatrics Dept", 9, "Available", "Room 301", "MBBS, MD (Pediatrics), FAAP", 4.85);
        Doctor d10 = seedDoctorIfNotExists("Dr. Samuel Clark", "samuel.clark@intellicare.com", "9876500010", "Pediatrics", "Pediatrics Dept", 14, "Available", "Room 302", "MBBS, MD, DCH (Pediatrics)", 4.9);
        Doctor d11 = seedDoctorIfNotExists("Dr. Zoe Bennett", "zoe.bennett@intellicare.com", "9876500011", "Pediatrics", "Pediatrics Dept", 7, "Available", "Room 303", "MBBS, MD (Pediatrics)", 4.75);
        Doctor d12 = seedDoctorIfNotExists("Dr. Daniel Kim", "daniel.kim@intellicare.com", "9876500012", "Pediatrics", "Pediatrics Dept", 16, "Available", "Room 304", "MBBS, MD (Pediatrics), Fellow Neonatology", 4.95);

        // Orthopedics (2013 - 2016)
        Doctor d13 = seedDoctorIfNotExists("Dr. David Miller", "david.miller@intellicare.com", "9876500013", "Orthopedics", "Orthopedics Dept", 16, "Available", "Room 401", "MBBS, MS (Orthopedics), MCh", 4.95);
        Doctor d14 = seedDoctorIfNotExists("Dr. Robert Taylor", "robert.taylor@intellicare.com", "9876500014", "Orthopedics", "Orthopedics Dept", 11, "Available", "Room 402", "MBBS, MS (Orthopedics)", 4.8);
        Doctor d15 = seedDoctorIfNotExists("Dr. Rebecca Moore", "rebecca.moore@intellicare.com", "9876500015", "Orthopedics", "Orthopedics Dept", 10, "Available", "Room 403", "MBBS, DNB (Orthopedics)", 4.85);
        Doctor d16 = seedDoctorIfNotExists("Dr. Brian Adams", "brian.adams@intellicare.com", "9876500016", "Orthopedics", "Orthopedics Dept", 13, "Available", "Room 404", "MBBS, MS (Orthopedics), Arthroscopy Fellow", 4.9);

        // Dermatology (2017 - 2020)
        Doctor d17 = seedDoctorIfNotExists("Dr. Elena Rostova", "elena.rostova@intellicare.com", "9876500017", "Dermatology", "Dermatology Dept", 8, "Available", "Room 501", "MBBS, MD (Dermatology), FAAD", 4.85);
        Doctor d18 = seedDoctorIfNotExists("Dr. Sophia Green", "sophia.green@intellicare.com", "9876500018", "Dermatology", "Dermatology Dept", 12, "Available", "Room 502", "MBBS, MD (Dermatology)", 4.9);
        Doctor d19 = seedDoctorIfNotExists("Dr. Nathan Scott", "nathan.scott@intellicare.com", "9876500019", "Dermatology", "Dermatology Dept", 6, "Available", "Room 503", "MBBS, DVD (Dermatology)", 4.7);
        Doctor d20 = seedDoctorIfNotExists("Dr. Chloe Taylor", "chloe.taylor@intellicare.com", "9876500020", "Dermatology", "Dermatology Dept", 15, "Available", "Room 504", "MBBS, MD (Dermatology), Cosmetic Fellow", 4.95);

        // General Medicine (2021 - 2024)
        Doctor d21 = seedDoctorIfNotExists("Dr. James Wilson", "james.wilson@intellicare.com", "9876500021", "General Medicine", "Outpatient Clinic", 20, "Available", "Room 601", "MBBS, MD (Internal Medicine), FACP", 4.95);
        Doctor d22 = seedDoctorIfNotExists("Dr. Rajesh Sharma", "rajesh.sharma@intellicare.com", "9876500022", "General Medicine", "Outpatient Clinic", 15, "Available", "Room 602", "MBBS, MD (General Medicine)", 4.9);
        Doctor d23 = seedDoctorIfNotExists("Dr. Laura Davis", "laura.davis@intellicare.com", "9876500023", "General Medicine", "Outpatient Clinic", 11, "Available", "Room 603", "MBBS, DNB (Family Medicine)", 4.8);
        Doctor d24 = seedDoctorIfNotExists("Dr. Kevin White", "kevin.white@intellicare.com", "9876500024", "General Medicine", "Outpatient Clinic", 9, "Available", "Room 604", "MBBS, MD (General Medicine)", 4.75);

        // Seed 4-digit User Accounts for all 24 Doctors (2001 - 2024)
        Doctor[] allDoctors = {d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13, d14, d15, d16, d17, d18, d19, d20, d21, d22, d23, d24};
        for (int i = 0; i < allDoctors.length; i++) {
            String docIdStr = String.valueOf(2001 + i);
            seedUserIfNotExists(docIdStr, defaultPass, allDoctors[i].getEmail(), Role.DOCTOR, allDoctors[i].getDoctorId(), null);
        }

        // 4. Seed Medicines
        seedMedicineIfNotExists("Paracetamol 500mg", "Analgesic", 250, "1 tab twice daily", LocalDate.now().plusYears(2), 5.00);
        seedMedicineIfNotExists("Amoxicillin 250mg", "Antibiotic", 120, "1 cap thrice daily", LocalDate.now().plusYears(1), 12.50);
        seedMedicineIfNotExists("Aspirin 75mg", "Cardiovascular", 180, "1 tab once daily", LocalDate.now().plusYears(2), 8.00);
        seedMedicineIfNotExists("Metformin 500mg", "Antidiabetic", 200, "1 tab with meals", LocalDate.now().plusYears(2), 15.00);
        seedMedicineIfNotExists("Salbutamol Inhaler", "Respiratory", 45, "2 puffs as needed", LocalDate.now().plusYears(1), 30.00);
        seedMedicineIfNotExists("Penicillin V 250mg", "Antibiotic", 60, "1 tab every 6 hrs", LocalDate.now().plusYears(1), 14.00);

        // 5. Seed Appointments
        if (appointmentRepository.count() == 0) {
            Appointment app1 = new Appointment();
            app1.setPatient(p1);
            app1.setDoctor(d1);
            app1.setAppointmentDate(LocalDate.now());
            app1.setAppointmentTime("10:00 AM");
            app1.setStatus(AppointmentStatus.BOOKED);
            app1.setPriority(1);
            app1.setQueuePosition(1);
            app1.setEstimatedWaitingTime(15);
            app1.setTokenNumber("T-01");
            app1.setSymptoms("Mild palpitations");
            app1.setSeverity("LOW");
            appointmentRepository.save(app1);

            Appointment app2 = new Appointment();
            app2.setPatient(p2);
            app2.setDoctor(d1);
            app2.setAppointmentDate(LocalDate.now());
            app2.setAppointmentTime("10:30 AM");
            app2.setStatus(AppointmentStatus.BOOKED);
            app2.setPriority(2);
            app2.setQueuePosition(2);
            app2.setEstimatedWaitingTime(25);
            app2.setTokenNumber("T-02");
            app2.setSymptoms("Chest tightness on exertion");
            app2.setSeverity("MEDIUM");
            appointmentRepository.save(app2);
        }

        // 6. Seed Emergency Case (Triage Prioritized)
        if (emergencyRepository.count() == 0) {
            EmergencyCase emg1 = new EmergencyCase();
            emg1.setPatient(p3);
            emg1.setSeverity("CRITICAL");
            emg1.setPriority(4);
            emg1.setDescription("Patient collapsed with sudden chest tightness and severe shortness of breath.");
            emg1.setHeartRate(118);
            emg1.setSpO2(86);
            emg1.setTemperature(39.1);
            emg1.setSystolicBP(165);
            emg1.setDiastolicBP(98);
            emg1.setRespiratoryRate(32);
            emg1.setSymptoms("Chest pain, breathing difficulty, fever");
            emg1.setSuggestedAction("OVERRIDE_TO_FRONT");
            emg1.setConfidenceScore(0.925);
            emg1.setStatus("ACTIVE");
            emergencyRepository.save(emg1);
        }

        // 7. Seed Laboratory Tests (Prioritized by Severity: CRITICAL > HIGH > MEDIUM > LOW)
        if (laboratoryRepository.count() == 0) {
            LabTest lt1 = new LabTest(null, p3, d1, "Lipid Panel & Cardiac Troponin-I", LabTestStatus.REQUESTED, LocalDate.now(), "CRITICAL", 4, "SpO2: 86%, HR: 118 bpm, BP: 165/98", "PATHOLOGY_DOC");
            laboratoryRepository.save(lt1);

            LabTest lt2 = new LabTest(null, p2, d1, "Chest X-Ray (PA View)", LabTestStatus.REQUESTED, LocalDate.now(), "HIGH", 3, "SpO2: 93%, HR: 98 bpm, BP: 138/88", "X_RAY");
            laboratoryRepository.save(lt2);

            LabTest lt3 = new LabTest(null, p1, d1, "Complete Blood Count (CBC)", LabTestStatus.COMPLETED, LocalDate.now().minusDays(2), "LOW", 1, "Vitals normal", "PATHOLOGY_DOC");
            lt3.setResultNotes("WBC: 6,800/mcL, Hb: 14.2 g/dL, Platelets: 240,000/mcL (Normal Range)");
            laboratoryRepository.save(lt3);
        }

        // 8. Seed Medical Record
        if (medicalRecordRepository.count() == 0) {
            MedicalRecord mr1 = new MedicalRecord();
            mr1.setPatient(p1);
            mr1.setDoctor(d1);
            mr1.setVisitDate(LocalDate.now().minusDays(10));
            mr1.setDiagnosis("Stage 1 Essential Hypertension");
            mr1.setPrescription("Amlodipine 5mg daily. Low sodium diet.");
            mr1.setNotes("Patient advised to record daily blood pressure logs.");
            medicalRecordRepository.save(mr1);
        }

        // 9. Seed Bill
        if (billingRepository.count() == 0) {
            Bill bill1 = new Bill();
            bill1.setPatient(p1);
            bill1.setConsultationFee(500.0);
            bill1.setLaboratoryFee(250.0);
            bill1.setPharmacyFee(75.0);
            bill1.setTotalAmount(825.0);
            bill1.setPaymentStatus(PaymentStatus.PAID);
            bill1.setBillDate(LocalDate.now().minusDays(1));
            billingRepository.save(bill1);
        }

        logger.info("IntelliCare HMS Demo Database seeded successfully!");
    }

    private void seedMedicineIfNotExists(String name, String category, Integer stock, String dosage, LocalDate expiry, Double price) {
        if (medicineRepository.findByMedicineNameIgnoreCase(name).isEmpty()) {
            medicineRepository.save(new Medicine(null, name, category, stock, dosage, expiry, price));
        }
    }

    private User seedUserIfNotExists(String username, String encodedPass, String email, Role role, Long employeeId, Long patientId) {
        return userRepository.findByUsername(username).orElseGet(() -> {
            User u = new User();
            u.setUsername(username);
            u.setPassword(encodedPass);
            u.setEmail(email);
            u.setRole(role);
            u.setEmployeeId(employeeId);
            u.setPatientId(patientId);
            u.setEnabled(true);
            return userRepository.save(u);
        });
    }

    private Patient seedPatientIfNotExists(String name, Integer age, String gender, String phone, String email, String address, String bloodGroup, String allergies) {
        return patientRepository.findByPhone(phone).orElseGet(() -> {
            Patient p = new Patient(null, name, age, gender, phone, email, address, bloodGroup, allergies);
            return patientRepository.save(p);
        });
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
