package com.travelplanner.backend.trip.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.Schema.RequiredMode;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
@Schema(
        name = "UpdateItineraryItemRequest",
        description = "Request payload used to update editable itinerary item fields")
public class UpdateItineraryItemRequestDto {

    @NotBlank
    @Pattern(
            regexp = "DRIVE|BICYCLE|WALK|TWO_WHEELER|TRANSIT|TRAVEL_MODE_UNSPECIFIED",
            message = "Travel method must be a supported itinerary command value.")
    @Schema(
            description =
                    "Travel method command value for the itinerary leg leading into this stop",
            example = "WALK",
            requiredMode = RequiredMode.REQUIRED)
    private String travelMethod;
}
