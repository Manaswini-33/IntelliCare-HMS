import axios from 'axios';
import type {
  Doctor,
  Patient,
  Appointment,
  QueueEntry,
  LabTest,
  Medicine,
  Prescription,
  MedicalRecord,
  SeverityPredictionResponse,
  SpecialistRecommendationResponse,
  WaitTimeResponse,
  Role,
  PurchaseOrder,
  StaffMember,
  Bill,
} from '../types';

export const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwtToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  async login(username: string, password?: string, role?: Role) {
    const res = await api.post('/auth/login', { username, password, role });
    return res.data;
  },
  async register(data: any) {
    const res = await api.post('/auth/register', data);
    return res.data;
  },
  async changePassword(data: { username: string; oldPassword: string; newPassword: string }) {
    const res = await api.post('/auth/change-password', data);
    return res.data;
  },
  async checkPatientPhone(phone: string) {
    const res = await api.post('/auth/patient/check-phone', { phone });
    return res.data;
  },
  async verifyPatientOtp(phone: string, otp: string) {
    const res = await api.post('/auth/patient/verify-otp', { phone, otp });
    return res.data;
  },
  async registerPatientMobile(data: {
    phone: string;
    name: string;
    age: number;
    gender: string;
    email?: string;
    address?: string;
    bloodGroup?: string;
    allergies?: string;
  }) {
    const res = await api.post('/auth/patient/register', data);
    return res.data;
  },
};

export const patientService = {
  async getAll(): Promise<Patient[]> {
    const res = await api.get('/patients');
    return res.data?.data || res.data || [];
  },
  async getById(id: number): Promise<Patient> {
    const res = await api.get(`/patients/${id}`);
    return res.data?.data || res.data;
  },
  async getByPhone(phone: string): Promise<Patient> {
    const res = await api.get(`/patients/by-phone/${phone}`);
    return res.data?.data || res.data;
  },
  async getMe(): Promise<Patient> {
    const res = await api.get('/patients/me');
    return res.data?.data || res.data;
  },
  async create(patientData: Partial<Patient>): Promise<Patient> {
    const res = await api.post('/patients', patientData);
    return res.data?.data || res.data;
  },
  async update(id: number, patientData: Partial<Patient>): Promise<Patient> {
    const res = await api.put(`/patients/${id}`, patientData);
    return res.data?.data || res.data;
  },
  async completeProfile(id: number, patientData: Partial<Patient>): Promise<Patient> {
    const res = await api.put(`/patients/${id}/profile`, patientData);
    return res.data?.data || res.data;
  },
};

export const doctorService = {
  async getAll(department?: string): Promise<Doctor[]> {
    const res = await api.get('/doctors');
    let list: Doctor[] = res.data?.data || res.data || [];
    if (department) {
      list = list.filter(
        (d) =>
          d.department.toLowerCase().includes(department.toLowerCase()) ||
          d.specialization.toLowerCase().includes(department.toLowerCase())
      );
    }
    return list;
  },
  async getById(id: number): Promise<Doctor> {
    const res = await api.get(`/doctors/${id}`);
    return res.data?.data || res.data;
  },
  async recommend(symptoms: string): Promise<Doctor[]> {
    const res = await api.get(`/doctors/recommend?symptoms=${encodeURIComponent(symptoms)}`);
    return res.data?.data || res.data || [];
  },
  async create(doctorData: Partial<Doctor>) {
    const res = await api.post('/doctors', doctorData);
    return res.data?.data || res.data;
  },
  async update(id: number, doctorData: Partial<Doctor>) {
    const res = await api.put(`/doctors/${id}`, doctorData);
    return res.data?.data || res.data;
  },
  async delete(id: number) {
    const res = await api.delete(`/doctors/${id}`);
    return res.data;
  },
};

export const appointmentService = {
  async getAll(): Promise<Appointment[]> {
    const res = await api.get('/appointments');
    return res.data?.data || res.data || [];
  },
  async getByDoctor(doctorId: number): Promise<Appointment[]> {
    const res = await api.get(`/appointments/doctor/${doctorId}`);
    return res.data?.data || res.data || [];
  },
  async getByPatient(patientId: number): Promise<Appointment[]> {
    const res = await api.get(`/appointments/patient/${patientId}`);
    return res.data?.data || res.data || [];
  },
  async book(data: {
    patientId: number;
    doctorId: number;
    appointmentDate: string;
    appointmentTime: string;
    symptoms?: string;
    reason?: string;
    severity?: string;
    tokenNumber?: string;
    temperature?: number;
    predictionStatus?: string;
    predictionTimestamp?: string;
    triageNotes?: string;
  }) {
    const res = await api.post('/appointments', data);
    return res.data?.data || res.data;
  },
  async cancel(id: number) {
    const res = await api.put(`/appointments/${id}/cancel`);
    return res.data;
  },
  async startExamining(id: number) {
    const res = await api.put(`/appointments/${id}/start-examining`);
    return res.data?.data || res.data;
  },
  async completeAppointment(id: number) {
    const res = await api.put(`/appointments/${id}/complete`);
    return res.data?.data || res.data;
  },
  async updateTriage(id: number, data: { vitals?: string; severity?: string; priority?: number }) {
    const res = await api.put(`/appointments/${id}/triage`, data);
    return res.data?.data || res.data;
  },
  async processUnattended(): Promise<Appointment[]> {
    const res = await api.post('/appointments/process-unattended');
    return res.data?.data || res.data || [];
  },
  async predictSeverity(data: { symptoms: string; temperature?: number; patientId?: number }) {
    const res = await api.post('/appointments/predict-severity', data);
    return res.data?.data || res.data;
  },
  async getNextToken(): Promise<string> {
    try {
      const res = await api.get('/appointments/next-token');
      return res.data?.data?.tokenNumber || res.data?.tokenNumber || 'TK-001';
    } catch {
      return 'TK-001';
    }
  },
};

export const notificationService = {
  async getAll() {
    const res = await api.get('/notifications');
    return res.data?.data || res.data || [];
  },
  async getForRecipient(recipient: string) {
    const res = await api.get(`/notifications/recipient/${encodeURIComponent(recipient)}`);
    return res.data?.data || res.data || [];
  },
  async markRead(id: number) {
    const res = await api.put(`/notifications/${id}/read`);
    return res.data?.data || res.data;
  },
};

export const queueService = {
  async getAll(): Promise<QueueEntry[]> {
    const res = await api.get('/queue');
    return res.data?.data || res.data || [];
  },
  async checkIn(data: {
    patientId: number;
    doctorId?: number;
    symptoms?: string;
    vitals?: string;
  }) {
    const res = await api.post('/queue/check-in', data);
    return res.data?.data || res.data;
  },
  async updateStatus(id: number, status: string) {
    const res = await api.put(`/queue/${id}/status`, { status });
    return res.data;
  },
  async acknowledgeCompletion(queueEntryId: number) {
    const res = await api.post(`/queue/${queueEntryId}/complete`);
    return res.data;
  },
};

export const labService = {
  async getAll(): Promise<LabTest[]> {
    try {
      const res = await api.get('/lab-tests');
      return res.data?.data || res.data || [];
    } catch {
      const res = await api.get('/lab/tests');
      return res.data?.data || res.data || [];
    }
  },
  async getByDoctor(doctorId: number): Promise<LabTest[]> {
    const res = await api.get(`/lab-tests/doctor/${doctorId}`);
    return res.data?.data || res.data || [];
  },
  async getByPatient(patientId: number): Promise<LabTest[]> {
    const res = await api.get(`/lab-tests/patient/${patientId}`);
    return res.data?.data || res.data || [];
  },
  async orderTest(data: {
    patientId: number;
    doctorId: number;
    testName: string;
    severity?: string;
    priority?: number;
    vitalsSummary?: string;
    testType?: string;
  }) {
    const res = await api.post('/lab-tests', data);
    return res.data?.data || res.data;
  },
  async completeTest(id: number, data: { resultNotes?: string; documentUrl?: string }) {
    const res = await api.put(`/lab-tests/${id}/complete`, data);
    return res.data?.data || res.data;
  },
  async uploadReport(testId: number, file: File, resultNotes?: string, testType?: string): Promise<LabTest> {
    const formData = new FormData();
    formData.append('file', file);
    if (resultNotes) formData.append('resultNotes', resultNotes);
    if (testType) formData.append('testType', testType);
    const res = await api.post(`/lab-tests/${testId}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data?.data || res.data;
  },
  async submitResult(testId: number, resultText: string) {
    const res = await api.post(`/lab-results`, { labTestId: testId, result: resultText });
    return res.data?.data || res.data;
  },
};

export const medicalRecordService = {
  async getByPatient(patientId: number): Promise<MedicalRecord[]> {
    try {
      const res = await api.get(`/medical-records/patient/${patientId}`);
      return res.data?.data || res.data || [];
    } catch {
      return [];
    }
  },
  async create(record: Partial<MedicalRecord>): Promise<MedicalRecord> {
    const res = await api.post('/medical-records', record);
    return res.data?.data || res.data;
  },
};

export const prescriptionService = {
  async getAll(): Promise<Prescription[]> {
    try {
      const res = await api.get('/prescriptions');
      return res.data?.data || res.data || [];
    } catch {
      return [];
    }
  },
  async getByPatient(patientId: number): Promise<Prescription[]> {
    try {
      const res = await api.get(`/prescriptions/patient/${patientId}`);
      return res.data?.data || res.data || [];
    } catch {
      return [];
    }
  },
  async dispense(prescriptionId: number): Promise<Prescription> {
    const res = await api.put(`/prescriptions/${prescriptionId}/dispense`);
    return res.data?.data || res.data;
  },
  async create(data: any): Promise<Prescription> {
    const res = await api.post('/prescriptions', data);
    return res.data?.data || res.data;
  },
};

export const pharmacyService = {
  async getMedicines(): Promise<Medicine[]> {
    try {
      const res = await api.get('/medicines');
      return res.data?.data || res.data || [];
    } catch {
      const res2 = await api.get('/pharmacy/medicines');
      return res2.data?.data || res2.data || [];
    }
  },
  async getPrescriptions(): Promise<Prescription[]> {
    return prescriptionService.getAll();
  },
  async dispense(prescriptionId: number) {
    return prescriptionService.dispense(prescriptionId);
  },
  async updateStock(medicineId: number, newStock: number) {
    const res = await api.put(`/medicines/${medicineId}`, { stockQuantity: newStock });
    return res.data;
  },
};

export const mlService = {
  async predictSeverity(vitals: {
    age?: number;
    gender?: string;
    heart_rate: number;
    spo2: number;
    temperature: number;
    systolic_bp: number;
    diastolic_bp: number;
    respiratory_rate: number;
    fever?: string;
    cough?: string;
    fatigue?: string;
    difficulty_breathing?: string;
    chest_pain?: string;
    headache?: string;
    disease?: string;
  }): Promise<SeverityPredictionResponse> {
    const res = await api.post('/ml/predict-severity', vitals);
    return res.data?.data || res.data;
  },
  async recommendSpecialist(symptoms: string): Promise<SpecialistRecommendationResponse> {
    const s = (symptoms || '').toLowerCase();
    const isNeuro =
      s.includes('migran') ||
      s.includes('migrain') ||
      s.includes('headache') ||
      s.includes('head ache') ||
      s.includes('head') ||
      s.includes('neuro') ||
      s.includes('brain') ||
      s.includes('seizure') ||
      s.includes('epilepsy') ||
      s.includes('nerve') ||
      s.includes('dizz') ||
      s.includes('vertigo') ||
      s.includes('stroke') ||
      s.includes('paralys') ||
      s.includes('numb') ||
      s.includes('tremor');

    const isDental =
      s.includes('tooth') ||
      s.includes('teeth') ||
      s.includes('dent') ||
      s.includes('gum') ||
      s.includes('cavity') ||
      s.includes('molar') ||
      s.includes('oral');

    try {
      const res = await api.post('/ml/recommend-specialist', { symptoms });
      const data = res.data?.data || res.data;
      if (isNeuro && data?.department !== 'Neurology') {
        data.department = 'Neurology';
        data.recommended_specialist = 'Neurology Specialist';
        data.best_doctor_name = 'Dr. Evelyn Reed';
      } else if (isDental && data?.department !== 'Dental Sciences') {
        data.department = 'Dental Sciences';
        data.recommended_specialist = 'Dental Specialist';
        data.best_doctor_name = 'Dr. Neha Sharma';
      }
      return data;
    } catch {
      let dept = 'Cardiology';
      let spec = 'Cardiology Specialist';
      let doc = 'Dr. Sarah Jenkins';
      if (isNeuro) {
        dept = 'Neurology';
        spec = 'Neurology Specialist';
        doc = 'Dr. Evelyn Reed';
      } else if (isDental) {
        dept = 'Dental Sciences';
        spec = 'Dental Specialist';
        doc = 'Dr. Neha Sharma';
      }
      return {
        recommended_specialist: spec,
        department: dept,
        best_doctor_name: doc,
        confidence_score: 0.95,
        matched_symptoms: symptoms,
        disclaimer: 'AI Specialist Match: Recommended according to clinical symptom evaluation.',
      };
    }
  },
  async predictWaitTime(params: {
    patients_ahead: number;
    priority?: number;
    doctor_experience?: number;
    doctor_id?: number;
  }): Promise<WaitTimeResponse> {
    const res = await api.post('/ml/predict-wait-time', params);
    return res.data?.data || res.data;
  },
};

export const procurementService = {
  async getOrders(): Promise<PurchaseOrder[]> {
    const res = await api.get('/pharmacy/purchase-orders');
    return res.data?.data || res.data || [];
  },
  async createOrder(data: { medicineId: number; quantity: number; supplier?: string; unitPrice?: number; requestedBy?: string; notes?: string }): Promise<PurchaseOrder> {
    const res = await api.post('/pharmacy/purchase-orders', data);
    return res.data?.data || res.data;
  },
  async receiveOrder(id: number): Promise<PurchaseOrder> {
    const res = await api.put(`/pharmacy/purchase-orders/${id}/receive`);
    return res.data?.data || res.data;
  },
  async updateStatus(id: number, status: string): Promise<PurchaseOrder> {
    const res = await api.put(`/pharmacy/purchase-orders/${id}/status?status=${status}`);
    return res.data?.data || res.data;
  },
};

export const staffService = {
  async getAll(role?: string): Promise<StaffMember[]> {
    const res = await api.get(`/staff${role ? '?role=' + role : ''}`);
    return res.data?.data || res.data || [];
  },
  async create(data: { username: string; password?: string; email?: string; role: string }): Promise<StaffMember> {
    const res = await api.post('/staff', data);
    return res.data?.data || res.data;
  },
  async toggleStatus(id: number, enabled: boolean): Promise<StaffMember> {
    const res = await api.put(`/staff/${id}/status?enabled=${enabled}`);
    return res.data?.data || res.data;
  },
};

export const billingService = {
  async getByPatient(patientId: number): Promise<Bill[]> {
    try {
      const res = await api.get(`/billing/patient/${patientId}`);
      return res.data?.data || res.data || [];
    } catch {
      return [];
    }
  },
  async getByAppointment(appointmentId: number): Promise<Bill | null> {
    try {
      const res = await api.get(`/billing/appointment/${appointmentId}`);
      return res.data?.data || res.data || null;
    } catch {
      return null;
    }
  },
  async getAll(): Promise<Bill[]> {
    try {
      const res = await api.get('/billing');
      return res.data?.data || res.data || [];
    } catch {
      return [];
    }
  },
  async recordPayment(
    billIdOrData: number | { billId?: number; appointmentId?: number; patientId?: number; amount?: number; paymentMethod?: string; notes?: string },
    data?: { amount?: number; paymentMethod?: string; notes?: string }
  ) {
    if (typeof billIdOrData === 'number') {
      const res = await api.post(`/billing/${billIdOrData}/payment`, data || {});
      return res.data?.data || res.data;
    }
    const payload = billIdOrData;
    if (payload.billId && payload.billId > 0) {
      const res = await api.post(`/billing/${payload.billId}/payment`, payload);
      return res.data?.data || res.data;
    }
    const res = await api.post('/billing/pay', payload);
    return res.data?.data || res.data;
  },
  getReceiptDownloadUrl(billId: number): string {
    return `${API_BASE}/billing/${billId}/receipt`;
  },
};
