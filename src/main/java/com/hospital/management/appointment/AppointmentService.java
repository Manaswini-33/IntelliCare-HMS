package com.hospital.management.appointment;

import com.hospital.management.doctor.Doctor;
import com.hospital.management.doctor.DoctorRepository;
import com.hospital.management.emergency.EmergencyCase;
import com.hospital.management.emergency.EmergencyService;
import com.hospital.management.exception.AppointmentNotFoundException;
import com.hospital.management.exception.DoctorNotFoundException;
import com.hospital.management.exception.DuplicateAppointmentException;
import com.hospital.management.exception.InvalidAppointmentException;
import com.hospital.management.exception.PatientNotFoundException;
import com.hospital.management.notification.NotificationService;
import com.hospital.management.notification.NotificationType;
import com.hospital.management.patient.Patient;
import com.hospital.management.patient.PatientRepository;
import com.hospital.management.queue.QueueEntry;
import com.hospital.management.queue.QueueEntryRepository;
import com.hospital.management.queue.QueueStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final QueuePredictionService queuePredictionService;
    private final NotificationService notificationService;
    private final QueueEntryRepository queueEntryRepository;
    private final EmergencyService emergencyService;

    @Autowired
    public AppointmentService(AppointmentRepository appointmentRepository,
                              PatientRepository patientRepository,
                              DoctorRepository doctorRepository,
                              QueuePredictionService queuePredictionService,
                              NotificationService notificationService,
                              QueueEntryRepository queueEntryRepository,
                              EmergencyService emergencyService) {
        this.appointmentRepository = appointmentRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.queuePredictionService = queuePredictionService;
        this.notificationService = notificationService;
        this.queueEntryRepository = queueEntryRepository;
        this.emergencyService = emergencyService;
    }

    @Transactional
    public AppointmentDTO bookAppointment(AppointmentDTO dto) {
        Patient patient = patientRepository.findById(dto.getPatientId())
                .orElseThrow(() -> new PatientNotFoundException("Patient not found with ID: " + dto.getPatientId()));

        Doctor doctor = doctorRepository.findById(dto.getDoctorId())
                .orElseThrow(() -> new DoctorNotFoundException("Doctor not found with ID: " + dto.getDoctorId()));

        if ("Unavailable".equalsIgnoreCase(doctor.getAvailability()) || !doctor.isActive()) {
            throw new InvalidAppointmentException("Doctor is not available for the selected time.");
        }

        boolean exists = appointmentRepository.existsByDoctorDoctorIdAndAppointmentDateAndAppointmentTimeAndStatusNot(
                doctor.getDoctorId(), dto.getAppointmentDate(), dto.getAppointmentTime(), AppointmentStatus.CANCELLED
        );
        if (exists) {
            throw new DuplicateAppointmentException("Doctor already has an appointment booked at " +
                    dto.getAppointmentDate() + " " + dto.getAppointmentTime());
        }

        int priority = dto.getPriority() != null ? dto.getPriority() : 1;
        QueuePredictionService.QueuePredictionResult queueResult = queuePredictionService
                .calculateQueueAndWaitingTime(doctor.getDoctorId(), dto.getAppointmentDate(), priority);

        Appointment appointment = new Appointment();
        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setAppointmentDate(dto.getAppointmentDate());
        appointment.setAppointmentTime(dto.getAppointmentTime());
        appointment.setStatus(AppointmentStatus.SCHEDULED);
        appointment.setPriority(priority);
        appointment.setQueuePosition(queueResult.getQueuePosition());
        appointment.setEstimatedWaitingTime(queueResult.getEstimatedWaitingTimeMinutes());
        appointment.setReason(dto.getReason());

        Appointment saved = appointmentRepository.save(appointment);

        String msg = String.format("Appointment confirmed with Dr. %s on %s at %s.",
                doctor.getName(), dto.getAppointmentDate(), dto.getAppointmentTime());
        notificationService.createNotification(patient.getPhone(), msg, NotificationType.APPOINTMENT_CONFIRMATION);

        return mapToDTO(saved);
    }

    public AppointmentDTO checkIn(CheckInRequest request) {
        Appointment appointment = appointmentRepository.findById(request.getAppointmentId())
                .orElseThrow(() -> new AppointmentNotFoundException("Appointment not found with ID: " + request.getAppointmentId()));

        if (appointment.getStatus() == AppointmentStatus.CANCELLED) {
            throw new InvalidAppointmentException("Cancelled appointments cannot be checked in.");
        }
        if (queueEntryRepository.findByAppointmentAppointmentId(appointment.getAppointmentId()).isPresent()) {
            throw new DuplicateAppointmentException("This appointment is already in the queue.");
        }

        EmergencyCase emergencyCase = emergencyService.registerEmergencyWithVitals(
                appointment.getPatient().getPatientId(),
                "AUTO",
                request.getSymptoms(),
                request.getHeartRate(),
                request.getSpo2(),
                request.getTemperature(),
                request.getSystolicBp(),
                request.getDiastolicBp(),
                request.getRespiratoryRate(),
                request.getSymptoms()
        );

        return persistCheckedInAppointment(appointment, request, emergencyCase);
    }

    @Transactional
    public AppointmentDTO persistCheckedInAppointment(Appointment appointment, CheckInRequest request, EmergencyCase emergencyCase) {
        appointment.setStatus(AppointmentStatus.CHECKED_IN);
        appointment.setSymptoms(request.getSymptoms());
        appointment.setVitals(formatVitals(request));
        appointment.setSeverity(emergencyCase.getSeverity());
        appointment.setPriority(emergencyCase.getPriority());

        QueuePredictionService.QueuePredictionResult queueResult = queuePredictionService
                .calculateQueueAndWaitingTime(appointment.getDoctor().getDoctorId(), appointment.getAppointmentDate(), emergencyCase.getPriority());

        String token = "T-" + appointment.getDoctor().getDoctorId() + "-" + appointment.getAppointmentId();
        appointment.setTokenNumber(token);
        appointment.setQueuePosition(queueResult.getQueuePosition());
        appointment.setEstimatedWaitingTime(queueResult.getEstimatedWaitingTimeMinutes());
        appointment.setStatus(AppointmentStatus.IN_QUEUE);

        QueueEntry entry = new QueueEntry();
        entry.setTokenNumber(token);
        entry.setAppointment(appointment);
        entry.setPatient(appointment.getPatient());
        entry.setDoctor(appointment.getDoctor());
        entry.setSeverity(emergencyCase.getSeverity());
        entry.setPriority(emergencyCase.getPriority());
        entry.setQueueStatus(QueueStatus.WAITING);
        entry.setEstimatedWaitingMinutes(queueResult.getEstimatedWaitingTimeMinutes());
        queueEntryRepository.save(entry);

        Appointment saved = appointmentRepository.save(appointment);
        notificationService.createNotification(appointment.getPatient().getPhone(),
                "Checked in. Token " + token + ". Severity " + emergencyCase.getSeverity() + ".",
                NotificationType.APPOINTMENT_CONFIRMATION);
        return mapToDTO(saved);
    }

    @Transactional
    public AppointmentDTO startConsultation(Long appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new AppointmentNotFoundException("Appointment not found with ID: " + appointmentId));
        appointment.setStatus(AppointmentStatus.IN_CONSULTATION);
        queueEntryRepository.findByAppointmentAppointmentId(appointmentId).ifPresent(entry -> {
            entry.setQueueStatus(QueueStatus.IN_CONSULTATION);
            entry.setCalledAt(LocalDateTime.now());
            queueEntryRepository.save(entry);
        });
        return mapToDTO(appointmentRepository.save(appointment));
    }

    @Transactional
    public AppointmentDTO completeConsultation(Long appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new AppointmentNotFoundException("Appointment not found with ID: " + appointmentId));
        appointment.setStatus(AppointmentStatus.COMPLETED);
        queueEntryRepository.findByAppointmentAppointmentId(appointmentId).ifPresent(entry -> {
            entry.setQueueStatus(QueueStatus.COMPLETED);
            entry.setCompletedAt(LocalDateTime.now());
            queueEntryRepository.save(entry);
        });
        return mapToDTO(appointmentRepository.save(appointment));
    }

    @Transactional(readOnly = true)
    public AppointmentDTO getAppointmentById(Long appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new AppointmentNotFoundException("Appointment not found with ID: " + appointmentId));
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
                .orElseThrow(() -> new AppointmentNotFoundException("Appointment not found with ID: " + appointmentId));

        appointment.setStatus(AppointmentStatus.CANCELLED);
        queueEntryRepository.findByAppointmentAppointmentId(appointmentId).ifPresent(entry -> {
            entry.setQueueStatus(QueueStatus.CANCELLED);
            queueEntryRepository.save(entry);
        });
        Appointment updated = appointmentRepository.save(appointment);

        String msg = String.format("Appointment ID %d with Dr. %s has been CANCELLED.",
                appointmentId, appointment.getDoctor().getName());
        notificationService.createNotification(appointment.getPatient().getPhone(), msg, NotificationType.APPOINTMENT_CANCELLED);

        return mapToDTO(updated);
    }

    @Transactional
    public AppointmentDTO rescheduleAppointment(Long appointmentId, String newTime) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new AppointmentNotFoundException("Appointment not found with ID: " + appointmentId));

        boolean exists = appointmentRepository.existsByDoctorDoctorIdAndAppointmentDateAndAppointmentTimeAndStatusNot(
                appointment.getDoctor().getDoctorId(), appointment.getAppointmentDate(), newTime, AppointmentStatus.CANCELLED
        );
        if (exists) {
            throw new DuplicateAppointmentException("Doctor already has an appointment booked at " + newTime);
        }

        appointment.setAppointmentTime(newTime);
        appointment.setStatus(AppointmentStatus.RESCHEDULED);
        Appointment updated = appointmentRepository.save(appointment);

        String msg = String.format("Appointment ID %d rescheduled to %s.", appointmentId, newTime);
        notificationService.createNotification(appointment.getPatient().getPhone(), msg, NotificationType.APPOINTMENT_RESCHEDULED);

        return mapToDTO(updated);
    }

    private String formatVitals(CheckInRequest request) {
        return String.format("HR=%s SpO2=%s Temp=%s BP=%s/%s RR=%s",
                request.getHeartRate(), request.getSpo2(), request.getTemperature(),
                request.getSystolicBp(), request.getDiastolicBp(), request.getRespiratoryRate());
    }

    public AppointmentDTO mapToDTO(Appointment entity) {
        AppointmentDTO dto = new AppointmentDTO(
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
        dto.setReason(entity.getReason());
        dto.setSymptoms(entity.getSymptoms());
        dto.setSeverity(entity.getSeverity());
        dto.setTokenNumber(entity.getTokenNumber());
        return dto;
    }
}
