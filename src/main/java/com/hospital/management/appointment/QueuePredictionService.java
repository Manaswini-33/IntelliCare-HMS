package com.hospital.management.appointment;

import java.time.LocalDate;

/**
 * Strategy interface for Appointment Queue & Wait-Time Prediction.
 * Extension point: Allows Rule-Based or future Machine Learning implementations.
 */
public interface QueuePredictionService {

    QueuePredictionResult calculateQueueAndWaitingTime(Long doctorId, LocalDate appointmentDate, Integer priority);

    class QueuePredictionResult {
        private final int queuePosition;
        private final int estimatedWaitingTimeMinutes;

        public QueuePredictionResult(int queuePosition, int estimatedWaitingTimeMinutes) {
            this.queuePosition = queuePosition;
            this.estimatedWaitingTimeMinutes = estimatedWaitingTimeMinutes;
        }

        public int getQueuePosition() {
            return queuePosition;
        }

        public int getEstimatedWaitingTimeMinutes() {
            return estimatedWaitingTimeMinutes;
        }
    }
}
