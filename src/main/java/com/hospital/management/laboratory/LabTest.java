package com.hospital.management.laboratory;

import com.hospital.management.doctor.Doctor;
import com.hospital.management.patient.Patient;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "lab_tests")
public class LabTest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long labTestId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @Column(nullable = false)
    private String testName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LabTestStatus status;

    @Column(nullable = false)
    private LocalDate requestedDate;

    private String severity; // CRITICAL, HIGH, MEDIUM, LOW

    private Integer priority = 1; // 4=CRITICAL, 3=HIGH, 2=MEDIUM, 1=LOW

    private String vitalsSummary;

    @Column(columnDefinition = "LONGTEXT")
    private String documentUrl; // Attachment / document upload / base64 report

    private String testType; // PATHOLOGY_DOC, X_RAY, CT_SCAN, etc.

    @Column(columnDefinition = "TEXT")
    private String resultNotes;

    private Long appointmentId;

    private Double testCharge = 0.0;

    private Boolean isBilled = false;

    public LabTest() {
        this.requestedDate = LocalDate.now();
        this.status = LabTestStatus.REQUESTED;
        this.priority = 1;
    }

    public LabTest(Long labTestId, Patient patient, Doctor doctor, String testName, LabTestStatus status, LocalDate requestedDate) {
        this.labTestId = labTestId;
        this.patient = patient;
        this.doctor = doctor;
        this.testName = testName;
        this.status = status != null ? status : LabTestStatus.REQUESTED;
        this.requestedDate = requestedDate != null ? requestedDate : LocalDate.now();
        this.priority = 1;
    }

    public LabTest(Long labTestId, Patient patient, Doctor doctor, String testName, LabTestStatus status, LocalDate requestedDate, String severity, Integer priority, String vitalsSummary, String testType) {
        this.labTestId = labTestId;
        this.patient = patient;
        this.doctor = doctor;
        this.testName = testName;
        this.status = status != null ? status : LabTestStatus.REQUESTED;
        this.requestedDate = requestedDate != null ? requestedDate : LocalDate.now();
        this.severity = severity;
        this.priority = priority != null ? priority : 1;
        this.vitalsSummary = vitalsSummary;
        this.testType = testType;
    }

    public Long getLabTestId() {
        return labTestId;
    }

    public void setLabTestId(Long labTestId) {
        this.labTestId = labTestId;
    }

    public Patient getPatient() {
        return patient;
    }

    public void setPatient(Patient patient) {
        this.patient = patient;
    }

    public Doctor getDoctor() {
        return doctor;
    }

    public void setDoctor(Doctor doctor) {
        this.doctor = doctor;
    }

    public String getTestName() {
        return testName;
    }

    public void setTestName(String testName) {
        this.testName = testName;
    }

    public LabTestStatus getStatus() {
        return status;
    }

    public void setStatus(LabTestStatus status) {
        this.status = status;
    }

    public LocalDate getRequestedDate() {
        return requestedDate;
    }

    public void setRequestedDate(LocalDate requestedDate) {
        this.requestedDate = requestedDate;
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

    public String getVitalsSummary() {
        return vitalsSummary;
    }

    public void setVitalsSummary(String vitalsSummary) {
        this.vitalsSummary = vitalsSummary;
    }

    public String getDocumentUrl() {
        return documentUrl;
    }

    public void setDocumentUrl(String documentUrl) {
        this.documentUrl = documentUrl;
    }

    public String getTestType() {
        return testType;
    }

    public void setTestType(String testType) {
        this.testType = testType;
    }

    public String getResultNotes() {
        return resultNotes;
    }

    public void setResultNotes(String resultNotes) {
        this.resultNotes = resultNotes;
    }

    public Long getAppointmentId() {
        return appointmentId;
    }

    public void setAppointmentId(Long appointmentId) {
        this.appointmentId = appointmentId;
    }

    public Double getTestCharge() {
        return testCharge;
    }

    public void setTestCharge(Double testCharge) {
        this.testCharge = testCharge;
    }

    public Boolean getIsBilled() {
        return isBilled;
    }

    public void setIsBilled(Boolean isBilled) {
        this.isBilled = isBilled;
    }
}
