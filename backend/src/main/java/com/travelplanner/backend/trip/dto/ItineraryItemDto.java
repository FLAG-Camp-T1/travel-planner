package com.travelplanner.backend.trip.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(name = "ItineraryItem", description = "One ordered itinerary item within a trip day")
public class ItineraryItemDto {

    @Schema(description = "Itinerary item identifier", example = "5001")
    private Long itemId;

    @Schema(
            description = "Google Place ID for this itinerary item",
            example = "ChIJVTPokywQkFQRmtVEaUZlJRA")
    private String placeId;

    @Schema(description = "Display name resolved for the place", example = "Pike Place Market")
    private String name;

    @Schema(
            description = "Latitude for this itinerary place",
            example = "47.609722",
            nullable = true)
    private Double latitude;

    @Schema(
            description = "Longitude for this itinerary place",
            example = "-122.342222",
            nullable = true)
    private Double longitude;

    @Schema(description = "Visit order within the selected day", example = "1")
    private Integer visitOrder;

    @Schema(
            description = "Display travel method, or null when not specified",
            example = "Walk",
            nullable = true)
    private String travelMethod;
}
