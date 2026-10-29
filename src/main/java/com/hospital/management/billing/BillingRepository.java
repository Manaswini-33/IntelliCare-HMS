package com.hospital.management.billing;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BillingRepository extends JpaRepository<Bill, Long> {
    List<Bill> findByPatientPatientId(Long patientId);
    List<Bill> findByPatientPatientIdOrderByBillDateDesc(Long patientId);
    List<Bill> findByPaymentStatus(PaymentStatus status);
    List<Bill> findByAppointmentId(Long appointmentId);
    java.util.Optional<Bill> findFirstByAppointmentId(Long appointmentId);
}
