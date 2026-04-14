package com.travelplanner.backend.auth.service;

import com.travelplanner.backend.auth.config.JwtService;
import com.travelplanner.backend.auth.dto.AuthResponse;
import com.travelplanner.backend.auth.dto.LoginRequest;
import com.travelplanner.backend.auth.model.UserEntity;
import com.travelplanner.backend.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;

    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(normalizedEmail, request.getPassword()));

        UserEntity user = userRepository.findByEmail(normalizedEmail);
        if (user == null) {
            throw new RuntimeException("User not found");
        }

        String token = jwtService.generateToken(user.getEmail());
        return new AuthResponse(token);
    }
}
