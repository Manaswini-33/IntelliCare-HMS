package com.hospital.management.medicalrecord;

import com.hospital.management.doctor.Doctor;
import com.hospital.management.doctor.DoctorRepository;
import com.hospital.management.exception.ResourceNotFoundException;
import com.hospital.management.patient.Patient;
import com.hospital.management.patient.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MedicalRecordService {

    private final MedicalRecordRepository medicalRecordRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;

    @Autowired
    public MedicalRecordService(MedicalRecordRepository medicalRecordRepository,
                                PatientRepository patientRepository,
                                DoctorRepository doctorRepository) {
        this.medicalRecordRepository = medicalRecordRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
    }

    @Transactional
    public MedicalRecordDTO createRecord(MedicalRecordDTO dto) {
        Patient patient = patientRepository.findById(dto.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + dto.getPatientId()));

        Doctor doctor = doctorRepository.findById(dto.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with ID: " + dto.getDoctorId()));

        MedicalRecord record = new MedicalRecord();
        record.setPatient(patient);
        record.setDoctor(doctor);
        record.setDiagnosis(dto.getDiagnosis());
        record.setPrescription(dto.getPrescription());
        record.setVisitDate(dto.getVisitDate() != null ? dto.getVisitDate() : LocalDate.now());
        record.setNotes(dto.getNotes());

        MedicalRecord saved = medicalRecordRepository.save(record);
        return mapToDTO(saved);
    }

    public MedicalRecordDTO getRecordById(Long recordId) {
        MedicalRecord record = medicalRecordRepository.findById(recordId)
                .orElseThrow(() -> new ResourceNotFoundException("Medical record not found with ID: " + recordId));
        return mapToDTO(record);
    }

    public List<MedicalRecordDTO> getPatientHistory(Long patientId) {
        return medicalRecordRepository.findByPatientPatientId(patientId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<MedicalRecordDTO> searchByDiagnosis(String diagnosis) {
        return medicalRecordRepository.findByDiagnosisContainingIgnoreCase(diagnosis).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public MedicalRecordDTO updateRecord(Long recordId, MedicalRecordDTO dto) {
        MedicalRecord record = medicalRecordRepository.findById(recordId)
                .orElseThrow(() -> new ResourceNotFoundException("Medical record not found with ID: " + recordId));

        record.setDiagnosis(dto.getDiagnosis());
        record.setPrescription(dto.getPrescription());
        record.setNotes(dto.getNotes());
        if (dto.getVisitDate() != null) {
            record.setVisitDate(dto.getVisitDate());
        }

        MedicalRecord updated = medicalRecordRepository.save(record);
        return mapToDTO(updated);
    }

    public MedicalRecordDTO mapToDTO(MedicalRecord entity) {
        return new MedicalRecordDTO(
                entity.getRecordId(),
                entity.getPatient().getPatientId(),
                entity.getPatient().getName(),
                entity.getDoctor().getDoctorId(),
                entity.getDoctor().getName(),
                entity.getDiagnosis(),
                entity.getPrescription(),
                entity.getVisitDate(),
                entity.getNotes()
        );
    }
}
