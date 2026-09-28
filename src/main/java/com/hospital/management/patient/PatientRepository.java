package com.hospital.management.patient;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {
    List<Patient> findByNameContainingIgnoreCase(String name);
    boolean existsByPhone(String phone);
    Optional<Patient> findByPhone(String phone);
    Optional<Patient> findByPatientCode(String patientCode);
    List<Patient> findByPhoneContaining(String phone);
}
