package com.hospital.management.pharmacy;

import com.hospital.management.exception.AllergyConflictException;
import com.hospital.management.exception.InsufficientStockException;
import com.hospital.management.patient.Patient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

class MedicationSafetyServiceTest {

    @Mock
    private PharmacyRepository pharmacyRepository;

    @InjectMocks
    private MedicationSafetyService medicationSafetyService;

    private Patient allergicPatient;
    private Patient normalPatient;
    private Medicine medicine;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        allergicPatient = new Patient(1L, "Bob", 40, "Male", "123456", "bob@test.com", "Address", "B+", "Aspirin, Penicillin");
        normalPatient = new Patient(2L, "Alice", 30, "Female", "654321", "alice@test.com", "Address", "A+", "None");
        medicine = new Medicine(5L, "Penicillin", "Antibiotic", 100, "500mg", null, 15.0);
    }

    @Test
    void validatePrescriptionSafety_AllergyMatch_ThrowsException() {
        PrescriptionItemDTO item = new PrescriptionItemDTO(5L, "Penicillin", 10, "500mg");
        when(pharmacyRepository.findById(5L)).thenReturn(Optional.of(medicine));

        assertThrows(AllergyConflictException.class, () ->
                medicationSafetyService.validatePrescriptionSafety(allergicPatient, Collections.singletonList(item))
        );
    }

    @Test
    void validatePrescriptionSafety_InsufficientStock_ThrowsException() {
        medicine.setStockQuantity(5); // Only 5 available
        PrescriptionItemDTO item = new PrescriptionItemDTO(5L, "Penicillin", 20, "500mg"); // Request 20
        when(pharmacyRepository.findById(5L)).thenReturn(Optional.of(medicine));

        assertThrows(InsufficientStockException.class, () ->
                medicationSafetyService.validatePrescriptionSafety(normalPatient, Collections.singletonList(item))
        );
    }

    @Test
    void validatePrescriptionSafety_Success() {
        PrescriptionItemDTO item = new PrescriptionItemDTO(5L, "Penicillin", 10, "500mg");
        when(pharmacyRepository.findById(5L)).thenReturn(Optional.of(medicine));

        assertDoesNotThrow(() ->
                medicationSafetyService.validatePrescriptionSafety(normalPatient, Collections.singletonList(item))
        );
    }
}
