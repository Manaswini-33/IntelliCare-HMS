import api from './api';
import type {
  Doctor,
  Patient,
  QueueEntry,
  LabTest,
  Medicine,
  Prescription,
  SeverityPredictionResponse,
  SpecialistRecommendationResponse,
  WaitTimeResponse,
  Role,
} from '../types';

export const authService = {
  async login(username: string, password: string, role?: Role) {
    const res = await api.post('/auth/login', { username, password, role });
    return res.data;
  },
  async getMe() {
    const res = await api.get('/auth/me');
    return res.data;
  },
};

export const patientService = {
  async getAll() {
    const res = await api.get('/patients');
    return res.data?.data || res.data || [];
  },
  async getById(id: number) {
    const res = await api.get(`/patients/${id}`);
    return res.data?.data || res.data;
  },
  async create(patientData: Partial<Patient>) {
    const res = await api.post('/patients', patientData);
    return res.data?.data || res.data;
  },
  async getHistory(id?: number) {
    const url = id ? `/patients/${id}/records` : '/patients/history';
    const res = await api.get(url);
    return res.data?.data || res.data;
  },
};

export const doctorService = {
  async getAll(department?: string) {
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
  async getAll() {
    const res = await api.get('/appointments');
    return res.data?.data || res.data || [];
  },
  async book(data: {
    patientId: number;
    doctorId: number;
    appointmentDate: string;
    appointmentTime: string;
    symptoms?: string;
    reason?: string;
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
    const res = await api.get('/lab/tests');
    return res.data?.data || res.data || [];
  },
  async orderTest(data: { patientId: number; doctorId: number; testName: string }) {
    const res = await api.post('/lab/tests', data);
    return res.data?.data || res.data;
  },
  async submitResult(testId: number, resultText: string) {
    const res = await api.post(`/lab/tests/${testId}/results`, { result: resultText });
    return res.data;
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
    age: number;
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
  }): Promise<WaitTimeResponse> {
    const res = await api.post('/ml/predict-wait-time', params);
    return res.data?.data || res.data;
  },
};
