package com.hospital.management.emergency;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmergencyRepository extends JpaRepository<EmergencyCase, Long> {
    List<EmergencyCase> findByStatusOrderByPriorityDescCreatedAtAsc(String status);
    List<EmergencyCase> findByPatientPatientId(Long patientId);
}
