package com.hospital.management.patient;

import com.hospital.management.exception.ResourceNotFoundException;
import com.hospital.management.security.User;
import com.hospital.management.security.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

class PatientServiceTest {

    @Mock
    private PatientRepository patientRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private PatientService patientService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void registerPatient_Success() {
        PatientDTO dto = new PatientDTO(null, "John Doe", 30, "Male", "9876543210", "john@example.com", "123 Main St", "O+", "Penicillin");
        Patient savedPatient = new Patient(1L, "John Doe", 30, "Male", "9876543210", "john@example.com", "123 Main St", "O+", "Penicillin");

        when(patientRepository.existsByPhone(anyString())).thenReturn(false);
        when(patientRepository.save(any(Patient.class))).thenReturn(savedPatient);
        when(userRepository.existsByUsername(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(new User());

        PatientDTO result = patientService.registerPatient(dto);

        assertNotNull(result);
        assertEquals(1L, result.getPatientId());
        assertEquals("John Doe", result.getName());
        verify(patientRepository, times(2)).save(any(Patient.class));
    }

    @Test
    void getPatientById_NotFound_ThrowsException() {
        when(patientRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> patientService.getPatientById(99L));
    }
}
