package com.travelplanner.backend.route.dto;

import lombok.Data;

@Data
public class RouteSummaryDto {

    private Integer distanceMeters;
    private String duration;

    private String encodedPolyline;

    private Viewport viewport;

    @Data
    public static class Viewport {
        private LatLng northeast;
        private LatLng southwest;
    }

    @Data
    public static class LatLng {
        private Double lat;
        private Double lng;
    }
}
