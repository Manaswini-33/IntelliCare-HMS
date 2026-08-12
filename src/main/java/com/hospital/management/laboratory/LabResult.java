package com.hospital.management.laboratory;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "lab_results")
public class LabResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long resultId;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "lab_test_id", nullable = false, unique = true)
    private LabTest labTest;

    @Column(nullable = false, length = 2000)
    private String result;

    @Column(length = 2000)
    private String remarks;

    @Column(nullable = false)
    private LocalDate resultDate;

    public LabResult() {
        this.resultDate = LocalDate.now();
    }

    public LabResult(Long resultId, LabTest labTest, String result, String remarks, LocalDate resultDate) {
        this.resultId = resultId;
        this.labTest = labTest;
        this.result = result;
        this.remarks = remarks;
        this.resultDate = resultDate != null ? resultDate : LocalDate.now();
    }

    public Long getResultId() {
        return resultId;
    }

    public void setResultId(Long resultId) {
        this.resultId = resultId;
    }

    public LabTest getLabTest() {
        return labTest;
    }

    public void setLabTest(LabTest labTest) {
        this.labTest = labTest;
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
