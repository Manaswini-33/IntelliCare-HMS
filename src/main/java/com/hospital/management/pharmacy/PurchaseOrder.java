package com.hospital.management.pharmacy;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "purchase_orders")
public class PurchaseOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "medicine_id", nullable = false)
    private Medicine medicine;

    @Column(nullable = false)
    private String medicineName;

    @Column(nullable = false)
    private Integer quantity;

    private String supplier;

    private Double unitPrice;

    private Double totalCost;

    private LocalDate orderDate;

    private LocalDate receivedDate;

    @Column(nullable = false)
    private String status; // PENDING, ORDERED, RECEIVED, CANCELLED

    private String requestedBy;

    @Column(columnDefinition = "TEXT")
    private String notes;

    public PurchaseOrder() {
        this.orderDate = LocalDate.now();
        this.status = "PENDING";
    }

    public PurchaseOrder(Medicine medicine, Integer quantity, String supplier, Double unitPrice, String requestedBy, String notes) {
        this.medicine = medicine;
        this.medicineName = medicine != null ? medicine.getMedicineName() : "";
        this.quantity = quantity;
        this.supplier = supplier != null ? supplier : "Standard Pharma Supply";
        this.unitPrice = unitPrice != null ? unitPrice : (medicine != null ? medicine.getPrice() : 0.0);
        this.totalCost = this.unitPrice * (quantity != null ? quantity : 0);
        this.orderDate = LocalDate.now();
        this.status = "PENDING";
        this.requestedBy = requestedBy != null ? requestedBy : "Pharmacy Dept";
        this.notes = notes;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Medicine getMedicine() {
        return medicine;
    }

    public void setMedicine(Medicine medicine) {
        this.medicine = medicine;
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

    public String getSupplier() {
        return supplier;
    }

    public void setSupplier(String supplier) {
        this.supplier = supplier;
    }

    public Double getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(Double unitPrice) {
        this.unitPrice = unitPrice;
    }

    public Double getTotalCost() {
        return totalCost;
    }

    public void setTotalCost(Double totalCost) {
        this.totalCost = totalCost;
    }

    public LocalDate getOrderDate() {
        return orderDate;
    }

    public void setOrderDate(LocalDate orderDate) {
        this.orderDate = orderDate;
    }

    public LocalDate getReceivedDate() {
        return receivedDate;
    }

    public void setReceivedDate(LocalDate receivedDate) {
        this.receivedDate = receivedDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getRequestedBy() {
        return requestedBy;
    }

    public void setRequestedBy(String requestedBy) {
        this.requestedBy = requestedBy;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
