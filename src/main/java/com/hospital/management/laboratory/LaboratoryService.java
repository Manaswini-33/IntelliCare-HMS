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

        String sev = dto.getSeverity() != null ? dto.getSeverity().toUpperCase() : "MEDIUM";
        test.setSeverity(sev);
        int prio = 2;
        if ("CRITICAL".equals(sev)) prio = 4;
        else if ("HIGH".equals(sev)) prio = 3;
        else if ("LOW".equals(sev)) prio = 1;
        test.setPriority(dto.getPriority() != null ? dto.getPriority() : prio);

        test.setVitalsSummary(dto.getVitalsSummary());
        test.setTestType(dto.getTestType());
        test.setDocumentUrl(dto.getDocumentUrl());
        test.setResultNotes(dto.getResultNotes());

        LabTest saved = laboratoryRepository.save(test);
        return mapTestToDTO(saved);
    }

    public LabTestDTO getLabTestById(Long labTestId) {
        LabTest test = laboratoryRepository.findById(labTestId)
                .orElseThrow(() -> new ResourceNotFoundException("Lab test not found with ID: " + labTestId));
        return mapTestToDTO(test);
    }

    public List<LabTestDTO> getAllLabTests() {
        return laboratoryRepository.findAllByOrderByPriorityDescLabTestIdDesc().stream()
                .map(this::mapTestToDTO)
                .collect(Collectors.toList());
    }

    public List<LabTestDTO> getLabTestsByPatient(Long patientId) {
        return laboratoryRepository.findByPatientPatientId(patientId).stream()
                .map(this::mapTestToDTO)
                .collect(Collectors.toList());
    }

    public List<LabTestDTO> getLabTestsByDoctor(Long doctorId) {
        return laboratoryRepository.findByDoctorDoctorIdOrderByPriorityDescLabTestIdDesc(doctorId).stream()
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
    public LabTestDTO completeTestWithDocument(Long labTestId, String resultNotes, String documentUrl) {
        LabTest test = laboratoryRepository.findById(labTestId)
                .orElseThrow(() -> new ResourceNotFoundException("Lab test not found with ID: " + labTestId));

        test.setStatus(LabTestStatus.COMPLETED);
        if (resultNotes != null) test.setResultNotes(resultNotes);
        if (documentUrl != null) test.setDocumentUrl(documentUrl);

        LabTest updated = laboratoryRepository.save(test);

        // Also record a lab result entry
        LabResult result = new LabResult();
        result.setLabTest(updated);
        result.setResult(resultNotes != null ? resultNotes : "Test Completed");
        result.setRemarks("Diagnostic documentation attached");
        result.setResultDate(LocalDate.now());
        labResultRepository.save(result);

        String msg = String.format("Diagnostic results for '%s' are completed and sent to Dr. %s.",
                updated.getTestName(), updated.getDoctor().getName());
        notificationService.createNotification(updated.getPatient().getPhone(), msg, NotificationType.LAB_RESULT);

        return mapTestToDTO(updated);
    }

    @Transactional
    public LabTestDTO uploadReportFile(Long labTestId, org.springframework.web.multipart.MultipartFile file, String resultNotes, String testType) throws java.io.IOException {
        LabTest test = laboratoryRepository.findById(labTestId)
                .orElseThrow(() -> new ResourceNotFoundException("Lab test not found with ID: " + labTestId));

        String uploadDir = "uploads/lab-reports";
        java.nio.file.Path uploadPath = java.nio.file.Paths.get(uploadDir);
        if (!java.nio.file.Files.exists(uploadPath)) {
            java.nio.file.Files.createDirectories(uploadPath);
        }

        String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "report.pdf";
        String cleanName = originalFilename.replaceAll("[^a-zA-Z0-9._-]", "_");
        String filename = labTestId + "_" + System.currentTimeMillis() + "_" + cleanName;
        java.nio.file.Path targetLocation = uploadPath.resolve(filename);
        java.nio.file.Files.copy(file.getInputStream(), targetLocation, java.nio.file.StandardCopyOption.REPLACE_EXISTING);

        String docUrl = "/api/lab-tests/" + labTestId + "/document";
        test.setDocumentUrl(docUrl);
        test.setStatus(LabTestStatus.COMPLETED);
        if (resultNotes != null && !resultNotes.trim().isEmpty()) {
            test.setResultNotes(resultNotes);
        } else {
            test.setResultNotes("Diagnostic file uploaded: " + originalFilename);
        }
        if (testType != null && !testType.trim().isEmpty()) {
            test.setTestType(testType);
        }

        LabTest updated = laboratoryRepository.save(test);

        LabResult result = new LabResult();
        result.setLabTest(updated);
        result.setResult("Diagnostic report uploaded (" + originalFilename + ")");
        result.setRemarks(test.getResultNotes());
        result.setResultDate(LocalDate.now());
        labResultRepository.save(result);

        String msg = String.format("Diagnostic test '%s' report uploaded by Lab Tech and available for Dr. %s.",
                updated.getTestName(), updated.getDoctor().getName());
        notificationService.createNotification(updated.getPatient().getPhone(), msg, NotificationType.LAB_RESULT);

        return mapTestToDTO(updated);
    }

    public java.nio.file.Path getDocumentPath(Long labTestId) {
        String uploadDir = "uploads/lab-reports";
        java.nio.file.Path uploadPath = java.nio.file.Paths.get(uploadDir);
        if (!java.nio.file.Files.exists(uploadPath)) {
            return null;
        }
        try (java.util.stream.Stream<java.nio.file.Path> stream = java.nio.file.Files.list(uploadPath)) {
            return stream
                    .filter(p -> p.getFileName().toString().startsWith(labTestId + "_"))
                    .findFirst()
                    .orElse(null);
        } catch (java.io.IOException e) {
            return null;
        }
    }

    @Transactional
    public LabResultDTO recordLabResult(LabResultDTO dto) {
        LabTest test = laboratoryRepository.findById(dto.getLabTestId())
                .orElseThrow(() -> new ResourceNotFoundException("Lab test not found with ID: " + dto.getLabTestId()));

        test.setStatus(LabTestStatus.COMPLETED);
        test.setResultNotes(dto.getResult());
        laboratoryRepository.save(test);

        LabResult result = new LabResult();
        result.setLabTest(test);
        result.setResult(dto.getResult());
        result.setRemarks(dto.getRemarks());
        result.setResultDate(LocalDate.now());

        LabResult savedResult = labResultRepository.save(result);

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
                entity.getRequestedDate(),
                entity.getSeverity(),
                entity.getPriority(),
                entity.getVitalsSummary(),
                entity.getDocumentUrl(),
                entity.getTestType(),
                entity.getResultNotes()
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
