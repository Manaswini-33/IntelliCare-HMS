package com.hospital.management.doctor;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public class DoctorDTO {

    private Long doctorId;

    @NotBlank(message = "Doctor name is required")
    private String name;

    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Phone number is required")
    private String phone;

    @NotBlank(message = "Specialization is required")
    private String specialization;

    @NotBlank(message = "Department is required")
    private String department;

    @Min(value = 0, message = "Experience must be non-negative")
    private Integer experience;

    private String availability;

    private String roomNumber;

    private String qualification;

    private Double rating;

    private Integer dailyCapacity = 10;
    private Integer currentBookedCount = 0;
    private Boolean isFull = false;

    public DoctorDTO() {
    }

    public DoctorDTO(Long doctorId, String name, String email, String phone, String specialization, String department, Integer experience, String availability) {
        this.doctorId = doctorId;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.specialization = specialization;
        this.department = department;
        this.experience = experience;
        this.availability = availability;
    }

    public DoctorDTO(Long doctorId, String name, String email, String phone, String specialization, String department, Integer experience, String availability, String roomNumber, String qualification, Double rating) {
        this.doctorId = doctorId;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.specialization = specialization;
        this.department = department;
        this.experience = experience;
        this.availability = availability;
        this.roomNumber = roomNumber;
        this.qualification = qualification;
        this.rating = rating;
    }

    public Long getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(Long doctorId) {
        this.doctorId = doctorId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
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

    public Integer getExperience() {
        return experience;
    }

    public void setExperience(Integer experience) {
        this.experience = experience;
    }

    public String getAvailability() {
        return availability;
    }

    public void setAvailability(String availability) {
        this.availability = availability;
    }

    public String getRoomNumber() {
        return roomNumber;
    }

    public void setRoomNumber(String roomNumber) {
        this.roomNumber = roomNumber;
    }

    public String getQualification() {
        return qualification;
    }

    public void setQualification(String qualification) {
        this.qualification = qualification;
    }

    public Double getRating() {
        return rating;
    }

    public void setRating(Double rating) {
        this.rating = rating;
    }

    public Integer getDailyCapacity() {
        return dailyCapacity != null ? dailyCapacity : 10;
    }

    public void setDailyCapacity(Integer dailyCapacity) {
        this.dailyCapacity = dailyCapacity;
    }

    public Integer getCurrentBookedCount() {
        return currentBookedCount != null ? currentBookedCount : 0;
    }

    public void setCurrentBookedCount(Integer currentBookedCount) {
        this.currentBookedCount = currentBookedCount;
    }

    public Boolean getIsFull() {
        return isFull != null ? isFull : false;
    }

    public void setIsFull(Boolean isFull) {
        this.isFull = isFull;
    }
}
