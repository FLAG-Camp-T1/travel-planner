package com.travelplanner.backend.route.dto;

import com.travelplanner.backend.route.enums.TravelMode;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
public class RouteRequest {

    @Schema(
            description = "Google Place ID of the starting location",
            example = "ChIJVVVVVYx3j4ARP-3NGldc8qQ")
    private String originPlaceId;

    @Schema(
            description = "Google Place ID of the destination",
            example = "ChIJJcSDXXx3j4ARRef7L0P3GpY")
    private String destinationPlaceId;

    @Schema(description = "Method of transportation", example = "DRIVE")
    private TravelMode travelMode = TravelMode.DRIVE;
}
