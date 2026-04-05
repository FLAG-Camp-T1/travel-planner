package com.travelplanner.backend.trip.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDate;
import lombok.Data;

@Data
public class TripDayDto {

    @Schema(description = "Day number within the trip", example = "1")
    private Integer dayNumber;

    @Schema(description = "Derived date for fixed trips, otherwise null", example = "2026-04-10")
    private LocalDate date;
}
