package com.travelplanner.backend.route.service;

import com.travelplanner.backend.route.enums.TravelMode;
import com.travelplanner.backend.route.model.ComputedRouteLeg;

public interface RouteProvider {

    ComputedRouteLeg computeLeg(
            String originPlaceId, String destinationPlaceId, TravelMode travelMode);
}
