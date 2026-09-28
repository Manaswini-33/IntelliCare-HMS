package com.hospital.management.queue;

import com.hospital.management.common.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/queue")
public class QueueController {

    private final QueueService queueService;

    public QueueController(QueueService queueService) {
        this.queueService = queueService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST','DOCTOR')")
    public ResponseEntity<ApiResponse<List<QueueEntryDTO>>> waiting() {
        return ResponseEntity.ok(ApiResponse.success("Queue retrieved", queueService.getWaitingQueue()));
    }

    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST','DOCTOR')")
    public ResponseEntity<ApiResponse<List<QueueEntryDTO>>> doctorQueue(@PathVariable Long doctorId) {
        return ResponseEntity.ok(ApiResponse.success("Doctor queue retrieved", queueService.getDoctorQueue(doctorId)));
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST','DOCTOR','PATIENT')")
    public ResponseEntity<ApiResponse<List<QueueEntryDTO>>> patientQueue(@PathVariable Long patientId) {
        return ResponseEntity.ok(ApiResponse.success("Patient queue retrieved", queueService.getPatientQueue(patientId)));
    }

    @PostMapping("/doctor/{doctorId}/call-next")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','RECEPTIONIST')")
    public ResponseEntity<ApiResponse<QueueEntryDTO>> callNext(@PathVariable Long doctorId) {
        return ResponseEntity.ok(ApiResponse.success("Next patient called", queueService.callNext(doctorId)));
    }
}
