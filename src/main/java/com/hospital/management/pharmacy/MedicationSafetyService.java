package com.hospital.management.pharmacy;

import com.hospital.management.patient.Patient;

import java.util.List;

/**
 * Strategy interface for Medication Safety Check.
 * Extension point: Allows Rule-Based or future Machine Learning implementations.
 */
public interface MedicationSafetyService {
    void validatePrescriptionSafety(Patient patient, List<PrescriptionItemDTO> items);
}
