package com.hospital.management.security;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class PatientMobileAuthDTO {

    public static class CheckPhoneRequest {
        @NotBlank(message = "Phone number is required")
        @Pattern(regexp = "^[0-9]{10,15}$", message = "Phone number must be between 10 and 15 digits")
        private String phone;

        public CheckPhoneRequest() {}
        public CheckPhoneRequest(String phone) { this.phone = phone; }

        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
    }

    public static class VerifyOtpRequest {
        @NotBlank(message = "Phone number is required")
        private String phone;

        @NotBlank(message = "Verification code is required")
        private String code;

        public VerifyOtpRequest() {}
        public VerifyOtpRequest(String phone, String code) {
            this.phone = phone;
            this.code = code;
        }

        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }

        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }
    }

    public static class MobileRegisterRequest {
        @NotBlank(message = "Phone number is required")
        private String phone;

        @NotBlank(message = "Verification code is required")
        private String code;

        @NotBlank(message = "Full name is required")
        private String name;

        private Integer age;
        private String gender;
        private String email;
        private String address;
        private String bloodGroup;
        private String allergies;

        public MobileRegisterRequest() {}

        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }

        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public Integer getAge() { return age; }
        public void setAge(Integer age) { this.age = age; }

        public String getGender() { return gender; }
        public void setGender(String gender) { this.gender = gender; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }

        public String getBloodGroup() { return bloodGroup; }
        public void setBloodGroup(String bloodGroup) { this.bloodGroup = bloodGroup; }

        public String getAllergies() { return allergies; }
        public void setAllergies(String allergies) { this.allergies = allergies; }
    }

    public static class PhoneCheckResponse {
        private String phone;
        private boolean isRegistered;
        private String patientName;
        private Long patientId;
        private String devCode;
        private String devNotice;

        public PhoneCheckResponse() {}

        public PhoneCheckResponse(String phone, boolean isRegistered, String patientName, Long patientId, String devCode, String devNotice) {
            this.phone = phone;
            this.isRegistered = isRegistered;
            this.patientName = patientName;
            this.patientId = patientId;
            this.devCode = devCode;
            this.devNotice = devNotice;
        }

        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }

        public boolean isRegistered() { return isRegistered; }
        public void setRegistered(boolean registered) { isRegistered = registered; }

        public String getPatientName() { return patientName; }
        public void setPatientName(String patientName) { this.patientName = patientName; }

        public Long getPatientId() { return patientId; }
        public void setPatientId(Long patientId) { this.patientId = patientId; }

        public String getDevCode() { return devCode; }
        public void setDevCode(String devCode) { this.devCode = devCode; }

        public String getDevNotice() { return devNotice; }
        public void setDevNotice(String devNotice) { this.devNotice = devNotice; }
    }
}
