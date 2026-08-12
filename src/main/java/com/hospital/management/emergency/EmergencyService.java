package com.hospital.management.emergency;

import com.hospital.management.exception.ResourceNotFoundException;
import com.hospital.management.notification.NotificationService;
import com.hospital.management.notification.NotificationType;
import com.hospital.management.patient.Patient;
import com.hospital.management.patient.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EmergencyService {

    private final EmergencyRepository emergencyRepository;
    private final PatientRepository patientRepository;
    private final EmergencyPriorityService emergencyPriorityService;
    private final NotificationService notificationService;

    @Autowired
    public EmergencyService(EmergencyRepository emergencyRepository,
                            PatientRepository patientRepository,
                            EmergencyPriorityService emergencyPriorityService,
                            NotificationService notificationService) {
        this.emergencyRepository = emergencyRepository;
        this.patientRepository = patientRepository;
        this.emergencyPriorityService = emergencyPriorityService;
        this.notificationService = notificationService;
    }

    @Transactional
    public EmergencyCase registerEmergency(Long patientId, String severity, String description) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + patientId));

        int priority = emergencyPriorityService.calculatePriority(severity);

        EmergencyCase emergencyCase = new EmergencyCase();
        emergencyCase.setPatient(patient);
        emergencyCase.setSeverity(severity != null ? severity.toUpperCase() : "MEDIUM");
        emergencyCase.setPriority(priority);
        emergencyCase.setDescription(description);

        EmergencyCase saved = emergencyRepository.save(emergencyCase);

        // Notify Emergency Response Team / Doctors
        String msg = String.format("EMERGENCY ALERT: Patient %s (ID: %d) registered with Severity %s (Priority %d). Description: %s",
                patient.getName(), patient.getPatientId(), saved.getSeverity(), saved.getPriority(), description);
        notificationService.createNotification("EMERGENCY_DEPT", msg, NotificationType.EMERGENCY);

        return saved;
    }

    public EmergencyCase getEmergencyById(Long emergencyId) {
        return emergencyRepository.findById(emergencyId)
                .orElseThrow(() -> new ResourceNotFoundException("Emergency case not found with ID: " + emergencyId));
    }

    public List<EmergencyCase> getActiveEmergencies() {
        return emergencyRepository.findByStatusOrderByPriorityDescCreatedAtAsc("ACTIVE");
    }

    public List<EmergencyCase> getAllEmergencies() {
        return emergencyRepository.findAll();
    }

    @Transactional
    public EmergencyCase updateEmergencyStatus(Long emergencyId, String status) {
        EmergencyCase emergencyCase = getEmergencyById(emergencyId);
        emergencyCase.setStatus(status.toUpperCase());
        return emergencyRepository.save(emergencyCase);
    }
}
