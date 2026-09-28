package com.hospital.management.emergency;

import com.hospital.management.exception.ResourceNotFoundException;
import com.hospital.management.ml.MLIntegrationService;
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
    private final MLIntegrationService mlIntegrationService;

    @Autowired
    public EmergencyService(EmergencyRepository emergencyRepository,
                            PatientRepository patientRepository,
                            EmergencyPriorityService emergencyPriorityService,
                            NotificationService notificationService,
                            MLIntegrationService mlIntegrationService) {
        this.emergencyRepository = emergencyRepository;
        this.patientRepository = patientRepository;
        this.emergencyPriorityService = emergencyPriorityService;
        this.notificationService = notificationService;
        this.mlIntegrationService = mlIntegrationService;
    }

    @Transactional
    public EmergencyCase registerEmergency(Long patientId, String severity, String description) {
        return registerEmergencyWithVitals(patientId, severity, description, null, null, null, null, null, null, null);
    }

    @Transactional
    public EmergencyCase registerEmergencyWithVitals(Long patientId, String manualSeverity, String description,
                                                    Integer heartRate, Integer spO2, Double temperature,
                                                    Integer systolicBP, Integer diastolicBP, Integer respiratoryRate,
                                                    String symptoms) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + patientId));

        EmergencyCase emergencyCase = new EmergencyCase();
        emergencyCase.setPatient(patient);
        emergencyCase.setDescription(description);
        emergencyCase.setHeartRate(heartRate);
        emergencyCase.setSpO2(spO2);
        emergencyCase.setTemperature(temperature);
        emergencyCase.setSystolicBP(systolicBP);
        emergencyCase.setDiastolicBP(diastolicBP);
        emergencyCase.setRespiratoryRate(respiratoryRate);
        emergencyCase.setSymptoms(symptoms);

        String finalSeverity = manualSeverity;
        int finalPriority = 1;

        // If vital signs are provided, run AI Severity Model
        if (heartRate != null && spO2 != null) {
            MLIntegrationService.SeverityRequest mlReq = new MLIntegrationService.SeverityRequest();
            mlReq.setAge(patient.getAge() != null ? patient.getAge() : 45);
            mlReq.setGender(patient.getGender() != null ? patient.getGender() : "Male");
            mlReq.setHeartRate(heartRate);
            mlReq.setSpo2(spO2);
            mlReq.setTemperature(temperature != null ? temperature : 37.0);
            mlReq.setSystolicBp(systolicBP != null ? systolicBP : 120);
            mlReq.setDiastolicBp(diastolicBP != null ? diastolicBP : 80);
            mlReq.setRespiratoryRate(respiratoryRate != null ? respiratoryRate : 18);
            if (symptoms != null && !symptoms.isEmpty()) {
                String symLower = symptoms.toLowerCase();
                if (symLower.contains("fever")) mlReq.setFever("Yes");
                if (symLower.contains("cough")) mlReq.setCough("Yes");
                if (symLower.contains("breath")) mlReq.setDifficultyBreathing("Yes");
                if (symLower.contains("chest")) mlReq.setChestPain("Yes");
                if (symLower.contains("headache")) mlReq.setHeadache("Yes");
            }

            MLIntegrationService.SeverityResponse mlRes = mlIntegrationService.predictSeverity(mlReq);
            emergencyCase.setConfidenceScore(mlRes.getConfidenceScore());
            emergencyCase.setSuggestedAction(mlRes.getSuggestedQueueAction());

            // If manualSeverity was not specified or was defaulted, use AI prediction
            if (manualSeverity == null || manualSeverity.trim().isEmpty() || "AUTO".equalsIgnoreCase(manualSeverity)) {
                finalSeverity = mlRes.getSeverity();
                finalPriority = mlRes.getPriorityLevel();
            } else {
                // Staff manual override
                finalSeverity = manualSeverity.toUpperCase();
                finalPriority = emergencyPriorityService.calculatePriority(finalSeverity);
            }
        } else {
            // Standard rule-based priority mapping
            if (finalSeverity == null || finalSeverity.trim().isEmpty()) {
                finalSeverity = "MEDIUM";
            } else {
                finalSeverity = finalSeverity.toUpperCase();
            }
            finalPriority = emergencyPriorityService.calculatePriority(finalSeverity);
        }

        emergencyCase.setSeverity(finalSeverity);
        emergencyCase.setPriority(finalPriority);

        EmergencyCase saved = emergencyRepository.save(emergencyCase);

        // Notify Emergency Response Team / Doctors
        String msg = String.format("🚨 EMERGENCY ALERT: Patient %s (ID: %d) | Severity: %s (Priority %d) | Action: %s | Description: %s",
                patient.getName(), patient.getPatientId(), saved.getSeverity(), saved.getPriority(),
                saved.getSuggestedAction() != null ? saved.getSuggestedAction() : "EXPEDITE_QUEUE", description);
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
