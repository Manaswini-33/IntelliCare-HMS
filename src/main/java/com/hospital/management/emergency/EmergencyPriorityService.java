package com.hospital.management.emergency;

import org.springframework.stereotype.Service;

/**
 * Rule-Based Emergency Priority Service.
 * Note: Machine Learning is a future enhancement.
 * Currently maps severity strings (LOW, MEDIUM, HIGH, CRITICAL) to numeric priorities.
 */
@Service
public class EmergencyPriorityService {

    public int calculatePriority(String severity) {
        if (severity == null) {
            return 1;
        }

        switch (severity.trim().toUpperCase()) {
            case "CRITICAL":
                return 4;
            case "HIGH":
                return 3;
            case "MEDIUM":
                return 2;
            case "LOW":
            default:
                return 1;
        }
    }
}
