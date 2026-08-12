package com.hospital.management.laboratory;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LaboratoryRepository extends JpaRepository<LabTest, Long> {
    List<LabTest> findByPatientPatientId(Long patientId);
    List<LabTest> findByDoctorDoctorId(Long doctorId);
    List<LabTest> findByStatus(LabTestStatus status);
}
