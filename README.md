# IntelliCare HMS: AI-Driven Smart Hospital Management & Patient Care System

**Smarter Care. Shorter Waits. Safer Healthcare.**

IntelliCare is a full-stack Hospital Management System using **Spring Boot** for the backend, a modern Web UI for the frontend, and a **Python FastAPI** service for Machine Learning predictions (Emergency Severity, Doctor Recommendation, Wait Time Prediction).

## Core Features
1. **3-Portal Architecture**: Unified login screen with distinct portals for User (Patient), Doctor/Employee, and Admin.
2. **AI-Driven Care**:
    - **Emergency Priority Prediction**: Predicts severity level from vitals (Heart rate, SpO2, BP) using a Random Forest Classifier.
    - **Smart Doctor Recommendation**: Recommends appropriate department/specialist based on symptoms using NLP.
    - **Queue Wait Time Estimation**: Estimates patient wait times based on queue position and active doctors.
3. **Comprehensive Modules**: Registration, Appointment Booking, Pharmacy (with medication safety validation), Lab, and Billing.

## Setup Instructions

### 1. Prerequisites
- **Java 17** or higher
- **Maven** (Included via wrapper `mvnw`)
- **Python 3.9+** (For the ML Service)
- **MySQL** (Optional: currently configured to use H2 in-memory DB by default for easy local testing. See `application.properties` to switch to MySQL).

### 2. Start the Machine Learning Service (Python)
The ML models need to be trained and the FastAPI server started.

```bash
cd ml-service
# 1. Create virtual environment and install dependencies
python -m venv venv
.\venv\Scripts\activate  # On Windows
pip install -r requirements.txt

# 2. Train the models
python training/train_emergency_model.py
python training/train_specialist_model.py
python training/train_wait_time_model.py

# 3. Start the FastAPI server
python run_service.py
```
The ML API will run on `http://127.0.0.1:8000`.

### 3. Start the Spring Boot Backend
In a new terminal window, navigate to the root of the project:

```bash
# 1. Compile the Java application
.\mvnw.cmd clean install -DskipTests

# 2. Run the application
.\mvnw.cmd spring-boot:run
```
The Spring Boot server will run on `http://localhost:8080`.

### 4. Access the Application
Open a web browser and navigate to:
**http://localhost:8080**

You will see the unified Login Portal. You can use the following mock credentials (pre-loaded by `DataInitializer`):

- **User / Patient Portal**:
  Username: `patient`
  Password: `password123`

- **Doctor / Employee Portal**:
  Username: `doctor` (or `receptionist`, `pharmacist`, `labtech`)
  Password: `password123`

- **Admin Portal**:
  Username: `admin`
  Password: `password123`

*Note: In this demo, the frontend simply filters tabs based on the portal chosen. In a production environment, proper Spring Security JWT validation would enforce these rules at the API layer.*
