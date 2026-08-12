package com.hospital.management.billing;

import com.hospital.management.exception.ResourceNotFoundException;
import com.hospital.management.patient.Patient;
import com.hospital.management.patient.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BillingService {

    private final BillingRepository billingRepository;
    private final PaymentRepository paymentRepository;
    private final PatientRepository patientRepository;

    @Autowired
    public BillingService(BillingRepository billingRepository,
                          PaymentRepository paymentRepository,
                          PatientRepository patientRepository) {
        this.billingRepository = billingRepository;
        this.paymentRepository = paymentRepository;
        this.patientRepository = patientRepository;
    }

    @Transactional
    public BillDTO generateBill(BillDTO dto) {
        Patient patient = patientRepository.findById(dto.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + dto.getPatientId()));

        double consult = dto.getConsultationFee() != null ? dto.getConsultationFee() : 0.0;
        double lab = dto.getLaboratoryFee() != null ? dto.getLaboratoryFee() : 0.0;
        double pharmacy = dto.getPharmacyFee() != null ? dto.getPharmacyFee() : 0.0;
        double total = consult + lab + pharmacy;

        Bill bill = new Bill();
        bill.setPatient(patient);
        bill.setConsultationFee(consult);
        bill.setLaboratoryFee(lab);
        bill.setPharmacyFee(pharmacy);
        bill.setTotalAmount(total);
        bill.setPaymentStatus(PaymentStatus.PENDING);
        bill.setBillDate(LocalDate.now());

        Bill saved = billingRepository.save(bill);
        return mapBillToDTO(saved);
    }

    public BillDTO getBillById(Long billId) {
        Bill bill = billingRepository.findById(billId)
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found with ID: " + billId));
        return mapBillToDTO(bill);
    }

    public List<BillDTO> getBillsByPatient(Long patientId) {
        return billingRepository.findByPatientPatientId(patientId).stream()
                .map(this::mapBillToDTO)
                .collect(Collectors.toList());
    }

    public List<BillDTO> getAllBills() {
        return billingRepository.findAll().stream()
                .map(this::mapBillToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public PaymentDTO processPayment(Long billId, PaymentDTO dto) {
        Bill bill = billingRepository.findById(billId)
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found with ID: " + billId));

        Payment payment = new Payment();
        payment.setBill(bill);
        payment.setAmount(dto.getAmount());
        payment.setPaymentMethod(dto.getPaymentMethod());
        payment.setPaymentDate(LocalDateTime.now());
        payment.setPaymentStatus(PaymentStatus.PAID);

        Payment savedPayment = paymentRepository.save(payment);

        // Update bill status to PAID if payment covers total amount
        bill.setPaymentStatus(PaymentStatus.PAID);
        billingRepository.save(bill);

        return mapPaymentToDTO(savedPayment);
    }

    public List<PaymentDTO> getPaymentsForBill(Long billId) {
        return paymentRepository.findByBillBillId(billId).stream()
                .map(this::mapPaymentToDTO)
                .collect(Collectors.toList());
    }

    public BillDTO mapBillToDTO(Bill entity) {
        return new BillDTO(
                entity.getBillId(),
                entity.getPatient().getPatientId(),
                entity.getPatient().getName(),
                entity.getConsultationFee(),
                entity.getLaboratoryFee(),
                entity.getPharmacyFee(),
                entity.getTotalAmount(),
                entity.getPaymentStatus(),
                entity.getBillDate()
        );
    }

    public PaymentDTO mapPaymentToDTO(Payment entity) {
        return new PaymentDTO(
                entity.getPaymentId(),
                entity.getBill().getBillId(),
                entity.getAmount(),
                entity.getPaymentMethod(),
                entity.getPaymentStatus(),
                entity.getPaymentDate()
        );
    }
}
