package com.travelplanner.backend.trip.service;

import com.travelplanner.backend.common.api.ResultCode;
import com.travelplanner.backend.common.context.CurrentUserProvider;
import com.travelplanner.backend.common.exception.BusinessException;
import com.travelplanner.backend.place.service.PlaceLookupService;
import com.travelplanner.backend.route.enums.TravelMode;
import com.travelplanner.backend.trip.dto.CreateItineraryItemRequestDto;
import com.travelplanner.backend.trip.dto.CreateTripRequestDto;
import com.travelplanner.backend.trip.dto.TripSummaryDto;
import com.travelplanner.backend.trip.dto.UpdateItineraryItemRequestDto;
import com.travelplanner.backend.trip.dto.UpdateTripRequestDto;
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
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TripCommandService {

    private final TripRepository tripRepository;
    private final TripDayRepository tripDayRepository;
    private final ItineraryRepository itineraryRepository;
    private final PoiRepository poiRepository;
    private final PlaceLookupService placeLookupService;
    private final CurrentUserProvider currentUserProvider;

    @Transactional
    public TripSummaryDto createTrip(CreateTripRequestDto request) {
        UUID currentUserId = currentUserProvider.getCurrentUserId();

        TripEntity tripEntity = new TripEntity();
        tripEntity.setUserId(currentUserId);
        tripEntity.setTitle(request.getTitle().trim());
        tripEntity.setDuration(request.getDurationDays());
        tripEntity.setStartDate(request.getStartDate());

        TripEntity savedTripEntity = tripRepository.save(tripEntity);
        tripDayRepository.saveAll(
                createTripDays(savedTripEntity.getId(), savedTripEntity.getDuration()));

        return TripMapper.toTripSummaryDto(savedTripEntity);
    }

    @Transactional
    public TripSummaryDto updateTrip(Long tripId, UpdateTripRequestDto request) {
        TripEntity tripEntity = getOwnedTripEntity(tripId);
        String trimmedTitle = request.getTitle().trim();

        if (trimmedTitle.isEmpty()) {
            throw new BusinessException(ResultCode.PARAM_INVALID, "Trip title must not be blank.");
        }

        tripEntity.setTitle(trimmedTitle);
        tripEntity.setStartDate(request.getStartDate());

        return TripMapper.toTripSummaryDto(tripRepository.save(tripEntity));
    }

    @Transactional
    public void deleteTrip(Long tripId) {
        tripRepository.delete(getOwnedTripEntity(tripId));
    }

    @Transactional
    public void createTripDayItem(
            Long tripId, Integer dayNumber, CreateItineraryItemRequestDto request) {
        TripDayEntity tripDayEntity = getOwnedTripDayEntity(tripId, dayNumber);
        String placeId = request.getPlaceId().trim();

        // Validate the external place reference before we persist a new itinerary row.
        placeLookupService.resolveDisplayName(placeId);

        PoiEntity poiEntity = getOrCreatePoiEntity(placeId);

        ItineraryEntity itineraryEntity = new ItineraryEntity();
        itineraryEntity.setTripDayId(tripDayEntity.getId());
        itineraryEntity.setPoiId(poiEntity.getId());
        itineraryEntity.setVisitOrder(getNextVisitOrder(tripDayEntity.getId()));
        itineraryEntity.setTravelMethod(TravelMode.DRIVE.name());

        itineraryRepository.save(itineraryEntity);
    }

    @Transactional
    public void updateTripDayItem(
            Long tripId, Integer dayNumber, Long itemId, UpdateItineraryItemRequestDto request) {
        TripDayEntity tripDayEntity = getOwnedTripDayEntity(tripId, dayNumber);
        ItineraryEntity itineraryEntity =
                getOwnedItineraryEntity(tripId, dayNumber, tripDayEntity.getId(), itemId);

        itineraryEntity.setTravelMethod(
                TripTravelMethodMapper.toStoredValue(request.getTravelMethod()));
        itineraryRepository.save(itineraryEntity);
    }

    @Transactional
    public void deleteTripDayItem(Long tripId, Integer dayNumber, Long itemId) {
        TripDayEntity tripDayEntity = getOwnedTripDayEntity(tripId, dayNumber);
        ItineraryEntity itineraryEntity =
                getOwnedItineraryEntity(tripId, dayNumber, tripDayEntity.getId(), itemId);

        itineraryRepository.delete(itineraryEntity);
        reorderTripDayItems(tripDayEntity.getId());
    }

    private List<TripDayEntity> createTripDays(Long tripId, Integer durationDays) {
        List<TripDayEntity> tripDays = new ArrayList<>();
        for (int dayNumber = 1; dayNumber <= durationDays; dayNumber += 1) {
            TripDayEntity tripDayEntity = new TripDayEntity();
            tripDayEntity.setTripId(tripId);
            tripDayEntity.setDayNumber(dayNumber);
            tripDays.add(tripDayEntity);
        }
        return tripDays;
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
        getOwnedTripEntity(tripId);

        return tripDayRepository
                .findByTripIdAndDayNumber(tripId, dayNumber)
                .orElseThrow(
                        () ->
                                new BusinessException(
                                        ResultCode.BAD_REQUEST,
                                        "Trip day %d not found for trip %d."
                                                .formatted(dayNumber, tripId)));
    }

    private ItineraryEntity getOwnedItineraryEntity(
            Long tripId, Integer dayNumber, Long tripDayId, Long itemId) {
        ItineraryEntity itineraryEntity =
                itineraryRepository
                        .findById(itemId)
                        .orElseThrow(
                                () ->
                                        new BusinessException(
                                                ResultCode.BAD_REQUEST,
                                                "Itinerary item %d not found.".formatted(itemId)));

        if (!tripDayId.equals(itineraryEntity.getTripDayId())) {
            throw new BusinessException(
                    ResultCode.BAD_REQUEST,
                    "Itinerary item %d not found for day %d of trip %d."
                            .formatted(itemId, dayNumber, tripId));
        }

        return itineraryEntity;
    }

    private void reorderTripDayItems(Long tripDayId) {
        List<ItineraryEntity> remainingItems =
                itineraryRepository.findAllByTripDayIdOrderByVisitOrderAsc(tripDayId);

        for (int index = 0; index < remainingItems.size(); index += 1) {
            remainingItems.get(index).setVisitOrder(index + 1);
        }

        itineraryRepository.saveAll(remainingItems);
    }

    private PoiEntity getOrCreatePoiEntity(String placeId) {
        return poiRepository
                .findByPlacesId(placeId)
                .orElseGet(
                        () -> {
                            PoiEntity poiEntity = new PoiEntity();
                            poiEntity.setPlacesId(placeId);
                            return poiRepository.save(poiEntity);
                        });
    }

    private Integer getNextVisitOrder(Long tripDayId) {
        return itineraryRepository
                .findFirstByTripDayIdOrderByVisitOrderDesc(tripDayId)
                .map(ItineraryEntity::getVisitOrder)
                .map(lastVisitOrder -> lastVisitOrder + 1)
                .orElse(1);
    }
}
