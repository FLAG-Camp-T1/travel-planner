package com.travelplanner.backend.poi.enums;

import java.util.Arrays;
import java.util.Optional;
import lombok.Getter;

@Getter
public enum POIType {
    RESTAURANT("restaurant"),
    MUSEUM("museum"),
    HOTEL("lodging"),
    ATTRACTION("tourist_attraction"),
    PARK("park");

    private final String googleType;

    POIType(String googleType) {
        this.googleType = googleType;
    }

    public static Optional<POIType> fromRequestValue(String value) {
        if (value == null || value.isBlank()) {
            return Optional.empty();
        }

        return Arrays.stream(values())
                .filter(
                        type ->
                                type.googleType.equalsIgnoreCase(value)
                                        || type.name().equalsIgnoreCase(value))
                .findFirst();
    }
}
