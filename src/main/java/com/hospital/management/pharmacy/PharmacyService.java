package com.hospital.management.pharmacy;

import com.hospital.management.billing.BillingService;

import com.hospital.management.doctor.Doctor;
import com.hospital.management.doctor.DoctorRepository;
import com.hospital.management.exception.ResourceNotFoundException;
import com.hospital.management.patient.Patient;
import com.hospital.management.patient.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PharmacyService {

    private final PharmacyRepository pharmacyRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final MedicationSafetyService medicationSafetyService;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final BillingService billingService;

    @Autowired
    public PharmacyService(PharmacyRepository pharmacyRepository,
                           PrescriptionRepository prescriptionRepository,
                           PatientRepository patientRepository,
                           DoctorRepository doctorRepository,
                           MedicationSafetyService medicationSafetyService,
                           PurchaseOrderRepository purchaseOrderRepository,
                           BillingService billingService) {
        this.pharmacyRepository = pharmacyRepository;
        this.prescriptionRepository = prescriptionRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.medicationSafetyService = medicationSafetyService;
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.billingService = billingService;
    }

    @Transactional
    public MedicineDTO addMedicine(MedicineDTO dto) {
        Medicine medicine = mapMedicineToEntity(dto);
        Medicine saved = pharmacyRepository.save(medicine);
        return mapMedicineToDTO(saved);
    }

    public List<MedicineDTO> getAllMedicines() {
        return pharmacyRepository.findAll().stream()
                .map(this::mapMedicineToDTO)
                .collect(Collectors.toList());
    }

    public List<MedicineDTO> searchMedicines(String name) {
        return pharmacyRepository.findByMedicineNameContainingIgnoreCase(name).stream()
                .map(this::mapMedicineToDTO)
                .collect(Collectors.toList());
    }

    public MedicineDTO getMedicineById(Long id) {
        Medicine medicine = pharmacyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine not found with ID: " + id));
        return mapMedicineToDTO(medicine);
    }

    @Transactional
    public MedicineDTO updateMedicine(Long id, MedicineDTO dto) {
        Medicine medicine = pharmacyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine not found with ID: " + id));

        medicine.setMedicineName(dto.getMedicineName());
        medicine.setCategory(dto.getCategory());
        medicine.setStockQuantity(dto.getStockQuantity());
        medicine.setDosage(dto.getDosage());
        medicine.setExpiryDate(dto.getExpiryDate());
        medicine.setPrice(dto.getPrice());

        Medicine updated = pharmacyRepository.save(medicine);
        return mapMedicineToDTO(updated);
    }

    @Transactional
    public PrescriptionDTO createPrescription(PrescriptionDTO dto) {
        Patient patient = patientRepository.findById(dto.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + dto.getPatientId()));

        Doctor doctor = doctorRepository.findById(dto.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with ID: " + dto.getDoctorId()));

        // Resolve medicine items and match/create if needed
        if (dto.getItems() != null) {
            for (PrescriptionItemDTO itemDTO : dto.getItems()) {
                Medicine medicine = null;
                if (itemDTO.getMedicineId() != null) {
                    medicine = pharmacyRepository.findById(itemDTO.getMedicineId()).orElse(null);
                }
                if (medicine == null && itemDTO.getMedicineName() != null && !itemDTO.getMedicineName().trim().isEmpty()) {
                    String cleanName = itemDTO.getMedicineName().trim();
                    medicine = pharmacyRepository.findByMedicineNameIgnoreCase(cleanName).orElse(null);
                    if (medicine == null) {
                        medicine = new Medicine();
                        medicine.setMedicineName(cleanName);
                        medicine.setCategory("Prescription OPD");
                        medicine.setStockQuantity(100);
                        medicine.setDosage(itemDTO.getDosage() != null ? itemDTO.getDosage() : "As directed");
                        medicine.setPrice(25.0);
                        medicine.setExpiryDate(LocalDate.now().plusYears(1));
                        medicine = pharmacyRepository.save(medicine);
                    }
                    itemDTO.setMedicineId(medicine.getMedicineId());
                    itemDTO.setMedicineName(medicine.getMedicineName());
                }
            }
        }

        // 1. Transactional Medication Safety Validation (Allergy, Stock, Duplicates)
        if (dto.getItems() != null && !dto.getItems().isEmpty()) {
            medicationSafetyService.validatePrescriptionSafety(patient, dto.getItems());
        }

        // 2. Prepare Prescription Entity & Deduct Stock Atomically
        Prescription prescription = new Prescription();
        prescription.setPatient(patient);
        prescription.setDoctor(doctor);
        prescription.setDuration(dto.getDuration());
        prescription.setInstructions(dto.getInstructions());
        prescription.setPrescriptionDate(dto.getPrescriptionDate() != null ? dto.getPrescriptionDate() : LocalDate.now());

        List<PrescriptionItem> items = new ArrayList<>();
        if (dto.getItems() != null) {
            for (PrescriptionItemDTO itemDTO : dto.getItems()) {
                Medicine medicine = null;
                if (itemDTO.getMedicineId() != null) {
                    medicine = pharmacyRepository.findById(itemDTO.getMedicineId()).orElse(null);
                }
                if (medicine == null && itemDTO.getMedicineName() != null) {
                    medicine = pharmacyRepository.findByMedicineNameIgnoreCase(itemDTO.getMedicineName().trim()).orElse(null);
                }
                if (medicine != null) {
                    int qty = itemDTO.getQuantity() != null && itemDTO.getQuantity() > 0 ? itemDTO.getQuantity() : 1;
                    if (medicine.getStockQuantity() != null && medicine.getStockQuantity() >= qty) {
                        medicine.setStockQuantity(medicine.getStockQuantity() - qty);
                    }
                    pharmacyRepository.save(medicine);

                    PrescriptionItem item = new PrescriptionItem();
                    item.setMedicine(medicine);
                    item.setQuantity(qty);
                    item.setDosage(itemDTO.getDosage() != null ? itemDTO.getDosage() : medicine.getDosage());
                    items.add(item);
                }
            }
        }
        prescription.setItems(items);

        Prescription saved = prescriptionRepository.save(prescription);
        return mapPrescriptionToDTO(saved);
    }

    public List<PrescriptionDTO> getPrescriptionsByPatient(Long patientId) {
        return prescriptionRepository.findByPatientPatientId(patientId).stream()
                .map(this::mapPrescriptionToDTO)
                .collect(Collectors.toList());
    }

    public PrescriptionDTO getPrescriptionById(Long id) {
        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription not found with ID: " + id));
        return mapPrescriptionToDTO(prescription);
    }

    public Medicine mapMedicineToEntity(MedicineDTO dto) {
        Medicine med = new Medicine();
        med.setMedicineId(dto.getMedicineId());
        med.setMedicineName(dto.getMedicineName());
        med.setCategory(dto.getCategory());
        med.setStockQuantity(dto.getStockQuantity());
        med.setDosage(dto.getDosage());
        med.setExpiryDate(dto.getExpiryDate());
        med.setPrice(dto.getPrice());
        return med;
    }

    public MedicineDTO mapMedicineToDTO(Medicine entity) {
        return new MedicineDTO(
                entity.getMedicineId(),
                entity.getMedicineName(),
                entity.getCategory(),
                entity.getStockQuantity(),
                entity.getDosage(),
                entity.getExpiryDate(),
                entity.getPrice()
        );
    }

    public List<PrescriptionDTO> getAllPrescriptions() {
        return prescriptionRepository.findAll().stream()
                .map(this::mapPrescriptionToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public PrescriptionDTO dispensePrescription(Long id) {
        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription not found with ID: " + id));
        prescription.setStatus(PrescriptionStatus.DISPENSED);
        Prescription saved = prescriptionRepository.save(prescription);
        return mapPrescriptionToDTO(saved);
    }

    public PrescriptionDTO mapPrescriptionToDTO(Prescription entity) {
        List<PrescriptionItemDTO> itemDTOs = entity.getItems() != null ? entity.getItems().stream()
                .map(item -> new PrescriptionItemDTO(
                        item.getMedicine().getMedicineId(),
                        item.getMedicine().getMedicineName(),
                        item.getQuantity(),
                        item.getDosage()
                ))
                .collect(Collectors.toList()) : new ArrayList<>();

        PrescriptionDTO dto = new PrescriptionDTO(
                entity.getPrescriptionId(),
                entity.getPatient().getPatientId(),
                entity.getPatient().getName(),
                entity.getDoctor().getDoctorId(),
                entity.getDoctor().getName(),
                itemDTOs,
                entity.getDuration(),
                entity.getInstructions(),
                entity.getPrescriptionDate()
        );
        dto.setStatus(entity.getStatus() != null ? entity.getStatus() : PrescriptionStatus.ISSUED);
        if (entity.getPatient() != null) {
            dto.setPatientAllergies(entity.getPatient().getAllergies());
        }
        return dto;
    }

    @Transactional
    public PurchaseOrderDTO createPurchaseOrder(PurchaseOrderDTO dto) {
        Medicine medicine = pharmacyRepository.findById(dto.getMedicineId())
                .orElseThrow(() -> new ResourceNotFoundException("Medicine not found with ID: " + dto.getMedicineId()));

        PurchaseOrder order = new PurchaseOrder(
                medicine,
                dto.getQuantity() != null ? dto.getQuantity() : 100,
                dto.getSupplier() != null ? dto.getSupplier() : "Standard Pharma Supply",
                dto.getUnitPrice() != null ? dto.getUnitPrice() : medicine.getPrice(),
                dto.getRequestedBy() != null ? dto.getRequestedBy() : "Pharmacy Dept",
                dto.getNotes()
        );
        PurchaseOrder saved = purchaseOrderRepository.save(order);
        return mapPurchaseOrderToDTO(saved);
    }

    public List<PurchaseOrderDTO> getAllPurchaseOrders() {
        return purchaseOrderRepository.findAllByOrderByIdDesc().stream()
                .map(this::mapPurchaseOrderToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public PurchaseOrderDTO receivePurchaseOrder(Long id) {
        PurchaseOrder order = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase Order not found with ID: " + id));

        order.setStatus("RECEIVED");
        order.setReceivedDate(LocalDate.now());

        Medicine medicine = order.getMedicine();
        if (medicine != null) {
            medicine.setStockQuantity(medicine.getStockQuantity() + order.getQuantity());
            pharmacyRepository.save(medicine);
        }

        PurchaseOrder updated = purchaseOrderRepository.save(order);
        return mapPurchaseOrderToDTO(updated);
    }

    @Transactional
    public PurchaseOrderDTO updatePurchaseOrderStatus(Long id, String status) {
        PurchaseOrder order = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase Order not found with ID: " + id));

        order.setStatus(status.toUpperCase());
        PurchaseOrder updated = purchaseOrderRepository.save(order);
        return mapPurchaseOrderToDTO(updated);
    }

    public PurchaseOrderDTO mapPurchaseOrderToDTO(PurchaseOrder order) {
        return new PurchaseOrderDTO(
                order.getId(),
                order.getMedicine() != null ? order.getMedicine().getMedicineId() : null,
                order.getMedicineName(),
                order.getQuantity(),
                order.getSupplier(),
                order.getUnitPrice(),
                order.getTotalCost(),
                order.getOrderDate(),
                order.getReceivedDate(),
                order.getStatus(),
                order.getRequestedBy(),
                order.getNotes()
        );
    }
}
