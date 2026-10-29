package com.hospital.management.billing;

import com.hospital.management.patient.Patient;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "bills")
public class Bill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long billId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    private Long appointmentId;

    private Double consultationFee = 0.0;

    private Double laboratoryFee = 0.0;

    private Double pharmacyFee = 0.0;

    private Double procedureFee = 0.0;

    @Column(nullable = false)
    private Double totalAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus paymentStatus;

    @Column(nullable = false)
    private LocalDate billDate;

    private Double paidAmount = 0.0;

    private java.time.LocalDateTime paidDate;

    private String receiptNumber;

    private String tokenNumber;

    private String notes;

    public Bill() {
        this.billDate = LocalDate.now();
        this.paymentStatus = PaymentStatus.PENDING;
        this.paidAmount = 0.0;
    }

    public Bill(Long billId, Patient patient, Double consultationFee, Double laboratoryFee, Double pharmacyFee, Double totalAmount, PaymentStatus paymentStatus, LocalDate billDate) {
        this.billId = billId;
        this.patient = patient;
        this.consultationFee = consultationFee != null ? consultationFee : 0.0;
        this.laboratoryFee = laboratoryFee != null ? laboratoryFee : 0.0;
        this.pharmacyFee = pharmacyFee != null ? pharmacyFee : 0.0;
        this.totalAmount = totalAmount != null ? totalAmount : (this.consultationFee + this.laboratoryFee + this.pharmacyFee);
        this.paymentStatus = paymentStatus != null ? paymentStatus : PaymentStatus.PENDING;
        this.billDate = billDate != null ? billDate : LocalDate.now();
    }

    public Long getBillId() {
        return billId;
    }

    public void setBillId(Long billId) {
        this.billId = billId;
    }

    public Patient getPatient() {
        return patient;
    }

    public void setPatient(Patient patient) {
        this.patient = patient;
    }

    public Double getConsultationFee() {
        return consultationFee;
    }

    public void setConsultationFee(Double consultationFee) {
        this.consultationFee = consultationFee;
    }

    public Double getLaboratoryFee() {
        return laboratoryFee;
    }

    public void setLaboratoryFee(Double laboratoryFee) {
        this.laboratoryFee = laboratoryFee;
    }

    public Double getPharmacyFee() {
        return pharmacyFee;
    }

    public void setPharmacyFee(Double pharmacyFee) {
        this.pharmacyFee = pharmacyFee;
    }

    public Double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(Double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public PaymentStatus getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(PaymentStatus paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public LocalDate getBillDate() {
        return billDate;
    }

    public void setBillDate(LocalDate billDate) {
        this.billDate = billDate;
    }

    public Double getPaidAmount() {
        return paidAmount;
    }

    public void setPaidAmount(Double paidAmount) {
        this.paidAmount = paidAmount;
    }

    public Long getAppointmentId() {
        return appointmentId;
    }

    public void setAppointmentId(Long appointmentId) {
        this.appointmentId = appointmentId;
    }

    public Double getProcedureFee() {
        return procedureFee;
    }

    public void setProcedureFee(Double procedureFee) {
        this.procedureFee = procedureFee;
    }

    public java.time.LocalDateTime getPaidDate() {
        return paidDate;
    }

    public void setPaidDate(java.time.LocalDateTime paidDate) {
        this.paidDate = paidDate;
    }

    public String getReceiptNumber() {
        return receiptNumber;
    }

    public void setReceiptNumber(String receiptNumber) {
        this.receiptNumber = receiptNumber;
    }

    public String getTokenNumber() {
        return tokenNumber;
    }

    public void setTokenNumber(String tokenNumber) {
        this.tokenNumber = tokenNumber;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
