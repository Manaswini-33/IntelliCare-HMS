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
import java.time.LocalDateTime;

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

        // 4-Digit Role Portals
        seedUserIfNotExists("1001", defaultPass, "john.smith@intellicare.com", Role.PATIENT, null, 1L);
        seedUserIfNotExists("1002", defaultPass, "emily.davis@intellicare.com", Role.PATIENT, null, 2L);
        seedUserIfNotExists("1003", defaultPass, "robert.brown@intellicare.com", Role.PATIENT, null, 3L);
        seedUserIfNotExists("1004", defaultPass, "sarah.wilson@intellicare.com", Role.PATIENT, null, 4L);

        seedUserIfNotExists("3001", defaultPass, "reception1@intellicare.com", Role.RECEPTIONIST, null, null);
        seedUserIfNotExists("3002", defaultPass, "reception2@intellicare.com", Role.RECEPTIONIST, null, null);
        seedUserIfNotExists("4001", defaultPass, "labtech@intellicare.com", Role.LAB_TECHNICIAN, null, null);
        seedUserIfNotExists("5001", defaultPass, "pharmacist@intellicare.com", Role.PHARMACIST, null, null);
        seedUserIfNotExists("6001", defaultPass, "admin@intellicare.com", Role.ADMIN, null, null);

        // 2. Seed Patients
        Patient p1 = seedPatientIfNotExists("John Smith", 45, "Male", "9876543210", "john@email.com", "124 Park Ave, New York", "O+", "Penicillin");
        Patient p2 = seedPatientIfNotExists("Emily Davis", 28, "Female", "9876543211", "emily@email.com", "56 Lakeview Rd, Boston", "A+", "Aspirin");
        Patient p3 = seedPatientIfNotExists("Robert Brown", 65, "Male", "9876543212", "robert@email.com", "88 Broadway, Chicago", "B+", "None");
        Patient p4 = seedPatientIfNotExists("Sarah Wilson", 34, "Female", "9876543213", "sarah@email.com", "12 Pine St, Seattle", "AB+", "Sulfa Drugs");

        // 3. Seed 4 Doctors per Department (Total 24 Doctors across 6 Departments)
        // Cardiology (2001 - 2004)
        Doctor d1 = seedDoctorIfNotExists("Dr. Sarah Jenkins", "sarah.jenkins@intellicare.com", "9876500001", "Cardiology", "Cardiology Dept", 14, "Available");
        Doctor d2 = seedDoctorIfNotExists("Dr. Anthony Vance", "anthony.vance@intellicare.com", "9876500002", "Cardiology", "Cardiology Dept", 18, "Available");
        Doctor d3 = seedDoctorIfNotExists("Dr. Robert Martinez", "robert.martinez@intellicare.com", "9876500003", "Cardiology", "Cardiology Dept", 11, "Available");
        Doctor d4 = seedDoctorIfNotExists("Dr. Lisa Ray", "lisa.ray@intellicare.com", "9876500004", "Cardiology", "Cardiology Dept", 8, "Available");

        // Neurology (2005 - 2008)
        Doctor d5 = seedDoctorIfNotExists("Dr. Marcus Chen", "marcus.chen@intellicare.com", "9876500005", "Neurology", "Neurology Dept", 12, "Available");
        Doctor d6 = seedDoctorIfNotExists("Dr. Evelyn Reed", "evelyn.reed@intellicare.com", "9876500006", "Neurology", "Neurology Dept", 15, "Available");
        Doctor d7 = seedDoctorIfNotExists("Dr. Alan Cooper", "alan.cooper@intellicare.com", "9876500007", "Neurology", "Neurology Dept", 9, "Available");
        Doctor d8 = seedDoctorIfNotExists("Dr. Maya Lin", "maya.lin@intellicare.com", "9876500008", "Neurology", "Neurology Dept", 13, "Available");

        // Pediatrics (2009 - 2012)
        Doctor d9 = seedDoctorIfNotExists("Dr. Priya Patel", "priya.patel@intellicare.com", "9876500009", "Pediatrics", "Pediatrics Dept", 9, "Available");
        Doctor d10 = seedDoctorIfNotExists("Dr. Samuel Clark", "samuel.clark@intellicare.com", "9876500010", "Pediatrics", "Pediatrics Dept", 14, "Available");
        Doctor d11 = seedDoctorIfNotExists("Dr. Zoe Bennett", "zoe.bennett@intellicare.com", "9876500011", "Pediatrics", "Pediatrics Dept", 7, "Available");
        Doctor d12 = seedDoctorIfNotExists("Dr. Daniel Kim", "daniel.kim@intellicare.com", "9876500012", "Pediatrics", "Pediatrics Dept", 16, "Available");

        // Orthopedics (2013 - 2016)
        Doctor d13 = seedDoctorIfNotExists("Dr. David Miller", "david.miller@intellicare.com", "9876500013", "Orthopedics", "Orthopedics Dept", 16, "Available");
        Doctor d14 = seedDoctorIfNotExists("Dr. Robert Taylor", "robert.taylor@intellicare.com", "9876500014", "Orthopedics", "Orthopedics Dept", 11, "Available");
        Doctor d15 = seedDoctorIfNotExists("Dr. Rebecca Moore", "rebecca.moore@intellicare.com", "9876500015", "Orthopedics", "Orthopedics Dept", 10, "Available");
        Doctor d16 = seedDoctorIfNotExists("Dr. Brian Adams", "brian.adams@intellicare.com", "9876500016", "Orthopedics", "Orthopedics Dept", 13, "Available");

        // Dermatology (2017 - 2020)
        Doctor d17 = seedDoctorIfNotExists("Dr. Elena Rostova", "elena.rostova@intellicare.com", "9876500017", "Dermatology", "Dermatology Dept", 8, "Available");
        Doctor d18 = seedDoctorIfNotExists("Dr. Sophia Green", "sophia.green@intellicare.com", "9876500018", "Dermatology", "Dermatology Dept", 12, "Available");
        Doctor d19 = seedDoctorIfNotExists("Dr. Nathan Scott", "nathan.scott@intellicare.com", "9876500019", "Dermatology", "Dermatology Dept", 6, "Available");
        Doctor d20 = seedDoctorIfNotExists("Dr. Chloe Taylor", "chloe.taylor@intellicare.com", "9876500020", "Dermatology", "Dermatology Dept", 15, "Available");

        // General Medicine (2021 - 2024)
        Doctor d21 = seedDoctorIfNotExists("Dr. James Wilson", "james.wilson@intellicare.com", "9876500021", "General Medicine", "Outpatient Clinic", 20, "Available");
        Doctor d22 = seedDoctorIfNotExists("Dr. Rajesh Sharma", "rajesh.sharma@intellicare.com", "9876500022", "General Medicine", "Outpatient Clinic", 15, "Available");
        Doctor d23 = seedDoctorIfNotExists("Dr. Laura Davis", "laura.davis@intellicare.com", "9876500023", "General Medicine", "Outpatient Clinic", 11, "Available");
        Doctor d24 = seedDoctorIfNotExists("Dr. Kevin White", "kevin.white@intellicare.com", "9876500024", "General Medicine", "Outpatient Clinic", 9, "Available");

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

        // 7. Seed Laboratory Tests
        if (laboratoryRepository.count() == 0) {
            laboratoryRepository.save(new LabTest(null, p1, d1, "Complete Blood Count (CBC)", LabTestStatus.COMPLETED, LocalDate.now().minusDays(2)));
            laboratoryRepository.save(new LabTest(null, p3, d1, "Lipid Panel & Cardiac Enzymes", LabTestStatus.REQUESTED, LocalDate.now()));
            laboratoryRepository.save(new LabTest(null, p4, d6, "Pulmonary Function Test", LabTestStatus.REQUESTED, LocalDate.now()));
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

    private Doctor seedDoctorIfNotExists(String name, String email, String phone, String specialization, String department, Integer experience, String availability) {
        var existing = doctorRepository.findByNameContainingIgnoreCase(name);
        if (!existing.isEmpty()) {
            return existing.get(0);
        }
        Doctor d = new Doctor(null, name, email, phone, specialization, department, experience, availability);
        return doctorRepository.save(d);
    }
}
