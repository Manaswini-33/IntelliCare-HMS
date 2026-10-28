package com.hospital.management.security;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    boolean existsByUsername(String username);
    Optional<User> findByPatientId(Long patientId);
    Optional<User> findByEmployeeId(Long employeeId);
    Optional<User> findByRoleAndEmployeeId(Role role, Long employeeId);
    List<User> findByRole(Role role);
}
