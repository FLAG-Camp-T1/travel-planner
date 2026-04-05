package com.travelplanner.backend.route.model;

import lombok.Data;

@Data
public class ComputedRouteLeg {

    private Integer distanceMeters;
    private String duration;
    private Long durationSeconds;
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
