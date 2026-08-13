package com.hospital.management.exception;

public class DuplicateAppointmentException extends ConflictException {
    public DuplicateAppointmentException(String message) {
        super(message);
    }
}
