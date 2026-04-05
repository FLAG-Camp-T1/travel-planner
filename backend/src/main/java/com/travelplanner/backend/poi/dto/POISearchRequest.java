package com.travelplanner.backend.poi.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
@Schema(name = "POISearchRequest", description = "Request payload for nearby place search")
public class POISearchRequest {
    @NotBlank(message = "Search keyword cannot be empty")
    @Schema(description = "Search keyword", example = "museum")
    private String keyword;

    @Schema(description = "Search center as 'latitude,longitude'", example = "38.8896,-77.0230")
    private String location;

    @Schema(description = "Search radius in meters", example = "1500")
    private Integer radius;
}
