package com.travelplanner.backend.auth.service;

import com.travelplanner.backend.auth.config.JwtService;
import com.travelplanner.backend.auth.dto.AuthTokenResponse;
import com.travelplanner.backend.auth.dto.LoginRequest;
import com.travelplanner.backend.auth.dto.SignupRequest;
import com.travelplanner.backend.auth.model.UserEntity;
import com.travelplanner.backend.auth.repository.UserRepository;
import com.travelplanner.backend.common.api.ResultCode;
import com.travelplanner.backend.common.exception.BusinessException;
import java.util.UUID;
import java.util.regex.Pattern;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final Pattern PASSWORD_PATTERN =
            Pattern.compile("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z\\d]).{8,20}$");

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final JdbcTemplate jdbcTemplate;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public AuthTokenResponse login(LoginRequest request) {
        String normalizedEmail = normalizeEmail(request.email());

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(normalizedEmail, request.password()));
        } catch (AuthenticationException e) {
            throw new BusinessException(ResultCode.UNAUTHORIZED, "Invalid email or password.");
        }

        UserEntity user =
                userRepository
                        .findByEmail(normalizedEmail)
                        .orElseThrow(
                                () ->
                                        new BusinessException(
                                                ResultCode.UNAUTHORIZED,
                                                "Invalid email or password."));

        return new AuthTokenResponse(jwtService.generateToken(user.getEmail()));
    }

    @Transactional
    public AuthTokenResponse signup(SignupRequest request) {
        String normalizedUserName = normalizeUserName(request.username());
        String normalizedEmail = normalizeEmail(request.email());
        String normalizedPassword = request.password().trim();

        if (!PASSWORD_PATTERN.matcher(normalizedPassword).matches()) {
            throw new BusinessException(
                    ResultCode.PARAM_INVALID,
                    "Password must be 8-20 characters and include uppercase, lowercase, number, and special character.");
        }

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "Email already exists.");
        }

        if (userRepository.existsByUserName(normalizedUserName)) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "Username already exists.");
        }

        UserEntity user =
                new UserEntity(
                        UUID.randomUUID(),
                        normalizedUserName,
                        normalizedEmail,
                        passwordEncoder.encode(normalizedPassword));
        insertUser(user);
        return new AuthTokenResponse(jwtService.generateToken(user.getEmail()));
    }

    public void logout() {}

    private void insertUser(UserEntity user) {
        jdbcTemplate.update(
                "INSERT INTO app_user (user_id, user_name, email, password_hash) VALUES (?, ?, ?, ?)",
                user.getUserId(),
                user.getUserName(),
                user.getEmail(),
                user.getPasswordHash());
    }

    private String normalizeUserName(String userName) {
        return userName.trim();
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase();
    }
}
