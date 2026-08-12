package com.hospital.management.monitoring;

import com.hospital.management.appointment.AppointmentRepository;
import com.hospital.management.billing.BillingRepository;
import com.hospital.management.common.ApiResponse;
import com.hospital.management.doctor.DoctorRepository;
import com.hospital.management.patient.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.lang.management.ManagementFactory;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/monitoring")
public class MonitoringController {

    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;
    private final BillingRepository billingRepository;

    @Autowired
    public MonitoringController(PatientRepository patientRepository,
                                DoctorRepository doctorRepository,
                                AppointmentRepository appointmentRepository,
                                BillingRepository billingRepository) {
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.appointmentRepository = appointmentRepository;
        this.billingRepository = billingRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSystemMetrics() {
        Map<String, Object> metrics = new HashMap<>();

        long uptimeMs = ManagementFactory.getRuntimeMXBean().getUptime();
        Runtime runtime = Runtime.getRuntime();
        long totalMemoryMb = runtime.totalMemory() / (1024 * 1024);
        long freeMemoryMb = runtime.freeMemory() / (1024 * 1024);
        long usedMemoryMb = totalMemoryMb - freeMemoryMb;

        metrics.put("systemStatus", "UP");
        metrics.put("uptimeSeconds", uptimeMs / 1000);
        metrics.put("usedMemoryMB", usedMemoryMb);
        metrics.put("totalMemoryMB", totalMemoryMb);

        Map<String, Long> databaseRecords = new HashMap<>();
        databaseRecords.put("patients", patientRepository.count());
        databaseRecords.put("doctors", doctorRepository.count());
        databaseRecords.put("appointments", appointmentRepository.count());
        databaseRecords.put("bills", billingRepository.count());

        metrics.put("databaseMetrics", databaseRecords);

        return ResponseEntity.ok(ApiResponse.success("System monitoring metrics retrieved successfully", metrics));
    }
}
