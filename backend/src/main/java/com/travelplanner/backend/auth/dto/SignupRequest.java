package com.travelplanner.backend.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Schema(name = "SignupRequest", description = "Request payload used to create a new user account")
public record SignupRequest(
        @NotBlank(message = "Username cannot be empty.")
                @Size(max = 50, message = "Username must be 50 characters or fewer.")
                @Schema(description = "Public username", example = "traveler01")
                String username,
        @NotBlank(message = "Email cannot be empty.")
                @Email(message = "Email must be valid.")
                @Schema(description = "Login email", example = "traveler01@example.com")
                String email,
        @NotBlank(message = "Password cannot be empty.")
                @Pattern(
                        regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z\\d]).{8,20}$",
                        message =
                                "Password must be 8-20 characters and include uppercase, lowercase, number, and special character.")
                @Schema(
                        description =
                                "Password with 8-20 characters, including upper/lowercase letters, a number, and a special character.",
                        example = "Travel123!")
                String password) {}
