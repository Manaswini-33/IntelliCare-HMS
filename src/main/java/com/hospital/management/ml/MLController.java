package com.hospital.management.ml;

import com.hospital.management.common.ApiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/ml")
public class MLController {

    private final MLIntegrationService mlIntegrationService;

    @Autowired
    public MLController(MLIntegrationService mlIntegrationService) {
        this.mlIntegrationService = mlIntegrationService;
    }

    @GetMapping("/status")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStatus() {
        boolean available = mlIntegrationService.isMLServiceAvailable();
        Map<String, Object> status = new HashMap<>();
        status.put("mlServiceOnline", available);
        status.put("primaryEngine", available ? "Python FastAPI Scikit-Learn Microservice (:8000)" : "Spring Boot Fallback Engine");
        status.put("models", Map.of(
                "emergencySeverityTriage", "Random Forest Classifier (5000 records)",
                "specialistRecommendation", "TF-IDF + Logistic Regression",
                "queueWaitTime", "Random Forest Regressor"
        ));
        return ResponseEntity.ok(ApiResponse.success("ML Service Status", status));
    }

    @PostMapping("/predict-severity")
    public ResponseEntity<ApiResponse<MLIntegrationService.SeverityResponse>> predictSeverity(
            @RequestBody MLIntegrationService.SeverityRequest request) {
        MLIntegrationService.SeverityResponse response = mlIntegrationService.predictSeverity(request);
        return ResponseEntity.ok(ApiResponse.success("AI Severity & Emergency Triage Evaluation Complete", response));
    }

    @PostMapping("/recommend-specialist")
    public ResponseEntity<ApiResponse<MLIntegrationService.SpecialistResponse>> recommendSpecialist(
            @RequestParam(required = false) String symptoms,
            @RequestBody(required = false) Map<String, String> body) {
        String symptomsText = symptoms;
        if ((symptomsText == null || symptomsText.isEmpty()) && body != null && body.containsKey("symptoms")) {
            symptomsText = body.get("symptoms");
        }
        if (symptomsText == null) {
            symptomsText = "";
        }

        MLIntegrationService.SpecialistResponse response = mlIntegrationService.recommendSpecialist(symptomsText);
        return ResponseEntity.ok(ApiResponse.success("AI Specialist Recommendation Complete", response));
    }

    @PostMapping("/predict-wait-time")
    public ResponseEntity<ApiResponse<MLIntegrationService.WaitTimeResponse>> predictWaitTime(
            @RequestBody MLIntegrationService.WaitTimeRequest request) {
        MLIntegrationService.WaitTimeResponse response = mlIntegrationService.predictWaitTime(request);
        return ResponseEntity.ok(ApiResponse.success("AI Waiting Time Estimation Complete", response));
    }
}
