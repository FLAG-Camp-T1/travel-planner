package com.travelplanner.backend.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Schema(name = "LoginRequest", description = "Request payload used to authenticate a user")
public record LoginRequest(
        @NotBlank(message = "Email cannot be empty.")
                @Email(message = "Email must be valid.")
                @Schema(description = "Login email", example = "traveler01@example.com")
                String email,
        @NotBlank(message = "Password cannot be empty.")
                @Schema(description = "Account password", example = "Travel123!")
                String password) {}
