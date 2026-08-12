package com.hospital.management.laboratory;

import com.hospital.management.doctor.Doctor;
import com.hospital.management.doctor.DoctorRepository;
import com.hospital.management.exception.ResourceNotFoundException;
import com.hospital.management.notification.NotificationService;
import com.hospital.management.notification.NotificationType;
import com.hospital.management.patient.Patient;
import com.hospital.management.patient.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LaboratoryService {

    private final LaboratoryRepository laboratoryRepository;
    private final LabResultRepository labResultRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final NotificationService notificationService;

    @Autowired
    public LaboratoryService(LaboratoryRepository laboratoryRepository,
                             LabResultRepository labResultRepository,
                             PatientRepository patientRepository,
                             DoctorRepository doctorRepository,
                             NotificationService notificationService) {
        this.laboratoryRepository = laboratoryRepository;
        this.labResultRepository = labResultRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public LabTestDTO requestLabTest(LabTestDTO dto) {
        Patient patient = patientRepository.findById(dto.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + dto.getPatientId()));

        Doctor doctor = doctorRepository.findById(dto.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with ID: " + dto.getDoctorId()));

        LabTest test = new LabTest();
        test.setPatient(patient);
        test.setDoctor(doctor);
        test.setTestName(dto.getTestName());
        test.setStatus(LabTestStatus.REQUESTED);
        test.setRequestedDate(LocalDate.now());

        LabTest saved = laboratoryRepository.save(test);
        return mapTestToDTO(saved);
    }

    public LabTestDTO getLabTestById(Long labTestId) {
        LabTest test = laboratoryRepository.findById(labTestId)
                .orElseThrow(() -> new ResourceNotFoundException("Lab test not found with ID: " + labTestId));
        return mapTestToDTO(test);
    }

    public List<LabTestDTO> getAllLabTests() {
        return laboratoryRepository.findAll().stream()
                .map(this::mapTestToDTO)
                .collect(Collectors.toList());
    }

    public List<LabTestDTO> getLabTestsByPatient(Long patientId) {
        return laboratoryRepository.findByPatientPatientId(patientId).stream()
                .map(this::mapTestToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public LabTestDTO updateLabTestStatus(Long labTestId, LabTestStatus status) {
        LabTest test = laboratoryRepository.findById(labTestId)
                .orElseThrow(() -> new ResourceNotFoundException("Lab test not found with ID: " + labTestId));

        test.setStatus(status);
        LabTest updated = laboratoryRepository.save(test);
        return mapTestToDTO(updated);
    }

    @Transactional
    public LabResultDTO recordLabResult(LabResultDTO dto) {
        LabTest test = laboratoryRepository.findById(dto.getLabTestId())
                .orElseThrow(() -> new ResourceNotFoundException("Lab test not found with ID: " + dto.getLabTestId()));

        test.setStatus(LabTestStatus.COMPLETED);
        laboratoryRepository.save(test);

        LabResult result = new LabResult();
        result.setLabTest(test);
        result.setResult(dto.getResult());
        result.setRemarks(dto.getRemarks());
        result.setResultDate(LocalDate.now());

        LabResult savedResult = labResultRepository.save(result);

        // Notify patient & doctor
        String msg = String.format("Lab Result Available for test '%s': %s", test.getTestName(), dto.getResult());
        notificationService.createNotification(test.getPatient().getPhone(), msg, NotificationType.LAB_RESULT);

        return mapResultToDTO(savedResult);
    }

    public LabResultDTO getLabResultById(Long resultId) {
        LabResult result = labResultRepository.findById(resultId)
                .orElseThrow(() -> new ResourceNotFoundException("Lab result not found with ID: " + resultId));
        return mapResultToDTO(result);
    }

    public LabResultDTO getLabResultByTestId(Long labTestId) {
        LabResult result = labResultRepository.findByLabTestLabTestId(labTestId)
                .orElseThrow(() -> new ResourceNotFoundException("Lab result not found for test ID: " + labTestId));
        return mapResultToDTO(result);
    }

    public LabTestDTO mapTestToDTO(LabTest entity) {
        return new LabTestDTO(
                entity.getLabTestId(),
                entity.getPatient().getPatientId(),
                entity.getPatient().getName(),
                entity.getDoctor().getDoctorId(),
                entity.getDoctor().getName(),
                entity.getTestName(),
                entity.getStatus(),
                entity.getRequestedDate()
        );
    }

    public LabResultDTO mapResultToDTO(LabResult entity) {
        return new LabResultDTO(
                entity.getResultId(),
                entity.getLabTest().getLabTestId(),
                entity.getLabTest().getTestName(),
                entity.getLabTest().getPatient().getPatientId(),
                entity.getLabTest().getPatient().getName(),
                entity.getResult(),
                entity.getRemarks(),
                entity.getResultDate()
        );
    }
}
