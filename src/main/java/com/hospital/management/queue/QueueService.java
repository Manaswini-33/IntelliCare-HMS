package com.hospital.management.queue;

import com.hospital.management.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class QueueService {

    private final QueueEntryRepository queueEntryRepository;

    public QueueService(QueueEntryRepository queueEntryRepository) {
        this.queueEntryRepository = queueEntryRepository;
    }

    public List<QueueEntryDTO> getWaitingQueue() {
        return queueEntryRepository.findByQueueStatusOrderByPriorityDescCreatedAtAsc(QueueStatus.WAITING)
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public List<QueueEntryDTO> getDoctorQueue(Long doctorId) {
        return queueEntryRepository.findByDoctorDoctorIdAndQueueStatusOrderByPriorityDescCreatedAtAsc(doctorId, QueueStatus.WAITING)
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public List<QueueEntryDTO> getPatientQueue(Long patientId) {
        return queueEntryRepository.findByPatientPatientIdOrderByCreatedAtDesc(patientId)
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Transactional
    public QueueEntryDTO callNext(Long doctorId) {
        List<QueueEntry> waiting = queueEntryRepository
                .findByDoctorDoctorIdAndQueueStatusOrderByPriorityDescCreatedAtAsc(doctorId, QueueStatus.WAITING);
        if (waiting.isEmpty()) {
            throw new ResourceNotFoundException("No waiting patients for this doctor");
        }
        QueueEntry next = waiting.get(0);
        next.setQueueStatus(QueueStatus.CALLED);
        next.setCalledAt(LocalDateTime.now());
        return mapToDTO(queueEntryRepository.save(next));
    }

    public QueueEntryDTO mapToDTO(QueueEntry entity) {
        QueueEntryDTO dto = new QueueEntryDTO();
        dto.setQueueEntryId(entity.getQueueEntryId());
        dto.setTokenNumber(entity.getTokenNumber());
        dto.setAppointmentId(entity.getAppointment().getAppointmentId());
        dto.setPatientId(entity.getPatient().getPatientId());
        dto.setPatientName(entity.getPatient().getName());
        dto.setDoctorId(entity.getDoctor().getDoctorId());
        dto.setDoctorName(entity.getDoctor().getName());
        dto.setSeverity(entity.getSeverity());
        dto.setPriority(entity.getPriority());
        dto.setQueueStatus(entity.getQueueStatus());
        dto.setEstimatedWaitingMinutes(entity.getEstimatedWaitingMinutes());
        dto.setCreatedAt(entity.getCreatedAt());
        return dto;
    }
}
