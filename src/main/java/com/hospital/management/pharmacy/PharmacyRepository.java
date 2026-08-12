package com.hospital.management.pharmacy;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PharmacyRepository extends JpaRepository<Medicine, Long> {
    Optional<Medicine> findByMedicineNameIgnoreCase(String medicineName);
    List<Medicine> findByMedicineNameContainingIgnoreCase(String medicineName);
}
