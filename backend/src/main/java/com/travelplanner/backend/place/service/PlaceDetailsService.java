package com.travelplanner.backend.place.service;

import com.travelplanner.backend.place.dto.PlaceDetailDto;
import org.jspecify.annotations.NonNull;

public interface PlaceDetailsService {

    PlaceDetailDto getPlaceDetails(@NonNull String placeId);
}
