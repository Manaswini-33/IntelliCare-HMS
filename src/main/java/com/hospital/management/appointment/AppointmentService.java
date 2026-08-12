package com.hospital.management.appointment;

import com.hospital.management.doctor.Doctor;
import com.hospital.management.doctor.DoctorRepository;
import com.hospital.management.exception.DuplicateAppointmentException;
import com.hospital.management.exception.InvalidAppointmentException;
import com.hospital.management.exception.ResourceNotFoundException;
import com.hospital.management.notification.NotificationService;
import com.hospital.management.notification.NotificationType;
import com.hospital.management.patient.Patient;
import com.hospital.management.patient.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final QueuePredictionService queuePredictionService;
    private final NotificationService notificationService;

    @Autowired
    public AppointmentService(AppointmentRepository appointmentRepository,
                              PatientRepository patientRepository,
                              DoctorRepository doctorRepository,
                              QueuePredictionService queuePredictionService,
                              NotificationService notificationService) {
        this.appointmentRepository = appointmentRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.queuePredictionService = queuePredictionService;
        this.notificationService = notificationService;
    }

    @Transactional
    public AppointmentDTO bookAppointment(AppointmentDTO dto) {
        Patient patient = patientRepository.findById(dto.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + dto.getPatientId()));

        Doctor doctor = doctorRepository.findById(dto.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with ID: " + dto.getDoctorId()));

        if ("Unavailable".equalsIgnoreCase(doctor.getAvailability())) {
            throw new InvalidAppointmentException("Doctor " + doctor.getName() + " is currently unavailable.");
        }

        // 1. Check duplicate appointment (double booking)
        boolean exists = appointmentRepository.existsByDoctorDoctorIdAndAppointmentDateAndAppointmentTimeAndStatusNot(
                doctor.getDoctorId(), dto.getAppointmentDate(), dto.getAppointmentTime(), AppointmentStatus.CANCELLED
        );
        if (exists) {
            throw new DuplicateAppointmentException("Doctor already has an appointment booked at " +
                    dto.getAppointmentDate() + " " + dto.getAppointmentTime());
        }

        // 2. Set priority default (1 = Normal)
        int priority = dto.getPriority() != null ? dto.getPriority() : 1;

        // 3. Calculate queue position & estimated waiting time
        QueuePredictionService.QueuePredictionResult queueResult = queuePredictionService
                .calculateQueueAndWaitingTime(doctor.getDoctorId(), dto.getAppointmentDate(), priority);

        Appointment appointment = new Appointment();
        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setAppointmentDate(dto.getAppointmentDate());
        appointment.setAppointmentTime(dto.getAppointmentTime());
        appointment.setStatus(AppointmentStatus.BOOKED);
        appointment.setPriority(priority);
        appointment.setQueuePosition(queueResult.getQueuePosition());
        appointment.setEstimatedWaitingTime(queueResult.getEstimatedWaitingTimeMinutes());

        Appointment saved = appointmentRepository.save(appointment);

        // 4. Send Notification
        String msg = String.format("Appointment confirmed with Dr. %s on %s at %s. Queue Position: %d, Estimated Wait: %d mins.",
                doctor.getName(), dto.getAppointmentDate(), dto.getAppointmentTime(),
                saved.getQueuePosition(), saved.getEstimatedWaitingTime());
        notificationService.createNotification(patient.getPhone(), msg, NotificationType.APPOINTMENT_CONFIRMATION);

        return mapToDTO(saved);
    }

    @Transactional(readOnly = true)
    public AppointmentDTO getAppointmentById(Long appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with ID: " + appointmentId));
        return mapToDTO(appointment);
    }

    @Transactional(readOnly = true)
    public List<AppointmentDTO> getAppointmentsByPatient(Long patientId) {
        return appointmentRepository.findByPatientPatientId(patientId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AppointmentDTO> getAppointmentsByDoctor(Long doctorId) {
        return appointmentRepository.findByDoctorDoctorId(doctorId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AppointmentDTO> getAllAppointments() {
        return appointmentRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public AppointmentDTO cancelAppointment(Long appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with ID: " + appointmentId));

        appointment.setStatus(AppointmentStatus.CANCELLED);
        Appointment updated = appointmentRepository.save(appointment);

        String msg = String.format("Appointment ID %d with Dr. %s has been CANCELLED.",
                appointmentId, appointment.getDoctor().getName());
        notificationService.createNotification(appointment.getPatient().getPhone(), msg, NotificationType.APPOINTMENT_CANCELLED);

        return mapToDTO(updated);
    }

    @Transactional
    public AppointmentDTO rescheduleAppointment(Long appointmentId, String newTime) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with ID: " + appointmentId));

        boolean exists = appointmentRepository.existsByDoctorDoctorIdAndAppointmentDateAndAppointmentTimeAndStatusNot(
                appointment.getDoctor().getDoctorId(), appointment.getAppointmentDate(), newTime, AppointmentStatus.CANCELLED
        );
        if (exists) {
            throw new DuplicateAppointmentException("Doctor already has an appointment booked at " + newTime);
        }

        appointment.setAppointmentTime(newTime);
        appointment.setStatus(AppointmentStatus.BOOKED);
        Appointment updated = appointmentRepository.save(appointment);

        String msg = String.format("Appointment ID %d rescheduled to %s.", appointmentId, newTime);
        notificationService.createNotification(appointment.getPatient().getPhone(), msg, NotificationType.APPOINTMENT_RESCHEDULED);

        return mapToDTO(updated);
    }

    public AppointmentDTO mapToDTO(Appointment entity) {
        return new AppointmentDTO(
                entity.getAppointmentId(),
                entity.getPatient().getPatientId(),
                entity.getPatient().getName(),
                entity.getDoctor().getDoctorId(),
                entity.getDoctor().getName(),
                entity.getAppointmentDate(),
                entity.getAppointmentTime(),
                entity.getStatus(),
                entity.getPriority(),
                entity.getQueuePosition(),
                entity.getEstimatedWaitingTime()
        );
    }
}
