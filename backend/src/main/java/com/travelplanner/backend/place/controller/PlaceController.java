package com.travelplanner.backend.place.controller;

import com.travelplanner.backend.common.api.ApiResponse;
import com.travelplanner.backend.place.dto.PlaceDetailDto;
import com.travelplanner.backend.place.service.PlaceDetailsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/places")
@RequiredArgsConstructor
public class PlaceController {

    private final PlaceDetailsService placeDetailsService;

    @GetMapping("/{placeId}")
    public ApiResponse<PlaceDetailDto> getPlaceDetails(@PathVariable String placeId) {
        return ApiResponse.success(placeDetailsService.getPlaceDetails(placeId));
    }
}
