package com.hospital.management.employee;

import com.hospital.management.common.ApiResponse;
import com.hospital.management.doctor.Doctor;
import com.hospital.management.doctor.DoctorRepository;
import com.hospital.management.security.Role;
import com.hospital.management.security.User;
import com.hospital.management.security.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/staff")
@PreAuthorize("hasRole('ADMIN')")
public class StaffController {

    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public StaffController(UserRepository userRepository, DoctorRepository doctorRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.doctorRepository = doctorRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<StaffDTO>>> getAllStaff(@RequestParam(required = false) String role) {
        List<User> users = userRepository.findAll();
        Map<Long, Doctor> doctorMap = doctorRepository.findAll().stream()
                .collect(Collectors.toMap(Doctor::getDoctorId, d -> d, (a, b) -> a));

        List<StaffDTO> staffList = new ArrayList<>();
        for (User u : users) {
            if (u.getRole() == Role.PATIENT) {
                continue; // Only hospital staff
            }
            if (role != null && !role.trim().isEmpty() && !u.getRole().name().equalsIgnoreCase(role.trim())) {
                continue;
            }

            String name = u.getUsername();
            String dept = "Hospital Administration";
            if (u.getEmployeeId() != null && doctorMap.containsKey(u.getEmployeeId())) {
                Doctor doc = doctorMap.get(u.getEmployeeId());
                name = doc.getName();
                dept = doc.getDepartment();
            } else if (u.getRole() == Role.LAB_TECHNICIAN) {
                dept = "Diagnostic Pathology & Imaging";
            } else if (u.getRole() == Role.PHARMACIST) {
                dept = "Clinical Pharmacy & Dispensary";
            } else if (u.getRole() == Role.RECEPTIONIST) {
                dept = "Front Desk & OPD Registration";
            }

            StaffDTO dto = new StaffDTO(
                    u.getUserId(),
                    u.getUsername(),
                    name,
                    u.getEmail(),
                    u.getRole().name(),
                    dept,
                    u.getEmployeeId(),
                    u.isEnabled()
            );
            staffList.add(dto);
        }

        return ResponseEntity.ok(ApiResponse.success("Staff members retrieved successfully", staffList));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<StaffDTO>> createStaffMember(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password") != null ? body.get("password") : "password123";
        String email = body.get("email");
        String roleStr = body.get("role");

        if (username == null || username.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Username / ID is required"));
        }
        if (roleStr == null || roleStr.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Role is required"));
        }
        if (userRepository.existsByUsername(username.trim())) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Staff member with username '" + username + "' already exists"));
        }

        Role role = Role.valueOf(roleStr.trim().toUpperCase());
        User user = new User();
        user.setUsername(username.trim());
        user.setPassword(passwordEncoder.encode(password));
        user.setEmail(email != null ? email.trim() : username.trim() + "@intellicare.com");
        user.setRole(role);
        user.setEnabled(true);

        User saved = userRepository.save(user);

        StaffDTO dto = new StaffDTO(
                saved.getUserId(),
                saved.getUsername(),
                saved.getUsername(),
                saved.getEmail(),
                saved.getRole().name(),
                role.name().replace("_", " "),
                null,
                saved.isEnabled()
        );

        return new ResponseEntity<>(ApiResponse.success("Staff account created successfully", dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<StaffDTO>> toggleStaffStatus(@PathVariable Long id, @RequestParam boolean enabled) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        user.setEnabled(enabled);
        User saved = userRepository.save(user);

        StaffDTO dto = new StaffDTO(
                saved.getUserId(),
                saved.getUsername(),
                saved.getUsername(),
                saved.getEmail(),
                saved.getRole().name(),
                saved.getRole().name(),
                saved.getEmployeeId(),
                saved.isEnabled()
        );
        return ResponseEntity.ok(ApiResponse.success("Staff status updated successfully", dto));
    }
}
