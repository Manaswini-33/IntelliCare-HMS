-- Safe Demo Patient Data Reset Script
-- Deletes demo patient records and associated dependents in strict foreign key order
-- Preserves all doctors, employees, medicines, departments, and staff user accounts

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE medicine_dispensings;
TRUNCATE TABLE prescription_items;
DELETE FROM prescriptions;
TRUNCATE TABLE lab_results;
DELETE FROM lab_tests;
TRUNCATE TABLE queue_entries;
TRUNCATE TABLE payments;
TRUNCATE TABLE receipts;
DELETE FROM bills;
DELETE FROM emergency_cases;
DELETE FROM medical_records;
DELETE FROM appointments;
DELETE FROM notifications;

-- Delete patient user accounts (preserving doctor, receptionist, labtech, pharmacist, admin)
DELETE FROM users WHERE role = 'PATIENT';

-- Delete patients
DELETE FROM patients;

-- Reset auto increments for clean new patient registrations
ALTER TABLE patients AUTO_INCREMENT = 1;
ALTER TABLE appointments AUTO_INCREMENT = 1;
ALTER TABLE lab_tests AUTO_INCREMENT = 1;
ALTER TABLE prescriptions AUTO_INCREMENT = 1;
ALTER TABLE bills AUTO_INCREMENT = 1;

SET FOREIGN_KEY_CHECKS = 1;

SELECT 'Reset completed successfully. All demo patient data cleared while keeping staff and medicine catalog intact.' AS status;
