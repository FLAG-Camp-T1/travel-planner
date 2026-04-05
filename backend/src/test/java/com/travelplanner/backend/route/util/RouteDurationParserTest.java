package com.travelplanner.backend.route.util;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;

class RouteDurationParserTest {

    @Test
    void parseDurationSeconds_ParsesWholeSeconds() {
        assertEquals(183L, RouteDurationParser.parseDurationSeconds("183s"));
    }

    @Test
    void parseDurationSeconds_TruncatesFractionalSeconds() {
        assertEquals(183L, RouteDurationParser.parseDurationSeconds("183.9s"));
    }

    @Test
    void parseDurationSeconds_RejectsInvalidValues() {
        assertThrows(
                IllegalArgumentException.class,
                () -> RouteDurationParser.parseDurationSeconds("183"));
    }
}
