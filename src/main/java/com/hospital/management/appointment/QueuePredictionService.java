package com.hospital.management.appointment;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

/**
 * Rule-Based Smart Queue Prediction Service.
 * Note: Machine Learning is a future enhancement.
 * Currently uses rule-based priority logic and queue metrics.
 */
@Service
public class QueuePredictionService {

    private static final int AVERAGE_CONSULTATION_MINUTES = 15;
    private final AppointmentRepository appointmentRepository;

    @Autowired
    public QueuePredictionService(AppointmentRepository appointmentRepository) {
        this.appointmentRepository = appointmentRepository;
    }

    public QueuePredictionResult calculateQueueAndWaitingTime(Long doctorId, LocalDate appointmentDate, Integer priority) {
        List<AppointmentStatus> activeStatuses = Arrays.asList(AppointmentStatus.BOOKED, AppointmentStatus.WAITING, AppointmentStatus.IN_PROGRESS);
        long patientsAhead = appointmentRepository.countByDoctorDoctorIdAndAppointmentDateAndStatusIn(doctorId, appointmentDate, activeStatuses);

        int queuePosition = (int) patientsAhead + 1;
        int waitTime = (int) patientsAhead * AVERAGE_CONSULTATION_MINUTES;

        // If priority is higher (e.g., URGENT = 2, EMERGENCY = 3), reduce estimated waiting time proportionally
        if (priority != null && priority > 1) {
            waitTime = Math.max(0, waitTime / priority);
        }

        return new QueuePredictionResult(queuePosition, waitTime);
    }

    public static class QueuePredictionResult {
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
