package com.hospital.management.doctor;

import java.util.List;

/**
 * Strategy interface for Doctor Recommendation.
 * Extension point: Allows Rule-Based or future Machine Learning implementations.
 */
public interface DoctorRecommendationService {
    List<DoctorDTO> recommendDoctorsBySymptoms(String symptoms);
}
