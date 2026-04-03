package com.travelplanner.backend.poi.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class POISearchRequest {
    @NotBlank(message = "Search keyword cannot be empty")
    private String keyword;

    private String location;
    private Integer radius;
    private String poiType;
}
