package com.travelplanner.backend.trip.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(name = "DayRouteSummary", description = "Aggregate route totals for one trip day")
public class DayRouteSummaryDto {

    @Schema(description = "Total route distance in meters", example = "3500")
    private Integer totalDistanceMeters;

    @Schema(description = "Total route duration in seconds", example = "1250")
    private Long totalDurationSeconds;
}
