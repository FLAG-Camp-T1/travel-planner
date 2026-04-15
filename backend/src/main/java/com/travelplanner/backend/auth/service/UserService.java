package com.travelplanner.backend.auth.service;

import com.travelplanner.backend.auth.repository.UserRepository;
import java.util.UUID;
import java.util.regex.Pattern;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final JdbcTemplate jdbcTemplate;
    private final PasswordEncoder passwordEncoder =
            PasswordEncoderFactories.createDelegatingPasswordEncoder();
    private static final Pattern PASSWORD_PATTERN =
            Pattern.compile("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z\\d]).{8,20}$");

    public UserService(UserRepository userRepository, JdbcTemplate jdbcTemplate) {
        this.userRepository = userRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    public void signUp(String userName, String email, String password) {
        if (userName == null || userName.isBlank()) {
            throw new IllegalArgumentException("Username cannot be empty.");
        }

        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Email cannot be empty.");
        }

        if (password == null || password.isBlank()) {
            throw new IllegalArgumentException("Password cannot be empty.");
        }

        if (!PASSWORD_PATTERN.matcher(password).matches()) {
            throw new IllegalArgumentException(
                    "Password must be 8-20 characters and include uppercase, lowercase, number, and special character.");
        }

        String normalizedEmail = email.trim().toLowerCase();
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new IllegalArgumentException("Email already exists.");
        }

        if (userRepository.existsByUserName(userName)) {
            throw new IllegalArgumentException("Username already exists.");
        }

        UUID userId = UUID.randomUUID();
        String passwordHash = passwordEncoder.encode(password);
        jdbcTemplate.update(
                "INSERT INTO app_user (user_id, user_name, email, password_hash) VALUES (?, ?, ?, ?)",
                userId,
                userName,
                normalizedEmail,
                passwordHash);
    }
}
