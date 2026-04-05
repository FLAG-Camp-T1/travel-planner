package com.travelplanner.backend.trip.controller;

import com.travelplanner.backend.common.api.ApiResponse;
import com.travelplanner.backend.trip.dto.CreateTripRequestDto;
import com.travelplanner.backend.trip.dto.GenerateDayRouteResponseDto;
import com.travelplanner.backend.trip.dto.TripDayItemsResponseDto;
import com.travelplanner.backend.trip.dto.TripDaysResponseDto;
import com.travelplanner.backend.trip.dto.TripSummaryDto;
import com.travelplanner.backend.trip.service.TripCommandService;
import com.travelplanner.backend.trip.service.TripQueryService;
import com.travelplanner.backend.trip.service.TripRouteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/v1/trips")
@RequiredArgsConstructor
@Tag(name = "Trips", description = "APIs for trip planning")
public class TripController {

    private final TripCommandService tripCommandService;
    private final TripQueryService tripQueryService;
    private final TripRouteService tripRouteService;

    @PostMapping("/create")
    @Operation(summary = "Create a trip")
    public ApiResponse<TripSummaryDto> createTrip(
            @Valid @RequestBody CreateTripRequestDto request) {
        log.info("Inbound Trip Create Request: {}", request);
        return ApiResponse.success(tripCommandService.createTrip(request));
    }

    @GetMapping("/{tripId}")
    @Operation(summary = "Get trip summary")
    public ApiResponse<TripSummaryDto> getTrip(@PathVariable Long tripId) {
        return ApiResponse.success(tripQueryService.getTrip(tripId));
    }

    @GetMapping("/{tripId}/days")
    @Operation(summary = "Get ordered trip days")
    public ApiResponse<TripDaysResponseDto> getTripDays(@PathVariable Long tripId) {
        return ApiResponse.success(tripQueryService.getTripDays(tripId));
    }

    @GetMapping("/{tripId}/days/{dayNumber}/items")
    @Operation(summary = "Get ordered itinerary items")
    public ApiResponse<TripDayItemsResponseDto> getTripDayItems(
            @PathVariable Long tripId, @PathVariable Integer dayNumber) {
        return ApiResponse.success(tripQueryService.getTripDayItems(tripId, dayNumber));
    }

    @PostMapping("/{tripId}/days/{dayNumber}/route/generate")
    @Operation(summary = "Generate route for the selected trip day")
    public ApiResponse<GenerateDayRouteResponseDto> generateDayRoute(
            @PathVariable Long tripId, @PathVariable Integer dayNumber) {
        return ApiResponse.success(tripRouteService.generateDayRoute(tripId, dayNumber));
    }
}
