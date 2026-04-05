package com.travelplanner.backend.trip.controller;

import com.travelplanner.backend.common.api.ApiResponse;
import com.travelplanner.backend.trip.dto.CreateItineraryItemRequestDto;
import com.travelplanner.backend.trip.dto.CreateTripRequestDto;
import com.travelplanner.backend.trip.dto.GenerateDayRouteResponseDto;
import com.travelplanner.backend.trip.dto.ReorderTripDayItemsRequestDto;
import com.travelplanner.backend.trip.dto.TripDayItemsResponseDto;
import com.travelplanner.backend.trip.dto.TripDaysResponseDto;
import com.travelplanner.backend.trip.dto.TripSummaryDto;
import com.travelplanner.backend.trip.dto.UpdateItineraryItemRequestDto;
import com.travelplanner.backend.trip.dto.UpdateTripRequestDto;
import com.travelplanner.backend.trip.service.TripCommandService;
import com.travelplanner.backend.trip.service.TripQueryService;
import com.travelplanner.backend.trip.service.TripRouteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/v1/trips")
@RequiredArgsConstructor
@Tag(name = "Trips", description = "Create trips, browse trip data, and generate day routes")
public class TripController {

    private final TripCommandService tripCommandService;
    private final TripQueryService tripQueryService;
    private final TripRouteService tripRouteService;

    @PostMapping("/create")
    @Operation(
            summary = "Create a trip",
            description =
                    "Creates a trip shell with title, duration, and optional fixed start date.")
    public ApiResponse<TripSummaryDto> createTrip(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                            description = "Trip fields used to create a new trip",
                            required = true)
                    @Valid
                    @RequestBody
                    CreateTripRequestDto request) {
        log.info("Inbound Trip Create Request: {}", request);
        return ApiResponse.success(tripCommandService.createTrip(request));
    }

    @GetMapping
    @Operation(
            summary = "List trips",
            description = "Returns the current user's trips in reverse creation order.")
    public ApiResponse<List<TripSummaryDto>> listTrips() {
        return ApiResponse.success(tripQueryService.listTrips());
    }

    @GetMapping("/{tripId}")
    @Operation(
            summary = "Get trip summary",
            description = "Returns the summary for one trip owned by the current user.")
    public ApiResponse<TripSummaryDto> getTrip(
            @Parameter(description = "Trip identifier", example = "1001") @PathVariable
                    Long tripId) {
        return ApiResponse.success(tripQueryService.getTrip(tripId));
    }

    @PatchMapping("/{tripId}")
    @Operation(
            summary = "Update a trip",
            description = "Updates the current user's editable trip fields.")
    public ApiResponse<TripSummaryDto> updateTrip(
            @Parameter(description = "Trip identifier", example = "1001") @PathVariable Long tripId,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                            description = "Editable trip fields for the selected trip",
                            required = true)
                    @Valid
                    @RequestBody
                    UpdateTripRequestDto request) {
        return ApiResponse.success(tripCommandService.updateTrip(tripId, request));
    }

    @DeleteMapping("/{tripId}")
    @Operation(
            summary = "Delete a trip",
            description = "Deletes one trip owned by the current user and cascades related data.")
    public ApiResponse<Void> deleteTrip(
            @Parameter(description = "Trip identifier", example = "1001") @PathVariable
                    Long tripId) {
        tripCommandService.deleteTrip(tripId);
        return ApiResponse.success();
    }

    @GetMapping("/{tripId}/days")
    @Operation(
            summary = "List trip days",
            description = "Returns ordered day entries for the selected trip.")
    public ApiResponse<TripDaysResponseDto> getTripDays(
            @Parameter(description = "Trip identifier", example = "1001") @PathVariable
                    Long tripId) {
        return ApiResponse.success(tripQueryService.getTripDays(tripId));
    }

    @GetMapping("/{tripId}/days/{dayNumber}/items")
    @Operation(
            summary = "List day itinerary items",
            description = "Returns ordered itinerary items for one day of the selected trip.")
    public ApiResponse<TripDayItemsResponseDto> getTripDayItems(
            @Parameter(description = "Trip identifier", example = "1001") @PathVariable Long tripId,
            @Parameter(description = "Day number within the trip", example = "1") @PathVariable
                    Integer dayNumber) {
        return ApiResponse.success(tripQueryService.getTripDayItems(tripId, dayNumber));
    }

    @PostMapping("/{tripId}/days/{dayNumber}/items")
    @Operation(
            summary = "Add a day itinerary item",
            description =
                    "Adds one place to the selected trip day and appends it to the current stop order.")
    public ApiResponse<Void> createTripDayItem(
            @Parameter(description = "Trip identifier", example = "1001") @PathVariable Long tripId,
            @Parameter(description = "Day number within the trip", example = "1") @PathVariable
                    Integer dayNumber,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                            description = "Place reference used to create a new itinerary item",
                            required = true)
                    @Valid
                    @RequestBody
                    CreateItineraryItemRequestDto request) {
        tripCommandService.createTripDayItem(tripId, dayNumber, request);
        return ApiResponse.success();
    }

    @PatchMapping("/{tripId}/days/{dayNumber}/items/{itemId}")
    @Operation(
            summary = "Update a day itinerary item",
            description = "Updates editable fields for one itinerary item within the selected day.")
    public ApiResponse<Void> updateTripDayItem(
            @Parameter(description = "Trip identifier", example = "1001") @PathVariable Long tripId,
            @Parameter(description = "Day number within the trip", example = "1") @PathVariable
                    Integer dayNumber,
            @Parameter(description = "Itinerary item identifier", example = "5001") @PathVariable
                    Long itemId,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                            description = "Editable fields for the selected itinerary item",
                            required = true)
                    @Valid
                    @RequestBody
                    UpdateItineraryItemRequestDto request) {
        tripCommandService.updateTripDayItem(tripId, dayNumber, itemId, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{tripId}/days/{dayNumber}/items/{itemId}")
    @Operation(
            summary = "Delete a day itinerary item",
            description =
                    "Deletes one itinerary item from the selected trip day and reorders the remaining stops.")
    public ApiResponse<Void> deleteTripDayItem(
            @Parameter(description = "Trip identifier", example = "1001") @PathVariable Long tripId,
            @Parameter(description = "Day number within the trip", example = "1") @PathVariable
                    Integer dayNumber,
            @Parameter(description = "Itinerary item identifier", example = "5001") @PathVariable
                    Long itemId) {
        tripCommandService.deleteTripDayItem(tripId, dayNumber, itemId);
        return ApiResponse.success();
    }

    @PatchMapping("/{tripId}/days/{dayNumber}/items/reorder")
    @Operation(
            summary = "Reorder day itinerary items",
            description =
                    "Replaces the stop order for one trip day and rewrites visit order values to match.")
    public ApiResponse<Void> reorderTripDayItems(
            @Parameter(description = "Trip identifier", example = "1001") @PathVariable Long tripId,
            @Parameter(description = "Day number within the trip", example = "1") @PathVariable
                    Integer dayNumber,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                            description =
                                    "Ordered itinerary item identifiers for the selected trip day",
                            required = true)
                    @Valid
                    @RequestBody
                    ReorderTripDayItemsRequestDto request) {
        tripCommandService.reorderTripDayItems(tripId, dayNumber, request);
        return ApiResponse.success();
    }

    @PostMapping("/{tripId}/days/{dayNumber}/route/generate")
    @Operation(
            summary = "Generate a day route",
            description = "Computes route segments and totals for one trip day.")
    public ApiResponse<GenerateDayRouteResponseDto> generateDayRoute(
            @Parameter(description = "Trip identifier", example = "1001") @PathVariable Long tripId,
            @Parameter(description = "Day number within the trip", example = "1") @PathVariable
                    Integer dayNumber) {
        return ApiResponse.success(tripRouteService.generateDayRoute(tripId, dayNumber));
    }
}
