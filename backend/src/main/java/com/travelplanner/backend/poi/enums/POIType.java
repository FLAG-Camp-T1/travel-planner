package com.travelplanner.backend.poi.enums;

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
}
