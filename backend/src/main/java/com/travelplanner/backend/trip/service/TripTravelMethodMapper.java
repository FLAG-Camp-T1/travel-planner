package com.travelplanner.backend.trip.service;

import com.travelplanner.backend.route.enums.TravelMode;

final class TripTravelMethodMapper {

    private static final String UNSPECIFIED_TRAVEL_METHOD = "TRAVEL_MODE_UNSPECIFIED";

    private TripTravelMethodMapper() {}

    static String toNullableDisplay(String travelMethod) {
        TravelMode travelMode = toNullableTravelMode(travelMethod);
        return travelMode != null ? toDisplay(travelMode) : null;
    }

    static TravelMode toEffectiveRouteMode(String travelMethod) {
        TravelMode travelMode = toNullableTravelMode(travelMethod);
        return travelMode != null ? travelMode : TravelMode.DRIVE;
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

    static String toStoredValue(String requestedTravelMethod) {
        TravelMode travelMode = toNullableTravelMode(requestedTravelMethod);
        return travelMode != null ? travelMode.name() : null;
    }

    private static TravelMode toNullableTravelMode(String travelMethod) {
        if (travelMethod == null || UNSPECIFIED_TRAVEL_METHOD.equals(travelMethod)) {
            return null;
        }

        return TravelMode.valueOf(travelMethod);
    }
}
