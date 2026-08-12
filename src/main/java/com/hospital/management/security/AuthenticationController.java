package com.hospital.management.security;

import com.hospital.management.common.ApiResponse;
import com.hospital.management.exception.UnauthorizedException;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthenticationController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Autowired
    public AuthenticationController(UserRepository userRepository,
                                    PasswordEncoder passwordEncoder,
                                    JwtService jwtService,
                                    AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            return new ResponseEntity<>(
                    ApiResponse.error("Username '" + request.getUsername() + "' is already taken"),
                    HttpStatus.BAD_REQUEST
            );
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEmail(request.getEmail());
        user.setRole(request.getRole() != null ? request.getRole() : Role.PATIENT);

        userRepository.save(user);

        String token = jwtService.generateToken(user.getUsername(), user.getRole().name());
        AuthResponse response = new AuthResponse(token, user.getUsername(), user.getRole().name());

        return new ResponseEntity<>(
                ApiResponse.success("User registered successfully", response),
                HttpStatus.CREATED
        );
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody AuthRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );

            User user = userRepository.findByUsername(request.getUsername())
                    .orElseThrow(() -> new UnauthorizedException("User not found"));

            String token = jwtService.generateToken(user.getUsername(), user.getRole().name());
            AuthResponse response = new AuthResponse(token, user.getUsername(), user.getRole().name());

            return ResponseEntity.ok(ApiResponse.success("Authentication successful", response));
        } catch (Exception e) {
            throw new UnauthorizedException("Invalid username or password");
        }
    }
}
