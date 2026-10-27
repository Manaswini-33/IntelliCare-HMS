package com.hospital.management.patient;

import com.hospital.management.exception.ConflictException;
import com.hospital.management.exception.PatientNotFoundException;
import com.hospital.management.security.Role;
import com.hospital.management.security.User;
import com.hospital.management.security.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class PatientService {

    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public PatientService(PatientRepository patientRepository,
                          UserRepository userRepository,
                          PasswordEncoder passwordEncoder) {
        this.patientRepository = patientRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public PatientDTO registerPatient(PatientDTO patientDTO) {
        if (patientRepository.existsByPhone(patientDTO.getPhone())) {
            throw new ConflictException("An existing patient already uses this phone number. Search and reuse the existing record.");
        }

        Patient patient = mapToEntity(patientDTO);
        patient.setActive(true);
        if (patient.getProfileCompleted() == null) {
            patient.setProfileCompleted(false);
        }
        Patient savedPatient = patientRepository.save(patient);
        savedPatient.setPatientCode(String.format("PAT-%05d", savedPatient.getPatientId()));
        final Patient finalSavedPatient = patientRepository.save(savedPatient);

        String username = finalSavedPatient.getPhone().trim();
        String initialPassword = username; // User prompt: use mobile number as username and initial password
        final Long patientId = finalSavedPatient.getPatientId();

        User user = userRepository.findByUsername(username)
                .or(() -> userRepository.findByPatientId(patientId))
                .orElse(null);

        if (user == null) {
            user = new User();
            user.setUsername(username);
            user.setPassword(passwordEncoder.encode(initialPassword));
            user.setEmail(finalSavedPatient.getEmail());
            user.setRole(Role.PATIENT);
            user.setEnabled(true);
            user.setPatientId(patientId);
            userRepository.save(user);
        } else {
            user.setPatientId(patientId);
            userRepository.save(user);
        }

        PatientDTO response = mapToDTO(finalSavedPatient);
        response.setUsername(username);
        response.setTemporaryPassword(initialPassword);
        return response;
    }

    public PatientDTO getPatientById(Long patientId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new PatientNotFoundException("Patient not found with ID: " + patientId));
        return mapToDTO(patient);
    }

    public PatientDTO getPatientByPhone(String phone) {
        Patient patient = patientRepository.findByPhone(phone)
                .orElseThrow(() -> new PatientNotFoundException("Patient not found with phone: " + phone));
        return mapToDTO(patient);
    }

    public PatientDTO getPatientByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new PatientNotFoundException("User not found with username: " + username));
        if (user.getPatientId() == null) {
            return patientRepository.findByPhone(username)
                    .map(this::mapToDTO)
                    .orElseThrow(() -> new PatientNotFoundException("No patient profile associated with user: " + username));
        }
        return getPatientById(user.getPatientId());
    }

    public List<PatientDTO> getAllPatients() {
        return patientRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<PatientDTO> searchPatients(String query) {
        if (query == null || query.isBlank()) {
            return getAllPatients();
        }
        String trimmed = query.trim();
        Map<Long, Patient> unique = new LinkedHashMap<>();
        patientRepository.findByPatientCode(trimmed).ifPresent(p -> unique.put(p.getPatientId(), p));
        patientRepository.findByPhone(trimmed).ifPresent(p -> unique.put(p.getPatientId(), p));
        for (Patient patient : patientRepository.findByNameContainingIgnoreCase(trimmed)) {
            unique.put(patient.getPatientId(), patient);
        }
        for (Patient patient : patientRepository.findByPhoneContaining(trimmed)) {
            unique.put(patient.getPatientId(), patient);
        }
        return new ArrayList<>(unique.values()).stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Transactional
    public PatientDTO updatePatient(Long patientId, PatientDTO patientDTO) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new PatientNotFoundException("Patient not found with ID: " + patientId));

        patient.setName(patientDTO.getName());
        patient.setAge(patientDTO.getAge());
        patient.setGender(patientDTO.getGender());
        patient.setPhone(patientDTO.getPhone());
        patient.setEmail(patientDTO.getEmail());
        patient.setAddress(patientDTO.getAddress());
        patient.setBloodGroup(patientDTO.getBloodGroup());
        patient.setAllergies(patientDTO.getAllergies());
        if (patientDTO.getDateOfBirth() != null) patient.setDateOfBirth(patientDTO.getDateOfBirth());
        if (patientDTO.getGuardianName() != null) patient.setGuardianName(patientDTO.getGuardianName());
        if (patientDTO.getGuardianRelation() != null) patient.setGuardianRelation(patientDTO.getGuardianRelation());
        if (patientDTO.getProfileCompleted() != null) patient.setProfileCompleted(patientDTO.getProfileCompleted());

        Patient updated = patientRepository.save(patient);
        return mapToDTO(updated);
    }

    @Transactional
    public PatientDTO completeProfile(Long patientId, PatientDTO patientDTO) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new PatientNotFoundException("Patient not found with ID: " + patientId));

        if (patientDTO.getName() != null && !patientDTO.getName().isBlank()) patient.setName(patientDTO.getName().trim());
        if (patientDTO.getEmail() != null) patient.setEmail(patientDTO.getEmail().trim());
        if (patientDTO.getDateOfBirth() != null) patient.setDateOfBirth(patientDTO.getDateOfBirth().trim());
        if (patientDTO.getGender() != null) patient.setGender(patientDTO.getGender());
        if (patientDTO.getAddress() != null) patient.setAddress(patientDTO.getAddress().trim());
        if (patientDTO.getGuardianName() != null) patient.setGuardianName(patientDTO.getGuardianName().trim());
        if (patientDTO.getGuardianRelation() != null) patient.setGuardianRelation(patientDTO.getGuardianRelation().trim());
        if (patientDTO.getBloodGroup() != null) patient.setBloodGroup(patientDTO.getBloodGroup());
        if (patientDTO.getAllergies() != null) patient.setAllergies(patientDTO.getAllergies());
        patient.setProfileCompleted(true);

        Patient updated = patientRepository.save(patient);

        // Also update User email if present
        userRepository.findByPatientId(patientId).ifPresent(user -> {
            if (patientDTO.getEmail() != null && !patientDTO.getEmail().isBlank()) {
                user.setEmail(patientDTO.getEmail().trim());
                userRepository.save(user);
            }
        });

        return mapToDTO(updated);
    }

    @Transactional
    public void deletePatient(Long patientId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new PatientNotFoundException("Patient not found with ID: " + patientId));
        patient.setActive(false);
        patientRepository.save(patient);
    }

    public Patient mapToEntity(PatientDTO dto) {
        Patient patient = new Patient();
        patient.setPatientId(dto.getPatientId());
        patient.setName(dto.getName());
        patient.setAge(dto.getAge());
        patient.setGender(dto.getGender());
        patient.setPhone(dto.getPhone());
        patient.setEmail(dto.getEmail());
        patient.setAddress(dto.getAddress());
        patient.setBloodGroup(dto.getBloodGroup());
        patient.setAllergies(dto.getAllergies());
        patient.setDateOfBirth(dto.getDateOfBirth());
        patient.setGuardianName(dto.getGuardianName());
        patient.setGuardianRelation(dto.getGuardianRelation());
        patient.setProfileCompleted(dto.getProfileCompleted());
        return patient;
    }

    public PatientDTO mapToDTO(Patient entity) {
        PatientDTO dto = new PatientDTO(
                entity.getPatientId(),
                entity.getName(),
                entity.getAge(),
                entity.getGender(),
                entity.getPhone(),
                entity.getEmail(),
                entity.getAddress(),
                entity.getBloodGroup(),
                entity.getAllergies()
        );
        dto.setPatientCode(entity.getPatientCode());
        dto.setActive(entity.isActive());
        dto.setDateOfBirth(entity.getDateOfBirth());
        dto.setGuardianName(entity.getGuardianName());
        dto.setGuardianRelation(entity.getGuardianRelation());
        dto.setProfileCompleted(entity.getProfileCompleted());
        return dto;
    }
}
