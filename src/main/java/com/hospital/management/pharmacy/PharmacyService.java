package com.hospital.management.pharmacy;

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

    @Autowired
    public PharmacyService(PharmacyRepository pharmacyRepository,
                           PrescriptionRepository prescriptionRepository,
                           PatientRepository patientRepository,
                           DoctorRepository doctorRepository,
                           MedicationSafetyService medicationSafetyService) {
        this.pharmacyRepository = pharmacyRepository;
        this.prescriptionRepository = prescriptionRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.medicationSafetyService = medicationSafetyService;
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

        // 1. Transactional Medication Safety Validation (Allergy, Stock, Duplicates)
        medicationSafetyService.validatePrescriptionSafety(patient, dto.getItems());

        // 2. Prepare Prescription Entity & Deduct Stock Atomically
        Prescription prescription = new Prescription();
        prescription.setPatient(patient);
        prescription.setDoctor(doctor);
        prescription.setDuration(dto.getDuration());
        prescription.setInstructions(dto.getInstructions());
        prescription.setPrescriptionDate(dto.getPrescriptionDate() != null ? dto.getPrescriptionDate() : LocalDate.now());

        List<PrescriptionItem> items = new ArrayList<>();
        for (PrescriptionItemDTO itemDTO : dto.getItems()) {
            Medicine medicine = pharmacyRepository.findById(itemDTO.getMedicineId()).get();
            
            // Deduct stock quantity
            medicine.setStockQuantity(medicine.getStockQuantity() - itemDTO.getQuantity());
            pharmacyRepository.save(medicine);

            PrescriptionItem item = new PrescriptionItem();
            item.setMedicine(medicine);
            item.setQuantity(itemDTO.getQuantity());
            item.setDosage(itemDTO.getDosage());
            items.add(item);
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

    public PrescriptionDTO mapPrescriptionToDTO(Prescription entity) {
        List<PrescriptionItemDTO> itemDTOs = entity.getItems().stream()
                .map(item -> new PrescriptionItemDTO(
                        item.getMedicine().getMedicineId(),
                        item.getMedicine().getMedicineName(),
                        item.getQuantity(),
                        item.getDosage()
                ))
                .collect(Collectors.toList());

        return new PrescriptionDTO(
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
    }
}
