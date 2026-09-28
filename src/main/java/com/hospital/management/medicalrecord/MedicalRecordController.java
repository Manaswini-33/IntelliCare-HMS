package com.hospital.management.medicalrecord;

import com.hospital.management.common.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

@RestController
@RequestMapping("/api/medical-records")
@PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'PATIENT')")
public class MedicalRecordController {

    private final MedicalRecordService medicalRecordService;

    @Autowired
    public MedicalRecordController(MedicalRecordService medicalRecordService) {
        this.medicalRecordService = medicalRecordService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<MedicalRecordDTO>> createRecord(@Valid @RequestBody MedicalRecordDTO dto) {
        MedicalRecordDTO created = medicalRecordService.createRecord(dto);
        return new ResponseEntity<>(
                ApiResponse.success("Medical record created successfully", created),
                HttpStatus.CREATED
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MedicalRecordDTO>> getRecordById(@PathVariable Long id) {
        MedicalRecordDTO record = medicalRecordService.getRecordById(id);
        return ResponseEntity.ok(ApiResponse.success("Medical record retrieved successfully", record));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<ApiResponse<List<MedicalRecordDTO>>> getPatientHistory(@PathVariable Long patientId) {
        List<MedicalRecordDTO> history = medicalRecordService.getPatientHistory(patientId);
        return ResponseEntity.ok(ApiResponse.success("Patient medical history retrieved successfully", history));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<MedicalRecordDTO>>> searchByDiagnosis(@RequestParam String diagnosis) {
        List<MedicalRecordDTO> results = medicalRecordService.searchByDiagnosis(diagnosis);
        return ResponseEntity.ok(ApiResponse.success("Medical record search completed", results));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<MedicalRecordDTO>> updateRecord(@PathVariable Long id, @Valid @RequestBody MedicalRecordDTO dto) {
        MedicalRecordDTO updated = medicalRecordService.updateRecord(id, dto);
        return ResponseEntity.ok(ApiResponse.success("Medical record updated successfully", updated));
    }
}
