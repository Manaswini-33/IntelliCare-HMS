-- =========================================================
-- IntelliCare HMS Database Inspection & Seeding Script
-- Database: hospital_db
-- Password: Manaswini@337
-- Run these queries directly inside MySQL Workbench
-- =========================================================

-- 1. Select the database
USE hospital_db;

-- 2. View all seeded tables and data
SELECT 'USERS TABLE' AS Table_Name;
SELECT user_id, username, email, role, enabled FROM users;

SELECT 'PATIENTS TABLE' AS Table_Name;
SELECT patient_id, name, age, gender, phone, email, blood_group, allergies FROM patients;

SELECT 'DOCTORS TABLE' AS Table_Name;
SELECT doctor_id, name, department, specialization, experience, phone, email FROM doctors;

SELECT 'MEDICINES / PHARMACY TABLE' AS Table_Name;
SELECT medicine_id, medicine_name, category, stock_quantity, price FROM medicines;

SELECT 'APPOINTMENTS TABLE' AS Table_Name;
SELECT appointment_id, patient_id, doctor_id, appointment_date, appointment_time, status, reason FROM appointments;

SELECT 'EMERGENCY QUEUE TABLE' AS Table_Name;
SELECT queue_entry_id, token_number, patient_id, doctor_id, priority, severity, queue_status, estimated_waiting_minutes FROM queue_entries;

SELECT 'LAB TESTS TABLE' AS Table_Name;
SELECT lab_test_id, patient_id, doctor_id, test_name, status, requested_date FROM lab_tests;

SELECT 'PRESCRIPTIONS TABLE' AS Table_Name;
SELECT prescription_id, patient_id, doctor_id, prescription_date, status, instructions FROM prescriptions;


-- =========================================================
-- OPTIONAL: Manual Seed Script (If tables ever need re-seeding)
-- =========================================================

-- Seed System Users
INSERT IGNORE INTO users (user_id, username, password, email, role, enabled) VALUES
(1, 'patient', '$2a$10$8.UnVuG9HHgffUDAlk8qfOUVGkqRzgVym556V6/tE.x2O4.9o27e6', 'patient@intellicare.com', 'PATIENT', 1),
(2, 'doctor', '$2a$10$8.UnVuG9HHgffUDAlk8qfOUVGkqRzgVym556V6/tE.x2O4.9o27e6', 'doctor@intellicare.com', 'DOCTOR', 1),
(3, 'receptionist', '$2a$10$8.UnVuG9HHgffUDAlk8qfOUVGkqRzgVym556V6/tE.x2O4.9o27e6', 'receptionist@intellicare.com', 'RECEPTIONIST', 1),
(4, 'labtech', '$2a$10$8.UnVuG9HHgffUDAlk8qfOUVGkqRzgVym556V6/tE.x2O4.9o27e6', 'labtech@intellicare.com', 'LAB_TECHNICIAN', 1),
(5, 'pharmacist', '$2a$10$8.UnVuG9HHgffUDAlk8qfOUVGkqRzgVym556V6/tE.x2O4.9o27e6', 'pharmacist@intellicare.com', 'PHARMACIST', 1),
(6, 'admin', '$2a$10$8.UnVuG9HHgffUDAlk8qfOUVGkqRzgVym556V6/tE.x2O4.9o27e6', 'admin@intellicare.com', 'ADMIN', 1);

-- Seed Doctors across departments
INSERT IGNORE INTO doctors (doctor_id, name, email, phone, department, specialization, experience, active) VALUES
(1, 'Dr. Sarah Jenkins', 'sarah.jenkins@intellicare.com', '9876500001', 'Cardiology Dept', 'Cardiology', 14, 1),
(2, 'Dr. Marcus Chen', 'marcus.chen@intellicare.com', '9876500002', 'Neurology Dept', 'Neurology', 12, 1),
(3, 'Dr. Priya Patel', 'priya.patel@intellicare.com', '9876500003', 'Pediatrics Dept', 'Pediatrics', 9, 1),
(4, 'Dr. David Miller', 'david.miller@intellicare.com', '9876500004', 'Orthopedics Dept', 'Orthopedics', 16, 1),
(5, 'Dr. Elena Rostova', 'elena.rostova@intellicare.com', '9876500005', 'Dermatology Dept', 'Dermatology', 8, 1),
(6, 'Dr. James Wilson', 'james.wilson@intellicare.com', '9876500006', 'Outpatient Clinic', 'General Medicine', 20, 1);

-- Seed Patients
INSERT IGNORE INTO patients (patient_id, name, age, gender, phone, email, address, blood_group, allergies, active) VALUES
(1, 'John Smith', 45, 'Male', '9876543210', 'john@email.com', '124 Park Ave, New York', 'O+', 'Penicillin', 1),
(2, 'Emily Davis', 28, 'Female', '9876543211', 'emily@email.com', '56 Lakeview Rd, Boston', 'A+', 'Aspirin', 1),
(3, 'Robert Brown', 65, 'Male', '9876543212', 'robert@email.com', '88 Broadway, Chicago', 'B+', 'None', 1);

-- Seed Pharmacy Medicines
INSERT IGNORE INTO medicines (medicine_id, medicine_name, category, stock_quantity, dosage, price, active) VALUES
(1, 'Paracetamol 500mg', 'Analgesic', 250, '1 tab twice daily', 5.00, 1),
(2, 'Amoxicillin 250mg', 'Antibiotic', 120, '1 cap thrice daily', 12.50, 1),
(3, 'Aspirin 75mg', 'Cardiovascular', 180, '1 tab once daily', 8.00, 1);
