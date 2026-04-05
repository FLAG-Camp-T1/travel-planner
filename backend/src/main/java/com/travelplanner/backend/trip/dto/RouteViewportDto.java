package com.travelplanner.backend.trip.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(name = "RouteViewport", description = "Bounding viewport for a route or route segment")
public class RouteViewportDto {

    @Schema(description = "Northeast viewport corner")
    private RouteLatLngDto northeast;

    @Schema(description = "Southwest viewport corner")
    private RouteLatLngDto southwest;
}
