package com.travelplanner.backend.trip.service;

import com.travelplanner.backend.trip.dto.TripDayDto;
import com.travelplanner.backend.trip.dto.TripSummaryDto;
import com.travelplanner.backend.trip.model.TripDayEntity;
import com.travelplanner.backend.trip.model.TripEntity;
import java.time.LocalDate;

final class TripMapper {

    private TripMapper() {}

    static TripSummaryDto toTripSummaryDto(TripEntity tripEntity) {
        TripSummaryDto dto = new TripSummaryDto();
        dto.setTripId(tripEntity.getId());
        dto.setTitle(tripEntity.getTitle());
        dto.setDurationDays(tripEntity.getDuration());
        dto.setStartDate(tripEntity.getStartDate());
        return dto;
    }

    static TripDayDto toTripDayDto(TripDayEntity tripDayEntity, LocalDate tripStartDate) {
        TripDayDto dto = new TripDayDto();
        dto.setDayNumber(tripDayEntity.getDayNumber());
        dto.setDate(
                tripStartDate == null
                        ? null
                        : tripStartDate.plusDays(tripDayEntity.getDayNumber() - 1L));
        return dto;
    }
}
