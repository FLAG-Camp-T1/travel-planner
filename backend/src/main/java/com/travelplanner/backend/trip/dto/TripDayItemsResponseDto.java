package com.travelplanner.backend.trip.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;
import lombok.Data;

@Data
@Schema(
        name = "TripDayItemsResponse",
        description = "Ordered itinerary items returned for one trip day")
public class TripDayItemsResponseDto {

    @Schema(description = "Trip identifier", example = "1001")
    private Long tripId;

    @Schema(description = "Day number within the trip", example = "1")
    private Integer dayNumber;

    @Schema(description = "Ordered itinerary items for the selected day")
    private List<ItineraryItemDto> items;
}
