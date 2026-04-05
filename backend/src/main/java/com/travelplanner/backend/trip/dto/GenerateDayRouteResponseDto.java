package com.travelplanner.backend.trip.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;
import lombok.Data;

@Data
public class GenerateDayRouteResponseDto {

    @Schema(description = "Trip identifier", example = "1001")
    private Long tripId;

    @Schema(description = "Day number within the trip", example = "1")
    private Integer dayNumber;

    @Schema(
            description = "Selected-day route summary or null when fewer than 2 items exist",
            nullable = true)
    private DayRouteSummaryDto routeSummary;

    @Schema(description = "Ordered route segments for the selected day")
    private List<DayRouteSegmentDto> segments;
}
