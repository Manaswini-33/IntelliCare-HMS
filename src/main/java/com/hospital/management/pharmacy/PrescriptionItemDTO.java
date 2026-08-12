package com.hospital.management.pharmacy;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class PrescriptionItemDTO {

    @NotNull(message = "Medicine ID is required")
    private Long medicineId;

    private String medicineName;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

    private String dosage;

    public PrescriptionItemDTO() {
    }

    public PrescriptionItemDTO(Long medicineId, String medicineName, Integer quantity, String dosage) {
        this.medicineId = medicineId;
        this.medicineName = medicineName;
        this.quantity = quantity;
        this.dosage = dosage;
    }

    public Long getMedicineId() {
        return medicineId;
    }

    public void setMedicineId(Long medicineId) {
        this.medicineId = medicineId;
    }

    public String getMedicineName() {
        return medicineName;
    }

    public void setMedicineName(String medicineName) {
        this.medicineName = medicineName;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public String getDosage() {
        return dosage;
    }

    public void setDosage(String dosage) {
        this.dosage = dosage;
    }
}
