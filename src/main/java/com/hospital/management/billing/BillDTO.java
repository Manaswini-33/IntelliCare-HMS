package com.hospital.management.billing;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class BillDTO {

    private Long billId;

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    private String patientName;

    private Double consultationFee;

    private Double laboratoryFee;

    private Double pharmacyFee;

    private Double totalAmount;

    private PaymentStatus paymentStatus;

    private LocalDate billDate;

    private Long appointmentId;
    private Double procedureFee;
    private Double paidAmount;
    private Double remainingBalance;
    private java.time.LocalDateTime paidDate;
    private String receiptNumber;
    private String tokenNumber;
    private String notes;

    public BillDTO() {
    }

    public BillDTO(Long billId, Long patientId, String patientName, Double consultationFee, Double laboratoryFee, Double pharmacyFee, Double totalAmount, PaymentStatus paymentStatus, LocalDate billDate) {
        this.billId = billId;
        this.patientId = patientId;
        this.patientName = patientName;
        this.consultationFee = consultationFee;
        this.laboratoryFee = laboratoryFee;
        this.pharmacyFee = pharmacyFee;
        this.totalAmount = totalAmount;
        this.paymentStatus = paymentStatus;
        this.billDate = billDate;
    }

    public Long getBillId() {
        return billId;
    }

    public void setBillId(Long billId) {
        this.billId = billId;
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

    public Double getPaidAmount() {
        return paidAmount;
    }

    public void setPaidAmount(Double paidAmount) {
        this.paidAmount = paidAmount;
    }

    public Double getRemainingBalance() {
        return remainingBalance;
    }

    public void setRemainingBalance(Double remainingBalance) {
        this.remainingBalance = remainingBalance;
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
