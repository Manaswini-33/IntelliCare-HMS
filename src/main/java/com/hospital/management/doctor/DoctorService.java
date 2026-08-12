package com.hospital.management.doctor;

import com.hospital.management.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DoctorService {

    private final DoctorRepository doctorRepository;

    @Autowired
    public DoctorService(DoctorRepository doctorRepository) {
        this.doctorRepository = doctorRepository;
    }

    @Transactional
    public DoctorDTO registerDoctor(DoctorDTO doctorDTO) {
        Doctor doctor = mapToEntity(doctorDTO);
        Doctor savedDoctor = doctorRepository.save(doctor);
        return mapToDTO(savedDoctor);
    }

    public DoctorDTO getDoctorById(Long doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with ID: " + doctorId));
        return mapToDTO(doctor);
    }

    public List<DoctorDTO> getAllDoctors() {
        return doctorRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<DoctorDTO> searchDoctors(String query) {
        return doctorRepository.findByNameContainingIgnoreCase(query).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<DoctorDTO> getDoctorsBySpecialization(String specialization) {
        return doctorRepository.findBySpecializationContainingIgnoreCase(specialization).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public DoctorDTO updateDoctor(Long doctorId, DoctorDTO doctorDTO) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with ID: " + doctorId));

        doctor.setName(doctorDTO.getName());
        doctor.setEmail(doctorDTO.getEmail());
        doctor.setPhone(doctorDTO.getPhone());
        doctor.setSpecialization(doctorDTO.getSpecialization());
        doctor.setDepartment(doctorDTO.getDepartment());
        doctor.setExperience(doctorDTO.getExperience());
        doctor.setAvailability(doctorDTO.getAvailability());

        Doctor updated = doctorRepository.save(doctor);
        return mapToDTO(updated);
    }

    @Transactional
    public void deleteDoctor(Long doctorId) {
        if (!doctorRepository.existsById(doctorId)) {
            throw new ResourceNotFoundException("Doctor not found with ID: " + doctorId);
        }
        doctorRepository.deleteById(doctorId);
    }

    public Doctor mapToEntity(DoctorDTO dto) {
        Doctor doctor = new Doctor();
        doctor.setDoctorId(dto.getDoctorId());
        doctor.setName(dto.getName());
        doctor.setEmail(dto.getEmail());
        doctor.setPhone(dto.getPhone());
        doctor.setSpecialization(dto.getSpecialization());
        doctor.setDepartment(dto.getDepartment());
        doctor.setExperience(dto.getExperience());
        doctor.setAvailability(dto.getAvailability());
        return doctor;
    }

    public DoctorDTO mapToDTO(Doctor entity) {
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
