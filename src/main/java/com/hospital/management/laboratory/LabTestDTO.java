package com.hospital.management.laboratory;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class LabTestDTO {

    private Long labTestId;

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    private String patientName;

    @NotNull(message = "Doctor ID is required")
    private Long doctorId;

    private String doctorName;

    @NotBlank(message = "Test name is required")
    private String testName;

    private LabTestStatus status;

    private LocalDate requestedDate;

    private String severity; // CRITICAL, HIGH, MEDIUM, LOW

    private Integer priority;

    private String vitalsSummary;

    private String documentUrl;

    private String testType;

    private String resultNotes;

    public LabTestDTO() {
    }

    public LabTestDTO(Long labTestId, Long patientId, String patientName, Long doctorId, String doctorName, String testName, LabTestStatus status, LocalDate requestedDate) {
        this.labTestId = labTestId;
        this.patientId = patientId;
        this.patientName = patientName;
        this.doctorId = doctorId;
        this.doctorName = doctorName;
        this.testName = testName;
        this.status = status;
        this.requestedDate = requestedDate;
    }

    public LabTestDTO(Long labTestId, Long patientId, String patientName, Long doctorId, String doctorName, String testName, LabTestStatus status, LocalDate requestedDate, String severity, Integer priority, String vitalsSummary, String documentUrl, String testType, String resultNotes) {
        this.labTestId = labTestId;
        this.patientId = patientId;
        this.patientName = patientName;
        this.doctorId = doctorId;
        this.doctorName = doctorName;
        this.testName = testName;
        this.status = status;
        this.requestedDate = requestedDate;
        this.severity = severity;
        this.priority = priority;
        this.vitalsSummary = vitalsSummary;
        this.documentUrl = documentUrl;
        this.testType = testType;
        this.resultNotes = resultNotes;
    }

    public Long getLabTestId() {
        return labTestId;
    }

    public void setLabTestId(Long labTestId) {
        this.labTestId = labTestId;
    }

    public Long getPatientId() {
        return patientId;
    }

    public void setPatientId(Long patientId) {
        this.patientId = patientId;
    }

    public String getPatientName() {
        return patientName;
    }

    public void setPatientName(String patientName) {
        this.patientName = patientName;
    }

    public Long getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(Long doctorId) {
        this.doctorId = doctorId;
    }

    public String getDoctorName() {
        return doctorName;
    }

    public void setDoctorName(String doctorName) {
        this.doctorName = doctorName;
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
}
