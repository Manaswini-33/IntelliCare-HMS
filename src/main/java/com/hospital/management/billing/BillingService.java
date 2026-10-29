package com.hospital.management.billing;

import com.hospital.management.appointment.AppointmentRepository;
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
    private final ReceiptRepository receiptRepository;
    private final AppointmentRepository appointmentRepository;

    @Autowired
    public BillingService(BillingRepository billingRepository,
                          PaymentRepository paymentRepository,
                          PatientRepository patientRepository,
                          ReceiptRepository receiptRepository,
                          AppointmentRepository appointmentRepository) {
        this.billingRepository = billingRepository;
        this.paymentRepository = paymentRepository;
        this.patientRepository = patientRepository;
        this.receiptRepository = receiptRepository;
        this.appointmentRepository = appointmentRepository;
    }

    @Transactional
    public BillDTO generateBill(BillDTO dto) {
        Patient patient = patientRepository.findById(dto.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + dto.getPatientId()));

        double consult = dto.getConsultationFee() != null ? dto.getConsultationFee() : 0.0;
        double lab = dto.getLaboratoryFee() != null ? dto.getLaboratoryFee() : 0.0;
        double pharmacy = dto.getPharmacyFee() != null ? dto.getPharmacyFee() : 0.0;
        double proc = dto.getProcedureFee() != null ? dto.getProcedureFee() : 0.0;
        double total = consult + lab + pharmacy + proc;

        Bill bill = new Bill();
        bill.setPatient(patient);
        bill.setAppointmentId(dto.getAppointmentId());
        bill.setConsultationFee(consult);
        bill.setLaboratoryFee(lab);
        bill.setPharmacyFee(pharmacy);
        bill.setProcedureFee(proc);
        bill.setTotalAmount(total);
        bill.setPaidAmount(0.0);
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

    public BillDTO getBillByAppointmentId(Long appointmentId) {
        return billingRepository.findFirstByAppointmentId(appointmentId)
                .map(this::mapBillToDTO)
                .orElse(null);
    }

    public List<BillDTO> getBillsByPatient(Long patientId) {
        return billingRepository.findByPatientPatientIdOrderByBillDateDesc(patientId).stream()
                .map(this::mapBillToDTO)
                .collect(Collectors.toList());
    }

    public List<BillDTO> getAllBills() {
        return billingRepository.findAll().stream()
                .map(this::mapBillToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public Bill ensureBillForAppointment(Long appointmentId, Long patientId, Double consultationFee) {
        if (appointmentId != null) {
            var opt = billingRepository.findFirstByAppointmentId(appointmentId);
            if (opt.isPresent()) return opt.get();
        }

        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + patientId));

        Bill bill = new Bill();
        bill.setAppointmentId(appointmentId);
        bill.setPatient(patient);
        double consult = consultationFee != null ? consultationFee : 500.0;
        bill.setConsultationFee(consult);
        bill.setLaboratoryFee(0.0);
        bill.setPharmacyFee(0.0);
        bill.setProcedureFee(0.0);
        bill.setTotalAmount(consult);
        bill.setPaidAmount(0.0);
        bill.setPaymentStatus(PaymentStatus.PENDING);
        bill.setBillDate(LocalDate.now());

        return billingRepository.save(bill);
    }

    public Bill ensureBillForAppointment(Long appointmentId, Long patientId, String tokenNumber) {
        Bill b = ensureBillForAppointment(appointmentId, patientId, 500.0);
        if (tokenNumber != null && (b.getTokenNumber() == null || b.getTokenNumber().isBlank())) {
            b.setTokenNumber(tokenNumber);
            billingRepository.save(b);
        }
        return b;
    }

    @Transactional
    public void addPharmacyCharge(Long appointmentId, Long patientId, Double charge) {
        if (charge == null || charge <= 0) return;
        Bill bill;
        if (appointmentId != null) {
            bill = ensureBillForAppointment(appointmentId, patientId, 500.0);
        } else {
            var list = billingRepository.findByPatientPatientId(patientId);
            bill = list.isEmpty() ? ensureBillForAppointment(null, patientId, 500.0) : list.get(list.size() - 1);
        }
        double cur = bill.getPharmacyFee() != null ? bill.getPharmacyFee() : 0.0;
        bill.setPharmacyFee(cur + charge);
        recalcTotal(bill);
        billingRepository.save(bill);
    }

    @Transactional
    public void addLaboratoryCharge(Long appointmentId, Long patientId, Double charge) {
        if (charge == null || charge <= 0) return;
        Bill bill;
        if (appointmentId != null) {
            bill = ensureBillForAppointment(appointmentId, patientId, 500.0);
        } else {
            var list = billingRepository.findByPatientPatientId(patientId);
            bill = list.isEmpty() ? ensureBillForAppointment(null, patientId, 500.0) : list.get(list.size() - 1);
        }
        double cur = bill.getLaboratoryFee() != null ? bill.getLaboratoryFee() : 0.0;
        bill.setLaboratoryFee(cur + charge);
        recalcTotal(bill);
        billingRepository.save(bill);
    }

    private void recalcTotal(Bill bill) {
        double c = bill.getConsultationFee() != null ? bill.getConsultationFee() : 0.0;
        double l = bill.getLaboratoryFee() != null ? bill.getLaboratoryFee() : 0.0;
        double p = bill.getPharmacyFee() != null ? bill.getPharmacyFee() : 0.0;
        double proc = bill.getProcedureFee() != null ? bill.getProcedureFee() : 0.0;
        bill.setTotalAmount(c + l + p + proc);
        double paid = bill.getPaidAmount() != null ? bill.getPaidAmount() : 0.0;
        if (paid >= bill.getTotalAmount() && bill.getTotalAmount() > 0) {
            bill.setPaymentStatus(PaymentStatus.PAID);
        } else if (paid > 0) {
            bill.setPaymentStatus(PaymentStatus.PARTIALLY_PAID);
        } else {
            bill.setPaymentStatus(PaymentStatus.PENDING);
        }
    }

    @Transactional
    public PaymentDTO processPayment(Long billId, PaymentDTO dto) {
        Bill bill = billingRepository.findById(billId)
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found with ID: " + billId));

        double payAmt = dto.getAmount() != null && dto.getAmount() > 0 ? dto.getAmount() :
                Math.max(0.0, (bill.getTotalAmount() != null ? bill.getTotalAmount() : 0.0) - (bill.getPaidAmount() != null ? bill.getPaidAmount() : 0.0));

        Payment payment = new Payment();
        payment.setBill(bill);
        payment.setAmount(payAmt);
        payment.setPaymentMethod(dto.getPaymentMethod() != null ? dto.getPaymentMethod() : "CASH");
        payment.setPaymentDate(LocalDateTime.now());
        payment.setPaymentStatus(PaymentStatus.PAID);

        Payment savedPayment = paymentRepository.save(payment);

        double curPaid = bill.getPaidAmount() != null ? bill.getPaidAmount() : 0.0;
        double newPaid = curPaid + payAmt;
        bill.setPaidAmount(newPaid);
        bill.setPaidDate(LocalDateTime.now());

        double total = bill.getTotalAmount() != null ? bill.getTotalAmount() : 0.0;
        if (newPaid >= total) {
            bill.setPaymentStatus(PaymentStatus.PAID);
        } else if (newPaid > 0) {
            bill.setPaymentStatus(PaymentStatus.PARTIALLY_PAID);
        }

        Receipt receipt = new Receipt();
        receipt.setBill(bill);
        receipt.setPayment(savedPayment);
        receipt.setPatientId(bill.getPatient().getPatientId());
        receipt.setAmount(payAmt);
        receipt.setPaymentMethod(payment.getPaymentMethod());
        receipt.setPaymentStatus(bill.getPaymentStatus());
        receipt.setPaymentDate(LocalDateTime.now());
        String rcpNo = "RCP-" + bill.getBillId() + "-" + (System.currentTimeMillis() % 100000);
        receipt.setReceiptNumber(rcpNo);
        receiptRepository.save(receipt);

        bill.setReceiptNumber(rcpNo);
        billingRepository.save(bill);

        return mapPaymentToDTO(savedPayment);
    }

    public List<PaymentDTO> getPaymentsForBill(Long billId) {
        return paymentRepository.findByBillBillId(billId).stream()
                .map(this::mapPaymentToDTO)
                .collect(Collectors.toList());
    }

    public BillDTO mapBillToDTO(Bill entity) {
        BillDTO dto = new BillDTO(
                entity.getBillId(),
                entity.getPatient().getPatientId(),
                entity.getPatient().getName(),
                entity.getConsultationFee() != null ? entity.getConsultationFee() : 0.0,
                entity.getLaboratoryFee() != null ? entity.getLaboratoryFee() : 0.0,
                entity.getPharmacyFee() != null ? entity.getPharmacyFee() : 0.0,
                entity.getTotalAmount() != null ? entity.getTotalAmount() : 0.0,
                entity.getPaymentStatus(),
                entity.getBillDate()
        );
        dto.setAppointmentId(entity.getAppointmentId());
        dto.setProcedureFee(entity.getProcedureFee() != null ? entity.getProcedureFee() : 0.0);
        double paid = entity.getPaidAmount() != null ? entity.getPaidAmount() : 0.0;
        dto.setPaidAmount(paid);
        double total = entity.getTotalAmount() != null ? entity.getTotalAmount() : 0.0;
        dto.setRemainingBalance(Math.max(0.0, total - paid));
        dto.setPaidDate(entity.getPaidDate());
        dto.setReceiptNumber(entity.getReceiptNumber());
        dto.setNotes(entity.getNotes());

        if (entity.getAppointmentId() != null) {
            appointmentRepository.findById(entity.getAppointmentId()).ifPresent(a -> {
                dto.setTokenNumber(a.getTokenNumber());
            });
        }
        return dto;
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
