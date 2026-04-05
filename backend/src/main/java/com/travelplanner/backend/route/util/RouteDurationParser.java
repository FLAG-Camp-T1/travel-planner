package com.travelplanner.backend.route.util;

import java.math.BigDecimal;

public final class RouteDurationParser {

    private RouteDurationParser() {}

    public static long parseDurationSeconds(String googleDuration) {
        if (googleDuration == null || googleDuration.isBlank() || !googleDuration.endsWith("s")) {
            throw new IllegalArgumentException("Invalid Google duration: " + googleDuration);
        }

        String rawSeconds = googleDuration.substring(0, googleDuration.length() - 1);
        return new BigDecimal(rawSeconds).longValue();
    }
}
