package com.hospital.management.pharmacy;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "medicines")
public class Medicine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long medicineId;

    @Column(nullable = false, unique = true)
    private String medicineName;

    private String category;

    @Column(nullable = false)
    private Integer stockQuantity;

    private String dosage;

    private LocalDate expiryDate;

    private Double price;

    private String batchNumber;

    private Integer lowStockThreshold = 20;

    private boolean active = true;

    public Medicine() {
        this.active = true;
        this.lowStockThreshold = 20;
    }

    public Medicine(Long medicineId, String medicineName, String category, Integer stockQuantity, String dosage, LocalDate expiryDate, Double price) {
        this.medicineId = medicineId;
        this.medicineName = medicineName;
        this.category = category;
        this.stockQuantity = stockQuantity;
        this.dosage = dosage;
        this.expiryDate = expiryDate;
        this.price = price != null ? price : 0.0;
        this.active = true;
        this.lowStockThreshold = 20;
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

    public String getBatchNumber() {
        return batchNumber;
    }

    public void setBatchNumber(String batchNumber) {
        this.batchNumber = batchNumber;
    }

    public Integer getLowStockThreshold() {
        return lowStockThreshold;
    }

    public void setLowStockThreshold(Integer lowStockThreshold) {
        this.lowStockThreshold = lowStockThreshold;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}
