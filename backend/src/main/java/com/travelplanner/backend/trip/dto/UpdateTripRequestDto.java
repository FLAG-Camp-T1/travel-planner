package com.travelplanner.backend.trip.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.Schema.RequiredMode;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;
import lombok.Data;

@Data
@Schema(
        name = "UpdateTripRequest",
        description = "Request payload used to update editable trip fields")
public class UpdateTripRequestDto {

    @NotBlank
    @Schema(
            description = "Trip title",
            example = "Spring DC Trip",
            requiredMode = RequiredMode.REQUIRED)
    private String title;

    @Schema(
            description =
                    "Trip start date when scheduling is fixed; null clears the fixed schedule",
            example = "2026-04-12",
            nullable = true)
    private LocalDate startDate;
}
