package com.hospital.management.doctor;

import com.hospital.management.ml.MLIntegrationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Enhanced DoctorRecommendationService combining ML TF-IDF recommendation with database lookup.
 */
@Service
@Primary
public class RuleBasedDoctorRecommendationService implements DoctorRecommendationService {

    private final DoctorRepository doctorRepository;
    private final MLIntegrationService mlIntegrationService;

    @Autowired
    public RuleBasedDoctorRecommendationService(DoctorRepository doctorRepository,
                                                MLIntegrationService mlIntegrationService) {
        this.doctorRepository = doctorRepository;
        this.mlIntegrationService = mlIntegrationService;
    }

    @Override
    public List<DoctorDTO> recommendDoctorsBySymptoms(String symptoms) {
        if (symptoms == null || symptoms.trim().isEmpty()) {
            return doctorRepository.findAll().stream()
                    .map(this::mapToDTO)
                    .collect(Collectors.toList());
        }

        String targetSpecialization = "General Medicine";
        try {
            MLIntegrationService.SpecialistResponse mlRes = mlIntegrationService.recommendSpecialist(symptoms);
            if (mlRes != null && mlRes.getRecommendedSpecialist() != null) {
                targetSpecialization = mlRes.getRecommendedSpecialist().replace(" Specialist", "").trim();
            }
        } catch (Exception ex) {
            String lower = symptoms.toLowerCase();
            if (lower.contains("chest") || lower.contains("heart") || lower.contains("cardio")) targetSpecialization = "Cardiology";
            else if (lower.contains("skin") || lower.contains("rash") || lower.contains("derma")) targetSpecialization = "Dermatology";
            else if (lower.contains("bone") || lower.contains("joint") || lower.contains("fracture")) targetSpecialization = "Orthopedics";
            else if (lower.contains("child") || lower.contains("pedia")) targetSpecialization = "Pediatrics";
            else if (lower.contains("headache") || lower.contains("neuro") || lower.contains("migraine")) targetSpecialization = "Neurology";
            else if (lower.contains("eye") || lower.contains("vision")) targetSpecialization = "Ophthalmology";
            else if (lower.contains("stomach") || lower.contains("digest")) targetSpecialization = "Gastroenterology";
        }

        List<Doctor> doctors = doctorRepository.findBySpecializationContainingIgnoreCase(targetSpecialization);
        if (doctors.isEmpty()) {
            doctors = doctorRepository.findAll();
        }

        return doctors.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private DoctorDTO mapToDTO(Doctor entity) {
        return new DoctorDTO(
                entity.getDoctorId(),
                entity.getName(),
                entity.getEmail(),
                entity.getPhone(),
                entity.getSpecialization(),
                entity.getDepartment(),
                entity.getExperience(),
                entity.getAvailability()
        );
    }
}
