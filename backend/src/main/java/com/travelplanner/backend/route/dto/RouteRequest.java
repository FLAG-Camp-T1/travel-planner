package com.travelplanner.backend.route.dto;

import com.travelplanner.backend.route.enums.TravelMode;
import lombok.Data;

@Data
public class RouteRequest {

    private String originPlaceId;
    private String destinationPlaceId;

    private TravelMode travelMode = TravelMode.DRIVE;
}
