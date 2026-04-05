package com.travelplanner.backend.place.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;
import lombok.Data;

@Data
@Schema(name = "PlaceDetailDto", description = "Detailed place information for one Google Place ID")
public class PlaceDetailDto {
    @Schema(description = "Google Place ID", example = "ChIJVTPokywQkFQRmtVEaUZlJRA")
    private String placeId;

    @Schema(description = "Display name", example = "Pike Place Market", nullable = true)
    private String name;

    @Schema(
            description = "Formatted address",
            example = "85 Pike St, Seattle, WA 98101, USA",
            nullable = true)
    private String address;

    @Schema(description = "Latitude", example = "47.609722", nullable = true)
    private Double latitude;

    @Schema(description = "Longitude", example = "-122.342222", nullable = true)
    private Double longitude;

    @Schema(description = "Primary category label", example = "Market", nullable = true)
    private String categoryLabel;

    @Schema(description = "Average rating", example = "4.7", nullable = true)
    private Double rating;

    @Schema(description = "Number of user ratings", example = "98765", nullable = true)
    private Integer userRatingCount;

    @Schema(
            description = "Official website URL",
            example = "https://www.pikeplacemarket.org/",
            nullable = true)
    private String websiteUri;

    @Schema(
            description = "Google Maps URL",
            example = "https://maps.google.com/?cid=999",
            nullable = true)
    private String googleMapsUri;

    @Schema(description = "Localized opening-hours lines", nullable = true)
    private List<String> openingWeekdayDescriptions;
}
