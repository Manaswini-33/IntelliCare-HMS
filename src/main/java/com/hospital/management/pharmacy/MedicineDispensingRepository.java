package com.hospital.management.pharmacy;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MedicineDispensingRepository extends JpaRepository<MedicineDispensing, Long> {
    boolean existsByPrescriptionPrescriptionId(Long prescriptionId);
}
