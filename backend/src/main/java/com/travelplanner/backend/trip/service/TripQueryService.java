package com.travelplanner.backend.trip.service;

import com.travelplanner.backend.common.api.ResultCode;
import com.travelplanner.backend.common.context.CurrentUserProvider;
import com.travelplanner.backend.common.exception.BusinessException;
import com.travelplanner.backend.place.dto.PlaceDetailDto;
import com.travelplanner.backend.place.service.PlaceDetailsService;
import com.travelplanner.backend.trip.dto.ItineraryItemDto;
import com.travelplanner.backend.trip.dto.TripDayDto;
import com.travelplanner.backend.trip.dto.TripDayItemsResponseDto;
import com.travelplanner.backend.trip.dto.TripDaysResponseDto;
import com.travelplanner.backend.trip.dto.TripSummaryDto;
import com.travelplanner.backend.trip.model.ItineraryEntity;
import com.travelplanner.backend.trip.model.PoiEntity;
import com.travelplanner.backend.trip.model.TripDayEntity;
import com.travelplanner.backend.trip.model.TripEntity;
import com.travelplanner.backend.trip.repository.ItineraryRepository;
import com.travelplanner.backend.trip.repository.PoiRepository;
import com.travelplanner.backend.trip.repository.TripDayRepository;
import com.travelplanner.backend.trip.repository.TripRepository;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TripQueryService {

    private final TripRepository tripRepository;
    private final TripDayRepository tripDayRepository;
    private final ItineraryRepository itineraryRepository;
    private final PoiRepository poiRepository;
    private final PlaceDetailsService placeDetailsService;
    private final CurrentUserProvider currentUserProvider;

    public List<TripSummaryDto> listTrips() {
        UUID currentUserId = currentUserProvider.getCurrentUserId();
        return tripRepository.findAllByUserIdOrderByIdDesc(currentUserId).stream()
                .map(TripMapper::toTripSummaryDto)
                .toList();
    }

    public TripSummaryDto getTrip(Long tripId) {
        return TripMapper.toTripSummaryDto(getOwnedTripEntity(tripId));
    }

    public TripDaysResponseDto getTripDays(Long tripId) {
        TripEntity tripEntity = getOwnedTripEntity(tripId);

        List<TripDayDto> days =
                tripDayRepository.findAllByTripIdOrderByDayNumberAsc(tripId).stream()
                        .map(
                                tripDayEntity ->
                                        TripMapper.toTripDayDto(
                                                tripDayEntity, tripEntity.getStartDate()))
                        .toList();

        TripDaysResponseDto response = new TripDaysResponseDto();
        response.setTripId(tripEntity.getId());
        response.setDays(days);
        return response;
    }

    public TripDayItemsResponseDto getTripDayItems(Long tripId, Integer dayNumber) {
        getOwnedTripEntity(tripId);
        TripDayEntity tripDayEntity = getOwnedTripDayEntity(tripId, dayNumber);

        List<ItineraryEntity> itineraryItems =
                itineraryRepository.findAllByTripDayIdOrderByVisitOrderAsc(tripDayEntity.getId());

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

        TripDayItemsResponseDto response = new TripDayItemsResponseDto();
        response.setTripId(tripId);
        response.setDayNumber(dayNumber);
        response.setItems(
                itineraryItems.stream()
                        .map(itineraryItem -> toItineraryItemDto(itineraryItem, poisById))
                        .toList());
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

    private ItineraryItemDto toItineraryItemDto(
            ItineraryEntity itineraryItem, Map<Long, PoiEntity> poisById) {
        PoiEntity poiEntity = poisById.get(itineraryItem.getPoiId());
        if (poiEntity == null) {
            throw new BusinessException(
                    ResultCode.BAD_REQUEST,
                    "POI %d not found for itinerary item %d."
                            .formatted(itineraryItem.getPoiId(), itineraryItem.getId()));
        }

        PlaceDetailDto placeDetail = placeDetailsService.getPlaceDetails(poiEntity.getPlacesId());
        return TripMapper.toItineraryItemDto(
                itineraryItem,
                poiEntity,
                placeDetail.getName(),
                placeDetail.getLatitude(),
                placeDetail.getLongitude());
    }
}
