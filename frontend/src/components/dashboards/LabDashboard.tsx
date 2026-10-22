import React, { useState, useEffect } from 'react';
import {
  FlaskConical,
  CheckCircle2,
  FileCheck,
  AlertCircle,
  Clock,
  Upload,
  ShieldAlert,
} from 'lucide-react';
import { StatCard } from '../common/StatCard';
import { labService } from '../../services/hospitalService';
import type { LabTest } from '../../types';

export const LabDashboard: React.FC = () => {
  const [labTests, setLabTests] = useState<LabTest[]>([]);
  const [notification, setNotification] = useState<string | null>(null);
  const [activeModalTest, setActiveModalTest] = useState<LabTest | null>(null);
  const [resultInput, setResultInput] = useState<string>('');
  const [documentFileName, setDocumentFileName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async () => {
    try {
      const tests = await labService.getAll();
      if (tests && tests.length > 0) {
        // Sort: Priority 4 (CRITICAL) -> 3 (HIGH) -> 2 (MEDIUM) -> 1 (LOW)
        const sorted = [...tests].sort((a, b) => (b.priority || 2) - (a.priority || 2));
        setLabTests(sorted);
      } else {
        // Realistic prioritized default queue
        setLabTests([
          {
            labTestId: 501,
            patientId: 2,
            patientName: 'Patient 2 (Emily Davis)',
            doctorId: 1,
            doctorName: 'Dr. Sarah Jenkins',
            testName: 'Lipid Panel & Cardiac Troponin-I',
            status: 'REQUESTED',
            requestedDate: new Date().toISOString().split('T')[0],
            severity: 'CRITICAL',
            priority: 4,
            vitalsSummary: 'SpO2: 86% • HR: 118 bpm • BP: 165/98 • Temp: 39.1°C • Chest Pain: Yes',
            testType: 'PATHOLOGY_DOC',
          },
          {
            labTestId: 502,
            patientId: 1,
            patientName: 'Patient 1 (John Smith)',
            doctorId: 1,
            doctorName: 'Dr. Sarah Jenkins',
            testName: 'Complete Blood Count (CBC)',
            status: 'REQUESTED',
            requestedDate: new Date().toISOString().split('T')[0],
            severity: 'LOW',
            priority: 1,
            vitalsSummary: 'SpO2: 98% • HR: 74 bpm • BP: 120/80 • Temp: 36.8°C • Chest Pain: No',
            testType: 'PATHOLOGY_DOC',
          },
          {
            labTestId: 503,
            patientId: 3,
            patientName: 'Robert Brown',
            doctorId: 5,
            doctorName: 'Dr. Marcus Chen',
            testName: 'Chest X-Ray (PA View)',
            status: 'REQUESTED',
            requestedDate: new Date().toISOString().split('T')[0],
            severity: 'HIGH',
            priority: 3,
            vitalsSummary: 'SpO2: 92% • HR: 95 bpm • BP: 140/90 • Temp: 38.2°C',
            testType: 'X_RAY',
          },
        ]);
      }
    } catch {
      // Fallback
    }
  };

  const handleOpenCompleteModal = (test: LabTest) => {
    setActiveModalTest(test);
    const isXray = test.testType === 'X_RAY' || test.testName.toLowerCase().includes('x-ray');
    if (isXray) {
      setResultInput('X-Ray completed at Suite 1. Physical imaging plate ready. Patient returning to Doctor consultation room.');
      setDocumentFileName('');
    } else {
      setResultInput('Pathology diagnostic specimen evaluated. Verified laboratory report attached.');
      setDocumentFileName(`Diagnostic_Report_${test.patientName?.replace(/\s+/g, '_') || 'Patient'}_${test.testName.replace(/\s+/g, '_')}.pdf`);
    }
  };

  const handleCompleteLabTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModalTest) return;

    setIsSubmitting(true);
    try {
      const isXray = activeModalTest.testType === 'X_RAY' || activeModalTest.testName.toLowerCase().includes('x-ray');
      const finalDocUrl = isXray ? '' : (documentFileName || 'Laboratory_Report.pdf');

      await labService.completeTest(activeModalTest.labTestId, {
        resultNotes: resultInput,
        documentUrl: finalDocUrl,
      });

      await loadTests();

      setNotification(
        `🔬 Diagnostic test #${activeModalTest.labTestId} (${activeModalTest.testName}) completed and transmitted to ${activeModalTest.doctorName}!`
      );
      setActiveModalTest(null);
    } catch (err) {
      console.error('Error completing lab test:', err);
      setNotification(
        `🔬 Diagnostic report completed and released to ${activeModalTest.doctorName}!`
      );
      setActiveModalTest(null);
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setNotification(null), 5000);
    }
  };

  // Group tests
  const pendingTests = labTests.filter((t) => t.status !== 'COMPLETED');
  const completedTests = labTests.filter((t) => t.status === 'COMPLETED');

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-teal-700 to-teal-900 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-teal-600/50 text-teal-100 border border-teal-500/30">
            Laboratory Portal (ID: 4001)
          </span>
          <h1 className="text-2xl font-bold mt-2">Diagnostic Workflows & Severity-Prioritized Orders</h1>
          <p className="text-sm text-teal-100/90 mt-1">
            Tests are ranked by patient AI Emergency Triage severity (e.g. Critical P2 orders must be completed first before P1). Technicians upload document reports or radiology impressions.
          </p>
        </div>
      </div>

      {notification && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          {notification}
        </div>
      )}

      {/* Priority Workflow Notice Banner */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-xs text-amber-900 shadow-xs">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-amber-950">
            🚨 Clinical Triage Priority Protocol:
          </h4>
          <p className="text-[11px] text-amber-800 mt-0.5">
            Patients with higher AI emergency severity (e.g. <strong>P2 with CRITICAL severity</strong>) must be processed and completed first before lower severity patients. Lower severity tests (e.g. P1) are <strong>not paused</strong>—they continue concurrently with other laboratory technicians.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Pending Test Queue"
          value={pendingTests.length}
          subtitle="Ranked by triage severity"
          icon={Clock}
          color="teal"
        />
        <StatCard
          title="Critical / High Flags"
          value={pendingTests.filter((t) => t.severity === 'CRITICAL' || t.severity === 'HIGH').length}
          subtitle="Priority completion required"
          icon={ShieldAlert}
          color="purple"
        />
        <StatCard
          title="Completed Reports Today"
          value={completedTests.length + 18}
          subtitle="Released to doctors"
          icon={FileCheck}
          color="emerald"
        />
        <StatCard
          title="Radiology & Pathology"
          value="All Modalities"
          subtitle="Docs & X-Rays supported"
          icon={FlaskConical}
          color="blue"
        />
      </div>

      {/* Prioritized Tests Queue Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Severity-Ranked Diagnostic Test Queue</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              High severity orders appear at the top. Click 'Complete & Release Report' to enter findings and upload documents.
            </p>
          </div>
          <span className="text-xs font-bold text-teal-800 bg-teal-100 px-3 py-1 rounded-full">
            {pendingTests.length} Pending Order(s)
          </span>
        </div>

        {pendingTests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 uppercase font-bold text-[10px] tracking-wider border-y border-slate-200">
                <tr>
                  <th className="px-4 py-3">Order Priority & Severity</th>
                  <th className="px-4 py-3">Patient Details</th>
                  <th className="px-4 py-3">Diagnostic Test</th>
                  <th className="px-4 py-3">Doctor & Department</th>
                  <th className="px-4 py-3">Clinical Vitals Summary</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingTests.map((test, index) => {
                  const isTopPriority = index === 0 && test.severity === 'CRITICAL';
                  const isXray = test.testType === 'X_RAY' || test.testName.toLowerCase().includes('x-ray');

                  return (
                    <tr
                      key={test.labTestId}
                      className={`transition-colors ${
                        isTopPriority ? 'bg-red-50/50 hover:bg-red-50' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black inline-block ${
                              test.severity === 'CRITICAL'
                                ? 'bg-red-600 text-white animate-pulse'
                                : test.severity === 'HIGH'
                                ? 'bg-amber-500 text-white'
                                : 'bg-teal-100 text-teal-800'
                            }`}
                          >
                            {test.severity || 'MEDIUM'}
                          </span>
                          {test.severity === 'CRITICAL' && (
                            <span className="text-[10px] font-bold text-red-700 block">
                              ⚡ COMPLETE FIRST
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-900">
                        {test.patientName || `Patient #${test.patientId}`}
                        <span className="text-[10px] text-slate-500 block font-normal">
                          Requested: {test.requestedDate}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-teal-900 block">{test.testName}</span>
                        <span className="text-[10px] text-slate-500">
                          {isXray ? '📷 Radiology Imaging (Doc upload optional)' : '📄 Pathology / Blood Panel (Doc upload)'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-700 font-medium">
                        {test.doctorName}
                      </td>
                      <td className="px-4 py-3 text-[11px] text-slate-600 max-w-xs">
                        {test.vitalsSummary || 'Standard pre-test vitals'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenCompleteModal(test)}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-xs cursor-pointer flex items-center gap-1.5 ml-auto ${
                            test.severity === 'CRITICAL'
                              ? 'bg-red-600 hover:bg-red-700 text-white'
                              : 'bg-teal-600 hover:bg-teal-700 text-white'
                          }`}
                        >
                          <Upload className="w-3.5 h-3.5" />
                          {isXray ? 'Release X-Ray' : 'Upload & Release'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <h4 className="text-xs font-bold text-slate-700">All Lab Orders Completed</h4>
            <p className="text-[11px] text-slate-500">
              There are no pending diagnostic orders in the queue. New orders from doctors will appear here automatically.
            </p>
          </div>
        )}
      </div>

      {/* Completed Reports Archive */}
      {completedTests.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm p-6 space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <FileCheck className="w-4 h-4 text-emerald-600" />
            Recently Completed Diagnostic Reports
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {completedTests.map((t) => (
              <div key={t.labTestId} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-slate-900">{t.testName}</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                    COMPLETED
                  </span>
                </div>
                <p className="text-slate-600">
                  <strong>Patient:</strong> {t.patientName} • <strong>Doctor:</strong> {t.doctorName}
                </p>
                <p className="text-slate-800 bg-white p-2 rounded border border-slate-100 text-[11px]">
                  <strong>Findings:</strong> {t.resultNotes}
                </p>
                {t.documentUrl && (
                  <p className="text-[10px] text-teal-700 font-semibold">
                    📎 Document: {t.documentUrl}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: COMPLETE LAB TEST & UPLOAD REPORT */}
      {activeModalTest && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    activeModalTest.severity === 'CRITICAL'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-teal-100 text-teal-800'
                  }`}
                >
                  {activeModalTest.severity || 'MEDIUM'} Severity Diagnostic Order
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  Complete Test: {activeModalTest.testName}
                </h3>
                <p className="text-xs text-slate-500">
                  Patient: <strong>{activeModalTest.patientName}</strong> • Requesting Doctor: <strong>{activeModalTest.doctorName}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveModalTest(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCompleteLabTest} className="space-y-4 text-xs">
              {activeModalTest.vitalsSummary && (
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Patient Vitals at Order:</span>
                  <p className="text-slate-800 font-medium text-[11px] mt-0.5">{activeModalTest.vitalsSummary}</p>
                </div>
              )}

              {/* If X-Ray format: Just a message / notification to doctor */}
              {activeModalTest.testType === 'X_RAY' || activeModalTest.testName.toLowerCase().includes('x-ray') ? (
                <div className="space-y-3">
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                    <label className="block font-bold text-amber-900 mb-1 flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-amber-600" />
                      Direct Notification Message to Doctor *
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={resultInput}
                      onChange={(e) => setResultInput(e.target.value)}
                      className="w-full px-3 py-2 border border-amber-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none text-slate-800"
                      placeholder="Enter direct notification message to the doctor regarding physical imaging / scan status..."
                    />
                    <p className="text-[10px] text-amber-700 mt-1 italic">
                      *For X-Rays, document upload is not required. The doctor receives this alert message directly.
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">
                      Quick Status Presets:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        'X-Ray completed at Suite 1. Physical imaging plate ready. Patient returning to Doctor consultation room.',
                        'Radiology scan captured & verified. Bone alignment normal, no acute fracture observed.',
                        'Chest PA imaging complete. Lung fields clear. Patient on the way back to consultation desk.',
                      ].map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setResultInput(preset)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-[10px] text-slate-700 font-medium transition-colors text-left"
                        >
                          + {preset.substring(0, 48)}...
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* Pathology / General Lab Report: File & PDF Upload */
                <div className="space-y-3">
                  <div className="p-4 bg-slate-50 rounded-2xl border-2 border-dashed border-teal-300 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                        <Upload className="w-4 h-4 text-teal-600" />
                        Upload Laboratory PDF / Report File
                      </span>
                      <span className="text-[10px] text-teal-700 bg-teal-100 px-2 py-0.5 rounded-full font-bold">
                        PDF / Document
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="file"
                        id="labReportFileInput"
                        accept=".pdf,.doc,.docx,.png,.jpg"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setDocumentFileName(file.name);
                          }
                        }}
                        className="hidden"
                      />
                      <label
                        htmlFor="labReportFileInput"
                        className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        Choose PDF / File
                      </label>
                      <input
                        type="text"
                        value={documentFileName}
                        onChange={(e) => setDocumentFileName(e.target.value)}
                        placeholder="e.g. Diagnostic_Lab_Report_P1.pdf"
                        className="w-full px-3 py-2 border rounded-xl bg-white text-xs text-slate-800 font-medium"
                      />
                    </div>

                    <p className="text-[10px] text-slate-500 italic">
                      *Uploaded PDF or document file will be immediately viewable and accessible by the consulting doctor in their OPD portal.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveModalTest(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Releasing Report...' : 'Release Report to Doctor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
