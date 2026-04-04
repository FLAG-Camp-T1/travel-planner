package com.travelplanner.backend.trip.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDate;
import lombok.Data;

@Data
public class TripSummaryDto {

    @Schema(description = "Trip identifier", example = "1001")
    private Long tripId;

    @Schema(description = "Trip title", example = "Spring DC Trip")
    private String title;

    @Schema(description = "Trip duration in days", example = "3")
    private Integer durationDays;

    @Schema(description = "Optional fixed trip start date", example = "2026-04-10")
    private LocalDate startDate;
}
