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
}
