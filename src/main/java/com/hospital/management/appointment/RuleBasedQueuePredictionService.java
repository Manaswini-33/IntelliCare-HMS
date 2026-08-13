package com.hospital.management.appointment;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

/**
 * Rule-Based implementation of QueuePredictionService.
 * Note: Machine Learning integration is planned as a future enhancement.
 */
@Service
@Primary
public class RuleBasedQueuePredictionService implements QueuePredictionService {

    private static final int AVERAGE_CONSULTATION_MINUTES = 15;
    private final AppointmentRepository appointmentRepository;

    @Autowired
    public RuleBasedQueuePredictionService(AppointmentRepository appointmentRepository) {
        this.appointmentRepository = appointmentRepository;
    }

    @Override
    public QueuePredictionResult calculateQueueAndWaitingTime(Long doctorId, LocalDate appointmentDate, Integer priority) {
        List<AppointmentStatus> activeStatuses = Arrays.asList(AppointmentStatus.BOOKED, AppointmentStatus.CONFIRMED, AppointmentStatus.IN_PROGRESS);
        long patientsAhead = appointmentRepository.countByDoctorDoctorIdAndAppointmentDateAndStatusIn(doctorId, appointmentDate, activeStatuses);

        int queuePosition = (int) patientsAhead + 1;
        int waitTime = (int) patientsAhead * AVERAGE_CONSULTATION_MINUTES;

        if (priority != null && priority > 1) {
            waitTime = Math.max(0, waitTime / priority);
        }

        return new QueuePredictionResult(queuePosition, waitTime);
    }
}
