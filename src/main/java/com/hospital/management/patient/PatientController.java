package com.hospital.management.patient;

import com.hospital.management.common.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

@RestController
@RequestMapping("/api/patients")
@PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'DOCTOR', 'PATIENT')")
public class PatientController {

    private final PatientService patientService;

    @Autowired
    public PatientController(PatientService patientService) {
        this.patientService = patientService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PatientDTO>> registerPatient(@Valid @RequestBody PatientDTO patientDTO) {
        PatientDTO created = patientService.registerPatient(patientDTO);
        return new ResponseEntity<>(
                ApiResponse.success("Patient registered successfully", created),
                HttpStatus.CREATED
        );
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<PatientDTO>>> getAllPatients() {
        List<PatientDTO> patients = patientService.getAllPatients();
        return ResponseEntity.ok(ApiResponse.success("Patients retrieved successfully", patients));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<PatientDTO>> getCurrentPatient(org.springframework.security.core.Authentication authentication) {
        String username = authentication != null ? authentication.getName() : null;
        if (username == null || username.isBlank()) {
            return new ResponseEntity<>(ApiResponse.error("Not authenticated"), HttpStatus.UNAUTHORIZED);
        }
        PatientDTO patient = patientService.getPatientByUsername(username);
        return ResponseEntity.ok(ApiResponse.success("Current patient profile retrieved", patient));
    }

    @GetMapping("/by-phone/{phone}")
    public ResponseEntity<ApiResponse<PatientDTO>> getPatientByPhone(@PathVariable String phone) {
        PatientDTO patient = patientService.getPatientByPhone(phone);
        return ResponseEntity.ok(ApiResponse.success("Patient retrieved successfully", patient));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PatientDTO>> getPatientById(@PathVariable Long id) {
        PatientDTO patient = patientService.getPatientById(id);
        return ResponseEntity.ok(ApiResponse.success("Patient retrieved successfully", patient));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<PatientDTO>>> searchPatients(@RequestParam String query) {
        List<PatientDTO> patients = patientService.searchPatients(query);
        return ResponseEntity.ok(ApiResponse.success("Patients search completed", patients));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PatientDTO>> updatePatient(@PathVariable Long id, @Valid @RequestBody PatientDTO patientDTO) {
        PatientDTO updated = patientService.updatePatient(id, patientDTO);
        return ResponseEntity.ok(ApiResponse.success("Patient updated successfully", updated));
    }

    @PutMapping("/{id}/profile")
    public ResponseEntity<ApiResponse<PatientDTO>> completeProfile(@PathVariable Long id, @RequestBody PatientDTO patientDTO) {
        PatientDTO updated = patientService.completeProfile(id, patientDTO);
        return ResponseEntity.ok(ApiResponse.success("Patient profile completed successfully", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePatient(@PathVariable Long id) {
        patientService.deletePatient(id);
        return ResponseEntity.ok(ApiResponse.success("Patient deleted successfully"));
    }
}
