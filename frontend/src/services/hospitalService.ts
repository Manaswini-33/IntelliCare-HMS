import axios from 'axios';
import type {
  Doctor,
  Patient,
  Appointment,
  QueueEntry,
  LabTest,
  Medicine,
  Prescription,
  SeverityPredictionResponse,
  SpecialistRecommendationResponse,
  WaitTimeResponse,
  Role,
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
  async create(patientData: Partial<Patient>): Promise<Patient> {
    const res = await api.post('/patients', patientData);
    return res.data?.data || res.data;
  },
  async update(id: number, patientData: Partial<Patient>): Promise<Patient> {
    const res = await api.put(`/patients/${id}`, patientData);
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
  }) {
    const res = await api.post('/appointments', data);
    return res.data?.data || res.data;
  },
  async cancel(id: number) {
    const res = await api.put(`/appointments/${id}/cancel`);
    return res.data;
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
  async submitResult(testId: number, resultText: string) {
    const res = await api.post(`/lab-results`, { labTestId: testId, result: resultText });
    return res.data?.data || res.data;
  },
};

export const pharmacyService = {
  async getMedicines(): Promise<Medicine[]> {
    const res = await api.get('/pharmacy/medicines');
    return res.data?.data || res.data || [];
  },
  async getPrescriptions(): Promise<Prescription[]> {
    const res = await api.get('/prescriptions');
    return res.data?.data || res.data || [];
  },
  async dispense(prescriptionId: number) {
    const res = await api.post(`/pharmacy/dispense/${prescriptionId}`);
    return res.data;
  },
  async updateStock(medicineId: number, newStock: number) {
    const res = await api.put(`/pharmacy/medicines/${medicineId}/stock`, { stock: newStock });
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
    const res = await api.post('/ml/recommend-specialist', { symptoms });
    return res.data?.data || res.data;
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
