package com.travelplanner.backend.trip.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.Schema.RequiredMode;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
@Schema(
        name = "MoveTripDayItemRequest",
        description = "Request payload used to move one itinerary item to another trip day")
public class MoveTripDayItemRequestDto {

    @NotNull
    @Min(1)
    @Schema(
            description = "Target day number within the same trip",
            example = "2",
            requiredMode = RequiredMode.REQUIRED)
    private Integer targetDayNumber;
}
