package com.travelplanner.backend.poi.dto;

import lombok.Data;

@Data
public class POIDto {
    private String placeId;
    private String name;
    private String address;
    private Double latitude;
    private Double longitude;
    private String poiType;
    private Double rating;
}
