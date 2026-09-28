package com.hospital.management.pharmacy;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "medicine_dispensings")
public class MedicineDispensing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long dispensingId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "prescription_id", nullable = false)
    private Prescription prescription;

    private Long billId;

    private Double pharmacyCharge;

    private LocalDateTime dispensedAt;

    public MedicineDispensing() {
        this.dispensedAt = LocalDateTime.now();
    }

    public Long getDispensingId() {
        return dispensingId;
    }

    public void setDispensingId(Long dispensingId) {
        this.dispensingId = dispensingId;
    }

    public Prescription getPrescription() {
        return prescription;
    }

    public void setPrescription(Prescription prescription) {
        this.prescription = prescription;
    }

    public Long getBillId() {
        return billId;
    }

    public void setBillId(Long billId) {
        this.billId = billId;
    }

    public Double getPharmacyCharge() {
        return pharmacyCharge;
    }

    public void setPharmacyCharge(Double pharmacyCharge) {
        this.pharmacyCharge = pharmacyCharge;
    }

    public LocalDateTime getDispensedAt() {
        return dispensedAt;
    }

    public void setDispensedAt(LocalDateTime dispensedAt) {
        this.dispensedAt = dispensedAt;
    }
}
