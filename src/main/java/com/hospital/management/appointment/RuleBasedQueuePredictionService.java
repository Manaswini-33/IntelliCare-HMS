package com.hospital.management.appointment;

import com.hospital.management.ml.MLIntegrationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;

/**
 * Enhanced QueuePredictionService with Python ML regressor integration and rule-based fallback.
 */
@Service
@Primary
public class RuleBasedQueuePredictionService implements QueuePredictionService {

    private static final int AVERAGE_CONSULTATION_MINUTES = 15;
    private final AppointmentRepository appointmentRepository;
    private final MLIntegrationService mlIntegrationService;

    @Autowired
    public RuleBasedQueuePredictionService(AppointmentRepository appointmentRepository,
                                           MLIntegrationService mlIntegrationService) {
        this.appointmentRepository = appointmentRepository;
        this.mlIntegrationService = mlIntegrationService;
    }

    @Override
    public QueuePredictionResult calculateQueueAndWaitingTime(Long doctorId, LocalDate appointmentDate, Integer priority) {
        List<AppointmentStatus> activeStatuses = Arrays.asList(
                AppointmentStatus.BOOKED,
                AppointmentStatus.SCHEDULED,
                AppointmentStatus.CONFIRMED,
                AppointmentStatus.CHECKED_IN,
                AppointmentStatus.IN_QUEUE,
                AppointmentStatus.IN_PROGRESS,
                AppointmentStatus.IN_CONSULTATION
        );
        long patientsAhead = appointmentRepository.countByDoctorDoctorIdAndAppointmentDateAndStatusIn(doctorId, appointmentDate, activeStatuses);

        int queuePosition = (int) patientsAhead + 1;
        int waitTime = (int) patientsAhead * AVERAGE_CONSULTATION_MINUTES;

        try {
            MLIntegrationService.WaitTimeRequest mlReq = new MLIntegrationService.WaitTimeRequest();
            mlReq.setPatientsAhead((int) patientsAhead);
            mlReq.setPriority(priority != null ? priority : 1);
            mlReq.setHourOfDay(LocalTime.now().getHour());
            mlReq.setDoctorExperience(12);

            MLIntegrationService.WaitTimeResponse mlRes = mlIntegrationService.predictWaitTime(mlReq);
            if (mlRes != null && mlRes.getPredictedWaitTimeMinutes() != null) {
                waitTime = mlRes.getPredictedWaitTimeMinutes();
            }
        } catch (Exception ex) {
            if (priority != null && priority > 1) {
                waitTime = Math.max(0, waitTime / priority);
            }
        }

        return new QueuePredictionResult(queuePosition, waitTime);
    }
}
