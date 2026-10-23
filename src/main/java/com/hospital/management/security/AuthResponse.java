package com.hospital.management.security;

public class AuthResponse {

    private String token;
    private String username;
    private String role;
    private Long userId;
    private Long doctorId;
    private Long patientId;
    private String name;
    private String specialization;
    private String department;
    private String roomNumber;

    public AuthResponse() {
    }

    public AuthResponse(String token, String username, String role) {
        this.token = token;
        this.username = username;
        this.role = role;
    }

    public AuthResponse(String token, String username, String role, Long userId, Long doctorId, Long patientId) {
        this.token = token;
        this.username = username;
        this.role = role;
        this.userId = userId;
        this.doctorId = doctorId;
        this.patientId = patientId;
    }

    public AuthResponse(String token, String username, String role, Long userId, Long doctorId, Long patientId, String name, String specialization, String department, String roomNumber) {
        this.token = token;
        this.username = username;
        this.role = role;
        this.userId = userId;
        this.doctorId = doctorId;
        this.patientId = patientId;
        this.name = name;
        this.specialization = specialization;
        this.department = department;
        this.roomNumber = roomNumber;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(Long doctorId) {
        this.doctorId = doctorId;
    }

    public Long getPatientId() {
        return patientId;
    }

    public void setPatientId(Long patientId) {
        this.patientId = patientId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSpecialization() {
        return specialization;
    }

    public void setSpecialization(String specialization) {
        this.specialization = specialization;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getRoomNumber() {
        return roomNumber;
    }

    public void setRoomNumber(String roomNumber) {
        this.roomNumber = roomNumber;
    }

    private String phone;

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }
}
