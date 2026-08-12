package com.hospital.management.medicalrecord;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, Long> {
    List<MedicalRecord> findByPatientPatientId(Long patientId);
    List<MedicalRecord> findByDoctorDoctorId(Long doctorId);
    List<MedicalRecord> findByDiagnosisContainingIgnoreCase(String diagnosis);
}
