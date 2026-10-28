package com.hospital.management.appointment;

import com.hospital.management.common.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/appointments")
@PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'RECEPTIONIST', 'PATIENT')")
public class AppointmentController {

    private final AppointmentService appointmentService;

    @Autowired
    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AppointmentDTO>> bookAppointment(@Valid @RequestBody AppointmentDTO dto) {
        AppointmentDTO created = appointmentService.bookAppointment(dto);
        return new ResponseEntity<>(
                ApiResponse.success("Appointment booked successfully", created),
                HttpStatus.CREATED
        );
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AppointmentDTO>>> getAllAppointments() {
        List<AppointmentDTO> list = appointmentService.getAllAppointments();
        return ResponseEntity.ok(ApiResponse.success("Appointments retrieved successfully", list));
    }

    @GetMapping("/next-token")
    public ResponseEntity<ApiResponse<Map<String, String>>> getNextToken() {
        String token = appointmentService.generateUniqueToken();
        return ResponseEntity.ok(ApiResponse.success("Next available token", Map.of("tokenNumber", token)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AppointmentDTO>> getAppointmentById(@PathVariable Long id) {
        AppointmentDTO appointment = appointmentService.getAppointmentById(id);
        return ResponseEntity.ok(ApiResponse.success("Appointment retrieved successfully", appointment));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<ApiResponse<List<AppointmentDTO>>> getAppointmentsByPatient(@PathVariable Long patientId) {
        List<AppointmentDTO> list = appointmentService.getAppointmentsByPatient(patientId);
        return ResponseEntity.ok(ApiResponse.success("Patient appointments retrieved", list));
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<ApiResponse<List<AppointmentDTO>>> getAppointmentsByDoctor(@PathVariable Long doctorId) {
        List<AppointmentDTO> list = appointmentService.getAppointmentsByDoctor(doctorId);
        return ResponseEntity.ok(ApiResponse.success("Doctor appointments retrieved", list));
    }

    @PutMapping("/{id}/start-examining")
    public ResponseEntity<ApiResponse<AppointmentDTO>> startExamining(@PathVariable Long id) {
        AppointmentDTO updated = appointmentService.startExaminingAppointment(id);
        return ResponseEntity.ok(ApiResponse.success("Consultation examination started", updated));
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<ApiResponse<AppointmentDTO>> completeAppointment(@PathVariable Long id) {
        AppointmentDTO completed = appointmentService.completeConsultation(id);
        return ResponseEntity.ok(ApiResponse.success("Consultation completed successfully", completed));
    }

    @PutMapping("/{id}/triage")
    public ResponseEntity<ApiResponse<AppointmentDTO>> updateTriage(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        String vitals = body.get("vitals") != null ? body.get("vitals").toString() : null;
        String severity = body.get("severity") != null ? body.get("severity").toString() : null;
        Integer priority = body.get("priority") != null ? Integer.parseInt(body.get("priority").toString()) : null;
        AppointmentDTO updated = appointmentService.updateTriageVitals(id, vitals, severity, priority);
        return ResponseEntity.ok(ApiResponse.success("Appointment triage & vitals recorded", updated));
    }

    @PostMapping("/process-unattended")
    public ResponseEntity<ApiResponse<List<AppointmentDTO>>> processUnattended() {
        List<AppointmentDTO> list = appointmentService.processExpiredUnattendedAppointments();
        return ResponseEntity.ok(ApiResponse.success("Processed unattended appointments", list));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<AppointmentDTO>> cancelAppointment(@PathVariable Long id) {
        AppointmentDTO cancelled = appointmentService.cancelAppointment(id);
        return ResponseEntity.ok(ApiResponse.success("Appointment cancelled successfully", cancelled));
    }

    @PutMapping("/{id}/reschedule")
    public ResponseEntity<ApiResponse<AppointmentDTO>> rescheduleAppointment(@PathVariable Long id, @RequestParam String newTime) {
        AppointmentDTO rescheduled = appointmentService.rescheduleAppointment(id, newTime);
        return ResponseEntity.ok(ApiResponse.success("Appointment rescheduled successfully", rescheduled));
    }
}
