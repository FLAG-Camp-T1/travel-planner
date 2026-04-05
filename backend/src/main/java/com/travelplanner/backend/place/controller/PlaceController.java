package com.travelplanner.backend.place.controller;

import com.travelplanner.backend.common.api.ApiResponse;
import com.travelplanner.backend.place.dto.PlaceDetailDto;
import com.travelplanner.backend.place.service.PlaceDetailsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/places")
@RequiredArgsConstructor
@Tag(name = "Place Details", description = "Read detailed information for a Google Place ID")
public class PlaceController {

    private final PlaceDetailsService placeDetailsService;

    @GetMapping("/{placeId}")
    @Operation(
            summary = "Get place details",
            description = "Returns detailed metadata for a single Google Place ID.")
    public ApiResponse<PlaceDetailDto> getPlaceDetails(
            @Parameter(
                            description = "Google Place ID to resolve",
                            example = "ChIJVTPokywQkFQRmtVEaUZlJRA")
                    @PathVariable
                    String placeId) {
        return ApiResponse.success(placeDetailsService.getPlaceDetails(placeId));
    }
}
