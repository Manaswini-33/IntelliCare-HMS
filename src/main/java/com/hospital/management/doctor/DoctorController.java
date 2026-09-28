package com.hospital.management.doctor;

import com.hospital.management.common.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

@RestController
@RequestMapping("/api/doctors")
@PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'PATIENT')")
public class DoctorController {

    private final DoctorService doctorService;
    private final DoctorRecommendationService doctorRecommendationService;

    @Autowired
    public DoctorController(DoctorService doctorService, DoctorRecommendationService doctorRecommendationService) {
        this.doctorService = doctorService;
        this.doctorRecommendationService = doctorRecommendationService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<DoctorDTO>> registerDoctor(@Valid @RequestBody DoctorDTO doctorDTO) {
        DoctorDTO created = doctorService.registerDoctor(doctorDTO);
        return new ResponseEntity<>(
                ApiResponse.success("Doctor registered successfully", created),
                HttpStatus.CREATED
        );
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<DoctorDTO>>> getAllDoctors() {
        List<DoctorDTO> doctors = doctorService.getAllDoctors();
        return ResponseEntity.ok(ApiResponse.success("Doctors retrieved successfully", doctors));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DoctorDTO>> getDoctorById(@PathVariable Long id) {
        DoctorDTO doctor = doctorService.getDoctorById(id);
        return ResponseEntity.ok(ApiResponse.success("Doctor retrieved successfully", doctor));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<DoctorDTO>>> searchDoctors(@RequestParam String query) {
        List<DoctorDTO> doctors = doctorService.searchDoctors(query);
        return ResponseEntity.ok(ApiResponse.success("Doctors search completed", doctors));
    }

    @GetMapping("/recommend")
    public ResponseEntity<ApiResponse<List<DoctorDTO>>> recommendDoctors(@RequestParam(required = false) String symptoms) {
        List<DoctorDTO> recommended = doctorRecommendationService.recommendDoctorsBySymptoms(symptoms);
        return ResponseEntity.ok(ApiResponse.success("Rule-based doctor recommendations retrieved", recommended));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<DoctorDTO>> updateDoctor(@PathVariable Long id, @Valid @RequestBody DoctorDTO doctorDTO) {
        DoctorDTO updated = doctorService.updateDoctor(id, doctorDTO);
        return ResponseEntity.ok(ApiResponse.success("Doctor updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteDoctor(@PathVariable Long id) {
        doctorService.deleteDoctor(id);
        return ResponseEntity.ok(ApiResponse.success("Doctor deleted successfully"));
    }
}
