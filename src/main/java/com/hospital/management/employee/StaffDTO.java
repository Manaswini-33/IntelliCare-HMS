package com.hospital.management.employee;

public class StaffDTO {
    private Long userId;
    private String username;
    private String name;
    private String email;
    private String role;
    private String department;
    private Long doctorId;
    private boolean enabled = true;

    public StaffDTO() {}

    public StaffDTO(Long userId, String username, String name, String email, String role, String department, Long doctorId, boolean enabled) {
        this.userId = userId;
        this.username = username;
        this.name = name;
        this.email = email;
        this.role = role;
        this.department = department;
        this.doctorId = doctorId;
        this.enabled = enabled;
    }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public Long getDoctorId() { return doctorId; }
    public void setDoctorId(Long doctorId) { this.doctorId = doctorId; }
    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }
}
