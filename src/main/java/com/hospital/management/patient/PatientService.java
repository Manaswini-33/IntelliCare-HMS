package com.hospital.management.patient;

import com.hospital.management.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PatientService {

    private final PatientRepository patientRepository;

    @Autowired
    public PatientService(PatientRepository patientRepository) {
        this.patientRepository = patientRepository;
    }

    @Transactional
    public PatientDTO registerPatient(PatientDTO patientDTO) {
        Patient patient = mapToEntity(patientDTO);
        Patient savedPatient = patientRepository.save(patient);
        return mapToDTO(savedPatient);
    }

    public PatientDTO getPatientById(Long patientId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + patientId));
        return mapToDTO(patient);
    }

    public List<PatientDTO> getAllPatients() {
        return patientRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<PatientDTO> searchPatients(String query) {
        return patientRepository.findByNameContainingIgnoreCase(query).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public PatientDTO updatePatient(Long patientId, PatientDTO patientDTO) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + patientId));

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
        if (!patientRepository.existsById(patientId)) {
            throw new ResourceNotFoundException("Patient not found with ID: " + patientId);
        }
        patientRepository.deleteById(patientId);
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
        return new PatientDTO(
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
    }
}
