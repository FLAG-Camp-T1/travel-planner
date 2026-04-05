package com.travelplanner.backend.trip.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(name = "RouteLatLng", description = "Latitude and longitude pair")
public class RouteLatLngDto {

    @Schema(description = "Latitude", example = "47.609722")
    private Double lat;

    @Schema(description = "Longitude", example = "-122.342222")
    private Double lng;
}
