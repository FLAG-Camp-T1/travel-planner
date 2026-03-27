package com.travelplanner.backend.route.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
public class RouteSummaryDto {

    @Schema(description = "Route distance in meters")
    private Integer distanceMeters;

    @Schema(description = "Route duration with unit")
    private String duration;

    @Schema(description = "Encoded polyline string for route visualization")
    private String encodedPolyline;

    @Schema(description = "Viewport that include the whole route")
    private Viewport viewport;

    @Data
    @Schema(description = "Viewport endpoints coordinates")
    public static class Viewport {
        private LatLng northeast;
        private LatLng southwest;
    }

    @Data
    @Schema(description = "Latitude and Longitude")
    public static class LatLng {
        private Double lat;
        private Double lng;
    }
}
