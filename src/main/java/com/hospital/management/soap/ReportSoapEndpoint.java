package com.hospital.management.soap;

import com.hospital.management.billing.Bill;
import com.hospital.management.billing.BillingRepository;
import com.hospital.management.medicalrecord.MedicalRecord;
import com.hospital.management.medicalrecord.MedicalRecordRepository;
import com.hospital.management.patient.Patient;
import com.hospital.management.patient.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.ws.server.endpoint.annotation.Endpoint;
import org.springframework.ws.server.endpoint.annotation.PayloadRoot;
import org.springframework.ws.server.endpoint.annotation.RequestPayload;
import org.springframework.ws.server.endpoint.annotation.ResponsePayload;

import java.util.List;

@Endpoint
public class ReportSoapEndpoint {

    private static final String NAMESPACE_URI = "http://hospital.com/management/soap";

    private final PatientRepository patientRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final BillingRepository billingRepository;

    @Autowired
    public ReportSoapEndpoint(PatientRepository patientRepository,
                               MedicalRecordRepository medicalRecordRepository,
                               BillingRepository billingRepository) {
        this.patientRepository = patientRepository;
        this.medicalRecordRepository = medicalRecordRepository;
        this.billingRepository = billingRepository;
    }

    @PayloadRoot(namespace = NAMESPACE_URI, localPart = "GetPatientMedicalReportRequest")
    @ResponsePayload
    public GetPatientMedicalReportResponse getPatientMedicalReport(@RequestPayload GetPatientMedicalReportRequest request) {
        GetPatientMedicalReportResponse response = new GetPatientMedicalReportResponse();
        
        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new RuntimeException("SOAP Error: Patient not found with ID: " + request.getPatientId()));

        response.setPatientId(patient.getPatientId());
        response.setPatientName(patient.getName());
        response.setAge(patient.getAge() != null ? patient.getAge() : 0);
        response.setGender(patient.getGender() != null ? patient.getGender() : "");
        response.setBloodGroup(patient.getBloodGroup() != null ? patient.getBloodGroup() : "");
        response.setAllergies(patient.getAllergies() != null ? patient.getAllergies() : "None");

        List<MedicalRecord> records = medicalRecordRepository.findByPatientPatientId(patient.getPatientId());
        for (MedicalRecord rec : records) {
            MedicalRecordItem item = new MedicalRecordItem();
            item.setRecordId(rec.getRecordId());
            item.setDoctorName(rec.getDoctor() != null ? rec.getDoctor().getName() : "Unknown");
            item.setDiagnosis(rec.getDiagnosis() != null ? rec.getDiagnosis() : "");
            item.setPrescription(rec.getPrescription() != null ? rec.getPrescription() : "");
            item.setVisitDate(rec.getVisitDate() != null ? rec.getVisitDate().toString() : "");
            item.setNotes(rec.getNotes() != null ? rec.getNotes() : "");
            response.getMedicalHistory().add(item);
        }

        return response;
    }

    @PayloadRoot(namespace = NAMESPACE_URI, localPart = "GetBillingReportRequest")
    @ResponsePayload
    public GetBillingReportResponse getBillingReport(@RequestPayload GetBillingReportRequest request) {
        GetBillingReportResponse response = new GetBillingReportResponse();

        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new RuntimeException("SOAP Error: Patient not found with ID: " + request.getPatientId()));

        response.setPatientId(patient.getPatientId());
        response.setPatientName(patient.getName());

        List<Bill> bills = billingRepository.findByPatientPatientId(patient.getPatientId());
        double totalConsult = 0;
        double totalLab = 0;
        double totalPharm = 0;
        double grandTotal = 0;

        for (Bill bill : bills) {
            totalConsult += bill.getConsultationFee() != null ? bill.getConsultationFee() : 0;
            totalLab += bill.getLaboratoryFee() != null ? bill.getLaboratoryFee() : 0;
            totalPharm += bill.getPharmacyFee() != null ? bill.getPharmacyFee() : 0;
            grandTotal += bill.getTotalAmount() != null ? bill.getTotalAmount() : 0;

            BillItem item = new BillItem();
            item.setBillId(bill.getBillId());
            item.setConsultationFee(bill.getConsultationFee() != null ? bill.getConsultationFee() : 0);
            item.setLaboratoryFee(bill.getLaboratoryFee() != null ? bill.getLaboratoryFee() : 0);
            item.setPharmacyFee(bill.getPharmacyFee() != null ? bill.getPharmacyFee() : 0);
            item.setTotalAmount(bill.getTotalAmount() != null ? bill.getTotalAmount() : 0);
            item.setPaymentStatus(bill.getPaymentStatus() != null ? bill.getPaymentStatus().name() : "PENDING");
            item.setBillDate(bill.getBillDate() != null ? bill.getBillDate().toString() : "");
            response.getBills().add(item);
        }

        response.setTotalConsultationFee(totalConsult);
        response.setTotalLaboratoryFee(totalLab);
        response.setTotalPharmacyFee(totalPharm);
        response.setGrandTotal(grandTotal);

        return response;
    }
}
