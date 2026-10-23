export type Role = 'PATIENT' | 'DOCTOR' | 'RECEPTIONIST' | 'LAB_TECHNICIAN' | 'PHARMACIST' | 'ADMIN';

export interface User {
  userId: number;
  username: string;
  name?: string;
  doctorName?: string;
  specialization?: string;
  department?: string;
  roomNumber?: string;
  email?: string;
  role: Role;
  token?: string;
  patientId?: number;
  doctorId?: number;
  employeeId?: number;
}

export interface Patient {
  patientId: number;
  name: string;
  age: number;
  gender: string;
  phone: string;
  email?: string;
  address?: string;
  bloodGroup?: string;
  allergies?: string;
  active: boolean;
  createdAt?: string;
}

export interface Doctor {
  doctorId: number;
  name: string;
  department: string;
  specialization: string;
  experience?: number;
  phone: string;
  email?: string;
  availability?: string;
  maxPatientsPerDay?: number;
  active: boolean;
  roomNumber?: string;
  qualification?: string;
  rating?: number;
}

export interface Appointment {
  appointmentId: number;
  patientId: number;
  patientName?: string;
  doctorId: number;
  doctorName?: string;
  appointmentDate: string;
  appointmentTime: string;
  status: 'BOOKED' | 'CHECKED_IN' | 'IN_CONSULTATION' | 'COMPLETED' | 'CANCELLED';
  symptoms?: string;
  reason?: string;
  severity?: string;
  priority?: number;
  tokenNumber?: string;
  estimatedWaitingTime?: number;
  doctorRoomNumber?: string;
  patientAge?: number;
  patientGender?: string;
  patientBloodGroup?: string;
  patientAllergies?: string;
  patientPhone?: string;
}

export interface QueueEntry {
  queueEntryId: number;
  tokenNumber: string;
  patientId: number;
  patientName: string;
  doctorId: number;
  doctorName?: string;
  priority: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  queueStatus: 'WAITING' | 'CALLED' | 'IN_CONSULTATION' | 'COMPLETED' | 'CANCELLED';
  estimatedWaitingMinutes: number;
  createdAt?: string;
}

export interface LabTest {
  labTestId: number;
  patientId: number;
  patientName?: string;
  doctorId: number;
  doctorName?: string;
  testName: string;
  status: 'REQUESTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  requestedDate: string;
  testResult?: string;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | string;
  priority?: number;
  vitalsSummary?: string;
  documentUrl?: string;
  testType?: string;
  resultNotes?: string;
}

export interface Medicine {
  medicineId: number;
  medicineName: string;
  category: string;
  stockQuantity: number;
  dosage: string;
  price: number;
  expiryDate?: string;
  active: boolean;
}

export interface Prescription {
  prescriptionId: number;
  patientId: number;
  patientName?: string;
  patientAge?: number;
  patientGender?: string;
  patientAllergies?: string;
  doctorId: number;
  doctorName?: string;
  prescriptionDate: string;
  status: 'ISSUED' | 'VERIFIED' | 'DISPENSED' | 'CANCELLED';
  instructions?: string;
  duration?: string;
  items?: PrescriptionItem[];
}

export interface MedicalRecord {
  recordId?: number;
  patientId: number;
  patientName?: string;
  doctorId: number;
  doctorName?: string;
  diagnosis: string;
  prescription?: string;
  visitDate: string;
  notes?: string;
}

export interface PrescriptionItem {
  id?: number;
  medicineId: number;
  medicineName?: string;
  dosage: string;
  quantity: number;
}

export interface SeverityPredictionResponse {
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  priority_level: number;
  confidence_score: number;
  probabilities: Record<string, number>;
  triage_recommendation: string;
  suggested_queue_action: string;
  is_emergency_override: boolean;
  disclaimer: string;
}

export interface SpecialistRecommendationResponse {
  recommended_specialist: string;
  department: string;
  best_doctor_name: string;
  confidence_score?: number;
  matched_symptoms: string;
  disclaimer: string;
  best_doctor_qualification?: string;
  best_doctor_rating?: number;
  best_doctor_experience?: number;
  best_doctor_room?: string;
  best_doctor_id?: number;
}

export interface WaitTimeResponse {
  predicted_wait_time_minutes: number;
  patients_ahead: number;
  priority_level: number;
  summary: string;
}

export interface PurchaseOrder {
  id: number;
  medicineId: number;
  medicineName: string;
  quantity: number;
  supplier: string;
  unitPrice: number;
  totalCost: number;
  orderDate: string;
  receivedDate?: string;
  status: 'PENDING' | 'ORDERED' | 'RECEIVED' | 'CANCELLED';
  requestedBy?: string;
  notes?: string;
}

export interface StaffMember {
  userId: number;
  username: string;
  name: string;
  email: string;
  role: Role;
  department: string;
  doctorId?: number;
  enabled: boolean;
}
