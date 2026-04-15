package com.travelplanner.backend.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(name = "AuthTokenResponse", description = "JWT token returned after a successful auth flow")
public record AuthTokenResponse(
        @Schema(description = "Bearer token used for authenticated API requests") String token) {}
