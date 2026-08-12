package com.hospital.management.pharmacy;

import com.hospital.management.common.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class PharmacyController {

    private final PharmacyService pharmacyService;

    @Autowired
    public PharmacyController(PharmacyService pharmacyService) {
        this.pharmacyService = pharmacyService;
    }

    @PostMapping("/medicines")
    public ResponseEntity<ApiResponse<MedicineDTO>> addMedicine(@Valid @RequestBody MedicineDTO dto) {
        MedicineDTO created = pharmacyService.addMedicine(dto);
        return new ResponseEntity<>(
                ApiResponse.success("Medicine added successfully", created),
                HttpStatus.CREATED
        );
    }

    @GetMapping("/medicines")
    public ResponseEntity<ApiResponse<List<MedicineDTO>>> getAllMedicines() {
        List<MedicineDTO> list = pharmacyService.getAllMedicines();
        return ResponseEntity.ok(ApiResponse.success("Medicines retrieved successfully", list));
    }

    @GetMapping("/medicines/{id}")
    public ResponseEntity<ApiResponse<MedicineDTO>> getMedicineById(@PathVariable Long id) {
        MedicineDTO medicine = pharmacyService.getMedicineById(id);
        return ResponseEntity.ok(ApiResponse.success("Medicine retrieved successfully", medicine));
    }

    @GetMapping("/medicines/search")
    public ResponseEntity<ApiResponse<List<MedicineDTO>>> searchMedicines(@RequestParam String query) {
        List<MedicineDTO> list = pharmacyService.searchMedicines(query);
        return ResponseEntity.ok(ApiResponse.success("Medicine search completed", list));
    }

    @PutMapping("/medicines/{id}")
    public ResponseEntity<ApiResponse<MedicineDTO>> updateMedicine(@PathVariable Long id, @Valid @RequestBody MedicineDTO dto) {
        MedicineDTO updated = pharmacyService.updateMedicine(id, dto);
        return ResponseEntity.ok(ApiResponse.success("Medicine updated successfully", updated));
    }

    @PostMapping("/prescriptions")
    public ResponseEntity<ApiResponse<PrescriptionDTO>> createPrescription(@Valid @RequestBody PrescriptionDTO dto) {
        PrescriptionDTO created = pharmacyService.createPrescription(dto);
        return new ResponseEntity<>(
                ApiResponse.success("Prescription created & medication safety validated", created),
                HttpStatus.CREATED
        );
    }

    @GetMapping("/prescriptions/{id}")
    public ResponseEntity<ApiResponse<PrescriptionDTO>> getPrescriptionById(@PathVariable Long id) {
        PrescriptionDTO prescription = pharmacyService.getPrescriptionById(id);
        return ResponseEntity.ok(ApiResponse.success("Prescription retrieved successfully", prescription));
    }

    @GetMapping("/prescriptions/patient/{patientId}")
    public ResponseEntity<ApiResponse<List<PrescriptionDTO>>> getPrescriptionsByPatient(@PathVariable Long patientId) {
        List<PrescriptionDTO> list = pharmacyService.getPrescriptionsByPatient(patientId);
        return ResponseEntity.ok(ApiResponse.success("Patient prescriptions retrieved", list));
    }
}
