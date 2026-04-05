package com.travelplanner.backend.route.util;

import com.travelplanner.backend.route.dto.RouteSummaryDto;
import com.travelplanner.backend.route.model.ComputedRouteLeg;

public final class RouteSummaryMapper {

    private RouteSummaryMapper() {}

    public static RouteSummaryDto toRouteSummaryDto(ComputedRouteLeg computedRouteLeg) {
        RouteSummaryDto dto = new RouteSummaryDto();
        dto.setDistanceMeters(computedRouteLeg.getDistanceMeters());
        dto.setDuration(computedRouteLeg.getDuration());
        dto.setEncodedPolyline(computedRouteLeg.getEncodedPolyline());
        dto.setViewport(toViewport(computedRouteLeg.getViewport()));
        return dto;
    }

    private static RouteSummaryDto.Viewport toViewport(ComputedRouteLeg.Viewport viewport) {
        if (viewport == null) {
            return null;
        }

        RouteSummaryDto.Viewport dtoViewport = new RouteSummaryDto.Viewport();
        dtoViewport.setNortheast(toLatLng(viewport.getNortheast()));
        dtoViewport.setSouthwest(toLatLng(viewport.getSouthwest()));
        return dtoViewport;
    }

    private static RouteSummaryDto.LatLng toLatLng(ComputedRouteLeg.LatLng latLng) {
        if (latLng == null) {
            return null;
        }

        RouteSummaryDto.LatLng dtoLatLng = new RouteSummaryDto.LatLng();
        dtoLatLng.setLat(latLng.getLat());
        dtoLatLng.setLng(latLng.getLng());
        return dtoLatLng;
    }
}
