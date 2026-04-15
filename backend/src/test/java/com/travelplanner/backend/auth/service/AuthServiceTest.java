package com.travelplanner.backend.auth.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.travelplanner.backend.auth.config.JwtService;
import com.travelplanner.backend.auth.dto.AuthTokenResponse;
import com.travelplanner.backend.auth.dto.LoginRequest;
import com.travelplanner.backend.auth.dto.SignupRequest;
import com.travelplanner.backend.auth.model.UserEntity;
import com.travelplanner.backend.auth.repository.UserRepository;
import com.travelplanner.backend.common.api.ResultCode;
import com.travelplanner.backend.common.exception.BusinessException;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    private static final UUID USER_ID = UUID.fromString("00000000-0000-0000-0000-000000000001");

    @Mock private AuthenticationManager authenticationManager;
    @Mock private JwtService jwtService;
    @Mock private UserRepository userRepository;
    @Mock private JdbcTemplate jdbcTemplate;
    @Mock private PasswordEncoder passwordEncoder;

    @InjectMocks private AuthService authService;

    @Test
    void login_ReturnsTokenForNormalizedEmail() {
        UserEntity user =
                new UserEntity(USER_ID, "traveler01", "traveler@example.com", "{bcrypt}hash");
        when(userRepository.findByEmail("traveler@example.com")).thenReturn(Optional.of(user));
        when(jwtService.generateToken("traveler@example.com")).thenReturn("jwt-token");

        AuthTokenResponse response =
                authService.login(new LoginRequest(" Traveler@Example.com ", "Travel123!"));

        assertEquals("jwt-token", response.token());
        verify(authenticationManager).authenticate(any());
        verify(userRepository).findByEmail("traveler@example.com");
    }

    @Test
    void login_WhenCredentialsAreInvalid_ThrowsBusinessException() {
        when(authenticationManager.authenticate(any()))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        BusinessException exception =
                assertThrows(
                        BusinessException.class,
                        () -> authService.login(new LoginRequest("traveler@example.com", "wrong")));

        assertEquals(ResultCode.UNAUTHORIZED, exception.getResultCode());
        assertEquals("Invalid email or password.", exception.getMessage());
    }

    @Test
    void signup_CreatesUserAndReturnsToken() {
        when(userRepository.existsByEmail("traveler@example.com")).thenReturn(false);
        when(userRepository.existsByUserName("traveler01")).thenReturn(false);
        when(passwordEncoder.encode("Travel123!")).thenReturn("{bcrypt}hash");
        when(jwtService.generateToken("traveler@example.com")).thenReturn("signup-token");

        AuthTokenResponse response =
                authService.signup(
                        new SignupRequest(" traveler01 ", "Traveler@Example.com ", "Travel123!"));

        assertEquals("signup-token", response.token());
        verify(jdbcTemplate)
                .update(
                        eq(
                                "INSERT INTO app_user (user_id, user_name, email, password_hash) VALUES (?, ?, ?, ?)"),
                        any(),
                        eq("traveler01"),
                        eq("traveler@example.com"),
                        eq("{bcrypt}hash"));
    }

    @Test
    void signup_WhenEmailAlreadyExists_ThrowsBusinessException() {
        when(userRepository.existsByEmail("traveler@example.com")).thenReturn(true);

        BusinessException exception =
                assertThrows(
                        BusinessException.class,
                        () ->
                                authService.signup(
                                        new SignupRequest(
                                                "traveler01",
                                                "traveler@example.com",
                                                "Travel123!")));

        assertEquals(ResultCode.BAD_REQUEST, exception.getResultCode());
        assertEquals("Email already exists.", exception.getMessage());
        verify(jdbcTemplate, never()).update(any(String.class), any(), any(), any(), any());
    }
}
