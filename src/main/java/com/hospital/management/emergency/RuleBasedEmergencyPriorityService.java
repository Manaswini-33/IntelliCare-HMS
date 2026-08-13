package com.hospital.management.emergency;

import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

/**
 * Rule-Based implementation of EmergencyPriorityService.
 * Note: Machine Learning integration is planned as a future enhancement.
 */
@Service
@Primary
public class RuleBasedEmergencyPriorityService implements EmergencyPriorityService {

    @Override
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
