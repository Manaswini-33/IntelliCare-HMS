package com.hospital.management.reporting;

import com.hospital.management.appointment.AppointmentRepository;
import com.hospital.management.billing.Bill;
import com.hospital.management.billing.BillingRepository;
import com.hospital.management.doctor.DoctorRepository;
import com.hospital.management.laboratory.LaboratoryRepository;
import com.hospital.management.medicalrecord.MedicalRecord;
import com.hospital.management.medicalrecord.MedicalRecordRepository;
import com.hospital.management.patient.Patient;
import com.hospital.management.patient.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ReportService {

    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final LaboratoryRepository laboratoryRepository;
    private final BillingRepository billingRepository;

    @Autowired
    public ReportService(PatientRepository patientRepository,
                         DoctorRepository doctorRepository,
                         AppointmentRepository appointmentRepository,
                         MedicalRecordRepository medicalRecordRepository,
                         LaboratoryRepository laboratoryRepository,
                         BillingRepository billingRepository) {
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.appointmentRepository = appointmentRepository;
        this.medicalRecordRepository = medicalRecordRepository;
        this.laboratoryRepository = laboratoryRepository;
        this.billingRepository = billingRepository;
    }

    public Map<String, Object> getPatientMedicalReport(Long patientId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found with ID: " + patientId));

        List<MedicalRecord> records = medicalRecordRepository.findByPatientPatientId(patientId);

        Map<String, Object> report = new HashMap<>();
        report.put("patientId", patient.getPatientId());
        report.put("name", patient.getName());
        report.put("age", patient.getAge());
        report.put("gender", patient.getGender());
        report.put("bloodGroup", patient.getBloodGroup());
        report.put("allergies", patient.getAllergies());
        report.put("medicalRecords", records);

        return report;
    }

    public Map<String, Object> getPatientBillingReport(Long patientId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found with ID: " + patientId));

        List<Bill> bills = billingRepository.findByPatientPatientId(patientId);
        double totalBilled = bills.stream().mapToDouble(Bill::getTotalAmount).sum();

        Map<String, Object> report = new HashMap<>();
        report.put("patientId", patient.getPatientId());
        report.put("patientName", patient.getName());
        report.put("totalBills", bills.size());
        report.put("totalAmountBilled", totalBilled);
        report.put("bills", bills);

        return report;
    }

    public Map<String, Object> getAppointmentStatistics() {
        long totalAppointments = appointmentRepository.count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalAppointments", totalAppointments);
        return stats;
    }

    public Map<String, Object> getHospitalStatistics() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalPatients", patientRepository.count());
        stats.put("totalDoctors", doctorRepository.count());
        stats.put("totalAppointments", appointmentRepository.count());
        stats.put("totalLabTests", laboratoryRepository.count());
        stats.put("totalBills", billingRepository.count());
        return stats;
    }
}
