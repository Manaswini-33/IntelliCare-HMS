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

    public LabTest() {
        this.requestedDate = LocalDate.now();
        this.status = LabTestStatus.REQUESTED;
    }

    public LabTest(Long labTestId, Patient patient, Doctor doctor, String testName, LabTestStatus status, LocalDate requestedDate) {
        this.labTestId = labTestId;
        this.patient = patient;
        this.doctor = doctor;
        this.testName = testName;
        this.status = status != null ? status : LabTestStatus.REQUESTED;
        this.requestedDate = requestedDate != null ? requestedDate : LocalDate.now();
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
}
