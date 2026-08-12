package com.hospital.management.emergency;

import com.hospital.management.common.ApiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/emergencies")
public class EmergencyController {

    private final EmergencyService emergencyService;

    @Autowired
    public EmergencyController(EmergencyService emergencyService) {
        this.emergencyService = emergencyService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<EmergencyCase>> registerEmergency(
            @RequestParam Long patientId,
            @RequestParam(required = false, defaultValue = "HIGH") String severity,
            @RequestParam(required = false) String description) {
        EmergencyCase created = emergencyService.registerEmergency(patientId, severity, description);
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
