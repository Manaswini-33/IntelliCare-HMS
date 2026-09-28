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
        if (userRepository.count() > 0) {
            logger.info("Database already seeded with demo records.");
            return;
        }

        logger.info("Initializing IntelliCare HMS Demo Data & Role Credentials...");

        String defaultPass = passwordEncoder.encode("password123");

        // 1. Seed System Users (6 distinct roles for the 3 Login Portals)
        userRepository.save(new User(null, "patient", defaultPass, "patient@intellicare.com", Role.PATIENT));
        userRepository.save(new User(null, "doctor", defaultPass, "doctor@intellicare.com", Role.DOCTOR));
        userRepository.save(new User(null, "receptionist", defaultPass, "receptionist@intellicare.com", Role.RECEPTIONIST));
        userRepository.save(new User(null, "labtech", defaultPass, "labtech@intellicare.com", Role.LAB_TECHNICIAN));
        userRepository.save(new User(null, "pharmacist", defaultPass, "pharmacist@intellicare.com", Role.PHARMACIST));
        userRepository.save(new User(null, "admin", defaultPass, "admin@intellicare.com", Role.ADMIN));

        // 2. Seed Patients
        Patient p1 = patientRepository.save(new Patient(null, "John Smith", 45, "Male", "9876543210", "john@email.com", "124 Park Ave, New York", "O+", "Penicillin"));
        Patient p2 = patientRepository.save(new Patient(null, "Emily Davis", 28, "Female", "9876543211", "emily@email.com", "56 Lakeview Rd, Boston", "A+", "Aspirin"));
        Patient p3 = patientRepository.save(new Patient(null, "Robert Brown", 65, "Male", "9876543212", "robert@email.com", "88 Broadway, Chicago", "B+", "None"));
        Patient p4 = patientRepository.save(new Patient(null, "Sarah Wilson", 34, "Female", "9876543213", "sarah@email.com", "12 Pine St, Seattle", "AB+", "Sulfa Drugs"));

        // 3. Seed Doctors
        Doctor d1 = doctorRepository.save(new Doctor(null, "Dr. Sarah Jenkins", "sarah.jenkins@intellicare.com", "9876500001", "Cardiology", "Cardiology Dept", 14, "Available"));
        Doctor d2 = doctorRepository.save(new Doctor(null, "Dr. Marcus Chen", "marcus.chen@intellicare.com", "9876500002", "Neurology", "Neurology Dept", 12, "Available"));
        Doctor d3 = doctorRepository.save(new Doctor(null, "Dr. Priya Patel", "priya.patel@intellicare.com", "9876500003", "Pediatrics", "Pediatrics Dept", 9, "Available"));
        Doctor d4 = doctorRepository.save(new Doctor(null, "Dr. David Miller", "david.miller@intellicare.com", "9876500004", "Orthopedics", "Orthopedics Dept", 16, "Available"));
        Doctor d5 = doctorRepository.save(new Doctor(null, "Dr. Elena Rostova", "elena.rostova@intellicare.com", "9876500005", "Dermatology", "Dermatology Dept", 8, "Available"));
        Doctor d6 = doctorRepository.save(new Doctor(null, "Dr. James Wilson", "james.wilson@intellicare.com", "9876500006", "General Medicine", "Outpatient Clinic", 20, "Available"));

        // 4. Seed Medicines
        medicineRepository.save(new Medicine(null, "Paracetamol 500mg", "Analgesic", 250, "1 tab twice daily", LocalDate.now().plusYears(2), 5.00));
        medicineRepository.save(new Medicine(null, "Amoxicillin 250mg", "Antibiotic", 120, "1 cap thrice daily", LocalDate.now().plusYears(1), 12.50));
        medicineRepository.save(new Medicine(null, "Aspirin 75mg", "Cardiovascular", 180, "1 tab once daily", LocalDate.now().plusYears(2), 8.00));
        medicineRepository.save(new Medicine(null, "Metformin 500mg", "Antidiabetic", 200, "1 tab with meals", LocalDate.now().plusYears(2), 15.00));
        medicineRepository.save(new Medicine(null, "Salbutamol Inhaler", "Respiratory", 45, "2 puffs as needed", LocalDate.now().plusYears(1), 30.00));
        medicineRepository.save(new Medicine(null, "Penicillin V 250mg", "Antibiotic", 60, "1 tab every 6 hrs", LocalDate.now().plusYears(1), 14.00));

        // 5. Seed Appointments
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

        // 6. Seed Emergency Case (Triage Prioritized)
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

        // 7. Seed Laboratory Tests
        laboratoryRepository.save(new LabTest(null, p1, d1, "Complete Blood Count (CBC)", LabTestStatus.COMPLETED, LocalDate.now().minusDays(2)));
        laboratoryRepository.save(new LabTest(null, p3, d1, "Lipid Panel & Cardiac Enzymes", LabTestStatus.REQUESTED, LocalDate.now()));
        laboratoryRepository.save(new LabTest(null, p4, d6, "Pulmonary Function Test", LabTestStatus.REQUESTED, LocalDate.now()));

        // 8. Seed Medical Record
        MedicalRecord mr1 = new MedicalRecord();
        mr1.setPatient(p1);
        mr1.setDoctor(d1);
        mr1.setVisitDate(LocalDate.now().minusDays(10));
        mr1.setDiagnosis("Stage 1 Essential Hypertension");
        mr1.setPrescription("Amlodipine 5mg daily. Low sodium diet.");
        mr1.setNotes("Patient advised to record daily blood pressure logs.");
        medicalRecordRepository.save(mr1);

        // 9. Seed Bill
        Bill bill1 = new Bill();
        bill1.setPatient(p1);
        bill1.setConsultationFee(500.0);
        bill1.setLaboratoryFee(250.0);
        bill1.setPharmacyFee(75.0);
        bill1.setTotalAmount(825.0);
        bill1.setPaymentStatus(PaymentStatus.PAID);
        bill1.setBillDate(LocalDate.now().minusDays(1));
        billingRepository.save(bill1);

        logger.info("IntelliCare HMS Demo Database seeded successfully!");
    }
}
