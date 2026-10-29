package com.hospital.management.billing;

import com.hospital.management.common.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.io.ByteArrayOutputStream;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@RestController
@RequestMapping("/api/billing")
@PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'PATIENT', 'PHARMACIST')")
public class BillingController {

    private final BillingService billingService;

    @Autowired
    public BillingController(BillingService billingService) {
        this.billingService = billingService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BillDTO>> generateBill(@Valid @RequestBody BillDTO dto) {
        BillDTO created = billingService.generateBill(dto);
        return new ResponseEntity<>(
                ApiResponse.success("Bill generated successfully", created),
                HttpStatus.CREATED
        );
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<BillDTO>>> getAllBills() {
        List<BillDTO> list = billingService.getAllBills();
        return ResponseEntity.ok(ApiResponse.success("Bills retrieved successfully", list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BillDTO>> getBillById(@PathVariable Long id) {
        BillDTO bill = billingService.getBillById(id);
        return ResponseEntity.ok(ApiResponse.success("Bill retrieved successfully", bill));
    }

    @GetMapping("/appointment/{appointmentId}")
    public ResponseEntity<ApiResponse<BillDTO>> getBillByAppointment(@PathVariable Long appointmentId) {
        BillDTO bill = billingService.getBillByAppointmentId(appointmentId);
        return ResponseEntity.ok(ApiResponse.success("Appointment bill retrieved", bill));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<ApiResponse<List<BillDTO>>> getBillsByPatient(@PathVariable Long patientId) {
        List<BillDTO> list = billingService.getBillsByPatient(patientId);
        return ResponseEntity.ok(ApiResponse.success("Patient bills retrieved", list));
    }

    @PostMapping("/{id}/payment")
    public ResponseEntity<ApiResponse<PaymentDTO>> processPayment(@PathVariable Long id, @RequestBody PaymentDTO dto) {
        if (dto.getBillId() == null) {
            dto.setBillId(id);
        }
        PaymentDTO payment = billingService.processPayment(id, dto);
        return new ResponseEntity<>(
                ApiResponse.success("Payment processed successfully", payment),
                HttpStatus.CREATED
        );
    }

    @PostMapping("/pay")
    public ResponseEntity<ApiResponse<PaymentDTO>> payBill(@RequestBody PaymentDTO dto) {
        Long billId = dto.getBillId();
        PaymentDTO payment = billingService.processPayment(billId, dto);
        return new ResponseEntity<>(
                ApiResponse.success("Payment processed successfully", payment),
                HttpStatus.CREATED
        );
    }

    @PreAuthorize("permitAll()")
    @GetMapping(value = "/{id}/receipt", produces = "application/pdf")
    public ResponseEntity<byte[]> downloadReceipt(@PathVariable Long id) {
        BillDTO bill = billingService.getBillById(id);
        byte[] pdfBytes = generateReceiptPdf(bill);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"Receipt-INV-" + id + ".pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }

    private byte[] generateReceiptPdf(BillDTO bill) {
        String patient = bill.getPatientName() != null ? bill.getPatientName() : ("Patient #" + bill.getPatientId());
        String date = bill.getBillDate() != null ? bill.getBillDate().toString() : LocalDate.now().toString();
        String total = String.format(Locale.US, "%.2f", bill.getTotalAmount() != null ? bill.getTotalAmount() : 0.0);
        String consult = String.format(Locale.US, "%.2f", bill.getConsultationFee() != null ? bill.getConsultationFee() : 0.0);
        String lab = String.format(Locale.US, "%.2f", bill.getLaboratoryFee() != null ? bill.getLaboratoryFee() : 0.0);
        String pharma = String.format(Locale.US, "%.2f", bill.getPharmacyFee() != null ? bill.getPharmacyFee() : 0.0);
        String status = bill.getPaymentStatus() != null ? bill.getPaymentStatus().name() : "PAID";

        StringBuilder stream = new StringBuilder();
        stream.append("BT\n");
        stream.append("/F1 18 Tf\n");
        stream.append("50 740 Td\n");
        stream.append("(INTELLICARE HOSPITAL MANAGEMENT SYSTEM) Tj\n");
        stream.append("/F1 13 Tf\n");
        stream.append("0 -28 Td\n");
        stream.append("(OFFICIAL HEALTHCARE PAYMENT RECEIPT) Tj\n");
        stream.append("/F1 10 Tf\n");
        stream.append("0 -24 Td\n");
        stream.append("(Receipt Reference: REC-INV-").append(bill.getBillId()).append("   Issue Date: ").append(date).append(") Tj\n");
        stream.append("0 -18 Td\n");
        stream.append("(Patient Name: ").append(patient).append("   Status: ").append(status).append(") Tj\n");
        stream.append("0 -25 Td\n");
        stream.append("(----------------------------------------------------------------------) Tj\n");
        stream.append("0 -18 Td\n");
        stream.append("(Itemized Service Breakdown:                                    Amount) Tj\n");
        stream.append("0 -18 Td\n");
        stream.append("(1. Specialist Doctor Consultation Fee:                       $ ").append(consult).append(") Tj\n");
        stream.append("0 -18 Td\n");
        stream.append("(2. Diagnostic Laboratory Tests:                              $ ").append(lab).append(") Tj\n");
        stream.append("0 -18 Td\n");
        stream.append("(3. Pharmacy Formulations & Medications:                      $ ").append(pharma).append(") Tj\n");
        stream.append("0 -22 Td\n");
        stream.append("(----------------------------------------------------------------------) Tj\n");
        stream.append("0 -22 Td\n");
        stream.append("/F1 12 Tf\n");
        stream.append("(NET TOTAL PAID:                                              $ ").append(total).append(") Tj\n");
        stream.append("/F1 9 Tf\n");
        stream.append("0 -36 Td\n");
        stream.append("(Thank you for trusting IntelliCare Healthcare Network.) Tj\n");
        stream.append("0 -14 Td\n");
        stream.append("(Floor 1 Administration & Pharmacy, Contact: support@intellicare.com) Tj\n");
        stream.append("ET\n");

        byte[] streamBytes = stream.toString().getBytes(StandardCharsets.US_ASCII);
        int streamLen = streamBytes.length;

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PrintWriter pw = new PrintWriter(new OutputStreamWriter(baos, StandardCharsets.US_ASCII));
        List<Integer> offsets = new ArrayList<>();

        pw.print("%PDF-1.4\n");
        pw.flush();

        offsets.add(baos.size());
        pw.print("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");
        pw.flush();

        offsets.add(baos.size());
        pw.print("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n");
        pw.flush();

        offsets.add(baos.size());
        pw.print("3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n");
        pw.flush();

        offsets.add(baos.size());
        pw.print("4 0 obj\n<< /Length " + streamLen + " >>\nstream\n");
        pw.flush();
        try {
            baos.write(streamBytes);
        } catch (Exception ignored) {}
        pw.print("\nendstream\nendobj\n");
        pw.flush();

        offsets.add(baos.size());
        pw.print("5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n");
        pw.flush();

        int xrefOffset = baos.size();
        pw.print("xref\n0 6\n0000000000 65535 f \n");
        for (int off : offsets) {
            pw.printf(Locale.US, "%010d 00000 n \n", off);
        }
        pw.print("trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n" + xrefOffset + "\n%%EOF\n");
        pw.flush();

        return baos.toByteArray();
    }
}
