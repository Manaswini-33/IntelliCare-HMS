package com.hospital.management.pharmacy;

import java.time.LocalDate;

public class PurchaseOrderDTO {
    private Long id;
    private Long medicineId;
    private String medicineName;
    private Integer quantity;
    private String supplier;
    private Double unitPrice;
    private Double totalCost;
    private LocalDate orderDate;
    private LocalDate receivedDate;
    private String status;
    private String requestedBy;
    private String notes;

    public PurchaseOrderDTO() {}

    public PurchaseOrderDTO(Long id, Long medicineId, String medicineName, Integer quantity, String supplier, Double unitPrice, Double totalCost, LocalDate orderDate, LocalDate receivedDate, String status, String requestedBy, String notes) {
        this.id = id;
        this.medicineId = medicineId;
        this.medicineName = medicineName;
        this.quantity = quantity;
        this.supplier = supplier;
        this.unitPrice = unitPrice;
        this.totalCost = totalCost;
        this.orderDate = orderDate;
        this.receivedDate = receivedDate;
        this.status = status;
        this.requestedBy = requestedBy;
        this.notes = notes;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getMedicineId() { return medicineId; }
    public void setMedicineId(Long medicineId) { this.medicineId = medicineId; }
    public String getMedicineName() { return medicineName; }
    public void setMedicineName(String medicineName) { this.medicineName = medicineName; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public String getSupplier() { return supplier; }
    public void setSupplier(String supplier) { this.supplier = supplier; }
    public Double getUnitPrice() { return unitPrice; }
    public void setUnitPrice(Double unitPrice) { this.unitPrice = unitPrice; }
    public Double getTotalCost() { return totalCost; }
    public void setTotalCost(Double totalCost) { this.totalCost = totalCost; }
    public LocalDate getOrderDate() { return orderDate; }
    public void setOrderDate(LocalDate orderDate) { this.orderDate = orderDate; }
    public LocalDate getReceivedDate() { return receivedDate; }
    public void setReceivedDate(LocalDate receivedDate) { this.receivedDate = receivedDate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getRequestedBy() { return requestedBy; }
    public void setRequestedBy(String requestedBy) { this.requestedBy = requestedBy; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
