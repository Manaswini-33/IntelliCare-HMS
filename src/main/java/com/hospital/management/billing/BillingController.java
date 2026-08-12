package com.hospital.management.billing;

import com.hospital.management.common.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/billing")
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

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<ApiResponse<List<BillDTO>>> getBillsByPatient(@PathVariable Long patientId) {
        List<BillDTO> list = billingService.getBillsByPatient(patientId);
        return ResponseEntity.ok(ApiResponse.success("Patient bills retrieved", list));
    }

    @PostMapping("/{id}/payment")
    public ResponseEntity<ApiResponse<PaymentDTO>> processPayment(@PathVariable Long id, @Valid @RequestBody PaymentDTO dto) {
        PaymentDTO payment = billingService.processPayment(id, dto);
        return new ResponseEntity<>(
                ApiResponse.success("Payment processed successfully", payment),
                HttpStatus.CREATED
        );
    }
}
