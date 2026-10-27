import React, { useState, useEffect } from 'react';
import {
  FlaskConical,
  CheckCircle2,
  FileCheck,
  Clock,
  Upload,
  ShieldAlert,
  FileText,
  ExternalLink,
} from 'lucide-react';
import { StatCard } from '../common/StatCard';
import { labService } from '../../services/hospitalService';
import type { LabTest } from '../../types';

interface LabDashboardProps {
  activeTab?: string;
  onSelectTab?: (tab: string) => void;
}

export const LabDashboard: React.FC<LabDashboardProps> = ({ activeTab = 'test-queue' }) => {
  const [labTests, setLabTests] = useState<LabTest[]>([]);
  const [notification, setNotification] = useState<string | null>(null);
  const [activeModalTest, setActiveModalTest] = useState<LabTest | null>(null);
  const [resultInput, setResultInput] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentFileName, setDocumentFileName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async () => {
    try {
      const tests = await labService.getAll();
      if (tests && Array.isArray(tests)) {
        // Sort by priority desc then ID desc
        const sorted = [...tests].sort((a, b) => (b.priority || 1) - (a.priority || 1));
        setLabTests(sorted);
      } else {
        setLabTests([]);
      }
    } catch (e) {
      console.error('Error loading lab tests:', e);
      setLabTests([]);
    }
  };

  const handleOpenCompleteModal = (test: LabTest) => {
    setActiveModalTest(test);
    setSelectedFile(null);
    const isXray = test.testType === 'X_RAY' || test.testName.toLowerCase().includes('x-ray');
    if (isXray) {
      setResultInput('X-Ray completed at Suite 1. Physical imaging plate ready. Patient returning to Doctor consultation room.');
      setDocumentFileName('');
    } else {
      setResultInput('');
      setDocumentFileName('');
    }
  };

  const handleCompleteLabTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModalTest) return;

    setIsSubmitting(true);
    try {
      const isXray = activeModalTest.testType === 'X_RAY' || activeModalTest.testName.toLowerCase().includes('x-ray');

      if (selectedFile) {
        // Real multipart file upload to backend
        await labService.uploadReport(
          activeModalTest.labTestId,
          selectedFile,
          resultInput || `Diagnostic report for ${activeModalTest.testName}`,
          activeModalTest.testType
        );
      } else {
        // Text / message completion (e.g. for X-Ray imaging or standard findings)
        await labService.completeTest(activeModalTest.labTestId, {
          resultNotes: resultInput || (isXray ? 'X-Ray captured and ready for review' : 'Test completed'),
          documentUrl: documentFileName ? `/api/lab-tests/${activeModalTest.labTestId}/document` : undefined,
        });
      }

      await loadTests();

      setNotification(
        `🔬 Diagnostic test #${activeModalTest.labTestId} (${activeModalTest.testName}) completed and transmitted to ${activeModalTest.doctorName}!`
      );
      setActiveModalTest(null);
    } catch (err: any) {
      console.error('Error completing lab test:', err);
      setNotification(`Failed to complete lab test: ${err?.message || 'Server error'}`);
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
          <h1 className="text-2xl font-bold mt-2">Diagnostic Workflows & Laboratory Tests</h1>
          <p className="text-sm text-teal-100/90 mt-1">
            Concurrent diagnostic testing queue. Upload PDF reports, scans, and radiology messages directly accessible by consulting doctors.
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
          title="Pending Test Queue"
          value={pendingTests.length}
          subtitle="Awaiting laboratory processing"
          icon={Clock}
          color="teal"
        />
        <StatCard
          title="Critical / High Severity"
          value={pendingTests.filter((t) => t.severity === 'CRITICAL' || t.severity === 'HIGH').length}
          subtitle="High clinical priority"
          icon={ShieldAlert}
          color="purple"
        />
        <StatCard
          title="Completed Reports"
          value={completedTests.length}
          subtitle="Released to doctors"
          icon={FileCheck}
          color="emerald"
        />
        <StatCard
          title="Radiology & Pathology"
          value="All Modalities"
          subtitle="PDFs, Scans & X-Rays supported"
          icon={FlaskConical}
          color="blue"
        />
      </div>

      {/* TAB 1 & 2: PENDING WORKLIST & UPLOADS */}
      {(activeTab === 'test-queue' || activeTab === 'upload-reports') && (
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Diagnostic Test Queue</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Tests can be processed concurrently. Click 'Upload & Complete' to attach reports or send scan confirmations to doctors.
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
                  <th className="px-4 py-3">Severity & Priority</th>
                  <th className="px-4 py-3">Patient Details</th>
                  <th className="px-4 py-3">Diagnostic Test</th>
                  <th className="px-4 py-3">Requesting Doctor</th>
                  <th className="px-4 py-3">Clinical Vitals / Notes</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingTests.map((test) => {
                  const isXray = test.testType === 'X_RAY' || test.testName.toLowerCase().includes('x-ray');

                  return (
                    <tr key={test.labTestId} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black inline-block ${
                            test.severity === 'CRITICAL'
                              ? 'bg-red-600 text-white'
                              : test.severity === 'HIGH'
                              ? 'bg-amber-500 text-white'
                              : 'bg-teal-100 text-teal-800'
                          }`}
                        >
                          {test.severity || 'MEDIUM'}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-900">
                        {test.patientName || `Patient #${test.patientId}`}
                        <span className="text-[10px] text-slate-500 block font-normal">
                          Date: {test.requestedDate}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-teal-900 block">{test.testName}</span>
                        <span className="text-[10px] text-slate-500">
                          {isXray ? '📷 Radiology Imaging (X-Ray / Scan)' : '📄 Pathology Diagnostic Test'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-700 font-medium">
                        {test.doctorName}
                      </td>
                      <td className="px-4 py-3 text-[11px] text-slate-600 max-w-xs">
                        {test.vitalsSummary || 'Clinical evaluation requested'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenCompleteModal(test)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-xs cursor-pointer bg-teal-600 hover:bg-teal-700 text-white"
                        >
                          Upload & Complete
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
            <h4 className="text-xs font-bold text-slate-700">All Diagnostic Orders Processed</h4>
            <p className="text-[11px] text-slate-500">
              There are no pending diagnostic tests at this moment. New orders placed by doctors will appear here.
            </p>
          </div>
        )}
      </div>
      )}

      {/* TAB 3: COMPLETED ARCHIVE */}
      {activeTab === 'completed-tests' && completedTests.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm p-6 space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <FileCheck className="w-4 h-4 text-emerald-600" />
            Completed Diagnostic Reports
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {completedTests.map((t) => (
              <div key={t.labTestId} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-slate-900">{t.testName}</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                    COMPLETED
                  </span>
                </div>
                <p className="text-slate-600 text-[11px]">
                  <strong>Patient:</strong> {t.patientName || `Patient #${t.patientId}`} • <strong>Doctor:</strong> {t.doctorName}
                </p>
                {t.resultNotes && (
                  <p className="text-slate-800 bg-white p-2 rounded border border-slate-100 text-[11px]">
                    <strong>Note:</strong> {t.resultNotes}
                  </p>
                )}
                {t.documentUrl && (
                  <div className="pt-1">
                    <a
                      href={t.documentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200 text-[11px] font-bold transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" /> View Uploaded Report Document
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: COMPLETE LAB TEST & REAL FILE UPLOAD */}
      {activeModalTest && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-teal-100 text-teal-800">
                  {activeModalTest.severity || 'MEDIUM'} Severity Diagnostic Order
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  Complete Test: {activeModalTest.testName}
                </h3>
                <p className="text-xs text-slate-500">
                  Patient: <strong>{activeModalTest.patientName || `Patient #${activeModalTest.patientId}`}</strong> • Requesting Doctor: <strong>{activeModalTest.doctorName}</strong>
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
              {/* File Upload Section for Real Computer PDF / Image Files */}
              <div className="p-4 bg-slate-50 rounded-2xl border-2 border-dashed border-teal-300 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                    <Upload className="w-4 h-4 text-teal-600" />
                    Upload Diagnostic Report (PDF, Image, or X-Ray)
                  </span>
                  <span className="text-[10px] text-teal-700 bg-teal-100 px-2 py-0.5 rounded-full font-bold">
                    Computer File
                  </span>
                </div>

                <div className="space-y-2">
                  <input
                    type="file"
                    id="labReportFileInput"
                    accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setSelectedFile(file);
                        setDocumentFileName(file.name);
                      }
                    }}
                    className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-teal-600 file:text-white hover:file:bg-teal-700 cursor-pointer"
                  />
                  {documentFileName && (
                    <div className="flex items-center gap-1.5 text-teal-800 font-semibold text-xs bg-teal-50 px-2.5 py-1.5 rounded-lg border border-teal-200">
                      <FileText className="w-3.5 h-3.5 text-teal-600" />
                      Selected: {documentFileName}
                    </div>
                  )}
                </div>

                <p className="text-[10px] text-slate-500">
                  Select a PDF, X-ray scan, or image from your computer. The doctor can click and inspect this file directly.
                </p>
              </div>

              {/* Message to Doctor (e.g. for X-Ray imaging or diagnostic remarks) */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Message / Remarks to Consulting Doctor
                </label>
                <textarea
                  rows={3}
                  value={resultInput}
                  onChange={(e) => setResultInput(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none text-slate-800"
                  placeholder="e.g. Diagnostic scan attached. No acute abnormalities observed. Patient returning to consultation desk."
                />
              </div>

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
                  {isSubmitting ? 'Uploading & Releasing...' : 'Upload & Release Report to Doctor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
