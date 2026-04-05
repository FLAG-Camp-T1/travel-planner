package com.travelplanner.backend.trip.service;

import com.travelplanner.backend.trip.dto.ItineraryItemDto;
import com.travelplanner.backend.trip.dto.TripDayDto;
import com.travelplanner.backend.trip.dto.TripSummaryDto;
import com.travelplanner.backend.trip.model.ItineraryEntity;
import com.travelplanner.backend.trip.model.PoiEntity;
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

    static ItineraryItemDto toItineraryItemDto(
            ItineraryEntity itineraryEntity, PoiEntity poiEntity, String displayName) {
        ItineraryItemDto dto = new ItineraryItemDto();
        dto.setItemId(itineraryEntity.getId());
        dto.setPlaceId(poiEntity.getPlacesId());
        dto.setName(displayName);
        dto.setVisitOrder(itineraryEntity.getVisitOrder());
        dto.setTravelMethod(toDisplayTravelMethod(itineraryEntity.getTravelMethod()));
        return dto;
    }

    private static String toDisplayTravelMethod(String travelMethod) {
        if (travelMethod == null || "TRAVEL_MODE_UNSPECIFIED".equals(travelMethod)) {
            return null;
        }

        return switch (travelMethod) {
            case "DRIVE" -> "Drive";
            case "BICYCLE" -> "Bicycle";
            case "WALK" -> "Walk";
            case "TWO_WHEELER" -> "Two Wheeler";
            case "TRANSIT" -> "Transit";
            default -> travelMethod;
        };
    }
}
