package com.hospital.management.queue;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QueueEntryRepository extends JpaRepository<QueueEntry, Long> {
    Optional<QueueEntry> findByAppointmentAppointmentId(Long appointmentId);
    List<QueueEntry> findByDoctorDoctorIdAndQueueStatusOrderByPriorityDescCreatedAtAsc(Long doctorId, QueueStatus status);
    List<QueueEntry> findByQueueStatusOrderByPriorityDescCreatedAtAsc(QueueStatus status);
    List<QueueEntry> findByPatientPatientIdOrderByCreatedAtDesc(Long patientId);
    long countByDoctorDoctorIdAndQueueStatus(Long doctorId, QueueStatus status);
}
