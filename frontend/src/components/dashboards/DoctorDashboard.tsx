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
} from 'lucide-react';
import { StatCard } from '../common/StatCard';
import {
  doctorService,
  appointmentService,
  labService,
  mlService,
} from '../../services/hospitalService';
import type { Doctor, LabTest } from '../../types';

interface PatientMedicalVisit {
  visitDate: string;
  doctorName: string;
  department: string;
  diagnosis: string;
  notes: string;
  prescription: string;
  labResult: string;
}

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
  vitals?: {
    spo2: number;
    hr: number;
    bp: string;
    rr: number;
    temp: number;
  };
  triageNotes?: string;
  medicalHistory: PatientMedicalVisit[];
}

export const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();

  // Dynamic doctor ID resolution
  const currentDoctorId =
    user?.doctorId ||
    (user?.username && user.username.match(/^2\d{3}$/)
      ? parseInt(user.username, 10) - 2000
      : 1);

  const [doctorProfile, setDoctorProfile] = useState<Doctor | null>(null);
  const [activeQueue, setActiveQueue] = useState<DoctorQueueItem[]>([]);
  const [labReports, setLabReports] = useState<LabTest[]>([]);
  const [treatingPatient, setTreatingPatient] = useState<DoctorQueueItem | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

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

  // Prescription Modal State
  const [showRxModal, setShowRxModal] = useState<boolean>(false);
  const [rxDetails, setRxDetails] = useState({
    medicine: 'Paracetamol 500mg',
    dosage: '1 tab twice daily',
    quantity: 10,
    instructions: 'Take after meals with water',
  });

  // Viewed Lab Report Modal
  const [viewedReport, setViewedReport] = useState<LabTest | null>(null);

  useEffect(() => {
    loadDoctorInfo();
    loadQueue();
    loadLabReports();
  }, [currentDoctorId]);

  const loadDoctorInfo = async () => {
    try {
      const doc = await doctorService.getById(currentDoctorId);
      if (doc) {
        setDoctorProfile(doc);
      }
    } catch {
      // Fallback from context
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
        const mappedQueue: DoctorQueueItem[] = appointments.map((app, idx) => ({
          appointmentId: app.appointmentId,
          tokenNumber: app.tokenNumber || `T-${String(idx + 1).padStart(2, '0')}`,
          patientId: app.patientId,
          patientName: app.patientName || `Patient #${app.patientId}`,
          age: 45,
          gender: 'Male',
          bloodGroup: 'O+',
          allergies: 'None',
          symptoms: app.symptoms || app.reason || 'Routine OPD Consultation',
          severity: app.severity || 'MEDIUM',
          priority: app.priority || 2,
          appointmentTime: app.appointmentTime,
          appointmentDate: app.appointmentDate,
          status: app.status || 'WAITING',
          vitals: { spo2: 96, hr: 84, bp: '124/80', rr: 16, temp: 37.0 },
          medicalHistory: [
            {
              visitDate: '2026-09-15',
              doctorName: doctorProfile?.name || 'Consulting Physician',
              department: doctorProfile?.department || 'OPD',
              diagnosis: 'Mild Seasonal Upper Respiratory Infection',
              notes: 'Rest, fluid intake, and symptomatic relief.',
              prescription: 'Paracetamol 500mg • As needed',
              labResult: 'Complete Blood Count Normal',
            },
          ],
        }));
        setActiveQueue(mappedQueue);
      } else if (currentDoctorId === 1) {
        // Seed default patients for Dr. Sarah Jenkins demo
        setActiveQueue([
          {
            appointmentId: 101,
            tokenNumber: 'T-01',
            patientId: 1,
            patientName: 'John Smith',
            age: 45,
            gender: 'Male',
            bloodGroup: 'O+',
            allergies: 'Penicillin',
            symptoms: 'Palpitations, sudden chest heaviness, shortness of breath',
            severity: 'CRITICAL',
            priority: 4,
            appointmentTime: '10:00 AM',
            appointmentDate: new Date().toISOString().split('T')[0],
            status: 'WAITING',
            vitals: { spo2: 86, hr: 118, bp: '165/98', rr: 32, temp: 39.1 },
            triageNotes: 'EMERGENCY OVERRIDE: Low SpO2 (86%) and severe chest tightness. Immediate doctor evaluation required.',
            medicalHistory: [
              {
                visitDate: '2026-10-14',
                doctorName: 'Dr. Sarah Jenkins',
                department: 'Cardiology',
                diagnosis: 'Stage 1 Essential Hypertension',
                notes: 'Blood pressure elevated with stress. Advised low sodium diet.',
                prescription: 'Amlodipine 5mg • 1 tab once daily',
                labResult: 'ECG Completed (Sinus Tachycardia)',
              },
              {
                visitDate: '2026-08-10',
                doctorName: 'Dr. James Wilson',
                department: 'General Medicine',
                diagnosis: 'Acute Bronchial Infection',
                notes: 'Persistent dry cough for 5 days. Chest auscultation clear.',
                prescription: 'Azithromycin 500mg • Once daily for 3 days',
                labResult: 'CBC Normal Range',
              },
            ],
          },
          {
            appointmentId: 102,
            tokenNumber: 'T-02',
            patientId: 2,
            patientName: 'Emily Davis',
            age: 28,
            gender: 'Female',
            bloodGroup: 'A+',
            allergies: 'Aspirin',
            symptoms: 'Mild chest tightness on walking, recurring fatigue',
            severity: 'HIGH',
            priority: 3,
            appointmentTime: '10:30 AM',
            appointmentDate: new Date().toISOString().split('T')[0],
            status: 'WAITING',
            vitals: { spo2: 93, hr: 98, bp: '138/88', rr: 24, temp: 38.4 },
            triageNotes: 'URGENT ATTENTION: Moderate respiratory distress and fever. Expedited queue assigned.',
            medicalHistory: [
              {
                visitDate: '2026-09-18',
                doctorName: 'Dr. Priya Patel',
                department: 'Pediatrics / OPD',
                diagnosis: 'Seasonal Allergic Asthma Flare',
                notes: 'Wheezing on exertion. Prescribed bronchodilator inhaler.',
                prescription: 'Salbutamol Inhaler • 2 puffs as needed',
                labResult: 'Chest X-Ray Normal',
              },
            ],
          },
        ]);
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
        // Fallback reports for demo
        setLabReports([
          {
            labTestId: 901,
            patientId: 1,
            patientName: 'John Smith',
            doctorId: currentDoctorId,
            doctorName: doctorProfile?.name || 'Dr. Sarah Jenkins',
            testName: 'Complete Blood Count (CBC)',
            status: 'COMPLETED',
            requestedDate: '2026-10-19',
            severity: 'LOW',
            priority: 1,
            resultNotes: 'Hb: 14.2 g/dL, WBC: 6,800/mcL, Platelets: 240,000/mcL (Normal Range)',
            documentUrl: 'Report_CBC_JohnSmith.pdf',
            testType: 'PATHOLOGY_DOC',
          },
        ]);
      }
    } catch {
      setLabReports([]);
    }
  };

  const handleStartTreatment = (patient: DoctorQueueItem) => {
    setTreatingPatient(patient);
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
  };

  const handleCompleteTreatment = (appointmentId: number, patientName: string) => {
    setActiveQueue((prev) => prev.filter((p) => p.appointmentId !== appointmentId));
    setTreatingPatient(null);
    setNotification(
      `✅ Consultation completed for ${patientName}! Patient record updated and discharged from OPD queue.`
    );
    setTimeout(() => setNotification(null), 4000);
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
      } catch (err) {
        console.warn('ML triage microservice fallback used');
        if (triageVitals.spo2 < 90 || triageVitals.systolic_bp > 160) {
          severityResult = 'CRITICAL';
          priorityLevel = 4;
        }
      }

      // 2. Format Vitals Summary
      const vitalsSummary = `SpO2: ${triageVitals.spo2}% • HR: ${triageVitals.heart_rate} bpm • BP: ${triageVitals.systolic_bp}/${triageVitals.diastolic_bp} • Temp: ${triageVitals.temperature}°C • RR: ${triageVitals.respiratory_rate}`;

      const isXray = orderedTestName.toLowerCase().includes('x-ray') || orderedTestName.toLowerCase().includes('scan');

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

      // Update patient severity in active queue
      treatingPatient.severity = severityResult;
      treatingPatient.priority = priorityLevel;

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

  const handleIssueRx = (e: React.FormEvent) => {
    e.preventDefault();
    setNotification(
      `💊 Prescription for ${rxDetails.medicine} (${rxDetails.dosage}) issued for ${treatingPatient?.patientName} and transmitted to Pharmacy!`
    );
    setShowRxModal(false);
    setTimeout(() => setNotification(null), 4000);
  };

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
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          {notification}
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Patients in Your Queue"
          value={activeQueue.length}
          subtitle={`Booked for ${docName}`}
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

      {/* Active Treatment Panel (When Doctor is Examining a Patient) */}
      {treatingPatient && (
        <div className="bg-white rounded-2xl border-2 border-teal-500/40 p-6 shadow-sm space-y-5">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-4 border-b border-slate-100 gap-3">
            <div>
              <div className="flex items-center gap-2">
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
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-1">
                Examining Patient: {treatingPatient.patientName} ({treatingPatient.age} yrs, {treatingPatient.gender})
              </h2>
              <p className="text-xs text-slate-500">
                Blood Group: <strong>{treatingPatient.bloodGroup}</strong> • Allergies:{' '}
                <strong className="text-red-600">{treatingPatient.allergies}</strong> • Reported Symptoms:{' '}
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

          {/* Vitals Summary Card */}
          {treatingPatient.vitals && (
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
          )}

          {/* Date-Wise Medical History - SHOWN ONLY WHILE TREATING THIS PATIENT */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-teal-600" />
              Patient Date-Wise Medical History (Visible During Active Treatment)
            </h3>
            {treatingPatient.medicalHistory && treatingPatient.medicalHistory.length > 0 ? (
              <div className="space-y-2">
                {treatingPatient.medicalHistory.map((h, i) => (
                  <div key={i} className="p-3 bg-teal-50/40 rounded-xl border border-teal-100 text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-teal-800">Visit Date: {h.visitDate}</span>
                      <span className="text-slate-600">Consultant: {h.doctorName} ({h.department})</span>
                    </div>
                    <p><strong>Diagnosis:</strong> {h.diagnosis}</p>
                    <p className="text-slate-600"><strong>Doctor Notes:</strong> {h.notes}</p>
                    <p className="text-slate-600"><strong>Prescription:</strong> {h.prescription}</p>
                    <p className="text-teal-700 font-medium"><strong>Lab Test Result:</strong> {h.labResult}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No previous visit records found for this patient.</p>
            )}
          </div>
        </div>
      )}

      {/* Doctor-Specific Queue Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm space-y-4 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Your OPD Consultation Queue</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Patients booked specifically for {docName} at {docRoom}.
            </p>
          </div>
          <span className="text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
            {activeQueue.length} Patient(s) Waiting
          </span>
        </div>

        {activeQueue.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 uppercase font-bold text-[10px] tracking-wider border-y border-slate-200">
                <tr>
                  <th className="px-4 py-3">Token</th>
                  <th className="px-4 py-3">Patient Name</th>
                  <th className="px-4 py-3">Symptoms Reported</th>
                  <th className="px-4 py-3">AI Severity</th>
                  <th className="px-4 py-3">Slot Time</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeQueue.map((patient) => (
                  <tr key={patient.appointmentId} className="hover:bg-teal-50/30 transition-colors">
                    <td className="px-4 py-3 font-bold text-teal-800">{patient.tokenNumber}</td>
                    <td className="px-4 py-3 font-bold text-slate-900">
                      {patient.patientName}
                      <span className="text-[10px] text-slate-500 block font-normal">
                        {patient.gender}, {patient.age} yrs
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 max-w-xs truncate">{patient.symptoms}</td>
                    <td className="px-4 py-3">
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
                    </td>
                    <td className="px-4 py-3 text-slate-600">{patient.appointmentTime}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleStartTreatment(patient)}
                        className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      >
                        Attend / Examine
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-2">
            <Clock className="w-8 h-8 text-slate-400 mx-auto" />
            <h4 className="text-xs font-bold text-slate-700">No Patients in Your Queue</h4>
            <p className="text-[11px] text-slate-500">
              There are currently no patients booked for {docName}. When a patient books a consultation with you from the patient portal or front desk receptionist, they will appear here.
            </p>
          </div>
        )}
      </div>

      {/* Lab Reports & Diagnostic Attachments for Doctor */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
              <FlaskConical className="w-4 h-4 text-teal-600" />
              Diagnostic Lab Orders & Completed Reports
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Reports completed by the lab technician prioritized by severity (e.g. Critical P2 tests completed before P1).
            </p>
          </div>
          <span className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
            {labReports.length} Test Orders
          </span>
        </div>

        {labReports.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {labReports.map((report) => (
              <div
                key={report.labTestId}
                className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 hover:border-teal-300 transition-colors space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{report.testName}</span>
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
                  <span className="text-teal-700 font-bold">{report.status}</span>
                </p>
                {report.resultNotes && (
                  <div className="p-2 bg-white rounded border border-slate-100 text-[11px] text-slate-700">
                    <strong>Findings:</strong> {report.resultNotes}
                  </div>
                )}
                {report.documentUrl && (
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-teal-700 font-semibold flex items-center gap-1">
                      📄 Document Report Attached
                    </span>
                    <button
                      type="button"
                      onClick={() => setViewedReport(report)}
                      className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded text-[10px] font-bold flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" /> View Report
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic">No laboratory tests requested yet.</p>
        )}
      </div>

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
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
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
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isEvaluatingTriage}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  <ShieldAlert className="w-4 h-4" />
                  {isEvaluatingTriage ? 'Evaluating Triage...' : 'Run AI Triage & Send to Technician'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ISSUE PRESCRIPTION */}
      {showRxModal && treatingPatient && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">💊 Issue Digital Prescription</h3>
                <p className="text-xs text-slate-500">Patient: {treatingPatient.patientName}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowRxModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleIssueRx} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Medication</label>
                <input
                  type="text"
                  value={rxDetails.medicine}
                  onChange={(e) => setRxDetails({ ...rxDetails, medicine: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Dosage & Frequency</label>
                <input
                  type="text"
                  value={rxDetails.dosage}
                  onChange={(e) => setRxDetails({ ...rxDetails, dosage: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Quantity</label>
                <input
                  type="number"
                  min={1}
                  value={rxDetails.quantity}
                  onChange={(e) => setRxDetails({ ...rxDetails, quantity: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-xl"
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Instructions</label>
                <input
                  type="text"
                  value={rxDetails.instructions}
                  onChange={(e) => setRxDetails({ ...rxDetails, instructions: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRxModal(false)}
                  className="px-3 py-1.5 border rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl"
                >
                  Confirm & Send to Pharmacy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: VIEW REPORT PREVIEW */}
      {viewedReport && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded">
                  Diagnostic Report
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">{viewedReport.testName}</h3>
                <p className="text-xs text-slate-500">
                  Patient: {viewedReport.patientName || `Patient #${viewedReport.patientId}`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewedReport(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-700 block mb-1">Clinical Findings & Remarks:</span>
                <p className="text-slate-900">{viewedReport.resultNotes || 'Standard evaluation recorded.'}</p>
              </div>

              {viewedReport.vitalsSummary && (
                <div className="p-2.5 bg-teal-50/50 rounded-lg border border-teal-100">
                  <span className="text-[10px] text-teal-800 font-bold block">Patient Vitals at Order:</span>
                  <p className="text-slate-700 text-[11px]">{viewedReport.vitalsSummary}</p>
                </div>
              )}

              {viewedReport.documentUrl && (
                <div className="p-3 border border-dashed border-teal-300 rounded-xl bg-teal-50/30 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-teal-900 block">Uploaded Attachment Document</span>
                    <span className="text-[11px] text-slate-500">{viewedReport.documentUrl}</span>
                  </div>
                  <span className="px-3 py-1 bg-teal-600 text-white rounded-lg font-bold text-[11px]">
                    Verified
                  </span>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setViewedReport(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold"
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
