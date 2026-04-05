package com.travelplanner.backend.poi.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(name = "POIDto", description = "Compact place result returned by POI search")
public class POIDto {
    @Schema(description = "Google Place ID", example = "ChIJVTPokywQkFQRmtVEaUZlJRA")
    private String placeId;

    @Schema(description = "Display name", example = "Pike Place Market")
    private String name;

    @Schema(description = "Formatted address", example = "85 Pike St, Seattle, WA 98101, USA")
    private String address;

    @Schema(description = "Latitude", example = "47.609722")
    private Double latitude;

    @Schema(description = "Longitude", example = "-122.342222")
    private Double longitude;

    @Schema(description = "Primary category label", example = "Market")
    private String poiType;

    @Schema(description = "Average rating", example = "4.7", nullable = true)
    private Double rating;
}
