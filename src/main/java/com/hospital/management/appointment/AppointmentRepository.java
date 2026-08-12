package com.hospital.management.appointment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByDoctorDoctorIdAndAppointmentDate(Long doctorId, LocalDate appointmentDate);
    List<Appointment> findByPatientPatientId(Long patientId);
    List<Appointment> findByDoctorDoctorId(Long doctorId);
    boolean existsByDoctorDoctorIdAndAppointmentDateAndAppointmentTimeAndStatusNot(
            Long doctorId, LocalDate appointmentDate, String appointmentTime, AppointmentStatus status
    );
    long countByDoctorDoctorIdAndAppointmentDateAndStatusIn(
            Long doctorId, LocalDate appointmentDate, List<AppointmentStatus> statuses
    );
}
