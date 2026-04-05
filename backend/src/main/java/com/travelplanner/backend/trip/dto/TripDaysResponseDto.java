package com.travelplanner.backend.trip.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;
import lombok.Data;

@Data
public class TripDaysResponseDto {

    @Schema(description = "Trip identifier", example = "1001")
    private Long tripId;

    @Schema(description = "Ordered trip days")
    private List<TripDayDto> days;
}
