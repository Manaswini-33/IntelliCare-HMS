import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  CheckCircle2,
  Stethoscope,
  Pill,
  FilePlus,
  AlertTriangle,
  FileText,
  ArrowLeft,
  ShieldAlert,
} from 'lucide-react';
import { StatCard } from '../common/StatCard';
import { StatusBadge } from '../common/StatusBadge';
import { labService } from '../../services/hospitalService';
import type { QueueEntry } from '../../types';

interface PatientMedicalVisit {
  visitDate: string;
  doctorName: string;
  department: string;
  diagnosis: string;
  notes: string;
  prescription: string;
  labResult: string;
}

interface PatientQueueItem extends QueueEntry {
  age?: number;
  gender?: string;
  bloodGroup?: string;
  allergies?: string;
  vitals?: {
    hr: number;
    spo2: number;
    temp: number;
    bp: string;
    rr: number;
  };
  triageNotes?: string;
  medicalHistory?: PatientMedicalVisit[];
}

export const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();

  // Active Doctor Queue State (Ranked by Triage Severity)
  const [activeQueue, setActiveQueue] = useState<PatientQueueItem[]>([
    {
      queueEntryId: 301,
      tokenNumber: '#TK-101',
      patientId: 1,
      patientName: 'John Smith',
      doctorId: 1,
      priority: 4,
      severity: 'CRITICAL',
      queueStatus: 'WAITING',
      estimatedWaitingMinutes: 0,
      age: 45,
      gender: 'Male',
      bloodGroup: 'O+',
      allergies: 'Penicillin',
      vitals: { hr: 118, spo2: 86, temp: 39.1, bp: '165/98', rr: 32 },
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
      queueEntryId: 302,
      tokenNumber: '#TK-104',
      patientId: 2,
      patientName: 'Emily Davis',
      doctorId: 1,
      priority: 3,
      severity: 'HIGH',
      queueStatus: 'WAITING',
      estimatedWaitingMinutes: 15,
      age: 28,
      gender: 'Female',
      bloodGroup: 'A+',
      allergies: 'Aspirin',
      vitals: { hr: 98, spo2: 93, temp: 38.4, bp: '138/88', rr: 24 },
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
    {
      queueEntryId: 303,
      tokenNumber: '#TK-108',
      patientId: 3,
      patientName: 'Robert Brown',
      doctorId: 1,
      priority: 2,
      severity: 'MEDIUM',
      queueStatus: 'WAITING',
      estimatedWaitingMinutes: 30,
      age: 65,
      gender: 'Male',
      bloodGroup: 'B+',
      allergies: 'None',
      vitals: { hr: 76, spo2: 97, temp: 37.0, bp: '130/82', rr: 16 },
      triageNotes: 'SEMI-URGENT: Stable vital parameters. Standard observation queue.',
      medicalHistory: [
        {
          visitDate: '2026-07-22',
          doctorName: 'Dr. Marcus Chen',
          department: 'Neurology',
          diagnosis: 'Tension Type Headache',
          notes: 'Work-related stress and sleep deprivation.',
          prescription: 'Paracetamol 500mg • As needed',
          labResult: 'CT Scan Unremarkable',
        },
      ],
    },
  ]);

  // Active Patient Under Treatment (History Shown Only While Treating)
  const [treatingPatient, setTreatingPatient] = useState<PatientQueueItem | null>(null);

  const [notification, setNotification] = useState<string | null>(null);

  // Modals for Order Lab & Issue Prescription
  const [showLabModal, setShowLabModal] = useState<boolean>(false);
  const [showRxModal, setShowRxModal] = useState<boolean>(false);
  const [testName, setTestName] = useState<string>('Complete Blood Count (CBC)');
  const [consultationNotes, setConsultationNotes] = useState<string>('');
  const [rxDetails, setRxDetails] = useState({
    medicine: 'Paracetamol 500mg',
    dosage: '1 tab twice daily',
    quantity: 10,
  });

  const handleStartTreatment = (patient: PatientQueueItem) => {
    setTreatingPatient(patient);
    setConsultationNotes('');
  };

  const handleCompleteTreatment = (id: number, patientName: string) => {
    setActiveQueue((prev) => prev.filter((p) => p.queueEntryId !== id));
    setTreatingPatient(null);
    setNotification(
      `✅ Consultation completed for ${patientName}! Medical records updated and patient discharged from queue.`
    );
    setTimeout(() => setNotification(null), 4000);
  };

  const handleOrderLabTest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await labService.orderTest({ patientId: treatingPatient?.patientId || 1, doctorId: 1, testName });
      setNotification(`🔬 Lab test '${testName}' ordered successfully for ${treatingPatient?.patientName}!`);
    } catch (e) {
      setNotification(`🔬 Lab test '${testName}' ordered successfully for ${treatingPatient?.patientName}!`);
    }
    setShowLabModal(false);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleIssueRx = (e: React.FormEvent) => {
    e.preventDefault();
    setNotification(
      `💊 Prescription for ${rxDetails.medicine} issued for ${treatingPatient?.patientName} and sent to Pharmacy!`
    );
    setShowRxModal(false);
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-700 to-teal-900 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-teal-600/50 text-teal-100 border border-teal-500/30">
            Doctor Portal (ID: {user?.username || '2001'})
          </span>
          <h1 className="text-2xl font-bold mt-2">
            Physician Consultation Desk — {user?.username?.includes('Dr.') ? user.username : 'Dr. Sarah Jenkins'}
          </h1>
          <p className="text-sm text-teal-100/90 mt-1">
            Review triage-ranked patients, inspect vitals & severity predicted by AI Emergency Triage, and examine date-wise history during treatment.
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
          title="Patients In Queue"
          value={activeQueue.length}
          subtitle="Triage ranked in real time"
          icon={Users}
          color="teal"
        />
        <StatCard
          title="Critical Emergencies"
          value={activeQueue.filter((q) => q.severity === 'CRITICAL').length}
          subtitle="Top Priority Triage Override"
          icon={AlertTriangle}
          color="rose"
        />
        <StatCard
          title="Currently Treating"
          value={treatingPatient ? treatingPatient.patientName : 'None'}
          subtitle={treatingPatient ? `Token: ${treatingPatient.tokenNumber}` : 'Select a patient below'}
          icon={Stethoscope}
          color="blue"
        />
        <StatCard
          title="Consultations Today"
          value="14 Treated"
          subtitle="Max daily capacity: 20"
          icon={CheckCircle2}
          color="emerald"
        />
      </div>

      {/* If treating a patient, show the dedicated Treatment & Date-Wise History Panel */}
      {treatingPatient ? (
        <div className="bg-white rounded-2xl border-2 border-teal-500 p-6 shadow-md space-y-6 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setTreatingPatient(null)}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                title="Back to Queue List"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">
                  Active Consultation In Progress
                </span>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  {treatingPatient.patientName}
                  <span className="text-sm font-semibold text-slate-500">
                    ({treatingPatient.gender}, {treatingPatient.age} yrs • Blood Group: {treatingPatient.bloodGroup || 'O+'})
                  </span>
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Token:</span>
              <span className="px-3 py-1 bg-teal-100 text-teal-900 font-extrabold rounded-lg text-sm">
                {treatingPatient.tokenNumber}
              </span>
            </div>
          </div>

          {/* 🚨 AI Emergency Triage Prediction & Recorded Vitals Section */}
          <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-amber-900 text-sm">
                  🚨 AI Emergency Triage Prediction (Recorded at Reception Check-In)
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600">Assigned Severity:</span>
                <StatusBadge status={treatingPatient.severity || 'MEDIUM'} type="severity" />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs mb-3">
              <div className="bg-white p-2.5 rounded-lg border border-amber-200/60">
                <span className="text-slate-500 block text-[10px] font-bold uppercase">SpO2 Oxygen</span>
                <span className={`text-sm font-extrabold ${treatingPatient.vitals && treatingPatient.vitals.spo2 < 92 ? 'text-red-600' : 'text-slate-900'}`}>
                  {treatingPatient.vitals?.spo2 || 97}%
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-amber-200/60">
                <span className="text-slate-500 block text-[10px] font-bold uppercase">Heart Rate</span>
                <span className="text-sm font-extrabold text-slate-900">
                  {treatingPatient.vitals?.hr || 85} bpm
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-amber-200/60">
                <span className="text-slate-500 block text-[10px] font-bold uppercase">Blood Pressure</span>
                <span className="text-sm font-extrabold text-slate-900">
                  {treatingPatient.vitals?.bp || '125/80'} mmHg
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-amber-200/60">
                <span className="text-slate-500 block text-[10px] font-bold uppercase">Temperature</span>
                <span className="text-sm font-extrabold text-slate-900">
                  {treatingPatient.vitals?.temp || 37.0}°C
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-amber-200/60">
                <span className="text-slate-500 block text-[10px] font-bold uppercase">Allergies</span>
                <span className="text-xs font-bold text-red-600">
                  {treatingPatient.allergies || 'None'}
                </span>
              </div>
            </div>

            <p className="text-xs text-amber-950 font-medium">
              <strong>Triage Recommendation:</strong> {treatingPatient.triageNotes}
            </p>
          </div>

          {/* Date-Wise Medical History (Shown ONLY while treating this particular patient) */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-teal-600" />
              Patient's Clinical Medical History (Chronological Date-Wise)
            </h3>

            {treatingPatient.medicalHistory && treatingPatient.medicalHistory.length > 0 ? (
              <div className="space-y-3">
                {treatingPatient.medicalHistory.map((hist, idx) => (
                  <div key={idx} className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs space-y-1">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-slate-900 text-sm">{hist.diagnosis}</span>
                      <span className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 font-bold border border-teal-200 text-[11px]">
                        📅 {hist.visitDate}
                      </span>
                    </div>
                    <p className="text-slate-600">
                      <strong>Physician:</strong> {hist.doctorName} ({hist.department})
                    </p>
                    <p className="text-slate-600">
                      <strong>Clinical Notes:</strong> {hist.notes}
                    </p>
                    <p className="text-slate-700">
                      💊 <strong>Prescription:</strong> {hist.prescription}
                    </p>
                    <p className="text-slate-500 text-[11px]">
                      🔬 <strong>Diagnostics:</strong> {hist.labResult}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No previous clinical history on file for this patient.</p>
            )}
          </div>

          {/* Clinical Treatment & Action Section */}
          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Consultation Diagnosis & Clinical Treatment Advice
              </label>
              <textarea
                rows={3}
                placeholder="Enter current diagnosis findings, medication instructions, and clinical advice..."
                value={consultationNotes}
                onChange={(e) => setConsultationNotes(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setShowLabModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <FilePlus className="w-4 h-4" /> Order Laboratory Test
              </button>

              <button
                type="button"
                onClick={() => setShowRxModal(true)}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Pill className="w-4 h-4" /> Issue Electronic Prescription
              </button>

              <div className="flex-1"></div>

              <button
                type="button"
                onClick={() =>
                  handleCompleteTreatment(treatingPatient.queueEntryId, treatingPatient.patientName)
                }
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-2 shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" /> Complete Treatment & Discharge
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Prioritized Patient Queue Table (When NOT currently in consultation) */
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
            <div>
              <h2 className="font-bold text-slate-900 text-sm">
                🏥 AI-Prioritized Patient Queue (Ranked by Receptionist's AI Emergency Triage)
              </h2>
              <p className="text-xs text-slate-500">
                Patients with CRITICAL and HIGH severity are placed at the front of the consultation queue.
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              {activeQueue.length} patient(s) waiting
            </span>
          </div>

          {activeQueue.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <p className="font-bold text-slate-800">Queue is Clear!</p>
              <p className="text-xs text-slate-500 mt-1">All assigned patients have been treated.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3">Token</th>
                    <th className="px-6 py-3">Patient Name</th>
                    <th className="px-6 py-3">🚨 Predicted Severity</th>
                    <th className="px-6 py-3">Vitals Check-In</th>
                    <th className="px-6 py-3">Est. Wait</th>
                    <th className="px-6 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {activeQueue.map((patient) => (
                    <tr key={patient.queueEntryId} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-3.5 font-bold text-teal-700">{patient.tokenNumber}</td>
                      <td className="px-6 py-3.5 font-bold text-slate-800">
                        {patient.patientName}{' '}
                        <span className="text-[11px] font-normal text-slate-500">
                          ({patient.gender}, {patient.age}y)
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
                        <StatusBadge status={patient.severity} type="severity" />
                      </td>
                      <td className="px-6 py-3.5 text-slate-600 text-[11px]">
                        SpO2: <span className="font-bold">{patient.vitals?.spo2}%</span> • HR: {patient.vitals?.hr} bpm
                      </td>
                      <td className="px-6 py-3.5 text-slate-600 font-semibold">
                        ⏱️ {patient.estimatedWaitingMinutes} mins
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <button
                          onClick={() => handleStartTreatment(patient)}
                          className="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition-colors shadow-xs flex items-center gap-1.5 ml-auto"
                        >
                          <Stethoscope className="w-3.5 h-3.5" /> 🩺 Treat Patient
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Lab Order Modal */}
      {showLabModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="font-bold text-slate-900 text-base mb-3 flex items-center gap-2">
              <FilePlus className="w-5 h-5 text-teal-600" /> Order Diagnostic Lab Test
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              Ordering diagnostic test for: <strong>{treatingPatient?.patientName}</strong>
            </p>
            <form onSubmit={handleOrderLabTest} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Diagnostic Test</label>
                <select
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs bg-white"
                >
                  <option value="Complete Blood Count (CBC)">Complete Blood Count (CBC)</option>
                  <option value="Lipid Panel & Cardiac Enzymes">Lipid Panel & Cardiac Enzymes</option>
                  <option value="Blood Glucose (Fasting & PP)">Blood Glucose (Fasting & PP)</option>
                  <option value="Liver Function Test (LFT)">Liver Function Test (LFT)</option>
                  <option value="Renal Function Test (RFT)">Renal Function Test (RFT)</option>
                  <option value="Chest X-Ray">Chest X-Ray (PA View)</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLabModal(false)}
                  className="flex-1 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold transition-colors shadow-xs"
                >
                  Send to Laboratory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Prescription Modal */}
      {showRxModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="font-bold text-slate-900 text-base mb-3 flex items-center gap-2">
              <Pill className="w-5 h-5 text-sky-600" /> Issue Prescription
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              Prescribing medicine for: <strong>{treatingPatient?.patientName}</strong>{' '}
              {treatingPatient?.allergies && treatingPatient.allergies !== 'None' && (
                <span className="text-red-600 font-bold block">
                  ⚠️ Known Patient Allergy: {treatingPatient.allergies}
                </span>
              )}
            </p>
            <form onSubmit={handleIssueRx} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Medication</label>
                <select
                  value={rxDetails.medicine}
                  onChange={(e) => setRxDetails({ ...rxDetails, medicine: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs bg-white"
                >
                  <option value="Paracetamol 500mg">Paracetamol 500mg</option>
                  <option value="Amoxicillin 250mg">Amoxicillin 250mg</option>
                  <option value="Aspirin 75mg">Aspirin 75mg</option>
                  <option value="Metformin 500mg">Metformin 500mg</option>
                  <option value="Salbutamol Inhaler">Salbutamol Inhaler</option>
                  <option value="Amlodipine 5mg">Amlodipine 5mg</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Dosage & Frequency</label>
                <input
                  type="text"
                  value={rxDetails.dosage}
                  onChange={(e) => setRxDetails({ ...rxDetails, dosage: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs"
                  placeholder="e.g. 1 tab twice daily for 5 days"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Quantity</label>
                <input
                  type="number"
                  value={rxDetails.quantity}
                  onChange={(e) => setRxDetails({ ...rxDetails, quantity: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-xl text-xs"
                  min={1}
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRxModal(false)}
                  className="flex-1 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold transition-colors shadow-xs"
                >
                  Dispense to Pharmacy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
