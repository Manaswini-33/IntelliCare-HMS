package com.hospital.management.emergency;

import com.hospital.management.common.ApiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

@RestController
@RequestMapping("/api/emergencies")
@PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'DOCTOR')")
public class EmergencyController {

    private final EmergencyService emergencyService;

    @Autowired
    public EmergencyController(EmergencyService emergencyService) {
        this.emergencyService = emergencyService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<EmergencyCase>> registerEmergency(
            @RequestParam Long patientId,
            @RequestParam(required = false, defaultValue = "AUTO") String severity,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) Integer heartRate,
            @RequestParam(required = false) Integer spO2,
            @RequestParam(required = false) Double temperature,
            @RequestParam(required = false) Integer systolicBP,
            @RequestParam(required = false) Integer diastolicBP,
            @RequestParam(required = false) Integer respiratoryRate,
            @RequestParam(required = false) String symptoms) {
        
        EmergencyCase created = emergencyService.registerEmergencyWithVitals(
                patientId, severity, description, heartRate, spO2, temperature, systolicBP, diastolicBP, respiratoryRate, symptoms
        );
        return new ResponseEntity<>(
                ApiResponse.success("Emergency case registered and prioritized successfully", created),
                HttpStatus.CREATED
        );
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<EmergencyCase>>> getAllEmergencies() {
        List<EmergencyCase> list = emergencyService.getAllEmergencies();
        return ResponseEntity.ok(ApiResponse.success("Emergency cases retrieved successfully", list));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<EmergencyCase>>> getActiveEmergencies() {
        List<EmergencyCase> list = emergencyService.getActiveEmergencies();
        return ResponseEntity.ok(ApiResponse.success("Active emergency cases retrieved", list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EmergencyCase>> getEmergencyById(@PathVariable Long id) {
        EmergencyCase emergencyCase = emergencyService.getEmergencyById(id);
        return ResponseEntity.ok(ApiResponse.success("Emergency case retrieved", emergencyCase));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<EmergencyCase>> updateEmergencyStatus(@PathVariable Long id, @RequestParam String status) {
        EmergencyCase updated = emergencyService.updateEmergencyStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("Emergency status updated successfully", updated));
    }
}
