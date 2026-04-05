package com.travelplanner.backend.trip.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(
        name = "DayRouteSegment",
        description = "Computed route segment between two itinerary items")
public class DayRouteSegmentDto {

    @Schema(description = "Itinerary item id for the segment origin", example = "5001")
    private Long fromItemId;

    @Schema(description = "Itinerary item id for the segment destination", example = "5002")
    private Long toItemId;

    @Schema(description = "Display travel method used for this segment", example = "Walk")
    private String travelMethod;

    @Schema(description = "Segment distance in meters", example = "1200")
    private Integer distanceMeters;

    @Schema(description = "Segment duration in seconds", example = "600")
    private Long durationSeconds;

    @Schema(description = "Encoded polyline for the segment")
    private String encodedPolyline;

    @Schema(description = "Viewport for the segment")
    private RouteViewportDto viewport;
}
