package com.hospital.management.doctor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Rule-Based implementation of DoctorRecommendationService.
 * Note: Machine Learning integration is planned as a future enhancement.
 */
@Service
@Primary
public class RuleBasedDoctorRecommendationService implements DoctorRecommendationService {

    private final DoctorRepository doctorRepository;

    @Autowired
    public RuleBasedDoctorRecommendationService(DoctorRepository doctorRepository) {
        this.doctorRepository = doctorRepository;
    }

    @Override
    public List<DoctorDTO> recommendDoctorsBySymptoms(String symptoms) {
        if (symptoms == null || symptoms.trim().isEmpty()) {
            return doctorRepository.findAll().stream()
                    .map(this::mapToDTO)
                    .collect(Collectors.toList());
        }

        String lowerSymptoms = symptoms.toLowerCase();
        String targetSpecialization;

        if (lowerSymptoms.contains("chest") || lowerSymptoms.contains("heart") || lowerSymptoms.contains("bp") || lowerSymptoms.contains("cardio")) {
            targetSpecialization = "Cardiology";
        } else if (lowerSymptoms.contains("skin") || lowerSymptoms.contains("rash") || lowerSymptoms.contains("acne") || lowerSymptoms.contains("derma")) {
            targetSpecialization = "Dermatology";
        } else if (lowerSymptoms.contains("bone") || lowerSymptoms.contains("joint") || lowerSymptoms.contains("fracture") || lowerSymptoms.contains("ortho")) {
            targetSpecialization = "Orthopedics";
        } else if (lowerSymptoms.contains("child") || lowerSymptoms.contains("infant") || lowerSymptoms.contains("pedia")) {
            targetSpecialization = "Pediatrics";
        } else if (lowerSymptoms.contains("brain") || lowerSymptoms.contains("headache") || lowerSymptoms.contains("nerve") || lowerSymptoms.contains("neuro")) {
            targetSpecialization = "Neurology";
        } else if (lowerSymptoms.contains("eye") || lowerSymptoms.contains("vision")) {
            targetSpecialization = "Ophthalmology";
        } else {
            targetSpecialization = "General Medicine";
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
