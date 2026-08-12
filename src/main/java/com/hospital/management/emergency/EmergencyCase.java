package com.hospital.management.emergency;

import com.hospital.management.patient.Patient;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "emergency_cases")
public class EmergencyCase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long emergencyId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Column(nullable = false)
    private String severity; // LOW, MEDIUM, HIGH, CRITICAL

    private Integer priority; // 1, 2, 3, 4

    @Column(length = 1000)
    private String description;

    private String status; // ACTIVE, TREATED, RESOLVED

    private LocalDateTime createdAt;

    public EmergencyCase() {
        this.createdAt = LocalDateTime.now();
        this.status = "ACTIVE";
    }

    public EmergencyCase(Long emergencyId, Patient patient, String severity, Integer priority, String description, String status, LocalDateTime createdAt) {
        this.emergencyId = emergencyId;
        this.patient = patient;
        this.severity = severity;
        this.priority = priority;
        this.description = description;
        this.status = status;
        this.createdAt = createdAt != null ? createdAt : LocalDateTime.now();
    }

    public Long getEmergencyId() {
        return emergencyId;
    }

    public void setEmergencyId(Long emergencyId) {
        this.emergencyId = emergencyId;
    }

    public Patient getPatient() {
        return patient;
    }

    public void setPatient(Patient patient) {
        this.patient = patient;
    }

    public String getSeverity() {
        return severity;
    }

    public void setSeverity(String severity) {
        this.severity = severity;
    }

    public Integer getPriority() {
        return priority;
    }

    public void setPriority(Integer priority) {
        this.priority = priority;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
