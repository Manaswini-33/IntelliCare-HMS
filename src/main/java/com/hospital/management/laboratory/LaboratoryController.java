package com.hospital.management.laboratory;

import com.hospital.management.common.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@PreAuthorize("hasAnyRole('ADMIN', 'LAB_TECHNICIAN', 'DOCTOR', 'PATIENT')")
public class LaboratoryController {

    private final LaboratoryService laboratoryService;

    @Autowired
    public LaboratoryController(LaboratoryService laboratoryService) {
        this.laboratoryService = laboratoryService;
    }

    @PostMapping("/lab-tests")
    public ResponseEntity<ApiResponse<LabTestDTO>> requestLabTest(@Valid @RequestBody LabTestDTO dto) {
        LabTestDTO created = laboratoryService.requestLabTest(dto);
        return new ResponseEntity<>(
                ApiResponse.success("Lab test requested successfully", created),
                HttpStatus.CREATED
        );
    }

    @GetMapping("/lab-tests")
    public ResponseEntity<ApiResponse<List<LabTestDTO>>> getAllLabTests() {
        List<LabTestDTO> list = laboratoryService.getAllLabTests();
        return ResponseEntity.ok(ApiResponse.success("Lab tests retrieved successfully", list));
    }

    @GetMapping("/lab-tests/{id}")
    public ResponseEntity<ApiResponse<LabTestDTO>> getLabTestById(@PathVariable Long id) {
        LabTestDTO test = laboratoryService.getLabTestById(id);
        return ResponseEntity.ok(ApiResponse.success("Lab test retrieved successfully", test));
    }

    @GetMapping("/lab-tests/patient/{patientId}")
    public ResponseEntity<ApiResponse<List<LabTestDTO>>> getLabTestsByPatient(@PathVariable Long patientId) {
        List<LabTestDTO> list = laboratoryService.getLabTestsByPatient(patientId);
        return ResponseEntity.ok(ApiResponse.success("Patient lab tests retrieved", list));
    }

    @GetMapping("/lab-tests/doctor/{doctorId}")
    public ResponseEntity<ApiResponse<List<LabTestDTO>>> getLabTestsByDoctor(@PathVariable Long doctorId) {
        List<LabTestDTO> list = laboratoryService.getLabTestsByDoctor(doctorId);
        return ResponseEntity.ok(ApiResponse.success("Doctor lab tests retrieved", list));
    }

    @PutMapping("/lab-tests/{id}")
    public ResponseEntity<ApiResponse<LabTestDTO>> updateLabTestStatus(@PathVariable Long id, @RequestParam LabTestStatus status) {
        LabTestDTO updated = laboratoryService.updateLabTestStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("Lab test status updated successfully", updated));
    }

    @PutMapping("/lab-tests/{id}/complete")
    public ResponseEntity<ApiResponse<LabTestDTO>> completeLabTest(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        String resultNotes = body != null ? body.get("resultNotes") : null;
        String documentUrl = body != null ? body.get("documentUrl") : null;
        LabTestDTO updated = laboratoryService.completeTestWithDocument(id, resultNotes, documentUrl);
        return ResponseEntity.ok(ApiResponse.success("Lab test completed and report released", updated));
    }

    @PostMapping(value = "/lab-tests/{id}/upload", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<LabTestDTO>> uploadLabTestDocument(
            @PathVariable Long id,
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file,
            @RequestParam(value = "resultNotes", required = false) String resultNotes,
            @RequestParam(value = "testType", required = false) String testType) {
        try {
            LabTestDTO updated = laboratoryService.uploadReportFile(id, file, resultNotes, testType);
            return ResponseEntity.ok(ApiResponse.success("Lab diagnostic report uploaded successfully", updated));
        } catch (java.io.IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to upload diagnostic report: " + e.getMessage()));
        }
    }

    @GetMapping("/lab-tests/{id}/document")
    public ResponseEntity<org.springframework.core.io.Resource> getLabDocument(@PathVariable Long id) {
        try {
            java.nio.file.Path filePath = laboratoryService.getDocumentPath(id);
            if (filePath == null || !java.nio.file.Files.exists(filePath)) {
                return ResponseEntity.notFound().build();
            }
            org.springframework.core.io.Resource resource = new org.springframework.core.io.UrlResource(filePath.toUri());
            String contentType = java.nio.file.Files.probeContentType(filePath);
            if (contentType == null) {
                contentType = "application/octet-stream";
            }
            return ResponseEntity.ok()
                    .contentType(org.springframework.http.MediaType.parseMediaType(contentType))
                    .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filePath.getFileName().toString() + "\"")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/lab-results")
    public ResponseEntity<ApiResponse<LabResultDTO>> recordLabResult(@Valid @RequestBody LabResultDTO dto) {
        LabResultDTO created = laboratoryService.recordLabResult(dto);
        return new ResponseEntity<>(
                ApiResponse.success("Lab result recorded successfully", created),
                HttpStatus.CREATED
        );
    }

    @GetMapping("/lab-results/{id}")
    public ResponseEntity<ApiResponse<LabResultDTO>> getLabResultById(@PathVariable Long id) {
        LabResultDTO result = laboratoryService.getLabResultById(id);
        return ResponseEntity.ok(ApiResponse.success("Lab result retrieved successfully", result));
    }
}
