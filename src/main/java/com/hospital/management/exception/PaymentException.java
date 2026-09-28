package com.hospital.management.exception;

public class PaymentException extends BadRequestException {
    public PaymentException(String message) {
        super(message);
    }
}
