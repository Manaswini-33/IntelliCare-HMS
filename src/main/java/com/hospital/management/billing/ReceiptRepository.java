package com.hospital.management.billing;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReceiptRepository extends JpaRepository<Receipt, Long> {
    List<Receipt> findByPatientId(Long patientId);
    List<Receipt> findByBillBillId(Long billId);
}
