package com.hospital.management.exception;

public class AppointmentConflictException extends DuplicateAppointmentException {
    public AppointmentConflictException(String message) {
        super(message);
    }
}
