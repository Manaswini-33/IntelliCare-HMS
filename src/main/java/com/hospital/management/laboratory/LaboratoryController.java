package com.hospital.management.laboratory;

import com.hospital.management.common.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
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

    @PutMapping("/lab-tests/{id}")
    public ResponseEntity<ApiResponse<LabTestDTO>> updateLabTestStatus(@PathVariable Long id, @RequestParam LabTestStatus status) {
        LabTestDTO updated = laboratoryService.updateLabTestStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("Lab test status updated successfully", updated));
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
