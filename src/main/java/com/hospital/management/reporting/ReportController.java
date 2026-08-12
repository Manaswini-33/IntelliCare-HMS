package com.hospital.management.reporting;

import com.hospital.management.common.ApiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    @Autowired
    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPatientMedicalReport(@PathVariable Long patientId) {
        Map<String, Object> report = reportService.getPatientMedicalReport(patientId);
        return ResponseEntity.ok(ApiResponse.success("Patient medical report generated", report));
    }

    @GetMapping("/billing/{patientId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPatientBillingReport(@PathVariable Long patientId) {
        Map<String, Object> report = reportService.getPatientBillingReport(patientId);
        return ResponseEntity.ok(ApiResponse.success("Patient billing report generated", report));
    }

    @GetMapping("/appointments")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAppointmentStatistics() {
        Map<String, Object> stats = reportService.getAppointmentStatistics();
        return ResponseEntity.ok(ApiResponse.success("Appointment statistics generated", stats));
    }

    @GetMapping("/statistics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getHospitalStatistics() {
        Map<String, Object> stats = reportService.getHospitalStatistics();
        return ResponseEntity.ok(ApiResponse.success("Hospital statistics generated", stats));
    }
}
