package com.hospital.management.security;

import com.hospital.management.exception.ForbiddenOperationException;
import com.hospital.management.exception.UnauthorizedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class AccessGuard {

    private final UserRepository userRepository;

    public AccessGuard(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User currentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new UnauthorizedException("Authentication required");
        }
        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UnauthorizedException("Authenticated user not found"));
    }

    public boolean hasRole(String role) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            return false;
        }
        String expected = role.startsWith("ROLE_") ? role : "ROLE_" + role;
        for (GrantedAuthority authority : authentication.getAuthorities()) {
            if (expected.equals(authority.getAuthority())) {
                return true;
            }
        }
        return false;
    }

    public void assertPatientOwns(Long patientId) {
        if (!hasRole("PATIENT")) {
            return;
        }
        User user = currentUser();
        if (user.getPatientId() == null || !user.getPatientId().equals(patientId)) {
            throw new ForbiddenOperationException("Patients may only access their own records");
        }
    }

    public Long currentPatientIdOrNull() {
        if (!hasRole("PATIENT")) {
            return null;
        }
        return currentUser().getPatientId();
    }
}
