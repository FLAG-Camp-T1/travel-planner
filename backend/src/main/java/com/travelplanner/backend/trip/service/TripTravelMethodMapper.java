package com.travelplanner.backend.trip.service;

import com.travelplanner.backend.route.enums.TravelMode;

final class TripTravelMethodMapper {

    private TripTravelMethodMapper() {}

    static String toNullableDisplay(String travelMethod) {
        if (travelMethod == null || "TRAVEL_MODE_UNSPECIFIED".equals(travelMethod)) {
            return null;
        }
        return toDisplay(TravelMode.valueOf(travelMethod));
    }

    static TravelMode toEffectiveRouteMode(String travelMethod) {
        if (travelMethod == null || "TRAVEL_MODE_UNSPECIFIED".equals(travelMethod)) {
            return TravelMode.DRIVE;
        }
        return TravelMode.valueOf(travelMethod);
    }

    static String toDisplay(TravelMode travelMode) {
        return switch (travelMode) {
            case DRIVE -> "Drive";
            case BICYCLE -> "Bicycle";
            case WALK -> "Walk";
            case TWO_WHEELER -> "Two Wheeler";
            case TRANSIT -> "Transit";
        };
    }
}
