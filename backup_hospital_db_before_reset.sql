-- MySQL dump 10.13  Distrib 9.6.0, for Win64 (x86_64)
--
-- Host: localhost    Database: hospital_db
-- ------------------------------------------------------
-- Server version	9.6.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '1dfd77b7-0687-11f1-82cc-c8418a269d82:1-461';

--
-- Table structure for table `appointments`
--

DROP TABLE IF EXISTS `appointments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `appointments` (
  `appointment_id` bigint NOT NULL AUTO_INCREMENT,
  `patient_id` bigint NOT NULL,
  `doctor_id` bigint NOT NULL,
  `appointment_date` date NOT NULL,
  `appointment_time` varchar(255) NOT NULL,
  `status` enum('BOOKED','CANCELLED','CHECKED_IN','COMPLETED','CONFIRMED','IN_CONSULTATION','IN_PROGRESS','IN_QUEUE','NO_SHOW','RESCHEDULED','SCHEDULED') NOT NULL DEFAULT 'BOOKED',
  `symptoms` varchar(255) DEFAULT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `severity` varchar(255) DEFAULT NULL,
  `priority` int DEFAULT '1',
  `queue_position` int DEFAULT NULL,
  `estimated_waiting_time` int DEFAULT NULL,
  `token_number` varchar(255) DEFAULT NULL,
  `vitals` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`appointment_id`),
  KEY `fk_appointment_patient` (`patient_id`),
  KEY `fk_appointment_doctor` (`doctor_id`),
  CONSTRAINT `fk_appointment_doctor` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`doctor_id`),
  CONSTRAINT `fk_appointment_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`patient_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appointments`
--

LOCK TABLES `appointments` WRITE;
/*!40000 ALTER TABLE `appointments` DISABLE KEYS */;
INSERT INTO `appointments` VALUES (1,1,1,'2026-09-28','10:00 AM','BOOKED',NULL,'Chest pain checkup',NULL,1,NULL,NULL,NULL,NULL),(2,2,2,'2026-09-28','10:30 AM','BOOKED',NULL,'Migraine evaluation',NULL,1,NULL,NULL,NULL,NULL),(3,1,2,'2026-10-21','3.00 PM','SCHEDULED',NULL,'OPD Consultation',NULL,1,1,5,NULL,NULL),(4,1,6,'2026-10-22','10:00 AM','SCHEDULED','Cough, Fever, Headache and Cold','OPD Consultation',NULL,1,1,5,'TK-001',NULL),(5,1,1,'2026-10-21','10:30 AM','SCHEDULED',NULL,'Chest pain and breathlessness',NULL,1,1,5,'T-05',NULL),(6,1,1,'2026-10-21','10:43:47 PM','SCHEDULED',NULL,'Chest pain and breathlessness',NULL,1,2,15,'T-06',NULL),(7,1,7,'2026-10-22','10:00 AM','SCHEDULED','Chest Pain ','OPD Consultation',NULL,1,1,5,'T-01',NULL),(8,5,4,'2026-10-22','10:00 AM','SCHEDULED','Joint Pain','Reception OPD Registration',NULL,1,1,5,'T-03',NULL),(9,1,21,'2026-10-22','02:00 PM','SCHEDULED','Skin rashes','OPD Consultation',NULL,1,1,5,'T-01',NULL),(10,1,27,'2026-10-23','10:00 AM','SCHEDULED','Toothache','Dental Sciences',NULL,1,1,5,'T-01',NULL);
/*!40000 ALTER TABLE `appointments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bills`
--

DROP TABLE IF EXISTS `bills`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bills` (
  `bill_id` bigint NOT NULL AUTO_INCREMENT,
  `bill_date` date NOT NULL,
  `consultation_fee` double DEFAULT NULL,
  `laboratory_fee` double DEFAULT NULL,
  `paid_amount` double DEFAULT NULL,
  `payment_status` enum('CANCELLED','FAILED','PAID','PARTIALLY_PAID','PENDING') NOT NULL,
  `pharmacy_fee` double DEFAULT NULL,
  `total_amount` double NOT NULL,
  `patient_id` bigint NOT NULL,
  PRIMARY KEY (`bill_id`),
  KEY `FKiklkhnj1odoll0m9otela7gb9` (`patient_id`),
  CONSTRAINT `FKiklkhnj1odoll0m9otela7gb9` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`patient_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bills`
--

LOCK TABLES `bills` WRITE;
/*!40000 ALTER TABLE `bills` DISABLE KEYS */;
INSERT INTO `bills` VALUES (1,'2026-09-27',500,250,0,'PAID',75,825,1);
/*!40000 ALTER TABLE `bills` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `departments`
--

DROP TABLE IF EXISTS `departments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `departments` (
  `department_id` bigint NOT NULL AUTO_INCREMENT,
  `active` bit(1) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`department_id`),
  UNIQUE KEY `UKj6cwks7xecs5jov19ro8ge3qk` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `departments`
--

LOCK TABLES `departments` WRITE;
/*!40000 ALTER TABLE `departments` DISABLE KEYS */;
/*!40000 ALTER TABLE `departments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `doctors`
--

DROP TABLE IF EXISTS `doctors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `doctors` (
  `doctor_id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `department` varchar(255) NOT NULL,
  `specialization` varchar(255) NOT NULL,
  `experience` int DEFAULT NULL,
  `phone` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `license_number` varchar(255) DEFAULT NULL,
  `availability` varchar(255) DEFAULT 'Available',
  `employee_id` bigint DEFAULT NULL,
  `active` bit(1) NOT NULL DEFAULT b'1',
  `qualification` varchar(255) DEFAULT NULL,
  `rating` double DEFAULT NULL,
  `room_number` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`doctor_id`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `doctors`
--

LOCK TABLES `doctors` WRITE;
/*!40000 ALTER TABLE `doctors` DISABLE KEYS */;
INSERT INTO `doctors` VALUES (1,'Dr. Sarah Jenkins','Cardiology Dept','Cardiology',14,'9876500001','sarah.jenkins@intellicare.com',NULL,'Available',NULL,_binary '','MBBS, MD, DM (Cardiology), FACC',4.9,'Room 101'),(2,'Dr. Marcus Chen','Neurology Dept','Neurology',12,'9876500002','marcus.chen@intellicare.com',NULL,'Available',NULL,_binary '','MBBS, MD, DM (Neurology)',4.9,'Room 201'),(3,'Dr. Priya Patel','Pediatrics Dept','Pediatrics',9,'9876500003','priya.patel@intellicare.com',NULL,'Available',NULL,_binary '','MBBS, MD (Pediatrics), FAAP',4.85,'Room 301'),(4,'Dr. David Miller','Orthopedics Dept','Orthopedics',16,'9876500004','david.miller@intellicare.com',NULL,'Available',NULL,_binary '','MBBS, MS (Orthopedics), MCh',4.95,'Room 401'),(5,'Dr. Elena Rostova','Dermatology Dept','Dermatology',8,'9876500005','elena.rostova@intellicare.com',NULL,'Available',NULL,_binary '','MBBS, MD (Dermatology), FAAD',4.85,'Room 501'),(6,'Dr. James Wilson','Outpatient Clinic','General Medicine',20,'9876500006','james.wilson@intellicare.com',NULL,'Available',NULL,_binary '','MBBS, MD (Internal Medicine), FACP',4.95,'Room 601'),(7,'Dr. Anthony Vance','Cardiology Dept','Cardiology',18,'9876500002','anthony.vance@intellicare.com',NULL,'Available',NULL,_binary '','MBBS, MD (Cardiology), FSCAI',4.95,'Room 102'),(8,'Dr. Robert Martinez','Cardiology Dept','Cardiology',11,'9876500003','robert.martinez@intellicare.com',NULL,'Available',NULL,_binary '','MBBS, MD (Cardiology)',4.8,'Room 103'),(9,'Dr. Lisa Ray','Cardiology Dept','Cardiology',8,'9876500004','lisa.ray@intellicare.com',NULL,'Available',NULL,_binary '','MBBS, DNB (Cardiology)',4.75,'Room 104'),(10,'Dr. Evelyn Reed','Neurology Dept','Neurology',15,'9876500006','evelyn.reed@intellicare.com',NULL,'Available',NULL,_binary '','MBBS, MD (Neurology), PhD',4.95,'Room 202'),(11,'Dr. Alan Cooper','Neurology Dept','Neurology',9,'9876500007','alan.cooper@intellicare.com',NULL,'Available',NULL,_binary '','MBBS, MD (Neurology)',4.8,'Room 203'),(12,'Dr. Maya Lin','Neurology Dept','Neurology',13,'9876500008','maya.lin@intellicare.com',NULL,'Available',NULL,_binary '','MBBS, DNB (Neurology)',4.85,'Room 204'),(13,'Dr. Samuel Clark','Pediatrics Dept','Pediatrics',14,'9876500010','samuel.clark@intellicare.com',NULL,'Available',NULL,_binary '','MBBS, MD, DCH (Pediatrics)',4.9,'Room 302'),(14,'Dr. Zoe Bennett','Pediatrics Dept','Pediatrics',7,'9876500011','zoe.bennett@intellicare.com',NULL,'Available',NULL,_binary '','MBBS, MD (Pediatrics)',4.75,'Room 303'),(15,'Dr. Daniel Kim','Pediatrics Dept','Pediatrics',16,'9876500012','daniel.kim@intellicare.com',NULL,'Available',NULL,_binary '','MBBS, MD (Pediatrics), Fellow Neonatology',4.95,'Room 304'),(16,'Dr. Robert Taylor','Orthopedics Dept','Orthopedics',11,'9876500014','robert.taylor@intellicare.com',NULL,'Available',NULL,_binary '','MBBS, MS (Orthopedics)',4.8,'Room 402'),(17,'Dr. Rebecca Moore','Orthopedics Dept','Orthopedics',10,'9876500015','rebecca.moore@intellicare.com',NULL,'Available',NULL,_binary '','MBBS, DNB (Orthopedics)',4.85,'Room 403'),(18,'Dr. Brian Adams','Orthopedics Dept','Orthopedics',13,'9876500016','brian.adams@intellicare.com',NULL,'Available',NULL,_binary '','MBBS, MS (Orthopedics), Arthroscopy Fellow',4.9,'Room 404'),(19,'Dr. Sophia Green','Dermatology Dept','Dermatology',12,'9876500018','sophia.green@intellicare.com',NULL,'Available',NULL,_binary '','MBBS, MD (Dermatology)',4.9,'Room 502'),(20,'Dr. Nathan Scott','Dermatology Dept','Dermatology',6,'9876500019','nathan.scott@intellicare.com',NULL,'Available',NULL,_binary '','MBBS, DVD (Dermatology)',4.7,'Room 503'),(21,'Dr. Chloe Taylor','Dermatology Dept','Dermatology',15,'9876500020','chloe.taylor@intellicare.com',NULL,'Available',NULL,_binary '','MBBS, MD (Dermatology), Cosmetic Fellow',4.95,'Room 504'),(22,'Dr. Rajesh Sharma','Outpatient Clinic','General Medicine',15,'9876500022','rajesh.sharma@intellicare.com',NULL,'Available',NULL,_binary '','MBBS, MD (General Medicine)',4.9,'Room 602'),(23,'Dr. Laura Davis','Outpatient Clinic','General Medicine',11,'9876500023','laura.davis@intellicare.com',NULL,'Available',NULL,_binary '','MBBS, DNB (Family Medicine)',4.8,'Room 603'),(24,'Dr. Kevin White','Outpatient Clinic','General Medicine',9,'9876500024','kevin.white@intellicare.com',NULL,'Available',NULL,_binary '','MBBS, MD (General Medicine)',4.75,'Room 604'),(25,'Dr. Ananya Rao','Dental Sciences','Dentistry',12,'9876500025','ananya.rao@intellicare.com',NULL,'Available',NULL,_binary '','BDS, MDS (Oral & Maxillofacial Surgery)',4.92,'Room 701'),(26,'Dr. Vikram Malhotra','Dental Sciences','Dentistry',9,'9876500026','vikram.malhotra@intellicare.com',NULL,'Available',NULL,_binary '','BDS, MDS (Orthodontics & Dentofacial Orthopedics)',4.88,'Room 702'),(27,'Dr. Neha Sharma','Dental Sciences','Dentistry',14,'9876500027','neha.sharma@intellicare.com',NULL,'Available',NULL,_binary '','BDS, MDS (Conservative Dentistry & Endodontics)',4.95,'Room 703');
/*!40000 ALTER TABLE `doctors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `emergency_cases`
--

DROP TABLE IF EXISTS `emergency_cases`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `emergency_cases` (
  `emergency_id` bigint NOT NULL AUTO_INCREMENT,
  `confidence_score` double DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `description` varchar(1000) DEFAULT NULL,
  `diastolicbp` int DEFAULT NULL,
  `heart_rate` int DEFAULT NULL,
  `priority` int DEFAULT NULL,
  `respiratory_rate` int DEFAULT NULL,
  `severity` varchar(255) NOT NULL,
  `spo2` int DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `suggested_action` varchar(255) DEFAULT NULL,
  `symptoms` varchar(255) DEFAULT NULL,
  `systolicbp` int DEFAULT NULL,
  `temperature` double DEFAULT NULL,
  `patient_id` bigint NOT NULL,
  PRIMARY KEY (`emergency_id`),
  KEY `FK6oiwjwl1l9m58tquma48uvnff` (`patient_id`),
  CONSTRAINT `FK6oiwjwl1l9m58tquma48uvnff` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`patient_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `emergency_cases`
--

LOCK TABLES `emergency_cases` WRITE;
/*!40000 ALTER TABLE `emergency_cases` DISABLE KEYS */;
INSERT INTO `emergency_cases` VALUES (1,0.925,'2026-09-28 15:12:18.345430','Patient collapsed with sudden chest tightness and severe shortness of breath.',98,118,4,32,'CRITICAL',86,'ACTIVE','OVERRIDE_TO_FRONT','Chest pain, breathing difficulty, fever',165,39.1,3);
/*!40000 ALTER TABLE `emergency_cases` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employees`
--

DROP TABLE IF EXISTS `employees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employees` (
  `employee_id` bigint NOT NULL AUTO_INCREMENT,
  `active` bit(1) NOT NULL,
  `department` varchar(255) DEFAULT NULL,
  `doctor_id` bigint DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `employee_code` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `role` enum('ADMIN','DOCTOR','LAB_TECHNICIAN','PATIENT','PHARMACIST','RECEPTIONIST') NOT NULL,
  `user_id` bigint DEFAULT NULL,
  PRIMARY KEY (`employee_id`),
  UNIQUE KEY `UKetqhw9qqnad1kyjq3ks1glw8x` (`employee_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employees`
--

LOCK TABLES `employees` WRITE;
/*!40000 ALTER TABLE `employees` DISABLE KEYS */;
/*!40000 ALTER TABLE `employees` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lab_results`
--

DROP TABLE IF EXISTS `lab_results`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lab_results` (
  `result_id` bigint NOT NULL AUTO_INCREMENT,
  `remarks` varchar(2000) DEFAULT NULL,
  `result` varchar(2000) NOT NULL,
  `result_date` date NOT NULL,
  `lab_test_id` bigint NOT NULL,
  PRIMARY KEY (`result_id`),
  UNIQUE KEY `UK1svdonr98y8mv4am0443rb7co` (`lab_test_id`),
  CONSTRAINT `FKe60ngnp0gdnsjf50i3glst95f` FOREIGN KEY (`lab_test_id`) REFERENCES `lab_tests` (`lab_test_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lab_results`
--

LOCK TABLES `lab_results` WRITE;
/*!40000 ALTER TABLE `lab_results` DISABLE KEYS */;
INSERT INTO `lab_results` VALUES (1,'Diagnostic documentation attached','Test','2026-10-21',1),(2,'Diagnostic documentation attached','Elevated Troponin-I at 2.4 ng/mL. Immediate cardiology intervention required.','2026-10-21',3),(3,'Diagnostic documentation attached','Elevated Troponin-I at 2.4 ng/mL. Immediate cardiology intervention required.','2026-10-21',4);
/*!40000 ALTER TABLE `lab_results` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lab_tests`
--

DROP TABLE IF EXISTS `lab_tests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lab_tests` (
  `lab_test_id` bigint NOT NULL AUTO_INCREMENT,
  `patient_id` bigint NOT NULL,
  `doctor_id` bigint NOT NULL,
  `test_name` varchar(255) NOT NULL,
  `status` enum('ACCEPTED','CANCELLED','COMPLETED','IN_PROGRESS','REQUESTED') NOT NULL DEFAULT 'REQUESTED',
  `requested_date` date NOT NULL,
  `document_url` longtext,
  `priority` int DEFAULT NULL,
  `result_notes` text,
  `severity` varchar(255) DEFAULT NULL,
  `test_type` varchar(255) DEFAULT NULL,
  `vitals_summary` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`lab_test_id`),
  KEY `fk_labtest_patient` (`patient_id`),
  KEY `fk_labtest_doctor` (`doctor_id`),
  CONSTRAINT `fk_labtest_doctor` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`doctor_id`),
  CONSTRAINT `fk_labtest_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`patient_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lab_tests`
--

LOCK TABLES `lab_tests` WRITE;
/*!40000 ALTER TABLE `lab_tests` DISABLE KEYS */;
INSERT INTO `lab_tests` VALUES (1,1,1,'Complete Blood Count (CBC)','COMPLETED','2026-09-26','doc.pdf',NULL,'Test',NULL,NULL,NULL),(2,3,1,'Lipid Panel & Cardiac Enzymes','REQUESTED','2026-09-28',NULL,NULL,NULL,NULL,NULL,NULL),(3,1,1,'Cardiac Troponin & ECG Panel','COMPLETED','2026-10-21','doc_troponin_ecg_cardiac_panel.pdf',100,'Elevated Troponin-I at 2.4 ng/mL. Immediate cardiology intervention required.','CRITICAL','PATHOLOGY','CRITICAL: SpO2 88%, HR 118bpm, BP 160/100, RR 28, Temp 99.1 F, Chest Pain: Yes, Difficulty Breathing: Yes'),(4,1,1,'Cardiac Troponin & ECG Panel','COMPLETED','2026-10-21','doc_troponin_ecg_cardiac_panel.pdf',100,'Elevated Troponin-I at 2.4 ng/mL. Immediate cardiology intervention required.','CRITICAL','PATHOLOGY','CRITICAL: SpO2 88%, HR 118bpm, BP 160/100, RR 28, Temp 99.1 F, Chest Pain: Yes, Difficulty Breathing: Yes'),(5,1,7,'Chest X-Ray (PA View)','REQUESTED','2026-10-22',NULL,3,NULL,'LOW','X_RAY','SpO2: 90% • HR: 72 bpm • BP: 124/80 • Temp: 38°C • RR: 16');
/*!40000 ALTER TABLE `lab_tests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `medical_records`
--

DROP TABLE IF EXISTS `medical_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `medical_records` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `patient_id` bigint NOT NULL,
  `doctor_id` bigint DEFAULT NULL,
  `visit_date` date DEFAULT NULL,
  `diagnosis` varchar(2000) NOT NULL,
  `treatment` varchar(255) DEFAULT NULL,
  `doctor_notes` varchar(255) DEFAULT NULL,
  `symptoms` varchar(255) DEFAULT NULL,
  `vitals` varchar(255) DEFAULT NULL,
  `notes` varchar(2000) DEFAULT NULL,
  `prescription` varchar(2000) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_medrecord_patient` (`patient_id`),
  KEY `FKtny13k9v4o58styd47st3s2l5` (`doctor_id`),
  CONSTRAINT `fk_medrecord_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`patient_id`),
  CONSTRAINT `FKtny13k9v4o58styd47st3s2l5` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`doctor_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medical_records`
--

LOCK TABLES `medical_records` WRITE;
/*!40000 ALTER TABLE `medical_records` DISABLE KEYS */;
INSERT INTO `medical_records` VALUES (1,1,1,'2026-10-11','Stage 1 Essential Hypertension',NULL,NULL,NULL,NULL,'Patient advised to record daily blood pressure logs.','Amlodipine 5mg daily. Low sodium diet.');
/*!40000 ALTER TABLE `medical_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `medicine_dispensings`
--

DROP TABLE IF EXISTS `medicine_dispensings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `medicine_dispensings` (
  `dispensing_id` bigint NOT NULL AUTO_INCREMENT,
  `bill_id` bigint DEFAULT NULL,
  `dispensed_at` datetime(6) DEFAULT NULL,
  `pharmacy_charge` double DEFAULT NULL,
  `prescription_id` bigint NOT NULL,
  PRIMARY KEY (`dispensing_id`),
  KEY `FKmiiebu2520cg7nhnkfmpb99bn` (`prescription_id`),
  CONSTRAINT `FKmiiebu2520cg7nhnkfmpb99bn` FOREIGN KEY (`prescription_id`) REFERENCES `prescriptions` (`prescription_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medicine_dispensings`
--

LOCK TABLES `medicine_dispensings` WRITE;
/*!40000 ALTER TABLE `medicine_dispensings` DISABLE KEYS */;
/*!40000 ALTER TABLE `medicine_dispensings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `medicines`
--

DROP TABLE IF EXISTS `medicines`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `medicines` (
  `medicine_id` bigint NOT NULL AUTO_INCREMENT,
  `medicine_name` varchar(255) NOT NULL,
  `category` varchar(255) DEFAULT NULL,
  `stock_quantity` int NOT NULL DEFAULT '0',
  `dosage` varchar(255) DEFAULT NULL,
  `price` double DEFAULT '0',
  `low_stock_threshold` int DEFAULT '10',
  `batch_number` varchar(255) DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `active` bit(1) NOT NULL DEFAULT b'1',
  PRIMARY KEY (`medicine_id`),
  UNIQUE KEY `medicine_name` (`medicine_name`)
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medicines`
--

LOCK TABLES `medicines` WRITE;
/*!40000 ALTER TABLE `medicines` DISABLE KEYS */;
INSERT INTO `medicines` VALUES (1,'Paracetamol 500mg','Analgesic',250,'1 tab twice daily',5,10,NULL,NULL,_binary ''),(2,'Amoxicillin 250mg','Antibiotic',120,'1 cap thrice daily',12.5,10,NULL,NULL,_binary ''),(3,'Aspirin 75mg','Cardiovascular',180,'1 tab once daily',8,10,NULL,NULL,_binary ''),(4,'Metformin 500mg','Antidiabetic',200,'1 tab with meals',15,10,NULL,NULL,_binary ''),(5,'Salbutamol Inhaler','Respiratory',45,'2 puffs as needed',30,10,NULL,NULL,_binary ''),(6,'Penicillin V 250mg','Antibiotic',60,'1 tab every 6 hrs',14,10,NULL,NULL,_binary ''),(8,'Ibuprofen 400mg','Fever & Pain',220,'1 tab after food',8.5,20,NULL,'2028-10-22',_binary ''),(9,'Tramadol 50mg','Severe Pain',90,'1 tab as prescribed',22,20,NULL,'2028-10-22',_binary ''),(10,'Atorvastatin 20mg','Cardiovascular',160,'1 tab at bedtime',18,20,NULL,'2028-10-22',_binary ''),(11,'Amlodipine 5mg','Cardiovascular',200,'1 tab once daily',12,20,NULL,'2028-10-22',_binary ''),(12,'Metoprolol 25mg','Cardiovascular',140,'1 tab twice daily',16,20,NULL,'2028-10-22',_binary ''),(13,'Clopidogrel 75mg','Cardiovascular',110,'1 tab once daily',24,20,NULL,'2028-10-22',_binary ''),(14,'Nitroglycerin 0.4mg','Cardiovascular',75,'1 sublingual tab on chest pain',35,20,NULL,'2027-10-22',_binary ''),(15,'Budesonide 200mcg Inhaler','Respiratory & Asthma',50,'2 puffs twice daily',48,20,NULL,'2027-10-22',_binary ''),(16,'Montelukast 10mg','Respiratory & Asthma',130,'1 tab at bedtime',19.5,20,NULL,'2028-10-22',_binary ''),(17,'Dextromethorphan Syrup 100ml','Cough & Cold',85,'10ml thrice daily',28,20,NULL,'2028-10-22',_binary ''),(18,'Amoxicillin-Clavulanate 625mg','Antibiotics',140,'1 tab twice daily after food',26,20,NULL,'2028-10-22',_binary ''),(19,'Azithromycin 500mg','Antibiotics',95,'1 tab once daily for 3 days',34,20,NULL,'2028-10-22',_binary ''),(20,'Ciprofloxacin 500mg','Antibiotics',110,'1 tab twice daily',18.5,20,NULL,'2028-10-22',_binary ''),(21,'Cefixime 200mg','Antibiotics',100,'1 tab twice daily',29,20,NULL,'2028-10-22',_binary ''),(22,'Doxycycline 100mg','Antibiotics',80,'1 cap twice daily with water',15,20,NULL,'2028-10-22',_binary ''),(23,'Glimepiride 2mg','Diabetes',150,'1 tab before breakfast',14,20,NULL,'2028-10-22',_binary ''),(24,'Insulin Glargine 100IU','Diabetes',40,'Inject as per blood sugar chart',85,20,NULL,'2027-10-22',_binary ''),(25,'Pantoprazole 40mg','Gastrointestinal',240,'1 tab before breakfast',11,20,NULL,'2028-10-22',_binary ''),(26,'Ondansetron 4mg','Gastrointestinal',160,'1 tab on nausea',9,20,NULL,'2028-10-22',_binary ''),(27,'ORS Electrolyte Sachet','Gastrointestinal',300,'Dissolve 1 sachet in 1L water',4.5,20,NULL,'2029-10-22',_binary ''),(28,'Cetirizine 10mg','Allergies & Skin',260,'1 tab at bedtime',6.5,20,NULL,'2028-10-22',_binary ''),(29,'Hydrocortisone 1% Cream','Allergies & Skin',90,'Apply twice daily to affected area',16.5,20,NULL,'2028-10-22',_binary ''),(30,'Mupirocin 2% Ointment','Allergies & Skin',70,'Apply to skin lesion thrice daily',22,20,NULL,'2028-10-22',_binary ''),(31,'Gabapentin 300mg','Neurology',110,'1 cap at bedtime',25,20,NULL,'2028-10-22',_binary ''),(32,'Levetiracetam 500mg','Neurology',80,'1 tab twice daily',38,20,NULL,'2028-10-22',_binary ''),(33,'Amoxicillin-Clavulanate 625mg (Dental)','Dentistry & Oral Care',180,'1 tab twice daily after food',28,20,NULL,'2028-10-22',_binary ''),(34,'Metronidazole 400mg','Dentistry & Oral Care',160,'1 tab thrice daily after meals',14.5,20,NULL,'2028-10-22',_binary ''),(35,'Ketorolac Tromethamine 10mg DT','Dentistry & Oral Care',140,'1 dispersible tab in half glass water on severe toothache',18,20,NULL,'2028-10-22',_binary ''),(36,'Chlorhexidine Gluconate 0.2% Rinse','Dentistry & Oral Care',120,'10ml oral rinse for 60 seconds twice daily',35,20,NULL,'2028-10-22',_binary ''),(37,'Triamcinolone 0.1% Dental Paste','Dentistry & Oral Care',80,'Apply thin film to mouth ulcer at bedtime',24,20,NULL,'2028-10-22',_binary ''),(38,'Lidocaine 2% + Adrenaline Inj','Dentistry & Oral Care',95,'Local anesthetic infiltration for dental procedures',42,20,NULL,'2027-10-22',_binary '');
/*!40000 ALTER TABLE `medicines` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `notification_id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `message` varchar(1000) NOT NULL,
  `recipient` varchar(255) NOT NULL,
  `status` varchar(255) DEFAULT NULL,
  `type` enum('APPOINTMENT_CANCELLED','APPOINTMENT_CONFIRMATION','APPOINTMENT_RESCHEDULED','DOCTOR_DELAY','EMERGENCY','LAB_RESULT') NOT NULL,
  PRIMARY KEY (`notification_id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,'2026-10-21 06:16:53.101402','Appointment confirmed with Dr. Dr. Marcus Chen on 2026-10-21 at 3.00 PM.','9876543210','UNREAD','APPOINTMENT_CONFIRMATION'),(2,'2026-10-21 10:25:09.500113','Appointment confirmed with Dr. Dr. James Wilson on 2026-10-22 at 10:00 AM.','9876543210','UNREAD','APPOINTMENT_CONFIRMATION'),(3,'2026-10-21 17:11:42.339664','Appointment confirmed with Dr. Dr. Sarah Jenkins on 2026-10-21 at 10:30 AM.','9876543210','UNREAD','APPOINTMENT_CONFIRMATION'),(4,'2026-10-21 17:12:34.305992','Diagnostic results for \'Complete Blood Count (CBC)\' are completed and sent to Dr. Dr. Sarah Jenkins.','9876543210','UNREAD','LAB_RESULT'),(5,'2026-10-21 17:13:23.721152','Diagnostic results for \'Cardiac Troponin & ECG Panel\' are completed and sent to Dr. Dr. Sarah Jenkins.','9876543210','UNREAD','LAB_RESULT'),(6,'2026-10-21 17:13:47.495119','Appointment confirmed with Dr. Dr. Sarah Jenkins on 2026-10-21 at 10:43:47 PM.','9876543210','UNREAD','APPOINTMENT_CONFIRMATION'),(7,'2026-10-21 17:13:48.176559','Diagnostic results for \'Cardiac Troponin & ECG Panel\' are completed and sent to Dr. Dr. Sarah Jenkins.','9876543210','UNREAD','LAB_RESULT'),(8,'2026-10-22 01:25:34.985352','Appointment confirmed with Dr. Dr. Anthony Vance on 2026-10-22 at 10:00 AM.','9876543210','UNREAD','APPOINTMENT_CONFIRMATION'),(9,'2026-10-22 01:38:01.643307','Appointment confirmed with Dr. Dr. David Miller on 2026-10-22 at 10:00 AM.','8798546521','UNREAD','APPOINTMENT_CONFIRMATION'),(10,'2026-10-22 07:27:38.661512','Appointment confirmed with Dr. Dr. Chloe Taylor on 2026-10-22 at 02:00 PM.','9876543210','UNREAD','APPOINTMENT_CONFIRMATION'),(11,'2026-10-22 15:36:43.471077','Appointment confirmed with Dr. Dr. Neha Sharma on 2026-10-23 at 10:00 AM.','9876543210','UNREAD','APPOINTMENT_CONFIRMATION');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `patients`
--

DROP TABLE IF EXISTS `patients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `patients` (
  `patient_id` bigint NOT NULL AUTO_INCREMENT,
  `patient_code` varchar(255) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `first_name` varchar(255) DEFAULT NULL,
  `last_name` varchar(255) DEFAULT NULL,
  `age` int DEFAULT NULL,
  `gender` varchar(255) DEFAULT NULL,
  `phone` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `blood_group` varchar(255) DEFAULT NULL,
  `allergies` varchar(255) DEFAULT NULL,
  `active` bit(1) NOT NULL DEFAULT b'1',
  `created_at` datetime(6) DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`patient_id`),
  UNIQUE KEY `patient_code` (`patient_code`),
  UNIQUE KEY `idx_patient_code` (`patient_code`),
  KEY `idx_patient_phone` (`phone`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patients`
--

LOCK TABLES `patients` WRITE;
/*!40000 ALTER TABLE `patients` DISABLE KEYS */;
INSERT INTO `patients` VALUES (1,NULL,'Harshith','Harshith','',30,'Male','9876543210',NULL,NULL,'O+','Penicillin',_binary '','2026-09-30 09:56:23.686739','2026-10-22 15:35:56.978062'),(2,NULL,'Emily Davis',NULL,NULL,28,'Female','9876543211','emily@email.com','56 Lakeview Rd, Boston','A+','Aspirin',_binary '','2026-09-30 09:56:23.686739','2026-09-30 09:56:23.686739'),(3,NULL,'Robert Brown',NULL,NULL,65,'Male','9876543212','robert@email.com','88 Broadway, Chicago','B+','None',_binary '','2026-09-30 09:56:23.686739','2026-09-30 09:56:23.686739'),(4,NULL,'Sarah Wilson','Sarah','Wilson',34,'Female','9876543213','sarah@email.com','12 Pine St, Seattle','AB+','Sulfa Drugs',_binary '','2026-10-21 10:03:57.147026','2026-10-21 10:03:57.147026'),(5,'PAT-00005','John Doe','John','Doe',28,'Male','8798546521','','Nippo, Nellore, 524004','A+','None',_binary '','2026-10-22 01:38:01.118344','2026-10-22 01:38:01.426505'),(6,'PAT-00006','Test NewPatient','Test','NewPatient',30,'Female','9998887771','newpat@example.com','100 Main St','B+','Penicillin',_binary '','2026-10-22 06:33:11.515764','2026-10-22 06:33:11.630747'),(7,NULL,'Patient (9812345678)','Patient','(9812345678)',30,'Unspecified','9812345678','9812345678@patient.com','Self-registered via Mobile Portal','O+','None',_binary '','2026-10-22 15:19:05.472294','2026-10-22 15:19:05.472294');
/*!40000 ALTER TABLE `patients` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `payment_id` bigint NOT NULL AUTO_INCREMENT,
  `amount` double NOT NULL,
  `payment_date` datetime(6) NOT NULL,
  `payment_method` varchar(255) NOT NULL,
  `payment_status` enum('CANCELLED','FAILED','PAID','PARTIALLY_PAID','PENDING') NOT NULL,
  `bill_id` bigint NOT NULL,
  PRIMARY KEY (`payment_id`),
  KEY `FK9565r6579khpdjxnyla0l2ycd` (`bill_id`),
  CONSTRAINT `FK9565r6579khpdjxnyla0l2ycd` FOREIGN KEY (`bill_id`) REFERENCES `bills` (`bill_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `prescription_items`
--

DROP TABLE IF EXISTS `prescription_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prescription_items` (
  `item_id` bigint NOT NULL AUTO_INCREMENT,
  `dosage` varchar(255) DEFAULT NULL,
  `quantity` int DEFAULT NULL,
  `medicine_id` bigint NOT NULL,
  `prescription_id` bigint DEFAULT NULL,
  PRIMARY KEY (`item_id`),
  KEY `FKacx7kmy9ksr443xpn5dccidro` (`medicine_id`),
  KEY `FK6uh7tdy2lv6sx34u1365acqsf` (`prescription_id`),
  CONSTRAINT `FK6uh7tdy2lv6sx34u1365acqsf` FOREIGN KEY (`prescription_id`) REFERENCES `prescriptions` (`prescription_id`),
  CONSTRAINT `FKacx7kmy9ksr443xpn5dccidro` FOREIGN KEY (`medicine_id`) REFERENCES `medicines` (`medicine_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prescription_items`
--

LOCK TABLES `prescription_items` WRITE;
/*!40000 ALTER TABLE `prescription_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `prescription_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `prescriptions`
--

DROP TABLE IF EXISTS `prescriptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prescriptions` (
  `prescription_id` bigint NOT NULL AUTO_INCREMENT,
  `patient_id` bigint NOT NULL,
  `doctor_id` bigint NOT NULL,
  `appointment_id` bigint DEFAULT NULL,
  `prescription_date` date DEFAULT NULL,
  `status` enum('CANCELLED','DISPENSED','ISSUED','VERIFIED') DEFAULT 'ISSUED',
  `duration` varchar(255) DEFAULT NULL,
  `instructions` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`prescription_id`),
  KEY `fk_prescription_patient` (`patient_id`),
  KEY `fk_prescription_doctor` (`doctor_id`),
  CONSTRAINT `fk_prescription_doctor` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`doctor_id`),
  CONSTRAINT `fk_prescription_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`patient_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prescriptions`
--

LOCK TABLES `prescriptions` WRITE;
/*!40000 ALTER TABLE `prescriptions` DISABLE KEYS */;
INSERT INTO `prescriptions` VALUES (1,1,1,NULL,'2026-10-22','DISPENSED','10 days','Amlodipine 5mg • 1 tab once daily in morning • Atorvastatin 20mg • 1 tab at bedtime'),(2,2,1,NULL,'2026-10-22','DISPENSED','5 days','Salbutamol Inhaler • 2 puffs as needed for wheezing • Montelukast 10mg • 1 tab at bedtime'),(3,3,7,NULL,'2026-10-22','ISSUED','15 days','Metformin 500mg • 1 tab with meals twice daily • Pantoprazole 40mg • 1 tab before breakfast');
/*!40000 ALTER TABLE `prescriptions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `queue_entries`
--

DROP TABLE IF EXISTS `queue_entries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `queue_entries` (
  `queue_entry_id` bigint NOT NULL AUTO_INCREMENT,
  `token_number` varchar(255) NOT NULL,
  `patient_id` bigint NOT NULL,
  `doctor_id` bigint NOT NULL,
  `appointment_id` bigint DEFAULT NULL,
  `priority` int DEFAULT '1',
  `severity` varchar(255) DEFAULT NULL,
  `queue_status` enum('CALLED','CANCELLED','COMPLETED','IN_CONSULTATION','WAITING') NOT NULL DEFAULT 'WAITING',
  `estimated_waiting_minutes` int DEFAULT NULL,
  `called_at` datetime(6) DEFAULT NULL,
  `completed_at` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`queue_entry_id`),
  UNIQUE KEY `token_number` (`token_number`),
  KEY `fk_queue_patient` (`patient_id`),
  KEY `fk_queue_doctor` (`doctor_id`),
  KEY `FKl2eyxplm08m14ixe8hrlas6f7` (`appointment_id`),
  CONSTRAINT `fk_queue_doctor` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`doctor_id`),
  CONSTRAINT `fk_queue_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`patient_id`),
  CONSTRAINT `FKl2eyxplm08m14ixe8hrlas6f7` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`appointment_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `queue_entries`
--

LOCK TABLES `queue_entries` WRITE;
/*!40000 ALTER TABLE `queue_entries` DISABLE KEYS */;
/*!40000 ALTER TABLE `queue_entries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `receipts`
--

DROP TABLE IF EXISTS `receipts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `receipts` (
  `receipt_id` bigint NOT NULL AUTO_INCREMENT,
  `amount` double DEFAULT NULL,
  `patient_id` bigint DEFAULT NULL,
  `payment_date` datetime(6) DEFAULT NULL,
  `payment_method` varchar(255) DEFAULT NULL,
  `payment_status` tinyint DEFAULT NULL,
  `receipt_number` varchar(255) NOT NULL,
  `bill_id` bigint NOT NULL,
  `payment_id` bigint NOT NULL,
  PRIMARY KEY (`receipt_id`),
  UNIQUE KEY `UKsehtr7fmqdjw4f4n3xys7x19l` (`receipt_number`),
  KEY `FK5dlh2l0nj6ynov9gx8kpy6hhc` (`bill_id`),
  KEY `FKecr3sh9ed2cda7v8n3gyy7530` (`payment_id`),
  CONSTRAINT `FK5dlh2l0nj6ynov9gx8kpy6hhc` FOREIGN KEY (`bill_id`) REFERENCES `bills` (`bill_id`),
  CONSTRAINT `FKecr3sh9ed2cda7v8n3gyy7530` FOREIGN KEY (`payment_id`) REFERENCES `payments` (`payment_id`),
  CONSTRAINT `receipts_chk_1` CHECK ((`payment_status` between 0 and 4))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `receipts`
--

LOCK TABLES `receipts` WRITE;
/*!40000 ALTER TABLE `receipts` DISABLE KEYS */;
/*!40000 ALTER TABLE `receipts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` bigint NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `role` enum('ADMIN','DOCTOR','LAB_TECHNICIAN','PATIENT','PHARMACIST','RECEPTIONIST') NOT NULL,
  `enabled` bit(1) NOT NULL DEFAULT b'1',
  `employee_id` bigint DEFAULT NULL,
  `patient_id` bigint DEFAULT NULL,
  `created_at` datetime(6) DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'patient','$2a$10$8.UnVuG9HHgffUDAlk8qfOUVGkqRzgVym556V6/tE.x2O4.9o27e6','patient@intellicare.com','PATIENT',_binary '',NULL,NULL,'2026-09-30 09:56:23.670586','2026-09-30 09:56:23.670586'),(2,'doctor','$2a$10$8.UnVuG9HHgffUDAlk8qfOUVGkqRzgVym556V6/tE.x2O4.9o27e6','doctor@intellicare.com','DOCTOR',_binary '',NULL,NULL,'2026-09-30 09:56:23.670586','2026-09-30 09:56:23.670586'),(3,'receptionist','$2a$10$8.UnVuG9HHgffUDAlk8qfOUVGkqRzgVym556V6/tE.x2O4.9o27e6','receptionist@intellicare.com','RECEPTIONIST',_binary '',NULL,NULL,'2026-09-30 09:56:23.670586','2026-09-30 09:56:23.670586'),(4,'labtech','$2a$10$8.UnVuG9HHgffUDAlk8qfOUVGkqRzgVym556V6/tE.x2O4.9o27e6','labtech@intellicare.com','LAB_TECHNICIAN',_binary '',NULL,NULL,'2026-09-30 09:56:23.670586','2026-09-30 09:56:23.670586'),(5,'pharmacist','$2a$10$8.UnVuG9HHgffUDAlk8qfOUVGkqRzgVym556V6/tE.x2O4.9o27e6','pharmacist@intellicare.com','PHARMACIST',_binary '',NULL,NULL,'2026-09-30 09:56:23.670586','2026-09-30 09:56:23.670586'),(6,'admin','$2a$10$8.UnVuG9HHgffUDAlk8qfOUVGkqRzgVym556V6/tE.x2O4.9o27e6','admin@intellicare.com','ADMIN',_binary '',NULL,NULL,'2026-09-30 09:56:23.670586','2026-09-30 09:56:23.670586'),(7,'john smith','$2a$10$dzfH2ZU5MkSQCcaZTZkiouISQGxTrizK94z9plvrgKEUMrCOygGFC','johnsmith@intellicare.com','PATIENT',_binary '',NULL,NULL,'2026-10-21 06:15:10.403332','2026-10-21 06:15:10.403332'),(8,'dr. sarah jenkins','$2a$10$dtoOicirLla9L.24Wm8wv.4as.s4snjKmJ5wvWqSZE9VMNWW6T.sC','dr.sarahjenkins@intellicare.com','PATIENT',_binary '',NULL,NULL,'2026-10-21 06:17:52.149091','2026-10-21 06:17:52.149091'),(9,'1','$2a$10$1cY/FXiB7hHv.tSZtq/70uMxX/azj8B.J0aiMALA6c9Tw.vdkH9cC','1@intellicare.com','PATIENT',_binary '',NULL,NULL,'2026-10-21 06:18:05.584384','2026-10-21 06:18:05.584384'),(10,'1001','$2a$10$iSULDGbdgTIiwH5VA5Fywu0AC8bjlNorhnDU9MPNZZpUpL7FuJgi6','john.smith@intellicare.com','PATIENT',_binary '',NULL,1,'2026-10-21 10:03:56.810981','2026-10-21 10:12:37.009271'),(11,'1002','$2a$10$8aXZtPXXsyb.6fFQ6xbN4.0N0iu0Fj1E5o03mFaNKTJq7RX.F4XB.','emily.davis@intellicare.com','PATIENT',_binary '',NULL,2,'2026-10-21 10:03:56.916105','2026-10-21 10:03:56.916105'),(12,'1003','$2a$10$8aXZtPXXsyb.6fFQ6xbN4.0N0iu0Fj1E5o03mFaNKTJq7RX.F4XB.','robert.brown@intellicare.com','PATIENT',_binary '',NULL,3,'2026-10-21 10:03:56.937984','2026-10-21 10:03:56.937984'),(13,'1004','$2a$10$8aXZtPXXsyb.6fFQ6xbN4.0N0iu0Fj1E5o03mFaNKTJq7RX.F4XB.','sarah.wilson@intellicare.com','PATIENT',_binary '',NULL,4,'2026-10-21 10:03:56.953408','2026-10-21 10:03:56.953408'),(14,'3001','$2a$10$8aXZtPXXsyb.6fFQ6xbN4.0N0iu0Fj1E5o03mFaNKTJq7RX.F4XB.','reception1@intellicare.com','RECEPTIONIST',_binary '',NULL,NULL,'2026-10-21 10:03:56.969758','2026-10-21 10:03:56.969758'),(15,'3002','$2a$10$8aXZtPXXsyb.6fFQ6xbN4.0N0iu0Fj1E5o03mFaNKTJq7RX.F4XB.','reception2@intellicare.com','RECEPTIONIST',_binary '',NULL,NULL,'2026-10-21 10:03:56.987260','2026-10-21 10:03:56.987260'),(16,'4001','$2a$10$8aXZtPXXsyb.6fFQ6xbN4.0N0iu0Fj1E5o03mFaNKTJq7RX.F4XB.','labtech@intellicare.com','LAB_TECHNICIAN',_binary '',NULL,NULL,'2026-10-21 10:03:57.010096','2026-10-21 10:03:57.010096'),(17,'5001','$2a$10$8aXZtPXXsyb.6fFQ6xbN4.0N0iu0Fj1E5o03mFaNKTJq7RX.F4XB.','pharmacist@intellicare.com','PHARMACIST',_binary '',NULL,NULL,'2026-10-21 10:03:57.035341','2026-10-21 10:03:57.035341'),(18,'6001','$2a$10$8aXZtPXXsyb.6fFQ6xbN4.0N0iu0Fj1E5o03mFaNKTJq7RX.F4XB.','admin@intellicare.com','ADMIN',_binary '',NULL,NULL,'2026-10-21 10:03:57.063333','2026-10-21 10:03:57.063333'),(19,'2001','$2a$10$8aXZtPXXsyb.6fFQ6xbN4.0N0iu0Fj1E5o03mFaNKTJq7RX.F4XB.','sarah.jenkins@intellicare.com','DOCTOR',_binary '',1,NULL,'2026-10-21 10:03:57.855031','2026-10-21 10:03:57.855031'),(20,'2002','$2a$10$8aXZtPXXsyb.6fFQ6xbN4.0N0iu0Fj1E5o03mFaNKTJq7RX.F4XB.','anthony.vance@intellicare.com','DOCTOR',_binary '',7,NULL,'2026-10-21 10:03:57.895707','2026-10-21 10:03:57.895707'),(21,'2003','$2a$10$8aXZtPXXsyb.6fFQ6xbN4.0N0iu0Fj1E5o03mFaNKTJq7RX.F4XB.','robert.martinez@intellicare.com','DOCTOR',_binary '',8,NULL,'2026-10-21 10:03:57.910885','2026-10-21 10:03:57.910885'),(22,'2004','$2a$10$8aXZtPXXsyb.6fFQ6xbN4.0N0iu0Fj1E5o03mFaNKTJq7RX.F4XB.','lisa.ray@intellicare.com','DOCTOR',_binary '',9,NULL,'2026-10-21 10:03:57.931935','2026-10-21 10:03:57.931935'),(23,'2005','$2a$10$8aXZtPXXsyb.6fFQ6xbN4.0N0iu0Fj1E5o03mFaNKTJq7RX.F4XB.','marcus.chen@intellicare.com','DOCTOR',_binary '',2,NULL,'2026-10-21 10:03:57.950446','2026-10-21 10:03:57.950446'),(24,'2006','$2a$10$8aXZtPXXsyb.6fFQ6xbN4.0N0iu0Fj1E5o03mFaNKTJq7RX.F4XB.','evelyn.reed@intellicare.com','DOCTOR',_binary '',10,NULL,'2026-10-21 10:03:57.964420','2026-10-21 10:03:57.964420'),(25,'2007','$2a$10$8aXZtPXXsyb.6fFQ6xbN4.0N0iu0Fj1E5o03mFaNKTJq7RX.F4XB.','alan.cooper@intellicare.com','DOCTOR',_binary '',11,NULL,'2026-10-21 10:03:57.988469','2026-10-21 10:03:57.988469'),(26,'2008','$2a$10$8aXZtPXXsyb.6fFQ6xbN4.0N0iu0Fj1E5o03mFaNKTJq7RX.F4XB.','maya.lin@intellicare.com','DOCTOR',_binary '',12,NULL,'2026-10-21 10:03:58.003836','2026-10-21 10:03:58.003836'),(27,'2009','$2a$10$8aXZtPXXsyb.6fFQ6xbN4.0N0iu0Fj1E5o03mFaNKTJq7RX.F4XB.','priya.patel@intellicare.com','DOCTOR',_binary '',3,NULL,'2026-10-21 10:03:58.028034','2026-10-21 10:03:58.028034'),(28,'2010','$2a$10$8aXZtPXXsyb.6fFQ6xbN4.0N0iu0Fj1E5o03mFaNKTJq7RX.F4XB.','samuel.clark@intellicare.com','DOCTOR',_binary '',13,NULL,'2026-10-21 10:03:58.049566','2026-10-21 10:03:58.049566'),(29,'2011','$2a$10$8aXZtPXXsyb.6fFQ6xbN4.0N0iu0Fj1E5o03mFaNKTJq7RX.F4XB.','zoe.bennett@intellicare.com','DOCTOR',_binary '',14,NULL,'2026-10-21 10:03:58.081103','2026-10-21 10:03:58.081103'),(30,'2012','$2a$10$8aXZtPXXsyb.6fFQ6xbN4.0N0iu0Fj1E5o03mFaNKTJq7RX.F4XB.','daniel.kim@intellicare.com','DOCTOR',_binary '',15,NULL,'2026-10-21 10:03:58.095943','2026-10-21 10:03:58.095943'),(31,'2013','$2a$10$8aXZtPXXsyb.6fFQ6xbN4.0N0iu0Fj1E5o03mFaNKTJq7RX.F4XB.','david.miller@intellicare.com','DOCTOR',_binary '',4,NULL,'2026-10-21 10:03:58.110388','2026-10-21 10:03:58.110388'),(32,'2014','$2a$10$8aXZtPXXsyb.6fFQ6xbN4.0N0iu0Fj1E5o03mFaNKTJq7RX.F4XB.','robert.taylor@intellicare.com','DOCTOR',_binary '',16,NULL,'2026-10-21 10:03:58.134444','2026-10-21 10:03:58.134444'),(33,'2015','$2a$10$8aXZtPXXsyb.6fFQ6xbN4.0N0iu0Fj1E5o03mFaNKTJq7RX.F4XB.','rebecca.moore@intellicare.com','DOCTOR',_binary '',17,NULL,'2026-10-21 10:03:58.154462','2026-10-21 10:03:58.154462'),(34,'2016','$2a$10$8aXZtPXXsyb.6fFQ6xbN4.0N0iu0Fj1E5o03mFaNKTJq7RX.F4XB.','brian.adams@intellicare.com','DOCTOR',_binary '',18,NULL,'2026-10-21 10:03:58.169537','2026-10-21 10:03:58.169537'),(35,'2017','$2a$10$8aXZtPXXsyb.6fFQ6xbN4.0N0iu0Fj1E5o03mFaNKTJq7RX.F4XB.','elena.rostova@intellicare.com','DOCTOR',_binary '',5,NULL,'2026-10-21 10:03:58.193055','2026-10-21 10:03:58.193055'),(36,'2018','$2a$10$8aXZtPXXsyb.6fFQ6xbN4.0N0iu0Fj1E5o03mFaNKTJq7RX.F4XB.','sophia.green@intellicare.com','DOCTOR',_binary '',19,NULL,'2026-10-21 10:03:58.214075','2026-10-21 10:03:58.214075'),(37,'2019','$2a$10$8aXZtPXXsyb.6fFQ6xbN4.0N0iu0Fj1E5o03mFaNKTJq7RX.F4XB.','nathan.scott@intellicare.com','DOCTOR',_binary '',20,NULL,'2026-10-21 10:03:58.234312','2026-10-21 10:03:58.234312'),(38,'2020','$2a$10$8aXZtPXXsyb.6fFQ6xbN4.0N0iu0Fj1E5o03mFaNKTJq7RX.F4XB.','chloe.taylor@intellicare.com','DOCTOR',_binary '',21,NULL,'2026-10-21 10:03:58.249316','2026-10-21 10:03:58.250319'),(39,'2021','$2a$10$8aXZtPXXsyb.6fFQ6xbN4.0N0iu0Fj1E5o03mFaNKTJq7RX.F4XB.','james.wilson@intellicare.com','DOCTOR',_binary '',6,NULL,'2026-10-21 10:03:58.269624','2026-10-21 10:03:58.269624'),(40,'2022','$2a$10$8aXZtPXXsyb.6fFQ6xbN4.0N0iu0Fj1E5o03mFaNKTJq7RX.F4XB.','rajesh.sharma@intellicare.com','DOCTOR',_binary '',22,NULL,'2026-10-21 10:03:58.282155','2026-10-21 10:03:58.282155'),(41,'2023','$2a$10$8aXZtPXXsyb.6fFQ6xbN4.0N0iu0Fj1E5o03mFaNKTJq7RX.F4XB.','laura.davis@intellicare.com','DOCTOR',_binary '',23,NULL,'2026-10-21 10:03:58.294054','2026-10-21 10:03:58.294054'),(42,'2024','$2a$10$8aXZtPXXsyb.6fFQ6xbN4.0N0iu0Fj1E5o03mFaNKTJq7RX.F4XB.','kevin.white@intellicare.com','DOCTOR',_binary '',24,NULL,'2026-10-21 10:03:58.307461','2026-10-21 10:03:58.307461'),(43,'pat-00005','$2a$10$cUDeLzl5dDv99I6tEfmxtuU7J9Ub0epODuWIeU5xgYCdwn98bBe9C','','PATIENT',_binary '',NULL,5,'2026-10-22 01:38:01.422401','2026-10-22 01:38:01.422401'),(44,'john doe','$2a$10$XdZeqwDy6wPHOmvcpenSCuYjg81Kp8cqjCoBfjJsdzubJz83kP16K','johndoe@intellicare.com','PATIENT',_binary '',NULL,NULL,'2026-10-22 01:38:49.639020','2026-10-22 01:38:49.639020'),(45,'pat-00006','$2a$10$7izuPbfow2ek56UvmPwKWug7SQn4BD5jGQsRJ1UH1EZIolk1lpj/G','newpat@example.com','PATIENT',_binary '',NULL,6,'2026-10-22 06:33:11.627226','2026-10-22 06:33:11.627226'),(46,'sharad','$2a$10$e3VTG9YdKSTOc1JsiuWZle6IpZFRZeSJzopBAdFQEXO9bsHn7Ial.','sharad@intellicare.com','PATIENT',_binary '',NULL,NULL,'2026-10-22 07:27:01.863028','2026-10-22 07:27:01.863028'),(47,'2025','$2a$10$k35HWPptWwTku/xdKI.Vd.oZCsALVMQjylcMW1kYB4BQgMPpu88dy','ananya.rao@intellicare.com','DOCTOR',_binary '',25,NULL,'2026-10-22 15:18:08.859932','2026-10-22 15:18:08.859932'),(48,'2026','$2a$10$k35HWPptWwTku/xdKI.Vd.oZCsALVMQjylcMW1kYB4BQgMPpu88dy','vikram.malhotra@intellicare.com','DOCTOR',_binary '',26,NULL,'2026-10-22 15:18:08.877573','2026-10-22 15:18:08.877573'),(49,'2027','$2a$10$k35HWPptWwTku/xdKI.Vd.oZCsALVMQjylcMW1kYB4BQgMPpu88dy','neha.sharma@intellicare.com','DOCTOR',_binary '',27,NULL,'2026-10-22 15:18:08.890031','2026-10-22 15:18:08.890031'),(50,'9812345678','$2a$10$5shIsHTGJyVptDGc5htqAOesvVkN4C8RRW8dt6ERbKfK2GE01Jnd2','9812345678@patient.com','PATIENT',_binary '',NULL,7,'2026-10-22 15:19:05.616698','2026-10-22 15:19:05.616698');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-22 22:33:46
