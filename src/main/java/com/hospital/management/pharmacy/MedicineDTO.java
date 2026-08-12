package com.hospital.management.pharmacy;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class MedicineDTO {

    private Long medicineId;

    @NotBlank(message = "Medicine name is required")
    private String medicineName;

    private String category;

    @NotNull(message = "Stock quantity is required")
    @Min(value = 0, message = "Stock quantity cannot be negative")
    private Integer stockQuantity;

    private String dosage;

    private LocalDate expiryDate;

    private Double price;

    public MedicineDTO() {
    }

    public MedicineDTO(Long medicineId, String medicineName, String category, Integer stockQuantity, String dosage, LocalDate expiryDate, Double price) {
        this.medicineId = medicineId;
        this.medicineName = medicineName;
        this.category = category;
        this.stockQuantity = stockQuantity;
        this.dosage = dosage;
        this.expiryDate = expiryDate;
        this.price = price;
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

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Integer getStockQuantity() {
        return stockQuantity;
    }

    public void setStockQuantity(Integer stockQuantity) {
        this.stockQuantity = stockQuantity;
    }

    public String getDosage() {
        return dosage;
    }

    public void setDosage(String dosage) {
        this.dosage = dosage;
    }

    public LocalDate getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(LocalDate expiryDate) {
        this.expiryDate = expiryDate;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }
}
