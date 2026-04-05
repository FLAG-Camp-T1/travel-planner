package com.travelplanner.backend.trip.service;

import com.travelplanner.backend.common.api.ResultCode;
import com.travelplanner.backend.common.context.CurrentUserProvider;
import com.travelplanner.backend.common.exception.BusinessException;
import com.travelplanner.backend.route.enums.TravelMode;
import com.travelplanner.backend.route.model.ComputedRouteLeg;
import com.travelplanner.backend.route.service.RouteProvider;
import com.travelplanner.backend.trip.dto.DayRouteSegmentDto;
import com.travelplanner.backend.trip.dto.DayRouteSummaryDto;
import com.travelplanner.backend.trip.dto.GenerateDayRouteResponseDto;
import com.travelplanner.backend.trip.model.ItineraryEntity;
import com.travelplanner.backend.trip.model.PoiEntity;
import com.travelplanner.backend.trip.model.TripDayEntity;
import com.travelplanner.backend.trip.model.TripEntity;
import com.travelplanner.backend.trip.repository.ItineraryRepository;
import com.travelplanner.backend.trip.repository.PoiRepository;
import com.travelplanner.backend.trip.repository.TripDayRepository;
import com.travelplanner.backend.trip.repository.TripRepository;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TripRouteService {

    private final TripRepository tripRepository;
    private final TripDayRepository tripDayRepository;
    private final ItineraryRepository itineraryRepository;
    private final PoiRepository poiRepository;
    private final RouteProvider routeProvider;
    private final CurrentUserProvider currentUserProvider;

    public GenerateDayRouteResponseDto generateDayRoute(Long tripId, Integer dayNumber) {
        getOwnedTripEntity(tripId);
        TripDayEntity tripDayEntity = getOwnedTripDayEntity(tripId, dayNumber);

        List<ItineraryEntity> itineraryItems =
                itineraryRepository.findAllByTripDayIdOrderByVisitOrderAsc(tripDayEntity.getId());

        GenerateDayRouteResponseDto response = new GenerateDayRouteResponseDto();
        response.setTripId(tripId);
        response.setDayNumber(dayNumber);

        if (itineraryItems.size() < 2) {
            response.setRouteSummary(null);
            response.setSegments(List.of());
            return response;
        }

        Map<Long, PoiEntity> poisById =
                poiRepository
                        .findAllById(
                                itineraryItems.stream()
                                        .map(ItineraryEntity::getPoiId)
                                        .distinct()
                                        .toList())
                        .stream()
                        .collect(
                                java.util.stream.Collectors.toMap(
                                        PoiEntity::getId, Function.identity()));

        List<DayRouteSegmentDto> segments = new ArrayList<>();
        long totalDurationSeconds = 0L;
        int totalDistanceMeters = 0;

        for (int index = 0; index < itineraryItems.size() - 1; index += 1) {
            ItineraryEntity fromItem = itineraryItems.get(index);
            ItineraryEntity toItem = itineraryItems.get(index + 1);

            PoiEntity originPoi = getPoiEntity(fromItem, poisById);
            PoiEntity destinationPoi = getPoiEntity(toItem, poisById);
            TravelMode effectiveTravelMode =
                    TripTravelMethodMapper.toEffectiveRouteMode(toItem.getTravelMethod());

            ComputedRouteLeg computedRouteLeg =
                    routeProvider.computeLeg(
                            originPoi.getPlacesId(),
                            destinationPoi.getPlacesId(),
                            effectiveTravelMode);

            segments.add(toSegmentDto(fromItem, toItem, effectiveTravelMode, computedRouteLeg));
            totalDistanceMeters += computedRouteLeg.getDistanceMeters();
            totalDurationSeconds += computedRouteLeg.getDurationSeconds();
        }

        response.setSegments(segments);
        response.setRouteSummary(toSummaryDto(totalDistanceMeters, totalDurationSeconds));
        return response;
    }

    private TripEntity getOwnedTripEntity(Long tripId) {
        UUID currentUserId = currentUserProvider.getCurrentUserId();
        return tripRepository
                .findByIdAndUserId(tripId, currentUserId)
                .orElseThrow(
                        () ->
                                new BusinessException(
                                        ResultCode.BAD_REQUEST,
                                        "Trip %d not found.".formatted(tripId)));
    }

    private TripDayEntity getOwnedTripDayEntity(Long tripId, Integer dayNumber) {
        return tripDayRepository
                .findByTripIdAndDayNumber(tripId, dayNumber)
                .orElseThrow(
                        () ->
                                new BusinessException(
                                        ResultCode.BAD_REQUEST,
                                        "Trip day %d not found for trip %d."
                                                .formatted(dayNumber, tripId)));
    }

    private PoiEntity getPoiEntity(ItineraryEntity itineraryItem, Map<Long, PoiEntity> poisById) {
        PoiEntity poiEntity = poisById.get(itineraryItem.getPoiId());
        if (poiEntity == null) {
            throw new BusinessException(
                    ResultCode.BAD_REQUEST,
                    "POI %d not found for itinerary item %d."
                            .formatted(itineraryItem.getPoiId(), itineraryItem.getId()));
        }
        return poiEntity;
    }

    private DayRouteSegmentDto toSegmentDto(
            ItineraryEntity fromItem,
            ItineraryEntity toItem,
            TravelMode effectiveTravelMode,
            ComputedRouteLeg computedRouteLeg) {
        DayRouteSegmentDto dto = new DayRouteSegmentDto();
        dto.setFromItemId(fromItem.getId());
        dto.setToItemId(toItem.getId());
        dto.setTravelMethod(TripTravelMethodMapper.toDisplay(effectiveTravelMode));
        dto.setDistanceMeters(computedRouteLeg.getDistanceMeters());
        dto.setDurationSeconds(computedRouteLeg.getDurationSeconds());
        dto.setEncodedPolyline(computedRouteLeg.getEncodedPolyline());
        dto.setViewport(TripMapper.toRouteViewportDto(computedRouteLeg.getViewport()));
        return dto;
    }

    private DayRouteSummaryDto toSummaryDto(int totalDistanceMeters, long totalDurationSeconds) {
        DayRouteSummaryDto dto = new DayRouteSummaryDto();
        dto.setTotalDistanceMeters(totalDistanceMeters);
        dto.setTotalDurationSeconds(totalDurationSeconds);
        return dto;
    }
}
