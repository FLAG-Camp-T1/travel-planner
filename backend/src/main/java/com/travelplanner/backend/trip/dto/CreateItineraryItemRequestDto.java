package com.travelplanner.backend.trip.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.Schema.RequiredMode;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
@Schema(
        name = "CreateItineraryItemRequest",
        description = "Request payload used to add one place to a selected trip day")
public class CreateItineraryItemRequestDto {

    @NotBlank
    @Schema(
            description = "Google place identifier for the selected stop",
            example = "ChIJW-T2Wt7Gt4kRKl2I1CJFUsI",
            requiredMode = RequiredMode.REQUIRED)
    private String placeId;
}
