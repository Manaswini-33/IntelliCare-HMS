package com.hospital.management.pharmacy;

import com.hospital.management.exception.AllergyConflictException;
import com.hospital.management.exception.InsufficientStockException;
import com.hospital.management.exception.ResourceNotFoundException;
import com.hospital.management.patient.Patient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Rule-Based Medication Safety Service.
 * Note: Machine Learning is a future enhancement.
 * Performs rule-based validation for allergies, stock levels, and duplicates.
 */
@Service
public class MedicationSafetyService {

    private final PharmacyRepository pharmacyRepository;

    @Autowired
    public MedicationSafetyService(PharmacyRepository pharmacyRepository) {
        this.pharmacyRepository = pharmacyRepository;
    }

    public void validatePrescriptionSafety(Patient patient, List<PrescriptionItemDTO> items) {
        Set<Long> seenMedicineIds = new HashSet<>();

        for (PrescriptionItemDTO itemDTO : items) {
            // 1. Check duplicate items in same prescription
            if (!seenMedicineIds.add(itemDTO.getMedicineId())) {
                throw new IllegalArgumentException("Duplicate medicine in prescription items (ID: " + itemDTO.getMedicineId() + ")");
            }

            Medicine medicine = pharmacyRepository.findById(itemDTO.getMedicineId())
                    .orElseThrow(() -> new ResourceNotFoundException("Medicine not found with ID: " + itemDTO.getMedicineId()));

            // 2. Allergy Check (Rule-Based)
            if (patient.getAllergies() != null && !patient.getAllergies().trim().isEmpty()) {
                String allergies = patient.getAllergies().toLowerCase();
                String medName = medicine.getMedicineName().toLowerCase();

                if (allergies.contains(medName) || medName.contains(allergies)) {
                    throw new AllergyConflictException(
                            String.format("CRITICAL MEDICATION SAFETY WARNING: Patient %s has a recorded allergy matching prescribed medicine '%s'!",
                                    patient.getName(), medicine.getMedicineName())
                    );
                }
            }

            // 3. Stock Check
            if (medicine.getStockQuantity() < itemDTO.getQuantity()) {
                throw new InsufficientStockException(
                        String.format("Insufficient stock for medicine '%s'. Available: %d, Requested: %d",
                                medicine.getMedicineName(), medicine.getStockQuantity(), itemDTO.getQuantity())
                );
            }
        }
    }
}
