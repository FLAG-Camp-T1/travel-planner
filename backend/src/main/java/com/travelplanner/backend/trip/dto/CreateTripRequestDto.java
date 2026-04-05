package com.travelplanner.backend.trip.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import lombok.Data;

@Data
public class CreateTripRequestDto {

    @NotBlank
    @Schema(description = "Trip title", example = "Spring DC Trip")
    private String title;

    @NotNull
    @Min(1)
    @Max(15)
    @Schema(description = "Trip duration in days", example = "3")
    private Integer durationDays;

    @Schema(description = "Optional fixed trip start date", example = "2026-04-10")
    private LocalDate startDate;
}
