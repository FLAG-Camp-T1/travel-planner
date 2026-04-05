package com.travelplanner.backend.route.util;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import com.travelplanner.backend.route.dto.RouteSummaryDto;
import com.travelplanner.backend.route.model.ComputedRouteLeg;
import org.junit.jupiter.api.Test;

class RouteSummaryMapperTest {

    @Test
    void toRouteSummaryDto_MapsInternalRouteLegToLegacyDto() {
        ComputedRouteLeg computedRouteLeg = new ComputedRouteLeg();
        computedRouteLeg.setDistanceMeters(1234);
        computedRouteLeg.setDuration("456s");
        computedRouteLeg.setDurationSeconds(456L);
        computedRouteLeg.setEncodedPolyline("encoded");

        ComputedRouteLeg.Viewport viewport = new ComputedRouteLeg.Viewport();
        ComputedRouteLeg.LatLng northeast = new ComputedRouteLeg.LatLng();
        northeast.setLat(47.0);
        northeast.setLng(-122.0);
        viewport.setNortheast(northeast);

        ComputedRouteLeg.LatLng southwest = new ComputedRouteLeg.LatLng();
        southwest.setLat(46.0);
        southwest.setLng(-123.0);
        viewport.setSouthwest(southwest);
        computedRouteLeg.setViewport(viewport);

        RouteSummaryDto result = RouteSummaryMapper.toRouteSummaryDto(computedRouteLeg);

        assertEquals(1234, result.getDistanceMeters());
        assertEquals("456s", result.getDuration());
        assertEquals("encoded", result.getEncodedPolyline());
        assertEquals(47.0, result.getViewport().getNortheast().getLat());
        assertEquals(-123.0, result.getViewport().getSouthwest().getLng());
    }

    @Test
    void toRouteSummaryDto_AllowsNullViewport() {
        ComputedRouteLeg computedRouteLeg = new ComputedRouteLeg();
        computedRouteLeg.setDistanceMeters(1234);
        computedRouteLeg.setDuration("456s");

        RouteSummaryDto result = RouteSummaryMapper.toRouteSummaryDto(computedRouteLeg);

        assertNull(result.getViewport());
    }
}
