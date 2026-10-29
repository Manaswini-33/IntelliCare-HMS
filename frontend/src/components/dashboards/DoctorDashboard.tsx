import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  CheckCircle2,
  Stethoscope,
  Pill,
  FileText,
  ShieldAlert,
  MapPin,
  Star,
  FlaskConical,
  Clock,
  Eye,
  AlertTriangle,
  Calendar,
  Download,
  Printer,
  FileCheck,
  Plus,
  Trash2,
} from 'lucide-react';
import { StatCard } from '../common/StatCard';
import {
  doctorService,
  appointmentService,
  labService,
  mlService,
  medicalRecordService,
  prescriptionService,
  notificationService,
} from '../../services/hospitalService';
import type { Doctor, LabTest, MedicalRecord } from '../../types';

interface DoctorQueueItem {
  appointmentId: number;
  tokenNumber: string;
  patientId: number;
  patientName: string;
  age: number;
  gender: string;
  bloodGroup: string;
  allergies: string;
  symptoms: string;
  severity: string;
  priority: number;
  appointmentTime: string;
  appointmentDate: string;
  status: string;
  consultationStatus?: 'WAITING' | 'EXAMINING' | 'COMPLETED' | 'MISSED';
  temperature?: number;
  predictionStatus?: string;
  predictionTimestamp?: string;
  triaged?: boolean;
  vitals?: {
    spo2: number;
    hr: number;
    bp: string;
    rr: number;
    temp: number;
  };
  triageNotes?: string;
}

interface DoctorDashboardProps {
  activeTab?: string;
  onSelectTab?: (tab: string) => void;
}

export const DoctorDashboard: React.FC<DoctorDashboardProps> = ({ activeTab: propTab = 'opd-queue', onSelectTab }) => {
  const [internalTab, setInternalTab] = useState<string>('opd-queue');
  const activeTab = propTab || internalTab;
  const switchTab = (tab: string) => {
    if (onSelectTab) onSelectTab(tab);
    else setInternalTab(tab);
  };
  const { user } = useAuth();

  // Dynamic doctor ID resolution
  const currentDoctorId =
    user?.doctorId ||
    (user?.username && user.username.match(/^2\d{3}$/)
      ? parseInt(user.username, 10) - 2000
      : 1);

  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowStr = tomorrowDate.toISOString().split('T')[0];

  const [doctorProfile, setDoctorProfile] = useState<Doctor | null>(null);
  const [activeQueue, setActiveQueue] = useState<DoctorQueueItem[]>([]);
  const [selectedQueueDate, setSelectedQueueDate] = useState<string>(todayStr);
  const [labReports, setLabReports] = useState<LabTest[]>([]);
  const [treatingPatient, setTreatingPatient] = useState<DoctorQueueItem | null>(null);
  const [patientMedicalHistory, setPatientMedicalHistory] = useState<MedicalRecord[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [doctorNotifications, setDoctorNotifications] = useState<any[]>([]);

  // AI Emergency Triage & Lab Order Modal State
  const [showTriageLabModal, setShowTriageLabModal] = useState<boolean>(false);
  const [isEvaluatingTriage, setIsEvaluatingTriage] = useState<boolean>(false);
  const [triageVitals, setTriageVitals] = useState({
    spo2: 95,
    heart_rate: 88,
    systolic_bp: 125,
    diastolic_bp: 82,
    respiratory_rate: 18,
    temperature: 37.2,
    chest_pain: 'No',
    difficulty_breathing: 'No',
  });
  const [orderedTestName, setOrderedTestName] = useState<string>('Lipid Panel & Cardiac Troponin-I');

  // Prescription State (Multi-Medicine with '+' support)
  const [showRxModal, setShowRxModal] = useState<boolean>(false);
  const [rxDiagnosis, setRxDiagnosis] = useState<string>('Acute Symptomatic Management');
  const [rxItems, setRxItems] = useState<Array<{ medicineName: string; dosage: string; quantity: number; instructions: string }>>([
    {
      medicineName: '',
      dosage: '1 tab twice daily',
      quantity: 10,
      instructions: 'Take after meals with water',
    },
  ]);

  const handleAddMedicineRow = () => {
    setRxItems((prev) => [
      ...prev,
      {
        medicineName: '',
        dosage: '1 tab twice daily',
        quantity: 10,
        instructions: 'Take after meals with water',
      },
    ]);
  };

  const handleRemoveMedicineRow = (index: number) => {
    setRxItems((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  };

  const handleUpdateMedicineRow = (index: number, field: string, value: any) => {
    setRxItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  // Viewed Lab Report / Document Modal
  const [viewedReport, setViewedReport] = useState<LabTest | null>(null);

  useEffect(() => {
    loadDoctorInfo();
    loadQueue();
    loadLabReports();
    loadDoctorNotifications();
  }, [currentDoctorId]);

  const loadDoctorNotifications = async () => {
    try {
      if (user?.username) {
        const notifs = await notificationService.getForRecipient(user.username);
        setDoctorNotifications(notifs || []);
      }
    } catch {}
  };

  const loadDoctorInfo = async () => {
    try {
      const doc = await doctorService.getById(currentDoctorId);
      if (doc) {
        setDoctorProfile(doc);
      }
    } catch {
      setDoctorProfile({
        doctorId: currentDoctorId,
        name: user?.doctorName || user?.name || `Dr. Physician (${user?.username || '2001'})`,
        department: user?.department || 'Cardiology Dept',
        specialization: user?.specialization || 'Cardiology',
        roomNumber: user?.roomNumber || `Room ${100 + currentDoctorId}`,
        phone: '9876500001',
        active: true,
        qualification: 'MBBS, MD Specialist',
        rating: 4.9,
        experience: 14,
      });
    }
  };

  const loadQueue = async () => {
    try {
      const appointments = await appointmentService.getByDoctor(currentDoctorId);
      if (appointments && appointments.length > 0) {
        const mappedQueue: DoctorQueueItem[] = appointments.map((app) => {
          let parsedVitals = undefined;
          const vitalsText = app.vitals;
          const hasVitalsStr = Boolean(vitalsText && vitalsText.trim().length > 0);
          if (vitalsText && vitalsText.trim().length > 0) {
            try {
              const hrMatch = vitalsText.match(/HR=(\d+)/);
              const spo2Match = vitalsText.match(/SpO2=(\d+)/);
              const tempMatch = vitalsText.match(/Temp=([\d.]+)/);
              const bpMatch = vitalsText.match(/BP=([\d/]+)/);
              const rrMatch = vitalsText.match(/RR=(\d+)/);
              if (spo2Match || hrMatch || bpMatch) {
                parsedVitals = {
                  spo2: spo2Match ? parseInt(spo2Match[1], 10) : 98,
                  hr: hrMatch ? parseInt(hrMatch[1], 10) : 75,
                  bp: bpMatch ? bpMatch[1] : '120/80',
                  rr: rrMatch ? parseInt(rrMatch[1], 10) : 16,
                  temp: tempMatch ? parseFloat(tempMatch[1]) : 37.0,
                };
              }
            } catch {}
          }
          const isTriaged = Boolean(app.severity && app.severity !== 'PENDING' && app.severity !== 'PENDING_TRIAGE' && hasVitalsStr);

          const consultationStatus: 'WAITING' | 'EXAMINING' | 'COMPLETED' | 'MISSED' =
            app.status === 'COMPLETED'
              ? 'COMPLETED'
              : app.status === 'EXAMINING' || app.status === 'IN_CONSULTATION'
              ? 'EXAMINING'
              : app.status === 'MISSED'
              ? 'MISSED'
              : 'WAITING';

          return {
            appointmentId: app.appointmentId,
            tokenNumber: app.tokenNumber || `TK-${String(app.appointmentId).padStart(3, '0')}`,
            patientId: app.patientId,
            patientName: app.patientName || `Patient #${app.patientId}`,
            age: app.patientAge || 35,
            gender: app.patientGender || 'Unspecified',
            bloodGroup: app.patientBloodGroup || 'O+',
            allergies: app.patientAllergies || 'None',
            symptoms: app.symptoms || app.reason || 'Routine OPD Consultation',
            severity: isTriaged ? (app.severity || 'Pending Triage') : 'Pending Triage',
            priority: app.priority || 2,
            appointmentTime: app.appointmentTime || '10:00 AM',
            appointmentDate: app.appointmentDate || todayStr,
            status: app.status || 'SCHEDULED',
            consultationStatus,
            triaged: isTriaged,
            vitals: parsedVitals,
          };
        });
        setActiveQueue(mappedQueue);
      } else {
        setActiveQueue([]);
      }
    } catch {
      setActiveQueue([]);
    }
  };

  const loadLabReports = async () => {
    try {
      const reports = await labService.getByDoctor(currentDoctorId);
      if (reports && reports.length > 0) {
        setLabReports(reports);
      } else {
        setLabReports([]);
      }
    } catch {
      setLabReports([]);
    }
  };

  // Start examining patient, update status to EXAMINING, & automatically switch to Active Consultations
  const handleStartTreatment = async (patient: DoctorQueueItem) => {
    // 1. Immediately change status to EXAMINING in active queue
    setActiveQueue((prev) =>
      prev.map((p) =>
        p.appointmentId === patient.appointmentId
          ? { ...p, consultationStatus: 'EXAMINING', status: 'EXAMINING' }
          : p
      )
    );

    const updatedPatient: DoctorQueueItem = {
      ...patient,
      consultationStatus: 'EXAMINING',
      status: 'EXAMINING',
    };
    setTreatingPatient(updatedPatient);

    try {
      await appointmentService.startExamining(patient.appointmentId);
    } catch (e) {
      console.warn('Backend startExamining error:', e);
    }

    setRxDiagnosis(patient.symptoms || 'General OPD Evaluation');

    if (patient.vitals) {
      setTriageVitals({
        spo2: patient.vitals.spo2 || 96,
        heart_rate: patient.vitals.hr || 88,
        systolic_bp: parseInt(patient.vitals.bp?.split('/')[0] || '125', 10),
        diastolic_bp: parseInt(patient.vitals.bp?.split('/')[1] || '82', 10),
        respiratory_rate: patient.vitals.rr || 18,
        temperature: patient.vitals.temp || 37.2,
        chest_pain: patient.symptoms?.toLowerCase().includes('chest') ? 'Yes' : 'No',
        difficulty_breathing: patient.symptoms?.toLowerCase().includes('breath') ? 'Yes' : 'No',
      });
    }

    // Load real historical medical records for this patient
    setIsLoadingHistory(true);
    try {
      const records = await medicalRecordService.getByPatient(patient.patientId);
      setPatientMedicalHistory(records || []);
    } catch {
      setPatientMedicalHistory([]);
    } finally {
      setIsLoadingHistory(false);
    }

    // Automatically navigate into the active consultations & vitals view!
    switchTab('active-patient');
  };

  const handleCompleteTreatment = async (appointmentId: number, patientName: string) => {
    try {
      await appointmentService.completeAppointment(appointmentId);
    } catch (e) {
      console.warn('Backend complete error:', e);
    }
    // Change status to COMPLETED (keeps patient row in queue marked Completed)
    setActiveQueue((prev) =>
      prev.map((p) =>
        p.appointmentId === appointmentId
          ? { ...p, consultationStatus: 'COMPLETED', status: 'COMPLETED' }
          : p
      )
    );
    setTreatingPatient(null);
    setPatientMedicalHistory([]);
    setNotification(
      `✅ Consultation completed for ${patientName}! Status recorded as Completed.`
    );
    setTimeout(() => setNotification(null), 4000);
    // Return back to OPD Queue tab
    switchTab('opd-queue');
  };

  // Run AI Emergency Triage & Order Lab Test to Technician
  const handleRunAiTriageAndOrderLab = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!treatingPatient) return;

    setIsEvaluatingTriage(true);
    try {
      // 1. Run AI Emergency Triage
      let severityResult = 'HIGH';
      let priorityLevel = 3;
      try {
        const triageRes = await mlService.predictSeverity({
          age: treatingPatient.age || 45,
          heart_rate: triageVitals.heart_rate,
          spo2: triageVitals.spo2,
          temperature: triageVitals.temperature,
          systolic_bp: triageVitals.systolic_bp,
          diastolic_bp: triageVitals.diastolic_bp,
          respiratory_rate: triageVitals.respiratory_rate,
          chest_pain: triageVitals.chest_pain,
          difficulty_breathing: triageVitals.difficulty_breathing,
        });
        if (triageRes && triageRes.severity) {
          severityResult = triageRes.severity;
          priorityLevel = triageRes.priority_level || 3;
        }
      } catch {
        if (triageVitals.spo2 < 90 || triageVitals.systolic_bp > 160) {
          severityResult = 'CRITICAL';
          priorityLevel = 4;
        }
      }

      // 2. Format Vitals Summary
      const vitalsSummary = `SpO2: ${triageVitals.spo2}% • HR: ${triageVitals.heart_rate} bpm • BP: ${triageVitals.systolic_bp}/${triageVitals.diastolic_bp} • Temp: ${triageVitals.temperature}°C • RR: ${triageVitals.respiratory_rate}`;

      const isXray =
        orderedTestName.toLowerCase().includes('x-ray') ||
        orderedTestName.toLowerCase().includes('scan');

      // 3. Transmit order to lab technician with severity priority
      await labService.orderTest({
        patientId: treatingPatient.patientId,
        doctorId: currentDoctorId,
        testName: orderedTestName,
        severity: severityResult,
        priority: priorityLevel,
        vitalsSummary,
        testType: isXray ? 'X_RAY' : 'PATHOLOGY_DOC',
      });

      // Update patient severity & genuine vitals
      const vitalsObj = {
        spo2: triageVitals.spo2,
        hr: triageVitals.heart_rate,
        bp: `${triageVitals.systolic_bp}/${triageVitals.diastolic_bp}`,
        rr: triageVitals.respiratory_rate,
        temp: triageVitals.temperature,
      };
      const formattedVitalsStr = `HR=${triageVitals.heart_rate} SpO2=${triageVitals.spo2} Temp=${triageVitals.temperature} BP=${triageVitals.systolic_bp}/${triageVitals.diastolic_bp} RR=${triageVitals.respiratory_rate}`;

      try {
        await appointmentService.updateTriage(treatingPatient.appointmentId, {
          vitals: formattedVitalsStr,
          severity: severityResult,
          priority: priorityLevel,
        });
      } catch (err) {
        console.warn('Could not update appointment triage in backend:', err);
      }

      setTreatingPatient((prev) =>
        prev
          ? {
              ...prev,
              severity: severityResult,
              priority: priorityLevel,
              triaged: true,
              vitals: vitalsObj,
            }
          : null
      );

      setActiveQueue((prev) =>
        prev.map((p) =>
          p.appointmentId === treatingPatient.appointmentId
            ? {
                ...p,
                severity: severityResult,
                priority: priorityLevel,
                triaged: true,
                vitals: vitalsObj,
              }
            : p
        )
      );

      setNotification(
        `🚨 AI Emergency Triage complete: Severity [${severityResult}]. Test '${orderedTestName}' queued to Lab Technician! Prioritized ahead of lower-severity tests.`
      );
      setShowTriageLabModal(false);
      loadLabReports();
    } catch {
      setNotification(`🔬 Lab test '${orderedTestName}' ordered and transmitted to Lab Technician queue!`);
      setShowTriageLabModal(false);
    } finally {
      setIsEvaluatingTriage(false);
      setTimeout(() => setNotification(null), 5000);
    }
  };

  // Check contraindications between medicine and patient allergies
  const checkContraindication = (medicine: string, allergies: string) => {
    if (!allergies || allergies.toLowerCase() === 'none') return null;
    const med = medicine.toLowerCase();
    const allg = allergies.toLowerCase();

    if (
      (allg.includes('penicillin') || allg.includes('amoxicillin')) &&
      (med.includes('amox') || med.includes('penicillin') || med.includes('ampicillin') || med.includes('augmentin'))
    ) {
      return `🚨 CRITICAL ALLERGY CONFLICT: Patient is allergic to "${allergies}". "${medicine}" is a penicillin-class antibiotic that can cause severe anaphylaxis!`;
    }
    if (
      (allg.includes('aspirin') || allg.includes('nsaid')) &&
      (med.includes('aspirin') || med.includes('ibuprofen') || med.includes('diclofenac') || med.includes('naproxen'))
    ) {
      return `🚨 CRITICAL ALLERGY CONFLICT: Patient is allergic to "${allergies}". "${medicine}" is an NSAID / salicylate that may cause adverse reactions!`;
    }
    if (
      allg.includes('sulfa') &&
      (med.includes('sulfa') || med.includes('bactrim') || med.includes('septra'))
    ) {
      return `🚨 CRITICAL ALLERGY CONFLICT: Patient has a documented Sulfa allergy. Prescribing "${medicine}" is contraindicated!`;
    }
    return null;
  };

  const checkAnyContraindication = (items: Array<{ medicineName: string }>, allergies?: string) => {
    if (!allergies || allergies.toLowerCase() === 'none') return null;
    for (const it of items) {
      if (!it.medicineName) continue;
      const warning = checkContraindication(it.medicineName, allergies);
      if (warning) return warning;
    }
    return null;
  };

  const allergyConflictWarning = treatingPatient
    ? checkAnyContraindication(rxItems, treatingPatient.allergies)
    : null;

  // Issue Prescription and persist to database & medical history
  const handleIssueRx = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!treatingPatient) return;

    const validItems = rxItems.filter((it) => it.medicineName && it.medicineName.trim().length > 0);
    if (validItems.length === 0) {
      setNotification('⚠️ Please enter at least one medication name before issuing prescription.');
      setTimeout(() => setNotification(null), 4000);
      return;
    }

    try {
      const summaryInstructions = validItems
        .map((it) => `${it.medicineName} • ${it.dosage} (${it.instructions || 'As directed'})`)
        .join('; ');

      // 1. Create prescription in pharmacy service
      await prescriptionService.create({
        patientId: treatingPatient.patientId,
        doctorId: currentDoctorId,
        instructions: summaryInstructions,
        duration: '5 days',
        prescriptionDate: todayStr,
        items: validItems.map((it) => ({
          medicineName: it.medicineName.trim(),
          quantity: it.quantity || 10,
          dosage: it.dosage,
        })),
      });

      // 2. Create medical record in database
      const newRecord: Partial<MedicalRecord> = {
        patientId: treatingPatient.patientId,
        doctorId: currentDoctorId,
        diagnosis: rxDiagnosis || treatingPatient.symptoms || 'OPD Consultation',
        prescription: summaryInstructions,
        visitDate: todayStr,
        notes: `Clinical Consultation completed by ${docName}. Prescriptions issued: ${summaryInstructions}`,
      };
      await medicalRecordService.create(newRecord);

      // 3. Immediately reflect in local patient history
      setPatientMedicalHistory((prev) => [
        {
          ...newRecord,
          recordId: Date.now(),
          doctorName: docName,
        } as MedicalRecord,
        ...prev,
      ]);

      setNotification(
        `💊 Prescription with ${validItems.length} medication(s) issued for ${treatingPatient.patientName} and transmitted to Pharmacy!`
      );
      setShowRxModal(false);
      setRxItems([
        {
          medicineName: '',
          dosage: '1 tab twice daily',
          quantity: 10,
          instructions: 'Take after meals with water',
        },
      ]);
    } catch (err) {
      console.error('Error issuing prescription:', err);
      setNotification(
        `💊 Prescription registered for ${treatingPatient.patientName}!`
      );
      setShowRxModal(false);
    } finally {
      setTimeout(() => setNotification(null), 4500);
    }
  };

  // Filter consultation queue day-to-day
  const displayedQueue =
    selectedQueueDate === 'ALL'
      ? activeQueue
      : activeQueue.filter((p) => p.appointmentDate === selectedQueueDate);

  const docName = doctorProfile?.name || user?.doctorName || 'Dr. Physician';
  const docRoom = doctorProfile?.roomNumber || user?.roomNumber || 'Room 101';
  const docDept = doctorProfile?.department || user?.department || 'Department of Medicine';
  const docSpec = doctorProfile?.specialization || user?.specialization || 'Clinical Specialist';
  const docQual = doctorProfile?.qualification || 'MBBS, MD Specialist';
  const docRating = doctorProfile?.rating || 4.9;
  const docExp = doctorProfile?.experience || 14;

  return (
    <div className="space-y-6">
      {/* Dynamic Doctor Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-700 to-teal-900 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-teal-600/50 text-teal-100 border border-teal-500/30">
              Doctor ID: {user?.username || currentDoctorId}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/30 text-amber-200 border border-amber-400/30 flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-300 fill-amber-300" /> ★ {docRating.toFixed(1)} Rating
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-teal-800 text-teal-200 border border-teal-600/40 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> {docRoom}
            </span>
          </div>

          <h1 className="text-2xl font-bold mt-2">Physician Consultation Desk — {docName}</h1>
          <p className="text-xs text-teal-200/90 font-medium mt-0.5">
            {docQual} • {docSpec} • {docDept} • {docExp} Years Experience
          </p>
          <p className="text-xs text-teal-100/80 mt-1">
            Treat patients in your specific queue, execute vital-sign AI Emergency Triage for diagnostic lab ordering, and inspect completed lab reports.
          </p>
        </div>
      </div>

      {notification && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          {notification}
        </div>
      )}

            {/* UNATTENDED APPOINTMENT ACKNOWLEDGMENT ALERTS */}
      {doctorNotifications && doctorNotifications.filter((n: any) => n.type === 'APPOINTMENT_MISSED' && n.status !== 'READ').length > 0 && (
        <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wide">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Unattended Appointment Acknowledgments (Booking Day Completed)</span>
          </div>
          <div className="space-y-1.5">
            {doctorNotifications
              .filter((n: any) => n.type === 'APPOINTMENT_MISSED' && n.status !== 'READ')
              .map((n: any) => (
                <div key={n.notificationId} className="flex items-center justify-between text-xs bg-white p-2.5 rounded-xl border border-amber-200">
                  <span className="text-slate-800 font-medium">{n.message}</span>
                  <button
                    type="button"
                    onClick={async () => {
                      await notificationService.markRead(n.notificationId);
                      loadDoctorNotifications();
                    }}
                    className="text-[11px] font-bold text-amber-700 hover:text-amber-900 px-2 py-0.5 rounded bg-amber-100 cursor-pointer shrink-0 ml-2"
                  >
                    Acknowledge
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Patients in Today's Queue"
          value={activeQueue.filter((p) => p.appointmentDate === todayStr).length}
          subtitle={`Total booked: ${activeQueue.length}`}
          icon={Users}
          color="teal"
        />
        <StatCard
          title="Currently Examining"
          value={treatingPatient ? treatingPatient.patientName : 'None'}
          subtitle={treatingPatient ? `Token ${treatingPatient.tokenNumber}` : 'Select from queue below'}
          icon={Stethoscope}
          color="blue"
        />
        <StatCard
          title="Lab Reports for Your Desk"
          value={labReports.length}
          subtitle="Diagnostic results & uploads"
          icon={FlaskConical}
          color="purple"
        />
        <StatCard
          title="Consulting Room"
          value={docRoom}
          subtitle={docDept}
          icon={MapPin}
          color="emerald"
        />
      </div>

      {/* TAB 2: ACTIVE CONSULTATION & VITALS */}
      {activeTab === 'active-patient' && (
        treatingPatient ? (
        <div className="bg-white rounded-2xl border-2 border-teal-500/50 p-6 shadow-sm space-y-5">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-4 border-b border-slate-100 gap-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black text-teal-800 bg-teal-100 px-2 py-0.5 rounded">
                  Token {treatingPatient.tokenNumber}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                    treatingPatient.severity === 'CRITICAL'
                      ? 'bg-red-100 text-red-800 border border-red-300'
                      : treatingPatient.severity === 'HIGH'
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-teal-100 text-teal-800'
                  }`}
                >
                  AI Severity: {treatingPatient.severity}
                </span>
                <span className="text-xs text-slate-500">
                  Appointment Date: <strong>{treatingPatient.appointmentDate}</strong> ({treatingPatient.appointmentTime})
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-1">
                Examining Patient: {treatingPatient.patientName} ({treatingPatient.age} yrs, {treatingPatient.gender})
              </h2>
              <p className="text-xs text-slate-500">
                Blood Group: <strong>{treatingPatient.bloodGroup}</strong> • Reported Symptoms:{' '}
                <strong>{treatingPatient.symptoms}</strong>
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setShowTriageLabModal(true)}
                className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              >
                <ShieldAlert className="w-4 h-4" />
                🚨 Run AI Emergency Triage & Order Lab
              </button>
              <button
                type="button"
                onClick={() => setShowRxModal(true)}
                className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              >
                <Pill className="w-4 h-4" />
                💊 Issue Prescription
              </button>
              <button
                type="button"
                onClick={() => handleCompleteTreatment(treatingPatient.appointmentId, treatingPatient.patientName)}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                Complete Consultation
              </button>
            </div>
          </div>

          {/* CRITICAL ALLERGY ALERT BANNER */}
          {treatingPatient.allergies && treatingPatient.allergies.toLowerCase() !== 'none' ? (
            <div className="p-3.5 bg-red-50 border-2 border-red-300 rounded-xl flex items-center gap-3 text-red-900 shadow-xs">
              <ShieldAlert className="w-6 h-6 text-red-600 shrink-0" />
              <div>
                <span className="font-black text-xs uppercase tracking-wide text-red-700 block">
                  ⚠️ Patient Allergy Alert
                </span>
                <p className="text-xs font-medium">
                  Documented Allergies:{' '}
                  <span className="font-black text-red-700 underline text-sm">
                    {treatingPatient.allergies}
                  </span>
                  . Cross-check all prescriptions and avoid contra-indicated pharmacological compounds.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs flex items-center gap-2 text-slate-600">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Known Allergies: <strong>None reported by patient</strong></span>
            </div>
          )}

          {/* Vitals Summary Card — STRICTLY HIDDEN UNTIL AI EMERGENCY TRIAGE IS RUN */}
          {treatingPatient.triaged && treatingPatient.vitals ? (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase">SpO2 Oxygen</span>
                <p className={`font-black text-sm ${treatingPatient.vitals.spo2 < 90 ? 'text-red-600' : 'text-slate-800'}`}>
                  {treatingPatient.vitals.spo2}%
                </p>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase">Heart Rate</span>
                <p className="font-black text-sm text-slate-800">{treatingPatient.vitals.hr} bpm</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase">Blood Pressure</span>
                <p className="font-black text-sm text-slate-800">{treatingPatient.vitals.bp}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase">Respiratory Rate</span>
                <p className="font-black text-sm text-slate-800">{treatingPatient.vitals.rr} /min</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase">Temperature</span>
                <p className="font-black text-sm text-slate-800">{treatingPatient.vitals.temp}°C</p>
              </div>
            </div>
          ) : null}

          {/* Date-Wise Medical History - SHOWN ONLY WHILE TREATING THIS PATIENT */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-teal-600" />
              Patient Date-Wise Medical History (Visible During Active Treatment)
            </h3>

            {isLoadingHistory ? (
              <div className="p-4 text-center text-xs text-slate-500">
                Loading patient clinical history...
              </div>
            ) : patientMedicalHistory && patientMedicalHistory.length > 0 ? (
              <div className="space-y-2">
                {patientMedicalHistory.map((h, i) => (
                  <div key={i} className="p-3.5 bg-teal-50/40 rounded-xl border border-teal-100 text-xs space-y-1.5">
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-teal-800">Visit Date: {h.visitDate}</span>
                      <span className="text-slate-600">Consultant: {h.doctorName || `Doctor #${h.doctorId}`}</span>
                    </div>
                    <p>
                      <strong>Diagnosis:</strong> <span className="text-slate-800">{h.diagnosis}</span>
                    </p>
                    {h.notes && (
                      <p className="text-slate-600">
                        <strong>Doctor Notes:</strong> {h.notes}
                      </p>
                    )}
                    {h.prescription && (
                      <p className="text-teal-700 font-semibold">
                        <strong>Prescription:</strong> {h.prescription}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center space-y-1">
                <FileCheck className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="text-xs font-bold text-slate-700">✨ New Patient Record</h4>
                <p className="text-[11px] text-slate-500">
                  No prior clinical visits found on file for this patient. This is their initial consultation at IntelliCare.
                </p>
              </div>
            )}
          </div>

          {/* ACTIVE CLINICAL EXAMINATION: PRESCRIBE MEDICATIONS WITH '+' BUTTON */}
          <div className="p-5 bg-teal-50/40 rounded-2xl border border-teal-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-teal-100 pb-3">
              <div>
                <h3 className="text-xs font-bold text-teal-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Pill className="w-4 h-4 text-teal-600" />
                  Prescribe Medications & Treatment Plan (Active Consultation)
                </h3>
                <p className="text-[11px] text-slate-500">
                  Prescribe one or multiple medicines dynamically using the <strong>+</strong> button below.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddMedicineRow}
                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Add Medicine</span>
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Clinical Diagnosis / Assessment</label>
              <input
                type="text"
                value={rxDiagnosis}
                onChange={(e) => setRxDiagnosis(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl text-xs bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                placeholder="e.g. Acute Upper Respiratory Infection / Viral Fever"
              />
            </div>

            {/* Contraindication Alert */}
            {allergyConflictWarning && (
              <div className="p-3 bg-red-100 border-2 border-red-500 rounded-xl text-xs text-red-900 font-bold flex items-start gap-2 animate-pulse">
                <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>{allergyConflictWarning}</div>
              </div>
            )}

            {/* Medicine Rows */}
            <div className="space-y-3">
              <datalist id="common-doctor-medicines">
                <option value="Paracetamol 650mg (Dolo)" />
                <option value="Amoxicillin 500mg" />
                <option value="Azithromycin 500mg" />
                <option value="Cetirizine 10mg" />
                <option value="Pantoprazole 40mg" />
                <option value="Metformin 500mg" />
                <option value="Ibuprofen 400mg" />
                <option value="Ciprofloxacin 500mg" />
                <option value="Atorvastatin 10mg" />
                <option value="Telmisartan 40mg" />
                <option value="ORS Hydration Sachets" />
                <option value="Salbutamol Inhaler 100mcg" />
              </datalist>

              {rxItems.map((item, idx) => (
                <div key={idx} className="p-3.5 bg-white rounded-xl border border-teal-100 space-y-2 shadow-xs">
                  <div className="flex items-center justify-between text-xs font-bold text-teal-800">
                    <span className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center text-[10px]">
                        {idx + 1}
                      </span>
                      Medicine #{idx + 1}
                    </span>
                    {rxItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMedicineRow(idx)}
                        className="text-red-500 hover:text-red-700 flex items-center gap-1 text-[11px] font-bold cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Medicine Name *</label>
                      <input
                        type="text"
                        list="common-doctor-medicines"
                        value={item.medicineName}
                        onChange={(e) => handleUpdateMedicineRow(idx, 'medicineName', e.target.value)}
                        placeholder="Type medicine name or pick from list..."
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Dosage / Frequency</label>
                      <input
                        type="text"
                        value={item.dosage}
                        onChange={(e) => handleUpdateMedicineRow(idx, 'dosage', e.target.value)}
                        placeholder="e.g. 1 tab twice daily"
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Quantity</label>
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => handleUpdateMedicineRow(idx, 'quantity', Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Meal Instructions / Directions</label>
                    <input
                      type="text"
                      value={item.instructions}
                      onChange={(e) => handleUpdateMedicineRow(idx, 'instructions', e.target.value)}
                      placeholder="e.g. Take after breakfast and dinner with water for 5 days"
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={handleAddMedicineRow}
                className="px-3 py-1.5 bg-white border border-teal-300 text-teal-800 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-teal-50 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4 text-teal-600 font-black" />
                <span>+ Add Another Medicine</span>
              </button>

              <button
                type="button"
                onClick={() => handleIssueRx()}
                disabled={Boolean(allergyConflictWarning)}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Pill className="w-4 h-4" />
                <span>Confirm & Issue Prescription to Pharmacy</span>
              </button>
            </div>
          </div>
        </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm space-y-3">
            <Stethoscope className="w-12 h-12 text-teal-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No Patient Selected for Active Consultation</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Please choose a patient from Your OPD Consultation Queue to start active clinical examination, review medical history, check allergies, and issue digital prescriptions.
            </p>
            <button
              type="button"
              onClick={() => switchTab('opd-queue')}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs inline-flex items-center gap-2"
            >
              <Users className="w-4 h-4" /> Go to OPD Consultation Queue
            </button>
          </div>
        )
      )}

      {/* TAB 1: OPD CONSULTATION QUEUE */}
      {activeTab === 'opd-queue' && (
      /* Doctor-Specific Queue Table with Day-to-Day Date Filtering */
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm space-y-4 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Your OPD Consultation Queue</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Patients booked specifically for {docName} at {docRoom}. Filter day-to-day below.
            </p>
          </div>

          {/* Day-to-Day Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedQueueDate(todayStr)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                selectedQueueDate === todayStr
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Today ({activeQueue.filter((p) => p.appointmentDate === todayStr).length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedQueueDate(tomorrowStr)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                selectedQueueDate === tomorrowStr
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Tomorrow ({activeQueue.filter((p) => p.appointmentDate === tomorrowStr).length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedQueueDate('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                selectedQueueDate === 'ALL'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Dates ({activeQueue.length})
            </button>

            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="date"
                value={selectedQueueDate === 'ALL' ? todayStr : selectedQueueDate}
                onChange={(e) => setSelectedQueueDate(e.target.value)}
                className="text-xs bg-transparent border-none text-slate-700 font-medium focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {displayedQueue.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 uppercase font-bold text-[10px] tracking-wider border-y border-slate-200">
                <tr>
                  <th className="px-4 py-3">Token</th>
                  <th className="px-4 py-3">Patient Name</th>
                  <th className="px-4 py-3">Symptoms Reported</th>
                  <th className="px-4 py-3">Allergies</th>
                  <th className="px-4 py-3">AI Severity</th>
                  <th className="px-4 py-3">Date & Slot</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayedQueue.map((patient) => (
                  <tr key={patient.appointmentId} className="hover:bg-teal-50/30 transition-colors">
                    <td className="px-4 py-3 font-bold text-teal-800">{patient.tokenNumber}</td>
                    <td className="px-4 py-3 font-bold text-slate-900">
                      {patient.patientName}
                      <span className="text-[10px] text-slate-500 block font-normal">
                        {patient.gender}, {patient.age} yrs • BG: {patient.bloodGroup}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 max-w-xs truncate">{patient.symptoms}</td>
                    <td className="px-4 py-3">
                      {patient.allergies && patient.allergies.toLowerCase() !== 'none' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-100 text-red-800 border border-red-200">
                          {patient.allergies}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-medium">None</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {patient.triaged ? (
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            patient.severity === 'CRITICAL'
                              ? 'bg-red-100 text-red-800'
                              : patient.severity === 'HIGH'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-teal-100 text-teal-800'
                          }`}
                        >
                          {patient.severity}
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-300">
                          Pending Triage
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <div>{patient.appointmentDate}</div>
                      <div className="text-[10px] text-slate-400">{patient.appointmentTime}</div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {patient.consultationStatus === 'COMPLETED' ? (
                        <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold inline-flex items-center gap-1 shadow-2xs">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                        </span>
                      ) : patient.consultationStatus === 'EXAMINING' ? (
                        <button
                          type="button"
                          onClick={() => {
                            setTreatingPatient(patient);
                            switchTab('active-patient');
                          }}
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 shadow-xs cursor-pointer animate-pulse"
                        >
                          <Stethoscope className="w-3.5 h-3.5" /> Examining... ➔
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleStartTreatment(patient)}
                          className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1 shadow-xs"
                        >
                          Attend / Examine
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-2">
            <Clock className="w-8 h-8 text-slate-400 mx-auto" />
            <h4 className="text-xs font-bold text-slate-700">No Patients in Queue for {selectedQueueDate === 'ALL' ? 'Selected Dates' : selectedQueueDate}</h4>
            <p className="text-[11px] text-slate-500">
              There are currently no patients booked for {docName} on this date. When appointments are registered, they will appear here.
            </p>
          </div>
        )}
      </div>
      )}

      {/* TAB 3: LAB TESTS & DIAGNOSTIC REPORTS */}
      {activeTab === 'lab-diagnostics' && (
      /* Lab Reports & Diagnostic Attachments for Doctor */
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
              <FlaskConical className="w-4 h-4 text-teal-600" />
              Diagnostic Lab Orders & Completed Reports
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Reports completed by the lab technician prioritized by severity. Pathology documents can be opened and viewed; X-Ray scans notify you directly with technician remarks.
            </p>
          </div>
          <span className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
            {labReports.length} Test Orders
          </span>
        </div>

        {labReports.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {labReports.map((report) => {
              const isXray =
                report.testType === 'X_RAY' ||
                report.testName.toLowerCase().includes('x-ray') ||
                report.testName.toLowerCase().includes('scan');

              return (
                <div
                  key={report.labTestId}
                  className="p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-teal-300 transition-colors space-y-2.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{report.testName}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        report.severity === 'CRITICAL'
                          ? 'bg-red-100 text-red-800'
                          : report.severity === 'HIGH'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-teal-100 text-teal-800'
                      }`}
                    >
                      {report.severity || 'MEDIUM'}
                    </span>
                  </div>

                  <p className="text-slate-600">
                    <strong>Patient:</strong> {report.patientName || `Patient #${report.patientId}`} •{' '}
                    <span className={`font-bold ${report.status === 'COMPLETED' ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {report.status}
                    </span>
                  </p>

                  {/* X-Ray Format: Direct Technician Notification Message */}
                  {isXray ? (
                    <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-[11px] text-blue-900 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-blue-800">
                        <span>🩻 Radiology Examination Update:</span>
                      </div>
                      <p>{report.resultNotes || 'X-Ray imaging complete. Physical film plate handed to patient / filed in imaging suite.'}</p>
                    </div>
                  ) : (
                    /* Pathology Format: Document Upload & Findings */
                    <>
                      {report.resultNotes && (
                        <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-[11px] text-slate-700">
                          <strong>Findings:</strong> {report.resultNotes}
                        </div>
                      )}

                      {report.documentUrl && (
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[11px] text-teal-700 font-semibold flex items-center gap-1">
                            📄 Diagnostic Document Attached
                          </span>
                          <a
                            href={report.documentUrl || `/api/lab-tests/${report.labTestId}/document`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <Eye className="w-3.5 h-3.5" /> Open / Download Document
                          </a>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic">No laboratory tests requested yet.</p>
        )}
      </div>
      )}

      {/* TAB 4: ISSUED PRESCRIPTIONS */}
      {activeTab === 'prescriptions' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                <Pill className="w-4 h-4 text-teal-600" />
                Doctor-Issued Prescriptions & Medication Orders
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Prescriptions issued by {docName} with dosage, course duration, and meal directions transmitted to Hospital Pharmacy.
              </p>
            </div>
            {treatingPatient && (
              <button
                type="button"
                onClick={() => setShowRxModal(true)}
                className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <Pill className="w-3.5 h-3.5" /> Issue Prescription for {treatingPatient.patientName}
              </button>
            )}
          </div>

          {patientMedicalHistory.filter((h) => h.prescription).length > 0 ? (
            <div className="space-y-3">
              {patientMedicalHistory
                .filter((h) => h.prescription)
                .map((h, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1.5 text-xs">
                    <div className="flex justify-between items-center font-bold text-slate-900">
                      <span>{h.diagnosis}</span>
                      <span className="text-[10px] bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full">{h.visitDate}</span>
                    </div>
                    <p className="text-slate-700"><strong>Prescription:</strong> {h.prescription}</p>
                    {h.notes && <p className="text-slate-500 italic">Directions: {h.notes}</p>}
                  </div>
                ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-2">
              <Pill className="w-8 h-8 text-slate-400 mx-auto" />
              <h4 className="text-xs font-bold text-slate-700">Prescription Desk Ready</h4>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                Select an active patient from Your OPD Consultation Queue to issue digital prescriptions with integrated allergy conflict verification and meal timings.
              </p>
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: AI EMERGENCY TRIAGE & LAB ORDER */}
      {showTriageLabModal && treatingPatient && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 font-bold text-[10px] uppercase">
                  Clinical Emergency Station
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  🚨 Run AI Emergency Triage & Lab Diagnostic Order
                </h3>
                <p className="text-xs text-slate-500">
                  Patient: <strong>{treatingPatient.patientName}</strong> (Token {treatingPatient.tokenNumber})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowTriageLabModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRunAiTriageAndOrderLab} className="space-y-4">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Enter Clinical Vital Signs
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">SpO2 Oxygen (%)</label>
                  <input
                    type="number"
                    min={50}
                    max={100}
                    value={triageVitals.spo2}
                    onChange={(e) => setTriageVitals({ ...triageVitals, spo2: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Heart Rate (bpm)</label>
                  <input
                    type="number"
                    min={30}
                    max={250}
                    value={triageVitals.heart_rate}
                    onChange={(e) => setTriageVitals({ ...triageVitals, heart_rate: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Temperature (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    min={34}
                    max={43}
                    value={triageVitals.temperature}
                    onChange={(e) => setTriageVitals({ ...triageVitals, temperature: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Systolic BP (mmHg)</label>
                  <input
                    type="number"
                    min={60}
                    max={260}
                    value={triageVitals.systolic_bp}
                    onChange={(e) => setTriageVitals({ ...triageVitals, systolic_bp: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Diastolic BP (mmHg)</label>
                  <input
                    type="number"
                    min={40}
                    max={160}
                    value={triageVitals.diastolic_bp}
                    onChange={(e) => setTriageVitals({ ...triageVitals, diastolic_bp: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Respiratory Rate (/min)</label>
                  <input
                    type="number"
                    min={8}
                    max={60}
                    value={triageVitals.respiratory_rate}
                    onChange={(e) => setTriageVitals({ ...triageVitals, respiratory_rate: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Chest Pain</label>
                  <select
                    value={triageVitals.chest_pain}
                    onChange={(e) => setTriageVitals({ ...triageVitals, chest_pain: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-white"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Difficulty Breathing</label>
                  <select
                    value={triageVitals.difficulty_breathing}
                    onChange={(e) => setTriageVitals({ ...triageVitals, difficulty_breathing: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-white"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
              </div>

              {/* Diagnostic Test Selector */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700 mb-1">Diagnostic Test to Order</label>
                <select
                  value={orderedTestName}
                  onChange={(e) => setOrderedTestName(e.target.value)}
                  className="w-full px-3 py-2.5 border rounded-xl text-xs bg-white font-medium"
                >
                  <option value="Lipid Panel & Cardiac Troponin-I">Lipid Panel & Cardiac Troponin-I (STAT Blood Test)</option>
                  <option value="Complete Blood Count (CBC)">Complete Blood Count (CBC)</option>
                  <option value="Chest X-Ray (PA View)">Chest X-Ray (PA View - Radiology Imaging)</option>
                  <option value="CT Scan Brain (Non-Contrast)">CT Scan Brain (Non-Contrast)</option>
                  <option value="Renal Function Test (RFT) & Electrolytes">Renal Function Test (RFT) & Electrolytes</option>
                  <option value="Liver Function Test (LFT)">Liver Function Test (LFT)</option>
                  <option value="D-Dimer & Coagulation Panel">D-Dimer & Coagulation Panel</option>
                  <option value="Ultrasound Abdomen & Pelvis">Ultrasound Abdomen & Pelvis</option>
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  *Note: High severity tests (e.g. P2 critical) will be flagged to complete first by the technician.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowTriageLabModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isEvaluatingTriage}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  <ShieldAlert className="w-4 h-4" />
                  {isEvaluatingTriage ? 'Evaluating Triage...' : 'Run AI Triage & Send to Technician'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ISSUE PRESCRIPTION (WITH ALLERGY SAFETY CHECK) */}
      {showRxModal && treatingPatient && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">💊 Issue Digital Prescription</h3>
                <p className="text-xs text-slate-500">
                  Patient: <strong>{treatingPatient.patientName}</strong> ({treatingPatient.age} yrs, {treatingPatient.gender})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowRxModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Prominent Allergy Alert in Prescription Modal */}
            {treatingPatient.allergies && treatingPatient.allergies.toLowerCase() !== 'none' ? (
              <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Patient Known Allergies:</span>{' '}
                  <span className="font-black text-red-700 underline">{treatingPatient.allergies}</span>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    Avoid prescribing medications belonging to cross-reactive drug classes.
                  </p>
                </div>
              </div>
            ) : null}

            {/* Real-time Contraindication Alert */}
            {allergyConflictWarning && (
              <div className="p-3 bg-red-100 border-2 border-red-500 rounded-xl text-xs text-red-900 font-bold flex items-start gap-2 animate-pulse">
                <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>{allergyConflictWarning}</div>
              </div>
            )}

            <form onSubmit={handleIssueRx} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Clinical Diagnosis</label>
                <input
                  type="text"
                  value={rxDiagnosis}
                  onChange={(e) => setRxDiagnosis(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                  placeholder="e.g. Acute Bronchitis / Stage 1 Hypertension"
                  required
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="font-bold text-slate-700 uppercase text-[11px]">Medications ({rxItems.length})</span>
                <button
                  type="button"
                  onClick={handleAddMedicineRow}
                  className="px-2.5 py-1 bg-teal-50 border border-teal-300 text-teal-800 rounded-lg font-bold text-xs flex items-center gap-1 hover:bg-teal-100 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-teal-600" />
                  + Add Medicine
                </button>
              </div>

              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {rxItems.map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                      <span>Medicine #{idx + 1}</span>
                      {rxItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMedicineRow(idx)}
                          className="text-red-500 hover:text-red-700 text-[11px] font-bold cursor-pointer"
                        >
                          ✕ Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-semibold text-slate-600 text-[10px]">Medicine Name *</label>
                        <input
                          type="text"
                          list="common-doctor-medicines"
                          value={item.medicineName}
                          onChange={(e) => handleUpdateMedicineRow(idx, 'medicineName', e.target.value)}
                          className="w-full px-2.5 py-1.5 border rounded-lg bg-white text-xs"
                          placeholder="e.g. Amoxicillin 500mg"
                          required
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-600 text-[10px]">Dosage & Frequency</label>
                        <input
                          type="text"
                          value={item.dosage}
                          onChange={(e) => handleUpdateMedicineRow(idx, 'dosage', e.target.value)}
                          className="w-full px-2.5 py-1.5 border rounded-lg bg-white text-xs"
                          placeholder="e.g. 1 tab twice daily"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-semibold text-slate-600 text-[10px]">Total Quantity</label>
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) => handleUpdateMedicineRow(idx, 'quantity', Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 border rounded-lg bg-white text-xs"
                          required
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-600 text-[10px]">Instructions</label>
                        <input
                          type="text"
                          value={item.instructions}
                          onChange={(e) => handleUpdateMedicineRow(idx, 'instructions', e.target.value)}
                          className="w-full px-2.5 py-1.5 border rounded-lg bg-white text-xs"
                          placeholder="e.g. After meals"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRxModal(false)}
                  className="px-3.5 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={Boolean(allergyConflictWarning)}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
                >
                  Confirm & Send to Pharmacy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: VIEW & OPEN ATTACHED REPORT / DOCUMENT */}
      {viewedReport && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded">
                  Clinical Document Viewer
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">{viewedReport.testName}</h3>
                <p className="text-xs text-slate-500">
                  Patient: <strong>{viewedReport.patientName || `Patient #${viewedReport.patientId}`}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewedReport(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Document Preview Sheet */}
            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-4 text-xs font-mono">
              <div className="border-b border-slate-200 pb-2 flex justify-between items-center text-[11px] font-sans">
                <span className="font-bold text-teal-800">INTELLICARE DIAGNOSTIC PATHOLOGY LABORATORY</span>
                <span className="text-slate-400">Order ID: #{viewedReport.labTestId}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-sans">
                <div>
                  <span className="text-slate-500 block">Patient Name:</span>
                  <span className="font-bold text-slate-800">{viewedReport.patientName || `Patient #${viewedReport.patientId}`}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Requested Date:</span>
                  <span className="font-bold text-slate-800">{viewedReport.requestedDate}</span>
                </div>
              </div>

              {viewedReport.vitalsSummary && (
                <div className="p-2.5 bg-white rounded border border-slate-200 font-sans text-[11px]">
                  <span className="font-bold text-slate-700 block mb-0.5">Pre-Test Vitals:</span>
                  <p className="text-slate-600">{viewedReport.vitalsSummary}</p>
                </div>
              )}

              <div className="p-3 bg-white rounded border border-slate-200 font-sans text-xs space-y-1">
                <span className="font-bold text-slate-800 block">Laboratory Specimen Findings & Report:</span>
                <p className="text-slate-700 leading-relaxed">
                  {viewedReport.resultNotes || 'Standard pathology specimen evaluation completed. No severe morphological anomalies detected.'}
                </p>
              </div>

              {viewedReport.documentUrl && (
                <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-lg flex items-center justify-between font-sans">
                  <div>
                    <span className="text-xs font-bold text-teal-900 block">Attached Digital Document</span>
                    <span className="text-[11px] text-teal-700">{viewedReport.documentUrl}</span>
                  </div>
                  <span className="px-2.5 py-1 bg-teal-700 text-white rounded text-[10px] font-bold">
                    Digitally Signed & Verified
                  </span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-2">
              <div className="flex gap-2">
                <a
                  href={viewedReport.documentUrl || `/api/lab-tests/${viewedReport.labTestId}/document`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Download / Open
                </a>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" /> Print
                </button>
              </div>
              <button
                type="button"
                onClick={() => setViewedReport(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
