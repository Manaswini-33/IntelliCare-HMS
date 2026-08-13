package com.hospital.management.emergency;

/**
 * Strategy interface for Emergency Priority Evaluation.
 * Extension point: Allows Rule-Based or future Machine Learning implementations.
 */
public interface EmergencyPriorityService {
    int calculatePriority(String severity);
}
