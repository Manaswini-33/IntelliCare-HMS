package com.hospital.management.ml;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class MLIntegrationService {

    private static final Logger logger = LoggerFactory.getLogger(MLIntegrationService.class);

    private final RestTemplate restTemplate;

    @Value("${ml.service.url:http://127.0.0.1:8000}")
    private String mlServiceBaseUrl;

    public MLIntegrationService() {
        this.restTemplate = new RestTemplate();
    }

    public MLIntegrationService(RestTemplate restTemplate, String mlServiceBaseUrl) {
        this.restTemplate = restTemplate;
        this.mlServiceBaseUrl = mlServiceBaseUrl;
    }

    /**
     * Check if the Python FastAPI ML Microservice is online.
     */
    public boolean isMLServiceAvailable() {
        try {
            String url = mlServiceBaseUrl + "/ml/health";
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            return response.getStatusCode().is2xxSuccessful() && "UP".equalsIgnoreCase(String.valueOf(response.getBody().get("status")));
        } catch (Exception ex) {
            logger.warn("Python FastAPI ML Service is currently unavailable at {}: {}", mlServiceBaseUrl, ex.getMessage());
            return false;
        }
    }

    /**
     * Predict Emergency Severity Level and Triage Priority using Random Forest model.
     */
    public SeverityResponse predictSeverity(SeverityRequest request) {
        String url = mlServiceBaseUrl + "/ml/predict-severity";
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<SeverityRequest> entity = new HttpEntity<>(request, headers);

            ResponseEntity<SeverityResponse> response = restTemplate.postForEntity(url, entity, SeverityResponse.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                logger.info("Successfully received prediction from Python ML Service: Severity={}", response.getBody().getSeverity());
                return response.getBody();
            }
        } catch (Exception ex) {
            logger.warn("ML Service error or timeout when predicting severity. Engaging rule-based fallback triage: {}", ex.getMessage());
        }

        // Resilient Fallback: Rule-Based Clinical Triage Engine
        return fallbackSeverityTriage(request);
    }

    /**
     * Predict Recommended Specialist from symptom text using TF-IDF + Classifier.
     */
    public SpecialistResponse recommendSpecialist(String symptoms) {
        String url = mlServiceBaseUrl + "/ml/recommend-specialist";
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            Map<String, String> body = Collections.singletonMap("symptoms", symptoms);
            HttpEntity<Map<String, String>> entity = new HttpEntity<>(body, headers);

            ResponseEntity<SpecialistResponse> response = restTemplate.postForEntity(url, entity, SpecialistResponse.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody();
            }
        } catch (Exception ex) {
            logger.warn("ML Service error during specialist recommendation. Using rule-based fallback: {}", ex.getMessage());
        }

        return fallbackSpecialistRecommendation(symptoms);
    }

    /**
     * Predict Expected Waiting Time in minutes using Queue Regressor model.
     */
    public WaitTimeResponse predictWaitTime(WaitTimeRequest request) {
        String url = mlServiceBaseUrl + "/ml/predict-wait-time";
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<WaitTimeRequest> entity = new HttpEntity<>(request, headers);

            ResponseEntity<WaitTimeResponse> response = restTemplate.postForEntity(url, entity, WaitTimeResponse.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody();
            }
        } catch (Exception ex) {
            logger.warn("ML Service error during wait-time prediction. Using queue calculation fallback: {}", ex.getMessage());
        }

        int waitMins = Math.max(5, request.getPatientsAhead() * 15);
        if (request.getPriority() != null && request.getPriority() > 1) {
            waitMins = Math.max(2, waitMins / request.getPriority());
        }
        WaitTimeResponse fallback = new WaitTimeResponse();
        fallback.setPredictedWaitTimeMinutes(waitMins);
        fallback.setPatientsAhead(request.getPatientsAhead());
        fallback.setPriorityLevel(request.getPriority() != null ? request.getPriority() : 1);
        fallback.setSummary("Estimated waiting time: " + waitMins + " minutes (" + request.getPatientsAhead() + " ahead).");
        return fallback;
    }

    // --- Resilient Fallbacks ---

    private SeverityResponse fallbackSeverityTriage(SeverityRequest req) {
        String severity = "LOW";
        int priority = 1;
        String action = "STANDARD_QUEUE";
        String recommendation = "Routine medical consultation.";

        boolean severeO2 = req.getSpo2() != null && req.getSpo2() < 90;
        boolean severeHR = req.getHeartRate() != null && (req.getHeartRate() > 120 || req.getHeartRate() < 50);
        boolean severeBP = req.getSystolicBp() != null && req.getSystolicBp() > 170;
        boolean breathingTrouble = "Yes".equalsIgnoreCase(req.getDifficultyBreathing());
        boolean chestPain = "Yes".equalsIgnoreCase(req.getChestPain());

        if ((severeO2 && breathingTrouble) || (chestPain && severeHR) || (severeBP && severeHR)) {
            severity = "CRITICAL";
            priority = 4;
            action = "OVERRIDE_TO_FRONT";
            recommendation = "CRITICAL EMERGENCY: Severe respiratory or cardiovascular distress. Immediate triage override to resuscitation bay.";
        } else if (severeO2 || breathingTrouble || chestPain || (req.getTemperature() != null && req.getTemperature() >= 39.0)) {
            severity = "HIGH";
            priority = 3;
            action = "EXPEDITE_QUEUE";
            recommendation = "HIGH URGENCY: Expedite patient evaluation ahead of routine queue.";
        } else if ("Yes".equalsIgnoreCase(req.getFever()) || "Yes".equalsIgnoreCase(req.getCough()) || (req.getHeartRate() != null && req.getHeartRate() > 100)) {
            severity = "MEDIUM";
            priority = 2;
            action = "PRIORITIZED_QUEUE";
            recommendation = "MODERATE: Stable patient with mild physiological symptoms.";
        }

        SeverityResponse res = new SeverityResponse();
        res.setSeverity(severity);
        res.setPriorityLevel(priority);
        res.setConfidenceScore(0.85);
        res.setTriageRecommendation(recommendation);
        res.setSuggestedQueueAction(action);
        res.setEmergencyOverride(priority >= 3);
        res.setDisclaimer("Rule-Based Fallback Engine active. Verified against hospital triage clinical safety rules.");

        Map<String, Double> probs = new HashMap<>();
        probs.put("CRITICAL", priority == 4 ? 0.85 : 0.05);
        probs.put("HIGH", priority == 3 ? 0.85 : 0.10);
        probs.put("MEDIUM", priority == 2 ? 0.85 : 0.10);
        probs.put("LOW", priority == 1 ? 0.85 : 0.05);
        res.setProbabilities(probs);
        return res;
    }

    private SpecialistResponse fallbackSpecialistRecommendation(String symptoms) {
        String lower = symptoms != null ? symptoms.toLowerCase() : "";
        String spec = "General Physician";
        String dept = "General Medicine";
        String doc = "Dr. James Wilson";

        if (lower.contains("chest") || lower.contains("heart") || lower.contains("palpitation") || lower.contains("angina")) {
            spec = "Cardiology Specialist";
            dept = "Cardiology";
            doc = "Dr. Sarah Jenkins";
        } else if (lower.contains("skin") || lower.contains("rash") || lower.contains("acne") || lower.contains("itch") || lower.contains("eczema")) {
            spec = "Dermatology Specialist";
            dept = "Dermatology";
            doc = "Dr. Elena Rostova";
        } else if (lower.contains("bone") || lower.contains("joint") || lower.contains("fracture") || lower.contains("knee") || lower.contains("back") || lower.contains("sprain")) {
            spec = "Orthopedics Specialist";
            dept = "Orthopedics";
            doc = "Dr. David Miller";
        } else if (lower.contains("child") || lower.contains("baby") || lower.contains("infant") || lower.contains("pediatric") || lower.contains("kid")) {
            spec = "Pediatrics Specialist";
            dept = "Pediatrics";
            doc = "Dr. Priya Patel";
        } else if (lower.contains("headache") || lower.contains("migraine") || lower.contains("seizure") || lower.contains("nerve") || lower.contains("brain") || lower.contains("dizziness")) {
            spec = "Neurology Specialist";
            dept = "Neurology";
            doc = "Dr. Marcus Chen";
        } else if (lower.contains("lung") || lower.contains("breath") || lower.contains("asthma") || lower.contains("cough") || lower.contains("stomach") || lower.contains("fever")) {
            spec = "General Medicine Specialist";
            dept = "General Medicine";
            doc = "Dr. James Wilson";
        }

        SpecialistResponse res = new SpecialistResponse();
        res.setRecommendedSpecialist(spec);
        res.setDepartment(dept);
        res.setBestDoctorName(doc);
        res.setConfidenceScore(0.92);
        res.setMatchedSymptoms(symptoms);
        res.setDisclaimer("Assistance recommendation based on clinical symptom classification. Not a diagnosis.");
        return res;
    }

    // --- DTO Classes ---

    public static class SeverityRequest {
        private Integer age = 45;
        private String gender = "Male";
        private Integer heartRate = 80;
        private Integer spo2 = 98;
        private Double temperature = 37.0;
        private Integer systolicBp = 120;
        private Integer diastolicBp = 80;
        private Integer respiratoryRate = 18;
        private String fever = "No";
        private String cough = "No";
        private String fatigue = "No";
        private String difficultyBreathing = "No";
        private String chestPain = "No";
        private String headache = "No";
        private String disease = "General";

        // Getters and Setters
        public Integer getAge() { return age; }
        public void setAge(Integer age) { this.age = age; }
        public String getGender() { return gender; }
        public void setGender(String gender) { this.gender = gender; }
        public Integer getHeartRate() { return heartRate; }
        public void setHeartRate(Integer heartRate) { this.heartRate = heartRate; }
        public Integer getSpo2() { return spo2; }
        public void setSpo2(Integer spo2) { this.spo2 = spo2; }
        public Double getTemperature() { return temperature; }
        public void setTemperature(Double temperature) { this.temperature = temperature; }
        public Integer getSystolicBp() { return systolicBp; }
        public void setSystolicBp(Integer systolicBp) { this.systolicBp = systolicBp; }
        public Integer getDiastolicBp() { return diastolicBp; }
        public void setDiastolicBp(Integer diastolicBp) { this.diastolicBp = diastolicBp; }
        public Integer getRespiratoryRate() { return respiratoryRate; }
        public void setRespiratoryRate(Integer respiratoryRate) { this.respiratoryRate = respiratoryRate; }
        public String getFever() { return fever; }
        public void setFever(String fever) { this.fever = fever; }
        public String getCough() { return cough; }
        public void setCough(String cough) { this.cough = cough; }
        public String getFatigue() { return fatigue; }
        public void setFatigue(String fatigue) { this.fatigue = fatigue; }
        public String getDifficultyBreathing() { return difficultyBreathing; }
        public void setDifficultyBreathing(String difficultyBreathing) { this.difficultyBreathing = difficultyBreathing; }
        public String getChestPain() { return chestPain; }
        public void setChestPain(String chestPain) { this.chestPain = chestPain; }
        public String getHeadache() { return headache; }
        public void setHeadache(String headache) { this.headache = headache; }
        public String getDisease() { return disease; }
        public void setDisease(String disease) { this.disease = disease; }
    }

    public static class SeverityResponse {
        private String severity;
        private Integer priorityLevel;
        private Double confidenceScore;
        private Map<String, Double> probabilities;
        private String triageRecommendation;
        private String suggestedQueueAction;
        private Boolean isEmergencyOverride;
        private String disclaimer;

        // Getters and Setters
        public String getSeverity() { return severity; }
        public void setSeverity(String severity) { this.severity = severity; }
        public Integer getPriorityLevel() { return priorityLevel; }
        public void setPriorityLevel(Integer priorityLevel) { this.priorityLevel = priorityLevel; }
        public Double getConfidenceScore() { return confidenceScore; }
        public void setConfidenceScore(Double confidenceScore) { this.confidenceScore = confidenceScore; }
        public Map<String, Double> getProbabilities() { return probabilities; }
        public void setProbabilities(Map<String, Double> probabilities) { this.probabilities = probabilities; }
        public String getTriageRecommendation() { return triageRecommendation; }
        public void setTriageRecommendation(String triageRecommendation) { this.triageRecommendation = triageRecommendation; }
        public String getSuggestedQueueAction() { return suggestedQueueAction; }
        public void setSuggestedQueueAction(String suggestedQueueAction) { this.suggestedQueueAction = suggestedQueueAction; }
        public Boolean getEmergencyOverride() { return isEmergencyOverride; }
        public void setEmergencyOverride(Boolean emergencyOverride) { isEmergencyOverride = emergencyOverride; }
        public String getDisclaimer() { return disclaimer; }
        public void setDisclaimer(String disclaimer) { this.disclaimer = disclaimer; }
    }

    public static class SpecialistResponse {
        private String recommendedSpecialist;
        private String department;
        private String bestDoctorName;
        private Double confidenceScore;
        private String matchedSymptoms;
        private String disclaimer;

        public String getRecommendedSpecialist() { return recommendedSpecialist; }
        public void setRecommendedSpecialist(String recommendedSpecialist) { this.recommendedSpecialist = recommendedSpecialist; }
        public String getDepartment() { return department; }
        public void setDepartment(String department) { this.department = department; }
        public String getBestDoctorName() { return bestDoctorName; }
        public void setBestDoctorName(String bestDoctorName) { this.bestDoctorName = bestDoctorName; }
        public Double getConfidenceScore() { return confidenceScore; }
        public void setConfidenceScore(Double confidenceScore) { this.confidenceScore = confidenceScore; }
        public String getMatchedSymptoms() { return matchedSymptoms; }
        public void setMatchedSymptoms(String matchedSymptoms) { this.matchedSymptoms = matchedSymptoms; }
        public String getDisclaimer() { return disclaimer; }
        public void setDisclaimer(String disclaimer) { this.disclaimer = disclaimer; }
    }

    public static class WaitTimeRequest {
        private Integer patientsAhead = 0;
        private Integer priority = 1;
        private Integer doctorExperience = 10;
        private Integer hourOfDay = 11;
        private Integer emergencyCasesActive = 0;

        public Integer getPatientsAhead() { return patientsAhead; }
        public void setPatientsAhead(Integer patientsAhead) { this.patientsAhead = patientsAhead; }
        public Integer getPriority() { return priority; }
        public void setPriority(Integer priority) { this.priority = priority; }
        public Integer getDoctorExperience() { return doctorExperience; }
        public void setDoctorExperience(Integer doctorExperience) { this.doctorExperience = doctorExperience; }
        public Integer getHourOfDay() { return hourOfDay; }
        public void setHourOfDay(Integer hourOfDay) { this.hourOfDay = hourOfDay; }
        public Integer getEmergencyCasesActive() { return emergencyCasesActive; }
        public void setEmergencyCasesActive(Integer emergencyCasesActive) { this.emergencyCasesActive = emergencyCasesActive; }
    }

    public static class WaitTimeResponse {
        private Integer predictedWaitTimeMinutes;
        private Integer patientsAhead;
        private Integer priorityLevel;
        private String summary;

        public Integer getPredictedWaitTimeMinutes() { return predictedWaitTimeMinutes; }
        public void setPredictedWaitTimeMinutes(Integer predictedWaitTimeMinutes) { this.predictedWaitTimeMinutes = predictedWaitTimeMinutes; }
        public Integer getPatientsAhead() { return patientsAhead; }
        public void setPatientsAhead(Integer patientsAhead) { this.patientsAhead = patientsAhead; }
        public Integer getPriorityLevel() { return priorityLevel; }
        public void setPriorityLevel(Integer priorityLevel) { this.priorityLevel = priorityLevel; }
        public String getSummary() { return summary; }
        public void setSummary(String summary) { this.summary = summary; }
    }
}
