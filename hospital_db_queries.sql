-- =========================================================
-- IntelliCare HMS Database Inspection & Seeding Script
-- Database: hospital_db
-- Run these queries directly inside MySQL Workbench
-- =========================================================

-- 1. Select the database
USE hospital_db;

-- 2. View all seeded tables and data
SELECT 'USERS TABLE' AS Table_Name;
SELECT id, username, email, role FROM users;

SELECT 'PATIENTS TABLE' AS Table_Name;
SELECT id, name, age, gender, phone, blood_group, allergies FROM patients;

SELECT 'DOCTORS TABLE' AS Table_Name;
SELECT id, name, department, email, phone, experience_years, availability_status FROM doctors;

SELECT 'MEDICINES / PHARMACY TABLE' AS Table_Name;
SELECT id, name, category, stock_quantity, price FROM medicines;

SELECT 'APPOINTMENTS TABLE' AS Table_Name;
SELECT id, patient_id, doctor_id, appointment_date, appointment_time, status, reason FROM appointments;

SELECT 'EMERGENCY QUEUE TABLE' AS Table_Name;
SELECT id, patient_name, chief_complaint, predicted_severity, predicted_department, assigned_doctor_name, wait_time_minutes, queue_status FROM queue_entries;

SELECT 'LAB TESTS TABLE' AS Table_Name;
SELECT id, patient_id, test_name, test_status, test_result FROM lab_tests;

SELECT 'PRESCRIPTIONS TABLE' AS Table_Name;
SELECT id, patient_id, doctor_name, prescription_date, status FROM prescriptions;

SELECT 'MEDICAL RECORDS TABLE' AS Table_Name;
SELECT id, patient_id, diagnosis, treatment, doctor_notes FROM medical_records;

SELECT 'BILLING TABLE' AS Table_Name;
SELECT id, patient_id, total_amount, payment_status FROM payments;


-- =========================================================
-- OPTIONAL: Manual Seed Script (If tables are empty)
-- =========================================================

-- Seed System Users
INSERT IGNORE INTO users (id, username, password, email, role) VALUES
(1, 'patient', '$2a$10$8.UnVuG9HHgffUDAlk8qfOUVGkqRzgVym556V6/tE.x2O4.9o27e6', 'patient@intellicare.com', 'PATIENT'),
(2, 'doctor', '$2a$10$8.UnVuG9HHgffUDAlk8qfOUVGkqRzgVym556V6/tE.x2O4.9o27e6', 'doctor@intellicare.com', 'DOCTOR'),
(3, 'receptionist', '$2a$10$8.UnVuG9HHgffUDAlk8qfOUVGkqRzgVym556V6/tE.x2O4.9o27e6', 'receptionist@intellicare.com', 'RECEPTIONIST'),
(4, 'labtech', '$2a$10$8.UnVuG9HHgffUDAlk8qfOUVGkqRzgVym556V6/tE.x2O4.9o27e6', 'labtech@intellicare.com', 'LAB_TECHNICIAN'),
(5, 'pharmacist', '$2a$10$8.UnVuG9HHgffUDAlk8qfOUVGkqRzgVym556V6/tE.x2O4.9o27e6', 'pharmacist@intellicare.com', 'PHARMACIST'),
(6, 'admin', '$2a$10$8.UnVuG9HHgffUDAlk8qfOUVGkqRzgVym556V6/tE.x2O4.9o27e6', 'admin@intellicare.com', 'ADMIN');

-- Seed Doctors across departments
INSERT IGNORE INTO doctors (id, name, email, phone, department, specialization, experience_years, availability_status) VALUES
(1, 'Dr. Sarah Jenkins', 'sarah.jenkins@intellicare.com', '9876500001', 'Cardiology', 'Cardiology Dept', 14, 'Available'),
(2, 'Dr. Anthony Vance', 'anthony.vance@intellicare.com', '9876500011', 'Cardiology', 'Cardiology Dept', 18, 'Available'),
(3, 'Dr. Marcus Chen', 'marcus.chen@intellicare.com', '9876500002', 'Neurology', 'Neurology Dept', 12, 'Available'),
(4, 'Dr. Evelyn Reed', 'evelyn.reed@intellicare.com', '9876500012', 'Neurology', 'Neurology Dept', 15, 'Available'),
(5, 'Dr. Priya Patel', 'priya.patel@intellicare.com', '9876500003', 'Pediatrics', 'Pediatrics Dept', 9, 'Available'),
(6, 'Dr. David Miller', 'david.miller@intellicare.com', '9876500004', 'Orthopedics', 'Orthopedics Dept', 16, 'Available'),
(7, 'Dr. Elena Rostova', 'elena.rostova@intellicare.com', '9876500005', 'Dermatology', 'Dermatology Dept', 8, 'Available'),
(8, 'Dr. James Wilson', 'james.wilson@intellicare.com', '9876500006', 'General Medicine', 'Outpatient Clinic', 20, 'Available');

-- Seed Patients
INSERT IGNORE INTO patients (id, name, age, gender, phone, email, address, blood_group, allergies) VALUES
(1023, 'John Smith', 45, 'Male', '9876543210', 'john@email.com', '124 Park Ave, New York', 'O+', 'Penicillin'),
(1045, 'Emily Davis', 28, 'Female', '9876543211', 'emily@email.com', '56 Lakeview Rd, Boston', 'A+', 'Aspirin'),
(1046, 'Robert Brown', 65, 'Male', '9876543212', 'robert@email.com', '88 Broadway, Chicago', 'B+', 'None');

-- Seed Pharmacy Medicines
INSERT IGNORE INTO medicines (id, name, category, stock_quantity, dosage_instructions, expiry_date, price) VALUES
(1, 'Paracetamol 500mg', 'Analgesic', 250, '1 tab twice daily', '2028-12-31', 5.00),
(2, 'Amoxicillin 250mg', 'Antibiotic', 120, '1 cap thrice daily', '2027-06-30', 12.50),
(3, 'Aspirin 75mg', 'Cardiovascular', 180, '1 tab once daily', '2028-09-15', 8.00);
