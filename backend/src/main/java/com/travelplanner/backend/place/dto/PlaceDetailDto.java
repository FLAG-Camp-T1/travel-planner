package com.travelplanner.backend.place.dto;

import java.util.List;
import lombok.Data;

@Data
public class PlaceDetailDto {
    private String placeId;
    private String name;
    private String address;
    private Double latitude;
    private Double longitude;
    private String categoryLabel;
    private Double rating;
    private Integer userRatingCount;
    private String websiteUri;
    private String googleMapsUri;
    private List<String> openingWeekdayDescriptions;
}
