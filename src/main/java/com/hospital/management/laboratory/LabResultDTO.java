package com.hospital.management.laboratory;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class LabResultDTO {

    private Long resultId;

    @NotNull(message = "Lab test ID is required")
    private Long labTestId;

    private String testName;

    private Long patientId;

    private String patientName;

    @NotBlank(message = "Result description is required")
    private String result;

    private String remarks;

    private LocalDate resultDate;

    public LabResultDTO() {
    }

    public LabResultDTO(Long resultId, Long labTestId, String testName, Long patientId, String patientName, String result, String remarks, LocalDate resultDate) {
        this.resultId = resultId;
        this.labTestId = labTestId;
        this.testName = testName;
        this.patientId = patientId;
        this.patientName = patientName;
        this.result = result;
        this.remarks = remarks;
        this.resultDate = resultDate;
    }

    public Long getResultId() {
        return resultId;
    }

    public void setResultId(Long resultId) {
        this.resultId = resultId;
    }

    public Long getLabTestId() {
        return labTestId;
    }

    public void setLabTestId(Long labTestId) {
        this.labTestId = labTestId;
    }

    public String getTestName() {
        return testName;
    }

    public void setTestName(String testName) {
        this.testName = testName;
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

    public String getResult() {
        return result;
    }

    public void setResult(String result) {
        this.result = result;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public LocalDate getResultDate() {
        return resultDate;
    }

    public void setResultDate(LocalDate resultDate) {
        this.resultDate = resultDate;
    }
}
