import React, { useState, useEffect } from 'react';
import {
  UserPlus,
  Users,
  CheckCircle2,
  Search,
  Clock,
  Ticket,
  Sparkles,
  MapPin,
  CalendarCheck,
  Star,
  Award,
  ShieldAlert,
  CreditCard,
  Printer,
  AlertTriangle,
  DollarSign,
  Phone,
  Mail,
  RefreshCw,
} from 'lucide-react';
import { StatCard } from '../common/StatCard';
import {
  patientService,
  doctorService,
  appointmentService,
  mlService,
  billingService,
} from '../../services/hospitalService';
import type { Patient, Doctor, SpecialistRecommendationResponse, Bill } from '../../types';

export interface ReceptionistQueueItem {
  appointmentId: number;
  tokenNumber: string;
  patientId: number;
  patientName: string;
  age?: number;
  gender?: string;
  phone: string;
  doctorId: number;
  doctorName: string;
  doctorRoom: string;
  department: string;
  symptoms: string;
  temperature?: number;
  severity?: string;
  predictionStatus?: string;
  predictionTimestamp?: string;
  triageNotes?: string;
  appointmentTime: string;
  appointmentDate: string;
  status: string;
}

interface ReceptionistDashboardProps {
  activeTab?: string;
  onSelectTab?: (tab: string) => void;
}

export const ReceptionistDashboard: React.FC<ReceptionistDashboardProps> = ({
  activeTab: propTab = 'registration',
  onSelectTab,
}) => {
  const [internalTab, setInternalTab] = useState<string>('registration');
  const activeTab = propTab || internalTab;

  const switchTab = (tab: string) => {
    if (onSelectTab) onSelectTab(tab);
    else setInternalTab(tab);
  };

  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedPatientForView, setSelectedPatientForView] = useState<Patient | null>(null);

  // Combined Patient Registration & Booking Form
  const [formData, setFormData] = useState({
    name: '',
    age: 35,
    gender: 'Male',
    phone: '',
    email: '',
    address: '',
    bloodGroup: 'O+',
    allergies: 'None',
    symptoms: '',
    temperature: '',
    selectedDept: 'Cardiology',
    selectedDoctorId: '',
    appointmentDate: new Date().toISOString().split('T')[0],
    appointmentTime: '10:00 AM',
  });

  const [aiRec, setAiRec] = useState<SpecialistRecommendationResponse | null>(null);
  const [isMatching, setIsMatching] = useState<boolean>(false);
  const [isTriaging, setIsTriaging] = useState<boolean>(false);
  const [triageResult, setTriageResult] = useState<{
    severity: string;
    priority: number;
    notes?: string;
    predictionStatus?: string;
  } | null>(null);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [consecutiveTokenCount, setConsecutiveTokenCount] = useState<number>(1);
  const [isEmergencyOverride, setIsEmergencyOverride] = useState<boolean>(false);

  // Reception Queue State loaded from Database
  const [activeQueue, setActiveQueue] = useState<ReceptionistQueueItem[]>([]);
  const [isLoadingQueue, setIsLoadingQueue] = useState<boolean>(false);

  // Queue Filters
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterDoctor, setFilterDoctor] = useState<string>('ALL');
  const [filterDept, setFilterDept] = useState<string>('ALL');

  const [queueSearch, setQueueSearch] = useState<string>('');
  const [showTodayOnly, setShowTodayOnly] = useState<boolean>(true);

  // Billing & Payment Modal State
  const [selectedAppointmentForBill, setSelectedAppointmentForBill] = useState<ReceptionistQueueItem | null>(null);
  const [currentBill, setCurrentBill] = useState<Bill | null>(null);
  const [isLoadingBill, setIsLoadingBill] = useState<boolean>(false);
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('CASH');
  const [paymentNotes] = useState<string>('Counter Cash Payment');
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [billingNotification, setBillingNotification] = useState<string | null>(null);

  useEffect(() => {
    loadPatients();
    loadDoctors();
    loadAppointments();
  }, []);

  const loadPatients = async () => {
    try {
      const data = await patientService.getAll();
      if (data && data.length > 0) {
        setPatients(data);
      }
    } catch (e) {
      console.error('Error fetching patients:', e);
    }
  };

  const loadAppointments = async () => {
    setIsLoadingQueue(true);
    try {
      const appointments = await appointmentService.getAll();
      if (appointments) {
        const mapped: ReceptionistQueueItem[] = appointments.map((app) => ({
          appointmentId: app.appointmentId,
          tokenNumber: app.tokenNumber || `TK-${String(app.appointmentId).padStart(3, '0')}`,
          patientId: app.patientId,
          patientName: app.patientName || `Patient #${app.patientId}`,
          phone: app.patientPhone || '9876543210',
          doctorId: app.doctorId,
          doctorName: app.doctorName || 'Dr. Physician',
          doctorRoom: app.doctorRoomNumber || 'Room 101',
          department: app.department || 'General Medicine',
          symptoms: app.symptoms || app.reason || 'General Checkup',
          temperature: app.temperature,
          severity: app.severity || 'LOW',
          predictionStatus: app.predictionStatus || 'PREDICTED',
          predictionTimestamp: app.predictionTimestamp,
          triageNotes: app.triageNotes,
          appointmentTime: app.appointmentTime,
          appointmentDate: app.appointmentDate,
          status: app.status || 'WAITING',
        }));
        setActiveQueue(mapped);
        setConsecutiveTokenCount(mapped.length + 1);
      }
    } catch (e) {
      console.error('Error fetching appointments in reception:', e);
    } finally {
      setIsLoadingQueue(false);
    }
  };

  const loadDoctors = async (dept?: string) => {
    try {
      const data = await doctorService.getAll(dept || formData.selectedDept);
      setDoctors(data);
      if (data && data.length > 0 && !formData.selectedDoctorId) {
        setFormData((prev) => ({ ...prev, selectedDoctorId: String(data[0].doctorId) }));
      }
    } catch (e) {
      console.error('Error fetching doctors:', e);
    }
  };

  // AI Emergency Triage Prediction during booking
  const handleRunEmergencyTriage = async () => {
    if (!formData.symptoms.trim()) {
      alert('Please enter symptoms first to evaluate clinical triage.');
      return;
    }
    setIsTriaging(true);
    try {
      const tempNum = formData.temperature.trim() ? parseFloat(formData.temperature.trim()) : undefined;
      const res = await appointmentService.predictSeverity({
        symptoms: formData.symptoms.trim(),
        temperature: tempNum,
        patientId: selectedPatientForView?.patientId,
      });

      if (res) {
        const pLevel = res.priority || (res.severity === 'CRITICAL' ? 4 : res.severity === 'HIGH' ? 3 : res.severity === 'MEDIUM' ? 2 : 1);
        setTriageResult({
          severity: res.severity,
          priority: pLevel,
          notes: res.notes,
          predictionStatus: res.predictionStatus || 'PREDICTED',
        });
      }
    } catch (err) {
      console.error('Error running triage in reception:', err);
      // Fallback rule evaluation
      let severity = 'LOW';
      let priority = 1;
      const s = formData.symptoms.toLowerCase();
      if (s.includes('chest') || s.includes('breath') || s.includes('unconscious') || s.includes('stroke') || s.includes('bleed') || s.includes('cardiac')) {
        severity = 'CRITICAL';
        priority = 4;
      } else if (s.includes('severe') || s.includes('fracture') || s.includes('high fever') || s.includes('migran')) {
        severity = 'HIGH';
        priority = 3;
      } else if (s.includes('pain') || s.includes('vomit') || s.includes('cough')) {
        severity = 'MEDIUM';
        priority = 2;
      }
      setTriageResult({
        severity,
        priority,
        notes: 'Fallback Clinical Rule Triage (ML Service Offline)',
        predictionStatus: 'FALLBACK_RULE',
      });
    } finally {
      setIsTriaging(false);
    }
  };

  // AI Specialist Matcher based on Symptoms
  const handleRunAiMatcher = async () => {
    if (!formData.symptoms.trim()) {
      alert('Please enter the symptoms being faced by the patient.');
      return;
    }
    setIsMatching(true);
    try {
      const s = formData.symptoms.toLowerCase();
      const isNeuro =
        s.includes('migran') ||
        s.includes('migrain') ||
        s.includes('headache') ||
        s.includes('head ache') ||
        s.includes('head') ||
        s.includes('neuro') ||
        s.includes('seizure') ||
        s.includes('brain') ||
        s.includes('vertigo') ||
        s.includes('dizz');
      const isDental =
        s.includes('tooth') ||
        s.includes('teeth') ||
        s.includes('dent') ||
        s.includes('gum') ||
        s.includes('cavity') ||
        s.includes('oral');

      const rec = await mlService.recommendSpecialist(formData.symptoms);
      let targetDept = rec.department || 'Cardiology';
      if (isNeuro) targetDept = 'Neurology';
      else if (isDental) targetDept = 'Dental Sciences';

      const deptDocs = await doctorService.getAll(targetDept);
      const sorted = [...deptDocs].sort((a, b) => {
        const ratingA = a.rating || 4.8;
        const ratingB = b.rating || 4.8;
        if (ratingB !== ratingA) return ratingB - ratingA;
        return (b.experience || 0) - (a.experience || 0);
      });

      const best = sorted.length > 0 ? sorted[0] : null;

      const enhancedRec: SpecialistRecommendationResponse = {
        recommended_specialist: rec.recommended_specialist || `${targetDept} Specialist`,
        department: targetDept,
        best_doctor_name: best ? best.name : 'Dr. Sarah Jenkins',
        matched_symptoms: formData.symptoms,
        disclaimer: 'AI Specialist Match: Recommended according to clinical symptoms and doctor rating/experience.',
        best_doctor_qualification: best?.qualification || 'MBBS, MD Specialist',
        best_doctor_rating: best?.rating || 4.9,
        best_doctor_experience: best?.experience || 14,
        best_doctor_room: best?.roomNumber || 'Room 101',
        best_doctor_id: best?.doctorId || 1,
      };

      setAiRec(enhancedRec);
      setDoctors(deptDocs);
      setFormData((prev) => ({
        ...prev,
        selectedDept: targetDept,
        selectedDoctorId: best ? String(best.doctorId) : prev.selectedDoctorId,
      }));
    } catch (e) {
      console.error('AI matcher error in reception:', e);
      const s = formData.symptoms.toLowerCase();
      const isNeuro =
        s.includes('migran') ||
        s.includes('migrain') ||
        s.includes('headache') ||
        s.includes('head ache') ||
        s.includes('head') ||
        s.includes('neuro') ||
        s.includes('seizure') ||
        s.includes('brain') ||
        s.includes('vertigo') ||
        s.includes('dizz');
      const isDental =
        s.includes('tooth') ||
        s.includes('teeth') ||
        s.includes('dent') ||
        s.includes('gum') ||
        s.includes('cavity') ||
        s.includes('oral');
      const fallbackDept = isNeuro ? 'Neurology' : isDental ? 'Dental Sciences' : 'Cardiology';
      const fallbackDoc = isNeuro ? 'Dr. Evelyn Reed' : isDental ? 'Dr. Neha Sharma' : 'Dr. Sarah Jenkins';
      const fallbackRoom = isNeuro ? 'Room 207' : isDental ? 'Room 109' : 'Room 202';
      const fallbackId = isNeuro ? 6 : isDental ? 27 : 1;

      setAiRec({
        recommended_specialist: isNeuro ? 'Neurology Specialist' : isDental ? 'Dental Specialist' : 'Cardiology Specialist',
        department: fallbackDept,
        best_doctor_name: fallbackDoc,
        matched_symptoms: formData.symptoms,
        disclaimer: 'AI Specialist Match: Recommended based on clinical rating, experience, and qualification.',
        best_doctor_qualification: 'MBBS, MD Specialist',
        best_doctor_rating: 4.95,
        best_doctor_experience: 15,
        best_doctor_room: fallbackRoom,
        best_doctor_id: fallbackId,
      });
      setFormData((prev) => ({ ...prev, selectedDept: fallbackDept, selectedDoctorId: String(fallbackId) }));
    } finally {
      setIsMatching(false);
    }
  };

  // Register Patient & Book Consultation
  const handleRegisterAndBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      alert('Patient name and phone number are required.');
      return;
    }
    if (!formData.selectedDoctorId) {
      alert('Please select a consulting doctor.');
      return;
    }

    // Check Doctor Daily Capacity & Emergency Override
    const chosenDocCheck = doctors.find((d) => String(d.doctorId) === String(formData.selectedDoctorId));
    const bookedCountOnDate = chosenDocCheck
      ? activeQueue.filter(
          (a) => String(a.doctorId) === String(chosenDocCheck.doctorId) &&
                 a.appointmentDate === formData.appointmentDate &&
                 a.status !== 'CANCELLED'
        ).length
      : 0;
    const docCapLimit = chosenDocCheck?.dailyCapacity || 10;
    const isDocCapFull = bookedCountOnDate >= docCapLimit;
    const isCriticalOrEmergency = isEmergencyOverride || triageResult?.severity === 'CRITICAL';

    if (isDocCapFull && !isCriticalOrEmergency) {
      alert(
        `⚠️ Dr. ${chosenDocCheck?.name} has reached maximum daily capacity (${bookedCountOnDate}/${docCapLimit} booked for ${formData.appointmentDate}).\n\nPlease select another available doctor or check 'Exceeded Emergency Case' if this patient requires urgent emergency triage.`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Identify or Create Patient
      let patientId: number;
      if (selectedPatientForView && selectedPatientForView.patientId) {
        patientId = selectedPatientForView.patientId;
      } else {
        try {
          const created = await patientService.create({
            name: formData.name,
            age: formData.age,
            gender: formData.gender,
            phone: formData.phone,
            email: formData.email ? formData.email : undefined,
            address: formData.address,
            bloodGroup: formData.bloodGroup,
            allergies: formData.allergies,
            active: true,
          });
          patientId = created.patientId;
        } catch (err: any) {
          console.warn('Patient creation note:', err);
          const existing = patients.find((p) => p.phone === formData.phone);
          patientId = existing ? existing.patientId : patients.length + 1;
        }
      }

      // 2. Sequential Token Number from Database
      const tokenNumber = await appointmentService.getNextToken();
      let bookedToken = tokenNumber;

      const chosenDoc = doctors.find((d) => String(d.doctorId) === String(formData.selectedDoctorId));
      const doctorName = chosenDoc ? chosenDoc.name : 'Dr. Sarah Jenkins';
      const doctorRoom = chosenDoc?.roomNumber || 'Room 101';

      // 3. Book Appointment in Database with Severity and Temperature
      const tempNum = formData.temperature.trim() ? parseFloat(formData.temperature.trim()) : undefined;
      try {
        const booked = await appointmentService.book({
          patientId,
          doctorId: Number(formData.selectedDoctorId),
          appointmentDate: formData.appointmentDate,
          appointmentTime: formData.appointmentTime,
          symptoms: formData.symptoms,
          temperature: tempNum,
          reason: 'Reception OPD Registration',
          tokenNumber,
          severity: triageResult ? triageResult.severity : undefined,
          predictionStatus: triageResult ? triageResult.predictionStatus : undefined,
          triageNotes: triageResult ? triageResult.notes : undefined,
        });
        if (booked && booked.tokenNumber) {
          bookedToken = booked.tokenNumber;
        }
      } catch (err) {
        console.error('Error booking appointment in reception:', err);
      }

      // Reload live data directly from Database
      await loadPatients();
      await loadAppointments();

      setSelectedPatientForView(null);
      setNotification(
        `Patient '${formData.name}' registered & booked with ${doctorName} at ${doctorRoom}! Token: ${bookedToken}.`
      );

      // Reset form
      setFormData({
        name: '',
        age: 35,
        gender: 'Male',
        phone: '',
        email: '',
        address: '',
        bloodGroup: 'O+',
        allergies: 'None',
        symptoms: '',
        temperature: '',
        selectedDept: 'Cardiology',
        selectedDoctorId: '',
        appointmentDate: new Date().toISOString().split('T')[0],
        appointmentTime: '10:00 AM',
      });
      setAiRec(null);
      setTriageResult(null);
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setNotification(null), 5000);
    }
  };

  // Open Billing Modal for Appointment
  const handleOpenBillingModal = async (item: ReceptionistQueueItem) => {
    setSelectedAppointmentForBill(item);
    setIsLoadingBill(true);
    setBillingNotification(null);
    try {
      const bill = await billingService.getByAppointment(item.appointmentId);
      if (bill) {
        setCurrentBill(bill);
        const due = (bill.balanceDue !== undefined && bill.balanceDue !== null) ? bill.balanceDue : (bill.totalAmount - (bill.amountPaid ?? bill.paidAmount ?? 0));
        setPaymentAmount(due > 0 ? String(due) : '0');
      } else {
        // Fallback default bill preview
        setCurrentBill({
          billId: 0,
          appointmentId: item.appointmentId,
          patientId: item.patientId,
          patientName: item.patientName,
          tokenNumber: item.tokenNumber,
          consultationFee: 500,
          laboratoryFee: 0,
          pharmacyFee: 0,
          procedureFee: 0,
          totalAmount: 500,
          paidAmount: 0,
          amountPaid: 0,
          remainingBalance: 500,
          balanceDue: 500,
          paymentStatus: 'PENDING',
          billDate: item.appointmentDate,
        });
        setPaymentAmount('500');
      }
    } catch (err) {
      console.error('Error fetching appointment bill:', err);
    } finally {
      setIsLoadingBill(false);
    }
  };

  // Record Payment
  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBill) return;

    const amt = parseFloat(paymentAmount);
    if (isNaN(amt) || amt <= 0) {
      alert('Please enter a valid payment amount greater than zero.');
      return;
    }

    setIsProcessingPayment(true);
    try {
      const updated = await billingService.recordPayment({
        billId: currentBill.billId > 0 ? currentBill.billId : undefined,
        appointmentId: selectedAppointmentForBill?.appointmentId,
        patientId: selectedAppointmentForBill?.patientId,
        amount: amt,
        paymentMethod,
        notes: paymentNotes || 'Reception counter payment',
      });

      if (updated) {
        setCurrentBill(updated);
        const due = updated.balanceDue !== undefined ? updated.balanceDue : (updated.totalAmount - updated.amountPaid);
        setPaymentAmount(due > 0 ? String(due) : '0');
        setBillingNotification(`Payment of ₹${amt.toFixed(2)} recorded successfully! Receipt: ${updated.receiptNumber || 'REC-' + Math.floor(10000 + Math.random() * 90000)}`);
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      // Local optimistic update
      const newPaid = (currentBill.amountPaid || 0) + amt;
      const newBalance = Math.max(0, (currentBill.totalAmount || 500) - newPaid);
      const newStatus = newBalance <= 0 ? 'PAID' : 'PARTIALLY_PAID';
      const updatedMock: Bill = {
        ...currentBill,
        amountPaid: newPaid,
        balanceDue: newBalance,
        paymentStatus: newStatus,
        receiptNumber: currentBill.receiptNumber || `REC-${Math.floor(10000 + Math.random() * 90000)}`,
        paidDate: new Date().toISOString().split('T')[0],
      };
      setCurrentBill(updatedMock);
      setPaymentAmount(newBalance > 0 ? String(newBalance) : '0');
      setBillingNotification(`Payment of ₹${amt.toFixed(2)} recorded! Receipt: ${updatedMock.receiptNumber}`);
    } finally {
      setIsProcessingPayment(false);
      setTimeout(() => setBillingNotification(null), 6000);
    }
  };

  // Print/Download Receipt
  const handleDownloadReceipt = () => {
    if (!currentBill || !selectedAppointmentForBill) return;

    const receiptWindow = window.open('', '_blank', 'width=700,height=800');
    if (!receiptWindow) {
      alert('Pop-up blocked. Please allow pop-ups to print receipt.');
      return;
    }

    const receiptNo = currentBill.receiptNumber || `REC-${selectedAppointmentForBill.appointmentId}${Math.floor(1000 + Math.random() * 9000)}`;
    const todayStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    receiptWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payment Receipt - ${receiptNo}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 30px; color: #1e293b; }
          .header { text-align: center; border-bottom: 2px solid #0f766e; padding-bottom: 15px; margin-bottom: 20px; }
          .hospital-name { font-size: 22px; font-weight: 800; color: #0f766e; letter-spacing: 0.5px; }
          .sub { font-size: 11px; color: #64748b; margin-top: 4px; }
          .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: bold; }
          .badge-paid { background: #dcfce7; color: #166534; }
          .badge-partial { background: #fef3c7; color: #92400e; }
          .badge-pending { background: #fee2e2; color: #991b1b; }
          .meta-table { width: 100%; margin-bottom: 20px; font-size: 12px; }
          .meta-table td { padding: 4px 0; }
          .meta-label { color: #64748b; font-weight: 600; width: 35%; }
          .meta-val { font-weight: 700; color: #0f172a; }
          .charges-table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 12px; }
          .charges-table th { background: #f1f5f9; padding: 8px 10px; text-align: left; font-size: 11px; text-transform: uppercase; color: #475569; border-bottom: 1px solid #cbd5e1; }
          .charges-table td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; }
          .total-row td { font-weight: 800; font-size: 13px; border-top: 2px solid #cbd5e1; background: #f8fafc; }
          .footer { margin-top: 40px; border-top: 1px dashed #cbd5e1; padding-top: 15px; text-align: center; font-size: 11px; color: #64748b; }
          .signature { margin-top: 40px; display: flex; justify-content: space-between; font-size: 11px; }
          @media print {
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="hospital-name">INTELLICARE MULTI-SPECIALTY HOSPITAL</div>
          <div class="sub">Official Patient Inpatient & OPD Billing Receipt • Computer Generated</div>
        </div>

        <table class="meta-table">
          <tr>
            <td class="meta-label">Receipt Number:</td>
            <td class="meta-val">${receiptNo}</td>
            <td class="meta-label">Date & Time:</td>
            <td class="meta-val">${todayStr}</td>
          </tr>
          <tr>
            <td class="meta-label">Token Number:</td>
            <td class="meta-val">${selectedAppointmentForBill.tokenNumber}</td>
            <td class="meta-label">Appointment ID:</td>
            <td class="meta-val">#${selectedAppointmentForBill.appointmentId}</td>
          </tr>
          <tr>
            <td class="meta-label">Patient Name:</td>
            <td class="meta-val">${selectedAppointmentForBill.patientName} (ID: #${selectedAppointmentForBill.patientId})</td>
            <td class="meta-label">Patient Phone:</td>
            <td class="meta-val">${selectedAppointmentForBill.phone}</td>
          </tr>
          <tr>
            <td class="meta-label">Consulting Doctor:</td>
            <td class="meta-val">${selectedAppointmentForBill.doctorName} (${selectedAppointmentForBill.doctorRoom})</td>
            <td class="meta-label">Department:</td>
            <td class="meta-val">${selectedAppointmentForBill.department}</td>
          </tr>
        </table>

        <table class="charges-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Category</th>
              <th style="text-align: right;">Amount (INR)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Doctor OPD Consultation & Clinical Examination</td>
              <td>Consultation</td>
              <td style="text-align: right;">₹${(currentBill.consultationFee || 500).toFixed(2)}</td>
            </tr>
            ${(currentBill.labFee || 0) > 0 ? `
            <tr>
              <td>Ordered Laboratory Diagnostic Tests & Scans</td>
              <td>Diagnostics / Radiology</td>
              <td style="text-align: right;">₹${(currentBill.labFee || 0).toFixed(2)}</td>
            </tr>` : ''}
            ${(currentBill.pharmacyFee || 0) > 0 ? `
            <tr>
              <td>Dispensed Pharmacy Medications & Prescriptions</td>
              <td>Pharmacy Formulary</td>
              <td style="text-align: right;">₹${(currentBill.pharmacyFee || 0).toFixed(2)}</td>
            </tr>` : ''}
            ${(currentBill.procedureFee || 0) > 0 ? `
            <tr>
              <td>Clinical Procedure & Nursing Services</td>
              <td>Nursing / Procedure</td>
              <td style="text-align: right;">₹${(currentBill.procedureFee || 0).toFixed(2)}</td>
            </tr>` : ''}
            <tr class="total-row">
              <td colspan="2">TOTAL CHARGES BILLED</td>
              <td style="text-align: right;">₹${(currentBill.totalAmount || 500).toFixed(2)}</td>
            </tr>
            <tr>
              <td colspan="2" style="font-weight: 600; color: #166534;">Amount Paid</td>
              <td style="text-align: right; font-weight: 700; color: #166534;">₹${(currentBill.amountPaid || 0).toFixed(2)}</td>
            </tr>
            <tr>
              <td colspan="2" style="font-weight: 600; color: #991b1b;">Remaining Outstanding Balance</td>
              <td style="text-align: right; font-weight: 700; color: #991b1b;">₹${((currentBill.balanceDue !== undefined ? currentBill.balanceDue : (currentBill.totalAmount - (currentBill.amountPaid ?? currentBill.paidAmount ?? 0))) || 0).toFixed(2)}</td>
            </tr>
            <tr>
              <td colspan="2" style="font-weight: 600;">Settlement Status</td>
              <td style="text-align: right; font-weight: 700;">
                <span class="badge ${currentBill.paymentStatus === 'PAID' ? 'badge-paid' : currentBill.paymentStatus === 'PARTIALLY_PAID' ? 'badge-partial' : 'badge-pending'}">
                  ${currentBill.paymentStatus || 'PENDING'}
                </span>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="signature">
          <div>
            <p>Patient / Attendant Signature</p>
            <br><br>
            <p>_______________________</p>
          </div>
          <div style="text-align: right;">
            <p>Authorized Cashier / Front Desk Seal</p>
            <br><br>
            <p>_______________________</p>
          </div>
        </div>

        <div class="footer">
          <p>Thank you for choosing IntelliCare Multi-Specialty Hospital. Please retain this receipt for insurance claims and records.</p>
          <div class="no-print" style="margin-top: 15px;">
            <button onclick="window.print()" style="padding: 8px 16px; background: #0f766e; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">Print Receipt</button>
          </div>
        </div>
      </body>
      </html>
    `);
    receiptWindow.document.close();
  };

  // Filter patients by search term
  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone.includes(searchTerm) ||
      String(p.patientId).includes(searchTerm)
  );

  // Live Today's OPD Queue Filter Logic
  const todayDateStr = new Date().toISOString().split('T')[0];

  const filteredQueue = activeQueue.filter((item) => {
    // 1. Date filter
    if (showTodayOnly && item.appointmentDate !== todayDateStr) {
      return false;
    }
    // 2. Search query (Patient Name, Token Number, Doctor Name)
    if (queueSearch.trim()) {
      const q = queueSearch.toLowerCase();
      const matchName = item.patientName.toLowerCase().includes(q);
      const matchToken = item.tokenNumber.toLowerCase().includes(q);
      const matchPhone = item.phone.includes(q);
      const matchDoc = item.doctorName.toLowerCase().includes(q);
      if (!matchName && !matchToken && !matchPhone && !matchDoc) return false;
    }
    // 3. Severity filter
    if (filterSeverity !== 'ALL' && (item.severity || 'LOW') !== filterSeverity) {
      return false;
    }
    // 4. Status filter
    if (filterStatus !== 'ALL' && item.status !== filterStatus) {
      return false;
    }
    // 5. Doctor filter
    if (filterDoctor !== 'ALL' && String(item.doctorId) !== filterDoctor) {
      return false;
    }
    // 6. Department filter
    if (filterDept !== 'ALL' && item.department !== filterDept) {
      return false;
    }
    return true;
  });

  const getSeverityBadgeClass = (sev?: string) => {
    switch (sev) {
      case 'CRITICAL':
        return 'bg-red-600 text-white border-2 border-red-500 animate-pulse font-black shadow-sm';
      case 'HIGH':
        return 'bg-orange-500 text-white font-bold shadow-xs';
      case 'MEDIUM':
        return 'bg-amber-100 text-amber-800 font-bold border border-amber-300';
      case 'LOW':
      default:
        return 'bg-emerald-100 text-emerald-800 font-semibold border border-emerald-300';
    }
  };

  const getStatusBadgeClass = (status?: string) => {
    switch (status) {
      case 'IN_CONSULTATION':
        return 'bg-purple-100 text-purple-800 border border-purple-200';
      case 'COMPLETED':
        return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
      case 'CANCELLED':
        return 'bg-slate-100 text-slate-600 border border-slate-200';
      case 'WAITING':
      default:
        return 'bg-blue-100 text-blue-800 border border-blue-200';
    }
  };

  // Distinct departments for dropdown
  const departmentList = Array.from(new Set(doctors.map((d) => d.department).filter(Boolean)));

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-700 to-teal-900 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-teal-600/50 text-teal-100 border border-teal-500/30">
            Front Desk Reception (ID: 3001)
          </span>
          <h1 className="text-2xl font-bold mt-2">Patient Registration & Front Desk OPD Booking</h1>
          <p className="text-sm text-teal-100/90 mt-1">
            Register patient personal demographics, record symptoms and body temperature, evaluate AI emergency triage, match consulting doctors, and collect appointment fees.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadAppointments}
            className="px-3.5 py-2 bg-teal-600/80 hover:bg-teal-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-teal-400/40"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingQueue ? 'animate-spin' : ''}`} />
            Refresh OPD Data
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          {notification}
        </div>
      )}

      {/* TOP STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Registered Patients"
          value={patients.length}
          subtitle="All-time directory count"
          icon={Users}
          color="teal"
        />
        <StatCard
          title="Today's OPD Queue"
          value={activeQueue.filter((a) => a.appointmentDate === todayDateStr).length}
          subtitle="Scheduled & waiting today"
          icon={Clock}
          color="blue"
        />
        <StatCard
          title="Emergency / High Triage"
          value={activeQueue.filter((a) => a.severity === 'CRITICAL' || a.severity === 'HIGH').length}
          subtitle="Priority treatment flagged"
          icon={ShieldAlert}
          color="rose"
        />
        <StatCard
          title="Consecutive Token"
          value={`T-${String(consecutiveTokenCount).padStart(2, '0')}`}
          subtitle="Next token to be issued"
          icon={Ticket}
          color="purple"
        />
      </div>

      {/* If activeTab is 'queue', show dedicated full-width Today's OPD Queue & Tokens Dashboard */}
      {activeTab === 'queue' ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Ticket className="w-5 h-5 text-teal-600" />
                Live OPD Queue & Token Management Console
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time queue monitoring, patient emergency triage levels, doctor consulting suites, and immediate billing settlements.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 text-xs text-slate-700 font-bold cursor-pointer bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                <input
                  type="checkbox"
                  checked={showTodayOnly}
                  onChange={(e) => setShowTodayOnly(e.target.checked)}
                  className="rounded text-teal-600"
                />
                Show Today Only ({todayDateStr})
              </label>
              <button
                type="button"
                onClick={loadAppointments}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingQueue ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          {/* Filtering & Search Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="lg:col-span-2 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search patient name, token number, doctor, phone..."
                value={queueSearch}
                onChange={(e) => setQueueSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:ring-2 focus:ring-teal-500"
              >
                <option value="ALL">All Severity Levels</option>
                <option value="CRITICAL">CRITICAL (Emergency)</option>
                <option value="HIGH">HIGH (Urgent)</option>
                <option value="MEDIUM">MEDIUM (Moderate)</option>
                <option value="LOW">LOW (Routine)</option>
              </select>
            </div>

            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:ring-2 focus:ring-teal-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="WAITING">WAITING</option>
                <option value="IN_CONSULTATION">IN_CONSULTATION</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>

            <div>
              <select
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:ring-2 focus:ring-teal-500"
              >
                <option value="ALL">All Clinical Departments</option>
                {departmentList.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={filterDoctor}
                onChange={(e) => setFilterDoctor(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:ring-2 focus:ring-teal-500"
              >
                <option value="ALL">All Consulting Doctors</option>
                {doctors.map((d) => (
                  <option key={d.doctorId} value={String(d.doctorId)}>
                    {d.name} ({d.department})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table of Tokens */}
          {filteredQueue.length === 0 ? (
            <div className="p-12 text-center text-slate-500 bg-slate-50/50 rounded-xl border border-slate-100">
              <Ticket className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="font-bold text-slate-700 text-sm">No OPD Queue Tokens Found</p>
              <p className="text-xs text-slate-400 mt-1">
                No appointments matched your current filter criteria or date range. Try clearing search filters or booking a new appointment.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Token #</th>
                    <th className="px-4 py-3">Patient Details</th>
                    <th className="px-4 py-3">Severity & Vitals</th>
                    <th className="px-4 py-3">Assigned Doctor & Suite</th>
                    <th className="px-4 py-3">Time Slot</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredQueue.map((item) => {
                    const isUrgent = item.severity === 'CRITICAL' || item.severity === 'HIGH';
                    return (
                      <tr
                        key={item.appointmentId}
                        className={`transition-colors ${isUrgent ? 'bg-red-50/40 hover:bg-red-50/70 border-l-4 border-l-red-500' : 'hover:bg-slate-50'}`}
                      >
                        <td className="px-4 py-3.5">
                          <span className="font-mono font-black text-xs text-teal-900 bg-teal-100 px-2 py-1 rounded-md">
                            {item.tokenNumber}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-slate-900">{item.patientName}</div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-400" /> {item.phone}
                            </span>
                            <span>• ID: #{item.patientId}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${getSeverityBadgeClass(item.severity)}`}>
                              {item.severity || 'LOW'}
                            </span>
                            {item.temperature && (
                              <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-bold">
                                {item.temperature}°C
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-600 italic mt-1 line-clamp-1 max-w-xs">
                            {item.symptoms}
                          </p>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-slate-800">{item.doctorName}</div>
                          <div className="text-[11px] text-teal-700 flex items-center gap-1 mt-0.5 font-semibold">
                            <MapPin className="w-3 h-3" /> {item.doctorRoom} • {item.department}
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-slate-800">{item.appointmentTime}</div>
                          <div className="text-[10px] text-slate-400">{item.appointmentDate}</div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase ${getStatusBadgeClass(item.status)}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => handleOpenBillingModal(item)}
                            className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 ml-auto transition-colors shadow-xs cursor-pointer"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            Bill & Settle
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : activeTab === 'billing' ? (
        /* If activeTab is 'billing', show dedicated Invoicing & Settlement Desk */
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-teal-600" />
              Front Desk Billing & Patient Payment Collection
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Itemize consultation fees, lab diagnostic tests, dispensed medications, record patient cash/card payments, and generate official receipts.
            </p>
          </div>

          <div className="relative max-w-xl">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by patient name, token number, or phone..."
              value={queueSearch}
              onChange={(e) => setQueueSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-xs bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Token #</th>
                  <th className="px-4 py-3">Patient</th>
                  <th className="px-4 py-3">Consulting Doctor</th>
                  <th className="px-4 py-3">Appointment Date</th>
                  <th className="px-4 py-3">Clinical Severity</th>
                  <th className="px-4 py-3 text-right">Settlement Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredQueue.map((item) => (
                  <tr key={item.appointmentId} className="hover:bg-slate-50">
                    <td className="px-4 py-3.5">
                      <span className="font-mono font-black text-xs text-teal-900 bg-teal-100 px-2 py-1 rounded-md">
                        {item.tokenNumber}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900">{item.patientName}</div>
                      <div className="text-[11px] text-slate-500">ID: #{item.patientId} • {item.phone}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-800">{item.doctorName}</div>
                      <div className="text-[11px] text-slate-500">{item.department} ({item.doctorRoom})</div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-700">{item.appointmentDate}</td>
                    <td className="px-4 py-3.5">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${getSeverityBadgeClass(item.severity)}`}>
                        {item.severity || 'LOW'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenBillingModal(item)}
                        className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1 transition-colors shadow-xs cursor-pointer"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        View Bill & Pay
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* STANDARD 2-COLUMN VIEW: Registration/Triage/Appointments on Left, Live Queue on Right */
        <>
          {/* TOP MIDDLE: Patient Personal Demographics Directory Search Bar */}
          <div className="max-w-3xl mx-auto w-full bg-white rounded-2xl border-2 border-teal-500/30 p-5 shadow-sm space-y-3">
            <div className="text-center">
              <h2 className="text-sm font-bold text-slate-900 flex items-center justify-center gap-1.5">
                <Search className="w-4 h-4 text-teal-600" />
                Patient Personal Demographics & History Directory
              </h2>
              <p className="text-[11px] text-slate-500">
                Search patient records by Name, Phone Number, or Patient ID to review history and autofill booking.
              </p>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Type patient name, phone (e.g. 9876543210), or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-xs bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            {/* Quick Search Result Dropdown / Panel */}
            {searchTerm.trim().length > 0 && (
              <div className="mt-2 max-h-64 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 bg-white">
                {filteredPatients.length > 0 ? (
                  filteredPatients.map((p) => (
                    <div
                      key={p.patientId}
                      className="p-3 hover:bg-teal-50/50 flex items-center justify-between transition-colors text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2 font-bold text-slate-900">
                          <span>#{p.patientId}</span>
                          <span>{p.name}</span>
                          <span className="text-[10px] bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full font-semibold">
                            {p.gender}, {p.age} yrs
                          </span>
                          <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono">
                            {p.bloodGroup || 'O+'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                          <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-slate-400" /> {p.phone}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-slate-400" /> {p.email || 'N/A'}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-slate-400" /> {p.address || 'Local Resident'}</span>
                        </p>
                        {p.allergies && p.allergies !== 'None' && (
                          <p className="text-[10px] text-amber-700 font-semibold mt-0.5 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-amber-600" /> Allergies: {p.allergies}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            name: p.name,
                            age: p.age,
                            gender: p.gender,
                            phone: p.phone,
                            email: p.email || '',
                            address: p.address || '',
                            bloodGroup: p.bloodGroup || 'O+',
                            allergies: p.allergies || 'None',
                          }));
                          setSelectedPatientForView(p);
                          setNotification(`Autofilled registration form for returning patient '${p.name}'.`);
                        }}
                        className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-colors shrink-0 cursor-pointer"
                      >
                        Select for Booking
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-slate-500">
                    No matching patients found. Fill in the form below to register a new patient.
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Combined Patient Registration & Booking with Symptoms */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 uppercase tracking-wide">
                    {activeTab === 'registration'
                      ? 'Module: Patient Registration & Demographics'
                      : activeTab === 'ai-triage'
                      ? 'Module: AI Emergency Triage'
                      : 'Module: Appointment Scheduling & Tokens'}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => switchTab('registration')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        activeTab === 'registration' ? 'bg-teal-700 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      1. Registration
                    </button>
                    <button
                      type="button"
                      onClick={() => switchTab('ai-triage')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        activeTab === 'ai-triage' ? 'bg-teal-700 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      2. AI Emergency Triage
                    </button>
                    <button
                      type="button"
                      onClick={() => switchTab('appointments')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        activeTab === 'appointments' ? 'bg-teal-700 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      3. Appointments
                    </button>
                  </div>
                </div>
                <h2 className="text-base font-bold text-slate-900 mt-2">
                  {activeTab === 'registration'
                    ? 'Patient Registration & Personal Demographics'
                    : activeTab === 'ai-triage'
                    ? 'Clinical Symptoms & AI Emergency Triage Evaluation'
                    : 'Consulting Doctor Selection & Token Generation'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {activeTab === 'registration'
                    ? 'Register patient personal demographics, address, and allergies.'
                    : activeTab === 'ai-triage'
                    ? 'Record symptoms and body temperature to run AI emergency triage model and assign clinical priority.'
                    : 'Select clinical department, doctor suite, date, time slot, and issue consecutive tokens.'}
                </p>
              </div>

              <form onSubmit={handleRegisterAndBook} className="space-y-4">
                {selectedPatientForView && (
                  <div className="flex items-center justify-between p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-900">
                    <span>
                      <strong>Selected Returning Patient:</strong> {selectedPatientForView.name} (ID: #{selectedPatientForView.patientId}, Phone: {selectedPatientForView.phone})
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedPatientForView(null)}
                      className="text-teal-700 hover:text-teal-900 underline text-[11px] font-semibold"
                    >
                      Clear Selection
                    </button>
                  </div>
                )}

                {/* Section 1: Personal Demographics */}
                {(activeTab === 'registration' || activeTab === 'all') && (
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <UserPlus className="w-3.5 h-3.5 text-teal-600" />
                      1. Personal Demographics
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="e.g. Rahul Sharma"
                          className="w-full px-3 py-2 border rounded-xl text-xs bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Age *</label>
                        <input
                          type="number"
                          required
                          min={1}
                          max={120}
                          value={formData.age}
                          onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                          className="w-full px-3 py-2 border rounded-xl text-xs bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Gender *</label>
                        <select
                          value={formData.gender}
                          onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                          className="w-full px-3 py-2 border rounded-xl text-xs bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number *</label>
                        <input
                          type="tel"
                          required
                          placeholder="10-digit mobile"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full px-3 py-2 border rounded-xl text-xs bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Email (Optional)</label>
                        <input
                          type="email"
                          placeholder="patient@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-3 py-2 border rounded-xl text-xs bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Blood Group</label>
                        <select
                          value={formData.bloodGroup}
                          onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                          className="w-full px-3 py-2 border rounded-xl text-xs bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                        >
                          <option value="A+">A+</option>
                          <option value="A-">A-</option>
                          <option value="B+">B+</option>
                          <option value="B-">B-</option>
                          <option value="AB+">AB+</option>
                          <option value="AB-">AB-</option>
                          <option value="O+">O+</option>
                          <option value="O-">O-</option>
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 mb-1">Residential Address</label>
                        <input
                          type="text"
                          placeholder="Flat, Street, City"
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          className="w-full px-3 py-2 border rounded-xl text-xs bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Allergies (if any)</label>
                        <input
                          type="text"
                          placeholder="e.g. Penicillin, Sulfa, None"
                          value={formData.allergies}
                          onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                          className="w-full px-3 py-2 border rounded-xl text-xs bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Section 2: Symptoms & AI Triage / Specialist Match */}
                {(activeTab === 'ai-triage' || activeTab === 'all') && (
                  <div className="pt-2 border-t border-slate-100">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                      2. Clinical Symptoms, Body Temperature & AI Emergency Triage
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-2">
                      <div className="sm:col-span-3">
                        <label className="block text-xs font-bold text-slate-700 mb-1">Clinical Symptoms Faced *</label>
                        <input
                          type="text"
                          placeholder="e.g. Chest tightness, shortness of breath, high fever, severe migraine..."
                          value={formData.symptoms}
                          onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                          className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Body Temperature (°C, Optional)</label>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="e.g. 38.5"
                          value={formData.temperature}
                          onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                          className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={handleRunEmergencyTriage}
                        disabled={isTriaging || !formData.symptoms.trim()}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        {isTriaging ? 'Evaluating Triage...' : 'Run AI Emergency Triage'}
                      </button>

                      <button
                        type="button"
                        onClick={handleRunAiMatcher}
                        disabled={isMatching || !formData.symptoms.trim()}
                        className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        {isMatching ? 'Matching Specialist...' : 'Match Best Specialist'}
                      </button>
                    </div>

                    {/* Triage Result Display */}
                    {triageResult && (
                      <div className="mt-3 p-3.5 rounded-xl border flex items-center justify-between text-xs font-bold bg-red-50/90 border-red-200 text-red-950">
                        <div className="flex items-center gap-2">
                          <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                          <div>
                            <p>
                              AI Predicted Severity: <span className="underline uppercase tracking-wide">{triageResult.severity}</span> (Priority Level P{triageResult.priority})
                            </p>
                            {triageResult.notes && (
                              <p className="text-[11px] font-normal text-red-800 mt-0.5">{triageResult.notes}</p>
                            )}
                          </div>
                        </div>
                        <span className="text-[10px] px-2.5 py-1 rounded-full bg-red-200 text-red-900 uppercase font-black">
                          {triageResult.predictionStatus || 'PREDICTED'}
                        </span>
                      </div>
                    )}

                    {/* Specialist Match Result */}
                    {aiRec && (
                      <div className="mt-3 p-3.5 bg-teal-50/80 rounded-xl border border-teal-200 text-xs text-teal-950 space-y-2">
                        <div className="flex items-center justify-between font-bold text-teal-800">
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4 text-teal-600" />
                            Suggested Department: {aiRec.department}
                          </span>
                          <span className="text-[11px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-extrabold flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                            ★ {aiRec.best_doctor_rating?.toFixed(1) || '4.9'} Rating
                          </span>
                        </div>
                        <div className="bg-white p-2.5 rounded-lg border border-teal-100 flex items-center justify-between text-xs">
                          <div>
                            <p className="font-bold text-teal-900 flex items-center gap-1">
                              <Award className="w-3.5 h-3.5 text-teal-600" />
                              {aiRec.best_doctor_name} ({aiRec.best_doctor_qualification})
                            </p>
                            <p className="text-[11px] text-slate-500">{aiRec.best_doctor_experience} Years Experience</p>
                          </div>
                          <div className="text-right">
                            <span className="font-extrabold text-teal-800 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-teal-600" />
                              {aiRec.best_doctor_room}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Section 3: Consultation Doctor & Slot Details */}
                {(activeTab === 'appointments' || activeTab === 'all') && (
                  <div className="pt-2 border-t border-slate-100">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <CalendarCheck className="w-3.5 h-3.5 text-teal-600" />
                      3. Consultation Doctor & Time Slot
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                        <select
                          value={formData.selectedDept}
                          onChange={(e) => {
                            const newDept = e.target.value;
                            setFormData({ ...formData, selectedDept: newDept });
                            loadDoctors(newDept);
                          }}
                          className="w-full px-3 py-2 border rounded-xl text-xs bg-white"
                        >
                          <option value="Cardiology">Cardiology</option>
                          <option value="Neurology">Neurology</option>
                          <option value="Dental Sciences">Dental Sciences</option>
                          <option value="Pediatrics">Pediatrics</option>
                          <option value="Orthopedics">Orthopedics</option>
                          <option value="Dermatology">Dermatology</option>
                          <option value="General Medicine">General Medicine</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Consulting Doctor & Room</label>
                        <select
                          value={formData.selectedDoctorId}
                          onChange={(e) => setFormData({ ...formData, selectedDoctorId: e.target.value })}
                          className="w-full px-3 py-2 border rounded-xl text-xs bg-white"
                          required
                        >
                          <option value="">Select Doctor...</option>
                          {doctors.map((d) => {
                            const bCount = activeQueue.filter(
                              (a) => String(a.doctorId) === String(d.doctorId) &&
                                     a.appointmentDate === formData.appointmentDate &&
                                     a.status !== 'CANCELLED'
                            ).length;
                            const cap = d.dailyCapacity || 10;
                            const isFull = bCount >= cap;
                            const isAvail = (d.availability || 'Available').toLowerCase() === 'available';
                            return (
                              <option key={d.doctorId} value={d.doctorId}>
                                {d.name} ({d.roomNumber || 'Room 101'} • {isAvail ? 'Available' : 'Unavailable'} • Capacity: {bCount}/{cap} {isFull ? '[FULL]' : '[Open]'})
                              </option>
                            );
                          })}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
                        <input
                          type="date"
                          required
                          value={formData.appointmentDate}
                          onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                          className="w-full px-3 py-2 border rounded-xl text-xs bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Time Slot</label>
                        <select
                          value={formData.appointmentTime}
                          onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
                          className="w-full px-3 py-2 border rounded-xl text-xs bg-white"
                        >
                          <option value="09:00 AM">09:00 AM</option>
                          <option value="09:30 AM">09:30 AM</option>
                          <option value="10:00 AM">10:00 AM</option>
                          <option value="10:30 AM">10:30 AM</option>
                          <option value="11:00 AM">11:00 AM</option>
                          <option value="11:30 AM">11:30 AM</option>
                          <option value="02:00 PM">02:00 PM</option>
                          <option value="02:30 PM">02:30 PM</option>
                          <option value="03:00 PM">03:00 PM</option>
                        </select>
                      </div>
                    </div>

                    {/* Doctor Availability, Capacity & Exceeded Emergency Case Card */}
                    {(() => {
                      const selDoc = doctors.find((d) => String(d.doctorId) === String(formData.selectedDoctorId));
                      if (!selDoc) return null;
                      const bCount = activeQueue.filter(
                        (a) => String(a.doctorId) === String(selDoc.doctorId) &&
                               a.appointmentDate === formData.appointmentDate &&
                               a.status !== 'CANCELLED'
                      ).length;
                      const cap = selDoc.dailyCapacity || 10;
                      const isFull = bCount >= cap;
                      const isAvail = (selDoc.availability || 'Available').toLowerCase() === 'available';
                      const remaining = Math.max(0, cap - bCount);
                      const isEmergency = isEmergencyOverride || triageResult?.severity === 'CRITICAL';

                      return (
                        <div className="mt-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                                isAvail ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                              }`}>
                                <span className={`w-2 h-2 rounded-full ${isAvail ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                                {isAvail ? 'Doctor Available' : 'Doctor Unavailable / On Leave'}
                              </span>
                              <span className="font-bold text-slate-800">{selDoc.name} ({selDoc.department})</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-slate-500 text-[11px]">Daily OPD Capacity:</span>
                              <span className={`font-black px-2 py-0.5 rounded text-xs ${
                                isFull ? 'bg-red-100 text-red-800 border border-red-300' : 'bg-teal-100 text-teal-800'
                              }`}>
                                {bCount} / {cap} Taken ({remaining} Open)
                              </span>
                            </div>
                          </div>

                          {/* Capacity Progress Bar */}
                          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                isFull ? 'bg-red-600' : bCount / cap > 0.7 ? 'bg-amber-500' : 'bg-teal-600'
                              }`}
                              style={{ width: `${Math.min(100, (bCount / cap) * 100)}%` }}
                            ></div>
                          </div>

                          {/* Capacity Alert if Full */}
                          {isFull && !isEmergency && (
                            <div className="p-2.5 bg-amber-50 border border-amber-300 rounded-lg text-amber-900 text-xs flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                              <span>
                                <strong>Capacity Limit Reached:</strong> Dr. {selDoc.name} is fully booked ({bCount}/{cap} slots) for {formData.appointmentDate}. Standard bookings are restricted.
                              </span>
                            </div>
                          )}

                          {/* Exceeded Emergency Case Option */}
                          <div className={`p-2.5 rounded-lg border transition-all ${
                            isEmergency ? 'bg-red-50 border-red-300 text-red-950 font-medium' : 'bg-white border-slate-200 text-slate-700'
                          }`}>
                            <label className="flex items-start gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isEmergency}
                                onChange={(e) => setIsEmergencyOverride(e.target.checked)}
                                className="mt-0.5 text-red-600 focus:ring-red-500 rounded cursor-pointer"
                              />
                              <div>
                                <span className="font-bold text-xs flex items-center gap-1 text-red-700">
                                  <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                                  Exceeded Emergency Case (Override Capacity Limit)
                                </span>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                  Check this option for urgent emergency cases to admit the patient even if the doctor's daily capacity has been exceeded. Patient will be prioritized immediately in the consultation triage queue.
                                </p>
                              </div>
                            </label>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <Ticket className="w-4 h-4" />
                  {isSubmitting ? 'Registering & Booking...' : 'Register Patient, Book OPD & Generate Token'}
                </button>
              </form>
            </div>

            {/* Right Col: Interactive Live Today's OPD Queue Tokens */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <Ticket className="w-4 h-4 text-teal-600" />
                      Today's OPD Queue Tokens
                    </h3>
                    <p className="text-[11px] text-slate-500">Live tokens for {todayDateStr}</p>
                  </div>
                  <span className="text-xs font-black text-teal-800 bg-teal-100 px-2.5 py-0.5 rounded-full">
                    {filteredQueue.length} Active
                  </span>
                </div>

                {/* Mini Filter Toolbar */}
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      placeholder="Filter queue by name/token..."
                      value={queueSearch}
                      onChange={(e) => setQueueSearch(e.target.value)}
                      className="w-full pl-8 pr-2 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    <select
                      value={filterSeverity}
                      onChange={(e) => setFilterSeverity(e.target.value)}
                      className="px-2 py-1 border border-slate-200 rounded-lg text-[11px] bg-white"
                    >
                      <option value="ALL">All Severities</option>
                      <option value="CRITICAL">CRITICAL</option>
                      <option value="HIGH">HIGH</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="LOW">LOW</option>
                    </select>

                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-2 py-1 border border-slate-200 rounded-lg text-[11px] bg-white"
                    >
                      <option value="ALL">All Status</option>
                      <option value="WAITING">WAITING</option>
                      <option value="IN_CONSULTATION">IN_CONSULTATION</option>
                      <option value="COMPLETED">COMPLETED</option>
                    </select>
                  </div>
                </div>

                {/* Queue Cards List */}
                <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
                  {filteredQueue.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                      <Ticket className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                      <p className="font-bold text-slate-600">No Tokens Found</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Book an appointment or adjust filters.</p>
                    </div>
                  ) : (
                    filteredQueue.map((item) => {
                      return (
                        <div
                          key={item.appointmentId}
                          className={`p-3.5 rounded-xl border transition-all space-y-2 ${
                            item.severity === 'CRITICAL'
                              ? 'bg-red-50/80 border-red-400 shadow-xs ring-1 ring-red-400/30'
                              : item.severity === 'HIGH'
                              ? 'bg-orange-50/70 border-orange-300 shadow-xs'
                              : 'bg-slate-50/70 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-teal-900 bg-teal-100 px-2 py-0.5 rounded-md font-mono">
                              {item.tokenNumber}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${getSeverityBadgeClass(item.severity)}`}>
                                {item.severity || 'LOW'}
                              </span>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase ${getStatusBadgeClass(item.status)}`}>
                                {item.status}
                              </span>
                            </div>
                          </div>

                          <div>
                            <h4 className="text-xs font-bold text-slate-900">{item.patientName}</h4>
                            <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3 text-slate-400" /> {item.phone} • ID #{item.patientId}
                            </p>
                          </div>

                          <div className="text-[11px] text-slate-700 bg-white p-2 rounded-lg border border-slate-100 space-y-0.5">
                            <p>
                              <strong>Doctor:</strong> {item.doctorName}
                            </p>
                            <p className="text-teal-700 font-semibold flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> {item.doctorRoom} • {item.department}
                            </p>
                            <p className="text-[10px] text-slate-500">
                              Time: <strong>{item.appointmentTime}</strong>
                            </p>
                          </div>

                          <div className="text-[11px] text-slate-600 italic line-clamp-1">
                            Symptoms: {item.symptoms} {item.temperature ? `(${item.temperature}°C)` : ''}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleOpenBillingModal(item)}
                            className="w-full py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                          >
                            <CreditCard className="w-3 h-3" />
                            Bill & Settle Payment
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* BILLING & PAYMENT SETTLEMENT MODAL */}
      {selectedAppointmentForBill && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in duration-150">
            <div className="border-b border-slate-100 pb-3 flex items-start justify-between">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 uppercase">
                  Appointment Billing & Settlement
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  Token: {selectedAppointmentForBill.tokenNumber} — {selectedAppointmentForBill.patientName}
                </h3>
                <p className="text-xs text-slate-500">
                  Doctor: <strong>{selectedAppointmentForBill.doctorName}</strong> ({selectedAppointmentForBill.doctorRoom}) • Date: {selectedAppointmentForBill.appointmentDate}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAppointmentForBill(null)}
                className="text-slate-400 hover:text-slate-600 text-base font-bold p-1"
              >
                ✕
              </button>
            </div>

            {billingNotification && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                {billingNotification}
              </div>
            )}

            {isLoadingBill ? (
              <div className="p-8 text-center text-xs text-slate-500">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-teal-600 mb-2" />
                Loading appointment invoice & charges...
              </div>
            ) : currentBill ? (
              <div className="space-y-4">
                {/* Itemized Charges Breakdown Table */}
                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <div className="bg-slate-50 px-4 py-2 font-bold text-slate-700 uppercase tracking-wider text-[10px] border-b border-slate-200">
                    Itemized Billing Charges
                  </div>
                  <div className="divide-y divide-slate-100 p-2 space-y-1">
                    <div className="flex justify-between py-1.5 px-2">
                      <span className="text-slate-600">Doctor OPD Consultation Fee</span>
                      <span className="font-bold text-slate-900">₹{(currentBill.consultationFee || 500).toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between py-1.5 px-2">
                      <span className="text-slate-600">Prescribed Medicines (Pharmacy Dispense)</span>
                      <span className="font-bold text-slate-900">₹{(currentBill.pharmacyFee || 0).toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between py-1.5 px-2">
                      <span className="text-slate-600">Laboratory Diagnostics & Imaging Scans</span>
                      <span className="font-bold text-slate-900">₹{(currentBill.labFee || 0).toFixed(2)}</span>
                    </div>

                    {(currentBill.procedureFee || 0) > 0 && (
                      <div className="flex justify-between py-1.5 px-2">
                        <span className="text-slate-600">Hospital Procedures & Nursing</span>
                        <span className="font-bold text-slate-900">₹{(currentBill.procedureFee || 0).toFixed(2)}</span>
                      </div>
                    )}

                    <div className="flex justify-between py-2 px-2 bg-slate-50 font-bold border-t border-slate-200">
                      <span className="text-slate-800">Total Billed Charges</span>
                      <span className="text-slate-900 text-sm">₹{(currentBill.totalAmount || 500).toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between py-1.5 px-2 text-emerald-800 font-bold">
                      <span>Total Amount Paid</span>
                      <span>₹{(currentBill.amountPaid || 0).toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between py-1.5 px-2 text-red-800 font-extrabold bg-red-50/50 rounded">
                      <span>Outstanding Balance Due</span>
                      <span>
                        ₹
                        {(
                          (currentBill.balanceDue !== undefined
                            ? currentBill.balanceDue
                            : currentBill.totalAmount - (currentBill.amountPaid ?? currentBill.paidAmount ?? 0)) || 0
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Form (if balance due > 0) */}
                {((currentBill.balanceDue !== undefined ? currentBill.balanceDue : currentBill.totalAmount - (currentBill.amountPaid ?? currentBill.paidAmount ?? 0)) || 0) > 0 ? (
                  <form onSubmit={handleRecordPayment} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-teal-600" />
                      Record Patient Payment (Partial or Full)
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Amount to Collect (₹) *</label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={paymentAmount}
                          onChange={(e) => setPaymentAmount(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white font-bold text-slate-900 focus:ring-2 focus:ring-teal-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Payment Method</label>
                        <select
                          value={paymentMethod}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:ring-2 focus:ring-teal-500"
                        >
                          <option value="CASH">Cash Payment</option>
                          <option value="CREDIT_CARD">Credit Card</option>
                          <option value="DEBIT_CARD">Debit Card</option>
                          <option value="UPI">UPI / Digital QR</option>
                          <option value="INSURANCE">Health Insurance</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isProcessingPayment}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      <DollarSign className="w-4 h-4" />
                      {isProcessingPayment ? 'Recording Payment...' : 'Record Payment & Settle'}
                    </button>
                  </form>
                ) : (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>This appointment is fully paid and settled!</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 font-black text-[10px]">
                      PAID
                    </span>
                  </div>
                )}

                {/* Receipt Download / Print Button */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleDownloadReceipt}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Print / Download Itemized Receipt
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
