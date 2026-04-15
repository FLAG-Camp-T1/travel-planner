package com.travelplanner.backend.auth.controller;

import com.travelplanner.backend.auth.dto.AuthTokenResponse;
import com.travelplanner.backend.auth.dto.LoginRequest;
import com.travelplanner.backend.auth.dto.SignupRequest;
import com.travelplanner.backend.auth.service.AuthService;
import com.travelplanner.backend.common.api.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "APIs for account signup, login, and logout")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @Operation(summary = "Log in with email and password")
    public ApiResponse<AuthTokenResponse> login(@Valid @RequestBody LoginRequest request) {
        return ApiResponse.success(authService.login(request));
    }

    @PostMapping("/signup")
    @Operation(summary = "Create an account")
    public ApiResponse<AuthTokenResponse> signup(@Valid @RequestBody SignupRequest request) {
        return ApiResponse.success(authService.signup(request));
    }

    @PostMapping("/logout")
    @Operation(summary = "Log out the current user")
    public ApiResponse<Void> logout() {
        authService.logout();
        return ApiResponse.success();
    }
}
