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
import java.util.Locale;
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
        Patient savedPatient = patientRepository.save(patient);
        savedPatient.setPatientCode(String.format("PAT-%05d", savedPatient.getPatientId()));
        savedPatient = patientRepository.save(savedPatient);

        String username = savedPatient.getPatientCode().toLowerCase(Locale.ROOT);
        String temporaryPassword = "Pat@" + savedPatient.getPatientId() + savedPatient.getPhone().substring(Math.max(0, savedPatient.getPhone().length() - 4));
        if (userRepository.existsByUsername(username)) {
            username = username + savedPatient.getPatientId();
        }

        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(temporaryPassword));
        user.setEmail(savedPatient.getEmail());
        user.setRole(Role.PATIENT);
        user.setEnabled(true);
        user.setPatientId(savedPatient.getPatientId());
        userRepository.save(user);

        PatientDTO response = mapToDTO(savedPatient);
        response.setUsername(username);
        response.setTemporaryPassword(temporaryPassword);
        return response;
    }

    public PatientDTO getPatientById(Long patientId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new PatientNotFoundException("Patient not found with ID: " + patientId));
        return mapToDTO(patient);
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

        Patient updated = patientRepository.save(patient);
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
        return dto;
    }
}
