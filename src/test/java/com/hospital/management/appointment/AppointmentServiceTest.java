package com.hospital.management.appointment;

import com.hospital.management.doctor.Doctor;
import com.hospital.management.doctor.DoctorRepository;
import com.hospital.management.emergency.EmergencyPriorityService;
import com.hospital.management.emergency.EmergencyRepository;
import com.hospital.management.emergency.EmergencyService;
import com.hospital.management.emergency.RuleBasedEmergencyPriorityService;
import com.hospital.management.exception.DuplicateAppointmentException;
import com.hospital.management.exception.InvalidAppointmentException;
import com.hospital.management.notification.NotificationRepository;
import com.hospital.management.notification.NotificationService;
import com.hospital.management.patient.Patient;
import com.hospital.management.patient.PatientRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

class AppointmentServiceTest {

    @Mock
    private AppointmentRepository appointmentRepository;

    @Mock
    private PatientRepository patientRepository;

    @Mock
    private DoctorRepository doctorRepository;

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private com.hospital.management.queue.QueueEntryRepository queueEntryRepository;

    @Mock
    private EmergencyRepository emergencyRepository;

    private NotificationService notificationService;
    private QueuePredictionService queuePredictionService;
    private EmergencyPriorityService emergencyPriorityService;
    private EmergencyService emergencyService;
    private AppointmentService appointmentService;

    private Patient patient;
    private Doctor doctor;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        notificationService = new NotificationService(notificationRepository);
        queuePredictionService = new RuleBasedQueuePredictionService(appointmentRepository, null);
        emergencyPriorityService = new RuleBasedEmergencyPriorityService();
        emergencyService = new EmergencyService(emergencyRepository, patientRepository, emergencyPriorityService, notificationService, null);
        appointmentService = new AppointmentService(appointmentRepository, patientRepository, doctorRepository, queuePredictionService, notificationService, queueEntryRepository, emergencyService);

        patient = new Patient(1L, "Jane Doe", 25, "Female", "9876543210", "jane@example.com", "Address", "A+", "None");
        doctor = new Doctor(1L, "Dr. Smith", "smith@hospital.com", "1234567890", "Cardiology", "Cardiology", 10, "Available");
    }

    @Test
    void bookAppointment_Success() {
        AppointmentDTO dto = new AppointmentDTO(null, 1L, null, 1L, null, LocalDate.now().plusDays(1), "10:00 AM", null, 1, null, null);

        when(patientRepository.findById(1L)).thenReturn(Optional.of(patient));
        when(doctorRepository.findById(1L)).thenReturn(Optional.of(doctor));
        when(appointmentRepository.existsByDoctorDoctorIdAndAppointmentDateAndAppointmentTimeAndStatusNot(
                eq(1L), any(LocalDate.class), eq("10:00 AM"), eq(AppointmentStatus.CANCELLED)
        )).thenReturn(false);

        when(appointmentRepository.countByDoctorDoctorIdAndAppointmentDateAndStatusIn(eq(1L), any(LocalDate.class), anyList()))
                .thenReturn(0L);

        Appointment savedAppointment = new Appointment(10L, patient, doctor, dto.getAppointmentDate(), "10:00 AM", AppointmentStatus.BOOKED, 1, 1, 0);
        when(appointmentRepository.save(any(Appointment.class))).thenReturn(savedAppointment);

        AppointmentDTO result = appointmentService.bookAppointment(dto);

        assertNotNull(result);
        assertEquals(10L, result.getAppointmentId());
        assertEquals(AppointmentStatus.BOOKED, result.getStatus());
        assertEquals(1, result.getQueuePosition());
    }

    @Test
    void bookAppointment_DoubleBooking_ThrowsException() {
        AppointmentDTO dto = new AppointmentDTO(null, 1L, null, 1L, null, LocalDate.now().plusDays(1), "10:00 AM", null, 1, null, null);

        when(patientRepository.findById(1L)).thenReturn(Optional.of(patient));
        when(doctorRepository.findById(1L)).thenReturn(Optional.of(doctor));
        when(appointmentRepository.existsByDoctorDoctorIdAndAppointmentDateAndAppointmentTimeAndStatusNot(
                eq(1L), any(LocalDate.class), eq("10:00 AM"), eq(AppointmentStatus.CANCELLED)
        )).thenReturn(true);

        assertThrows(DuplicateAppointmentException.class, () -> appointmentService.bookAppointment(dto));
    }

    @Test
    void bookAppointment_DoctorUnavailable_ThrowsException() {
        doctor.setAvailability("Unavailable");
        AppointmentDTO dto = new AppointmentDTO(null, 1L, null, 1L, null, LocalDate.now().plusDays(1), "10:00 AM", null, 1, null, null);

        when(patientRepository.findById(1L)).thenReturn(Optional.of(patient));
        when(doctorRepository.findById(1L)).thenReturn(Optional.of(doctor));

        assertThrows(InvalidAppointmentException.class, () -> appointmentService.bookAppointment(dto));
    }
}
