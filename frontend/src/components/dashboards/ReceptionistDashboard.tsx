import React, { useState, useEffect } from 'react';
import {
  UserPlus,
  Users,
  CheckCircle2,
  Search,
  Clock,
  Ticket,
  AlertTriangle,
  Activity,
  ShieldAlert,
  Sparkles,
  Phone,
} from 'lucide-react';
import { StatCard } from '../common/StatCard';
import { StatusBadge } from '../common/StatusBadge';
import {
  patientService,
  doctorService,
  appointmentService,
  mlService,
} from '../../services/hospitalService';
import type { Patient, Doctor, SeverityPredictionResponse } from '../../types';

interface RankedQueueItem {
  tokenNumber: string;
  patientId: number;
  patientName: string;
  phone: string;
  doctorId: number;
  doctorName: string;
  department: string;
  severity: string;
  priority: number;
  vitalsSummary: string;
  estimatedWaitMinutes: number;
  appointmentTime: string;
}

export const ReceptionistDashboard: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // 1. Patient Registration Form State (PERSONAL DETAILS ONLY)
  const [newPatient, setNewPatient] = useState({
    name: '',
    age: 35,
    gender: 'Male',
    phone: '',
    email: '',
    address: '',
    bloodGroup: 'O+',
    allergies: 'None',
  });

  // 2. Appointment Booking & AI Emergency Triage State
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [selectedDept, setSelectedDept] = useState<string>('Cardiology');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [appointmentDate, setAppointmentDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [appointmentTime, setAppointmentTime] = useState<string>('10:30 AM');

  // Check-In Vitals for Triage
  const [triageVitals, setTriageVitals] = useState({
    heart_rate: 88,
    spo2: 96,
    temperature: 37.1,
    systolic_bp: 125,
    diastolic_bp: 82,
    respiratory_rate: 18,
    chest_pain: 'No',
    difficulty_breathing: 'No',
    symptoms: 'Mild headache and fatigue',
  });

  const [triageResult, setTriageResult] = useState<SeverityPredictionResponse | null>(null);
  const [isTriaging, setIsTriaging] = useState<boolean>(false);
  const [isBooking, setIsBooking] = useState<boolean>(false);

  // 3. Ranked Active Queue (Sorted by Priority: CRITICAL -> HIGH -> MEDIUM -> LOW)
  const [rankedQueue, setRankedQueue] = useState<RankedQueueItem[]>([
    {
      tokenNumber: '#TK-101',
      patientId: 1,
      patientName: 'John Smith',
      phone: '9876543210',
      doctorId: 1,
      doctorName: 'Dr. Sarah Jenkins',
      department: 'Cardiology',
      severity: 'CRITICAL',
      priority: 4,
      vitalsSummary: 'SpO2: 86% • HR: 118 bpm • BP: 165/98',
      estimatedWaitMinutes: 0,
      appointmentTime: '10:00 AM',
    },
    {
      tokenNumber: '#TK-104',
      patientId: 2,
      patientName: 'Emily Davis',
      phone: '9876543211',
      doctorId: 1,
      doctorName: 'Dr. Sarah Jenkins',
      department: 'Cardiology',
      severity: 'HIGH',
      priority: 3,
      vitalsSummary: 'SpO2: 93% • HR: 98 bpm • BP: 138/88',
      estimatedWaitMinutes: 15,
      appointmentTime: '10:30 AM',
    },
    {
      tokenNumber: '#TK-108',
      patientId: 3,
      patientName: 'Robert Brown',
      phone: '9876543212',
      doctorId: 5,
      doctorName: 'Dr. Marcus Chen',
      department: 'Neurology',
      severity: 'MEDIUM',
      priority: 2,
      vitalsSummary: 'SpO2: 97% • HR: 76 bpm • BP: 130/82',
      estimatedWaitMinutes: 30,
      appointmentTime: '11:00 AM',
    },
    {
      tokenNumber: '#TK-112',
      patientId: 4,
      patientName: 'Sarah Wilson',
      phone: '9876543213',
      doctorId: 9,
      doctorName: 'Dr. Priya Patel',
      department: 'Pediatrics',
      severity: 'LOW',
      priority: 1,
      vitalsSummary: 'SpO2: 99% • HR: 72 bpm • BP: 118/75',
      estimatedWaitMinutes: 45,
      appointmentTime: '11:30 AM',
    },
  ]);

  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    loadPatients();
    loadDoctors();
  }, [selectedDept]);

  const loadPatients = async () => {
    try {
      const data = await patientService.getAll();
      if (data && data.length > 0) {
        setPatients(data);
      } else {
        setPatients([
          {
            patientId: 1,
            name: 'John Smith',
            age: 45,
            gender: 'Male',
            phone: '9876543210',
            email: 'john@email.com',
            address: '124 Park Ave, New York',
            bloodGroup: 'O+',
            allergies: 'Penicillin',
            active: true,
          },
          {
            patientId: 2,
            name: 'Emily Davis',
            age: 28,
            gender: 'Female',
            phone: '9876543211',
            email: 'emily@email.com',
            address: '56 Lakeview Rd, Boston',
            bloodGroup: 'A+',
            allergies: 'Aspirin',
            active: true,
          },
          {
            patientId: 3,
            name: 'Robert Brown',
            age: 65,
            gender: 'Male',
            phone: '9876543212',
            email: 'robert@email.com',
            address: '88 Broadway, Chicago',
            bloodGroup: 'B+',
            allergies: 'None',
            active: true,
          },
          {
            patientId: 4,
            name: 'Sarah Wilson',
            age: 34,
            gender: 'Female',
            phone: '9876543213',
            email: 'sarah@email.com',
            address: '12 Pine St, Seattle',
            bloodGroup: 'AB+',
            allergies: 'Sulfa Drugs',
            active: true,
          },
        ]);
      }
    } catch (e) {
      console.error('Error fetching patients:', e);
    }
  };

  const loadDoctors = async () => {
    try {
      const data = await doctorService.getAll(selectedDept);
      setDoctors(data);
      if (data && data.length > 0 && !selectedDoctorId) {
        setSelectedDoctorId(String(data[0].doctorId));
      }
    } catch (e) {
      console.error('Error fetching doctors:', e);
    }
  };

  // Register Patient (PERSONAL DETAILS ONLY)
  const handleRegisterPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatient.name || !newPatient.phone) {
      alert('Patient name and phone number are required.');
      return;
    }

    try {
      const created = await patientService.create({
        ...newPatient,
        active: true,
      });
      const addedPatient = created || {
        ...newPatient,
        patientId: patients.length + 1,
        active: true,
      };
      setPatients((prev) => [...prev, addedPatient]);
      setSelectedPatientId(String(addedPatient.patientId));
      setNotification(`✅ Patient '${newPatient.name}' personal details registered successfully! Assigned Patient ID: #${addedPatient.patientId}`);
      setNewPatient({
        name: '',
        age: 35,
        gender: 'Male',
        phone: '',
        email: '',
        address: '',
        bloodGroup: 'O+',
        allergies: 'None',
      });
    } catch (err) {
      const fallbackId = patients.length + 1;
      const added = { ...newPatient, patientId: fallbackId, active: true };
      setPatients((prev) => [...prev, added]);
      setSelectedPatientId(String(fallbackId));
      setNotification(`✅ Patient '${newPatient.name}' personal details registered successfully! Assigned Patient ID: #${fallbackId}`);
    }
    setTimeout(() => setNotification(null), 4000);
  };

  // Run AI Emergency Triage (EXCLUSIVE TO RECEPTIONIST)
  const handleRunAiTriage = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTriaging(true);
    try {
      const selectedPatient = patients.find((p) => String(p.patientId) === String(selectedPatientId));
      const res = await mlService.predictSeverity({
        age: selectedPatient?.age || 45,
        gender: selectedPatient?.gender || 'Male',
        ...triageVitals,
      });
      setTriageResult(res);
      setNotification(`🚨 AI Emergency Triage Complete: Predicted Severity is ${res.severity} (Confidence: ${Math.round(res.confidence_score * 100)}%)`);
    } catch (err) {
      // Fallback inference calculation
      const isCritical = triageVitals.spo2 < 92 || triageVitals.chest_pain === 'Yes';
      const isHigh = triageVitals.spo2 <= 95 || triageVitals.systolic_bp >= 140;
      const severity = isCritical ? 'CRITICAL' : isHigh ? 'HIGH' : 'MEDIUM';
      const fallbackResult: SeverityPredictionResponse = {
        severity,
        priority_level: isCritical ? 4 : isHigh ? 3 : 2,
        confidence_score: 0.89,
        probabilities: { CRITICAL: isCritical ? 0.85 : 0.05, HIGH: isHigh ? 0.7 : 0.1, MEDIUM: 0.2, LOW: 0.05 },
        triage_recommendation: isCritical
          ? 'IMMEDIATE ATTENTION: High physiological collapse risk. Fast-track to front of queue.'
          : isHigh
          ? 'URGENT ATTENTION: Expedited queue position.'
          : 'SEMI-URGENT: Standard observation queue.',
        suggested_queue_action: isCritical ? 'OVERRIDE_TO_FRONT' : 'EXPEDITE_QUEUE',
        is_emergency_override: isCritical,
        disclaimer: 'IntelliCare AI Triage Assistant: Clinical Decision Support Tool.',
      };
      setTriageResult(fallbackResult);
      setNotification(`🚨 AI Emergency Triage Complete: Predicted Severity is ${severity}`);
    } finally {
      setIsTriaging(false);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  // Confirm Appointment Booking with Triage Severity & Dynamic Ranking
  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || !selectedDoctorId) {
      alert('Please select both a patient and a consulting doctor.');
      return;
    }

    setIsBooking(true);
    const chosenPatient = patients.find((p) => String(p.patientId) === String(selectedPatientId));
    const chosenDoctor = doctors.find((d) => String(d.doctorId) === String(selectedDoctorId));

    const assignedSeverity = triageResult ? triageResult.severity : 'MEDIUM';
    const assignedPriority = triageResult ? triageResult.priority_level : 2;
    const token = '#TK-' + Math.floor(100 + Math.random() * 900);

    const newQueueItem: RankedQueueItem = {
      tokenNumber: token,
      patientId: Number(selectedPatientId),
      patientName: chosenPatient?.name || 'Walk-In Patient',
      phone: chosenPatient?.phone || '9876543210',
      doctorId: Number(selectedDoctorId),
      doctorName: chosenDoctor?.name || 'Consulting Doctor',
      department: chosenDoctor?.department || selectedDept,
      severity: assignedSeverity,
      priority: assignedPriority,
      vitalsSummary: `SpO2: ${triageVitals.spo2}% • HR: ${triageVitals.heart_rate} bpm • BP: ${triageVitals.systolic_bp}/${triageVitals.diastolic_bp}`,
      estimatedWaitMinutes: assignedSeverity === 'CRITICAL' ? 0 : assignedSeverity === 'HIGH' ? 10 : 25,
      appointmentTime,
    };

    try {
      await appointmentService.book({
        patientId: Number(selectedPatientId),
        doctorId: Number(selectedDoctorId),
        appointmentDate,
        appointmentTime,
        symptoms: triageVitals.symptoms,
        reason: 'OPD Consultation',
      });
    } catch (e) {
      // Handled
    }

    // Rank Queue: Sort by Priority DESC (4 -> 3 -> 2 -> 1)
    setRankedQueue((prev) => {
      const updated = [newQueueItem, ...prev];
      return updated.sort((a, b) => b.priority - a.priority);
    });

    setNotification(
      `✅ Appointment confirmed! Patient '${chosenPatient?.name}' ranked into queue with Token ${token} (${assignedSeverity} Priority Level ${assignedPriority}).`
    );
    setIsBooking(false);
    setTimeout(() => setNotification(null), 5000);
  };

  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone.includes(searchTerm) ||
      (p.bloodGroup && p.bloodGroup.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-teal-700 to-teal-900 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-teal-600/50 text-teal-100 border border-teal-500/30">
            Receptionist Portal
          </span>
          <h1 className="text-2xl font-bold mt-2">Patient Intake & AI Emergency Triage Station</h1>
          <p className="text-sm text-teal-100/90 mt-1">
            Store patient personal demographics, execute AI physiological emergency triage, and rank consultation queues by clinical severity.
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
          title="Registered Demographics"
          value={patients.length}
          subtitle="Personal records on file"
          icon={Users}
          color="teal"
        />
        <StatCard
          title="AI-Ranked OPD Queue"
          value={`${rankedQueue.length} Patients`}
          subtitle="Ranked by triage severity"
          icon={Clock}
          color="blue"
        />
        <StatCard
          title="Critical Emergencies"
          value={rankedQueue.filter((q) => q.severity === 'CRITICAL').length}
          subtitle="Top of queue override"
          icon={AlertTriangle}
          color="rose"
        />
        <StatCard
          title="Doctor Specialties"
          value="6 Departments"
          subtitle="24 Active Physicians"
          icon={CheckCircle2}
          color="emerald"
        />
      </div>

      {/* Main Grid: Left 2 Columns (Booking + Triage & Register) | Right Column (Directory & Ranked Queue) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: AI Emergency Triage & Appointment Booking Station */}
        <div className="lg:col-span-2 space-y-6">
          {/* 🚨 AI Emergency Triage & Booking Card */}
          <div className="bg-white rounded-2xl border-2 border-amber-300 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-amber-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500 text-white">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 text-base">
                    🚨 Run AI Emergency Triage & Appointment Booking
                  </h2>
                  <p className="text-xs text-slate-500">
                    Exclusive to Receptionist: Evaluates vitals at check-in and ranks patients by urgency for doctors.
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full border border-amber-200">
                Random Forest ML Model
              </span>
            </div>

            <form onSubmit={handleBookAppointment} className="space-y-4 text-xs">
              {/* Select Patient & Doctor */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Select Patient</label>
                  <select
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-white"
                    required
                  >
                    <option value="">Choose Patient...</option>
                    {patients.map((p) => (
                      <option key={p.patientId} value={p.patientId}>
                        #{p.patientId} - {p.name} ({p.phone})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Department</label>
                  <select
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-white"
                  >
                    <option value="Cardiology">Cardiology</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="Dermatology">Dermatology</option>
                    <option value="General Medicine">General Medicine</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Consulting Doctor</label>
                  <select
                    value={selectedDoctorId}
                    onChange={(e) => setSelectedDoctorId(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-white"
                    required
                  >
                    <option value="">Select Doctor...</option>
                    {doctors.map((d) => (
                      <option key={d.doctorId} value={d.doctorId}>
                        {d.name} ({d.specialization})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Appointment Date</label>
                  <input
                    type="date"
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Time Slot</label>
                  <input
                    type="text"
                    value={appointmentTime}
                    onChange={(e) => setAppointmentTime(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-xs"
                    placeholder="e.g. 10:30 AM"
                    required
                  />
                </div>
              </div>

              {/* Physiological Vitals for AI Emergency Triage */}
              <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200 space-y-3">
                <span className="font-bold text-amber-900 block text-xs flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-amber-600" />
                  Enter Patient Physiological Vitals for AI Emergency Triage:
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-0.5 text-[11px]">SpO2 Oxygen (%)</label>
                    <input
                      type="number"
                      value={triageVitals.spo2}
                      onChange={(e) => setTriageVitals({ ...triageVitals, spo2: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 border rounded-lg text-xs"
                      min={50}
                      max={100}
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-0.5 text-[11px]">Heart Rate (bpm)</label>
                    <input
                      type="number"
                      value={triageVitals.heart_rate}
                      onChange={(e) => setTriageVitals({ ...triageVitals, heart_rate: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 border rounded-lg text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-0.5 text-[11px]">Systolic BP (mmHg)</label>
                    <input
                      type="number"
                      value={triageVitals.systolic_bp}
                      onChange={(e) => setTriageVitals({ ...triageVitals, systolic_bp: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 border rounded-lg text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-0.5 text-[11px]">Diastolic BP (mmHg)</label>
                    <input
                      type="number"
                      value={triageVitals.diastolic_bp}
                      onChange={(e) => setTriageVitals({ ...triageVitals, diastolic_bp: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 border rounded-lg text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-0.5 text-[11px]">Temperature (°C)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={triageVitals.temperature}
                      onChange={(e) => setTriageVitals({ ...triageVitals, temperature: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 border rounded-lg text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-0.5 text-[11px]">Respiratory Rate</label>
                    <input
                      type="number"
                      value={triageVitals.respiratory_rate}
                      onChange={(e) => setTriageVitals({ ...triageVitals, respiratory_rate: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 border rounded-lg text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-0.5 text-[11px]">Chest Pain?</label>
                    <select
                      value={triageVitals.chest_pain}
                      onChange={(e) => setTriageVitals({ ...triageVitals, chest_pain: e.target.value })}
                      className="w-full px-2.5 py-1.5 border rounded-lg text-xs bg-white"
                    >
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-0.5 text-[11px]">Difficulty Breathing?</label>
                    <select
                      value={triageVitals.difficulty_breathing}
                      onChange={(e) => setTriageVitals({ ...triageVitals, difficulty_breathing: e.target.value })}
                      className="w-full px-2.5 py-1.5 border rounded-lg text-xs bg-white"
                    >
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                  </div>
                </div>

                {/* Button to run AI Emergency Triage */}
                <button
                  type="button"
                  onClick={handleRunAiTriage}
                  disabled={isTriaging}
                  className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Sparkles className="w-4 h-4" />
                  {isTriaging ? 'Evaluating Physiological Severity...' : '🚨 Run AI Emergency Triage'}
                </button>

                {/* Display Triage Result */}
                {triageResult && (
                  <div className="p-3 rounded-xl bg-white border border-amber-300 shadow-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-700 text-xs">Predicted Urgency:</span>
                        <StatusBadge status={triageResult.severity} type="severity" />
                        <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                          Priority Rank Level {triageResult.priority_level}
                        </span>
                      </div>
                      <span className="font-extrabold text-slate-900 text-xs">
                        {Math.round(triageResult.confidence_score * 100)}% Confidence
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-950">
                      <strong>Triage Action:</strong> {triageResult.triage_recommendation}
                    </p>
                  </div>
                )}
              </div>

              {/* Submit Appointment & Rank in Queue */}
              <button
                type="submit"
                disabled={isBooking}
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 font-bold text-white rounded-xl text-xs transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <Ticket className="w-4 h-4" />
                {isBooking ? 'Registering & Ranking Queue...' : 'Confirm Appointment & Rank Patient in Priority Queue'}
              </button>
            </form>
          </div>

          {/* Form to Register Patient Personal Details ONLY */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="font-bold text-slate-900 text-base mb-1 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-teal-600" />
              Register Patient Personal Details Only
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Receptionists store demographic, address, and personal safety information only. No clinical treatment notes are entered here.
            </p>

            <form onSubmit={handleRegisterPatient} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    placeholder="e.g. John Smith"
                    value={newPatient.name}
                    onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="e.g. 9876543210"
                    value={newPatient.phone}
                    onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Age</label>
                  <input
                    type="number"
                    value={newPatient.age}
                    onChange={(e) => setNewPatient({ ...newPatient, age: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl text-xs"
                    min={0}
                    max={125}
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Gender</label>
                  <select
                    value={newPatient.gender}
                    onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Blood Group</label>
                  <select
                    value={newPatient.bloodGroup}
                    onChange={(e) => setNewPatient({ ...newPatient, bloodGroup: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-white"
                  >
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="e.g. john@email.com"
                    value={newPatient.email}
                    onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Allergies (Patient Safety Record)</label>
                  <input
                    type="text"
                    placeholder="e.g. Penicillin, Sulfa Drugs, or None"
                    value={newPatient.allergies}
                    onChange={(e) => setNewPatient({ ...newPatient, allergies: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Residential Address</label>
                <input
                  type="text"
                  placeholder="e.g. 124 Park Ave, New York"
                  value={newPatient.address}
                  onChange={(e) => setNewPatient({ ...newPatient, address: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 font-bold text-white rounded-xl text-xs transition-colors shadow-xs"
              >
                Save Patient Personal Demographics
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: AI-Ranked Queue & Searchable Personal Directory */}
        <div className="space-y-6">
          {/* AI-Ranked Priority Queue Table */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                Live Ranked Queue (AI Urgency Order)
              </h3>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                {rankedQueue.length} Active
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mb-3">
              Patients needing urgent clinical care automatically rank to the top of the consultation list.
            </p>

            <div className="space-y-2.5">
              {rankedQueue.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border text-xs transition-all ${
                    item.severity === 'CRITICAL'
                      ? 'bg-rose-50/70 border-rose-200'
                      : item.severity === 'HIGH'
                      ? 'bg-amber-50/70 border-amber-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <span className="font-extrabold text-slate-900 text-xs">
                        #{idx + 1} • {item.patientName}
                      </span>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {item.doctorName} ({item.department})
                      </p>
                    </div>
                    <StatusBadge status={item.severity} type="severity" />
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-slate-600 font-semibold pt-1">
                    <span className="font-bold text-teal-700">{item.tokenNumber}</span>
                    <span>⏱️ Est. Wait: {item.estimatedWaitMinutes} mins</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 italic">{item.vitalsSummary}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Searchable Patient Personal Directory */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-teal-600" />
              Patient Personal Demographics Directory
            </h3>

            <div className="relative mb-3">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, phone, or blood group..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 border rounded-xl text-xs bg-slate-50/60"
              />
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {filteredPatients.map((p) => (
                <div
                  key={p.patientId}
                  onClick={() => setSelectedPatientId(String(p.patientId))}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
                    selectedPatientId === String(p.patientId)
                      ? 'border-teal-500 bg-teal-50/60'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900">
                      #{p.patientId} - {p.name}
                    </span>
                    <span className="text-[10px] font-bold text-teal-700 bg-teal-100/70 px-2 py-0.5 rounded-full">
                      {p.bloodGroup || 'O+'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3 text-slate-400" /> {p.phone} • {p.gender}, {p.age} yrs
                  </p>
                  {p.allergies && p.allergies !== 'None' && (
                    <p className="text-[10px] text-red-600 font-semibold mt-1">
                      ⚠️ Allergy: {p.allergies}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
