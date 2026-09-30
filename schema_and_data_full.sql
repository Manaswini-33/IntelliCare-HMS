-- =====================================================================
-- IntelliCare HMS – Complete Database Schema & Seeding Script
-- Database Engine: MySQL 8.0+ / 9.0+
-- Database Name: hospital_db
-- Description: Complete SQL DDL & DML script containing database creation,
--              all 12 table definitions, foreign keys, unique constraints,
--              and demo data seeding for college presentation.
-- =====================================================================

-- 1. Create and Select Database
CREATE DATABASE IF NOT EXISTS hospital_db;
USE hospital_db;

-- 2. Drop existing tables if re-initialization is required (Ordered for FK constraints)
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS receipts;
DROP TABLE IF EXISTS prescription_items;
DROP TABLE IF EXISTS prescriptions;
DROP TABLE IF EXISTS lab_results;
DROP TABLE IF EXISTS lab_tests;
DROP TABLE IF EXISTS queue_entries;
DROP TABLE IF EXISTS appointments;
DROP TABLE IF EXISTS medical_records;
DROP TABLE IF EXISTS medicines;
DROP TABLE IF EXISTS doctors;
DROP TABLE IF EXISTS patients;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================================
-- TABLE 1: USERS (Core Authentication & Role Management)
-- =====================================================================
CREATE TABLE users (
    user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    role ENUM('ADMIN', 'DOCTOR', 'LAB_TECHNICIAN', 'PATIENT', 'PHARMACIST', 'RECEPTIONIST') NOT NULL,
    enabled BIT(1) NOT NULL DEFAULT 1,
    employee_id BIGINT,
    patient_id BIGINT,
    created_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================================
-- TABLE 2: PATIENTS (Patient Profiles & Demographics)
-- =====================================================================
CREATE TABLE patients (
    patient_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_code VARCHAR(255) UNIQUE,
    name VARCHAR(255) NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    age INT,
    gender VARCHAR(255),
    phone VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    address VARCHAR(255),
    blood_group VARCHAR(255),
    allergies VARCHAR(255),
    active BIT(1) NOT NULL DEFAULT 1,
    created_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================================
-- TABLE 3: DOCTORS (Doctor Directory & Specializations)
-- =====================================================================
CREATE TABLE doctors (
    doctor_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    department VARCHAR(255) NOT NULL,
    specialization VARCHAR(255) NOT NULL,
    experience INT,
    phone VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    license_number VARCHAR(255),
    availability VARCHAR(255) DEFAULT 'Available',
    employee_id BIGINT,
    active BIT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================================
-- TABLE 4: MEDICINES (Pharmacy Inventory)
-- =====================================================================
CREATE TABLE medicines (
    medicine_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    medicine_name VARCHAR(255) NOT NULL UNIQUE,
    category VARCHAR(255),
    stock_quantity INT NOT NULL DEFAULT 0,
    dosage VARCHAR(255),
    price DOUBLE DEFAULT 0.0,
    low_stock_threshold INT DEFAULT 10,
    batch_number VARCHAR(255),
    expiry_date DATE,
    active BIT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================================
-- TABLE 5: APPOINTMENTS (Patient Schedules & Bookings)
-- =====================================================================
CREATE TABLE appointments (
    appointment_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    doctor_id BIGINT NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time VARCHAR(255) NOT NULL,
    status ENUM('BOOKED','CANCELLED','CHECKED_IN','COMPLETED','CONFIRMED','IN_CONSULTATION','IN_PROGRESS','IN_QUEUE','NO_SHOW','RESCHEDULED','SCHEDULED') NOT NULL DEFAULT 'BOOKED',
    symptoms VARCHAR(255),
    reason VARCHAR(255),
    severity VARCHAR(255),
    priority INT DEFAULT 1,
    queue_position INT,
    estimated_waiting_time INT,
    token_number VARCHAR(255),
    vitals VARCHAR(255),
    CONSTRAINT fk_appointment_patient FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
    CONSTRAINT fk_appointment_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================================
-- TABLE 6: QUEUE_ENTRIES (AI Triage Priority Queue)
-- =====================================================================
CREATE TABLE queue_entries (
    queue_entry_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    token_number VARCHAR(255) NOT NULL UNIQUE,
    patient_id BIGINT NOT NULL,
    doctor_id BIGINT NOT NULL,
    appointment_id BIGINT,
    priority INT DEFAULT 1,
    severity VARCHAR(255),
    queue_status ENUM('CALLED','CANCELLED','COMPLETED','IN_CONSULTATION','WAITING') NOT NULL DEFAULT 'WAITING',
    estimated_waiting_minutes INT,
    called_at DATETIME(6),
    completed_at DATETIME(6),
    created_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_queue_patient FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
    CONSTRAINT fk_queue_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================================
-- TABLE 7: LAB_TESTS (Diagnostic Orders)
-- =====================================================================
CREATE TABLE lab_tests (
    lab_test_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    doctor_id BIGINT NOT NULL,
    test_name VARCHAR(255) NOT NULL,
    status ENUM('ACCEPTED','CANCELLED','COMPLETED','IN_PROGRESS','REQUESTED') NOT NULL DEFAULT 'REQUESTED',
    requested_date DATE NOT NULL,
    CONSTRAINT fk_labtest_patient FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
    CONSTRAINT fk_labtest_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================================
-- TABLE 8: PRESCRIPTIONS (Doctor Medication Orders)
-- =====================================================================
CREATE TABLE prescriptions (
    prescription_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    doctor_id BIGINT NOT NULL,
    appointment_id BIGINT,
    prescription_date DATE,
    status ENUM('CANCELLED','DISPENSED','ISSUED','VERIFIED') DEFAULT 'ISSUED',
    duration VARCHAR(255),
    instructions VARCHAR(255),
    CONSTRAINT fk_prescription_patient FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
    CONSTRAINT fk_prescription_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================================
-- TABLE 9: MEDICAL_RECORDS (Centralized Health History)
-- =====================================================================
CREATE TABLE medical_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    doctor_id BIGINT,
    visit_date DATE,
    diagnosis VARCHAR(255),
    treatment VARCHAR(255),
    doctor_notes VARCHAR(255),
    symptoms VARCHAR(255),
    vitals VARCHAR(255),
    CONSTRAINT fk_medrecord_patient FOREIGN KEY (patient_id) REFERENCES patients(patient_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================================
-- TABLE 10: PAYMENTS (Billing Transactions)
-- =====================================================================
CREATE TABLE payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    total_amount DOUBLE,
    consultation_fee DOUBLE,
    lab_fee DOUBLE,
    pharmacy_fee DOUBLE,
    payment_status VARCHAR(255) DEFAULT 'PENDING',
    payment_date DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_payment_patient FOREIGN KEY (patient_id) REFERENCES patients(patient_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- =====================================================================
-- SEED DATA INSERTION (Populate Initial Records)
-- =====================================================================

-- Seed System Users (6 Login Roles)
INSERT INTO users (user_id, username, password, email, role, enabled) VALUES
(1, 'patient', '$2a$10$8.UnVuG9HHgffUDAlk8qfOUVGkqRzgVym556V6/tE.x2O4.9o27e6', 'patient@intellicare.com', 'PATIENT', 1),
(2, 'doctor', '$2a$10$8.UnVuG9HHgffUDAlk8qfOUVGkqRzgVym556V6/tE.x2O4.9o27e6', 'doctor@intellicare.com', 'DOCTOR', 1),
(3, 'receptionist', '$2a$10$8.UnVuG9HHgffUDAlk8qfOUVGkqRzgVym556V6/tE.x2O4.9o27e6', 'receptionist@intellicare.com', 'RECEPTIONIST', 1),
(4, 'labtech', '$2a$10$8.UnVuG9HHgffUDAlk8qfOUVGkqRzgVym556V6/tE.x2O4.9o27e6', 'labtech@intellicare.com', 'LAB_TECHNICIAN', 1),
(5, 'pharmacist', '$2a$10$8.UnVuG9HHgffUDAlk8qfOUVGkqRzgVym556V6/tE.x2O4.9o27e6', 'pharmacist@intellicare.com', 'PHARMACIST', 1),
(6, 'admin', '$2a$10$8.UnVuG9HHgffUDAlk8qfOUVGkqRzgVym556V6/tE.x2O4.9o27e6', 'admin@intellicare.com', 'ADMIN', 1);

-- Seed Doctors Across All 6 Specialized Departments
INSERT INTO doctors (doctor_id, name, department, specialization, experience, phone, email, availability, active) VALUES
(1, 'Dr. Sarah Jenkins', 'Cardiology Dept', 'Cardiology', 14, '9876500001', 'sarah.jenkins@intellicare.com', 'Available', 1),
(2, 'Dr. Marcus Chen', 'Neurology Dept', 'Neurology', 12, '9876500002', 'marcus.chen@intellicare.com', 'Available', 1),
(3, 'Dr. Priya Patel', 'Pediatrics Dept', 'Pediatrics', 9, '9876500003', 'priya.patel@intellicare.com', 'Available', 1),
(4, 'Dr. David Miller', 'Orthopedics Dept', 'Orthopedics', 16, '9876500004', 'david.miller@intellicare.com', 'Available', 1),
(5, 'Dr. Elena Rostova', 'Dermatology Dept', 'Dermatology', 8, '9876500005', 'elena.rostova@intellicare.com', 'Available', 1),
(6, 'Dr. James Wilson', 'Outpatient Clinic', 'General Medicine', 20, '9876500006', 'james.wilson@intellicare.com', 'Available', 1);

-- Seed Initial Patients
INSERT INTO patients (patient_id, name, age, gender, phone, email, address, blood_group, allergies, active) VALUES
(1, 'John Smith', 45, 'Male', '9876543210', 'john@email.com', '124 Park Ave, New York', 'O+', 'Penicillin', 1),
(2, 'Emily Davis', 28, 'Female', '9876543211', 'emily@email.com', '56 Lakeview Rd, Boston', 'A+', 'Aspirin', 1),
(3, 'Robert Brown', 65, 'Male', '9876543212', 'robert@email.com', '88 Broadway, Chicago', 'B+', 'None', 1);

-- Seed Pharmacy Medicines Stock
INSERT INTO medicines (medicine_id, medicine_name, category, stock_quantity, dosage, price, active) VALUES
(1, 'Paracetamol 500mg', 'Analgesic', 250, '1 tab twice daily', 5.00, 1),
(2, 'Amoxicillin 250mg', 'Antibiotic', 120, '1 cap thrice daily', 12.50, 1),
(3, 'Aspirin 75mg', 'Cardiovascular', 180, '1 tab once daily', 8.00, 1),
(4, 'Metformin 500mg', 'Antidiabetic', 200, '1 tab with meals', 15.00, 1),
(5, 'Salbutamol Inhaler', 'Respiratory', 45, '2 puffs as needed', 30.00, 1),
(6, 'Penicillin V 250mg', 'Antibiotic', 60, '1 tab every 6 hrs', 14.00, 1);

-- Seed Appointments
INSERT INTO appointments (appointment_id, patient_id, doctor_id, appointment_date, appointment_time, status, reason) VALUES
(1, 1, 1, '2026-09-28', '10:00 AM', 'BOOKED', 'Chest pain checkup'),
(2, 2, 2, '2026-09-28', '10:30 AM', 'BOOKED', 'Migraine evaluation');

-- Seed Lab Tests
INSERT INTO lab_tests (lab_test_id, patient_id, doctor_id, test_name, status, requested_date) VALUES
(1, 1, 1, 'Complete Blood Count (CBC)', 'COMPLETED', '2026-09-26'),
(2, 3, 1, 'Lipid Panel & Cardiac Enzymes', 'REQUESTED', '2026-09-28');
