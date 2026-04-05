package com.travelplanner.backend.trip.service;

import com.travelplanner.backend.common.api.ResultCode;
import com.travelplanner.backend.common.context.CurrentUserProvider;
import com.travelplanner.backend.common.exception.BusinessException;
import com.travelplanner.backend.place.service.PlaceLookupService;
import com.travelplanner.backend.route.enums.TravelMode;
import com.travelplanner.backend.trip.dto.CreateItineraryItemRequestDto;
import com.travelplanner.backend.trip.dto.CreateTripRequestDto;
import com.travelplanner.backend.trip.dto.MoveTripDayItemRequestDto;
import com.travelplanner.backend.trip.dto.ReorderTripDayItemsRequestDto;
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
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
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
        Integer requestedDuration = request.getDurationDays();
        Integer currentDuration = tripEntity.getDuration();

        if (trimmedTitle.isEmpty()) {
            throw new BusinessException(ResultCode.PARAM_INVALID, "Trip title must not be blank.");
        }

        if (requestedDuration < currentDuration) {
            shrinkTripDays(tripEntity.getId(), requestedDuration);
        }

        tripEntity.setTitle(trimmedTitle);
        tripEntity.setDuration(requestedDuration);
        tripEntity.setStartDate(request.getStartDate());

        if (requestedDuration > currentDuration) {
            tripDayRepository.saveAll(
                    createTripDays(tripEntity.getId(), currentDuration + 1, requestedDuration));
        }

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
        List<ItineraryEntity> remainingItems =
                itineraryRepository.findAllByTripDayIdOrderByVisitOrderAsc(tripDayEntity.getId());
        rewriteVisitOrder(remainingItems);
        itineraryRepository.saveAll(remainingItems);
    }

    @Transactional
    public void reorderTripDayItems(
            Long tripId, Integer dayNumber, ReorderTripDayItemsRequestDto request) {
        TripDayEntity tripDayEntity = getOwnedTripDayEntity(tripId, dayNumber);
        List<ItineraryEntity> currentItems =
                itineraryRepository.findAllByTripDayIdOrderByVisitOrderAsc(tripDayEntity.getId());
        List<Long> requestedItemIds = request.getItemIds();

        validateTripDayReorderRequest(tripId, dayNumber, currentItems, requestedItemIds);

        Map<Long, ItineraryEntity> itemsById =
                currentItems.stream()
                        .collect(Collectors.toMap(ItineraryEntity::getId, Function.identity()));
        List<ItineraryEntity> reorderedItems =
                requestedItemIds.stream().map(itemsById::get).toList();

        persistTripDayReorder(reorderedItems);
    }

    @Transactional
    public void moveTripDayItem(
            Long tripId, Integer dayNumber, Long itemId, MoveTripDayItemRequestDto request) {
        TripDayEntity sourceTripDayEntity = getOwnedTripDayEntity(tripId, dayNumber);
        Integer targetDayNumber = request.getTargetDayNumber();
        if (dayNumber.equals(targetDayNumber)) {
            throw new BusinessException(
                    ResultCode.BAD_REQUEST,
                    "Target day must differ from the source day for move operations.");
        }

        TripDayEntity targetTripDayEntity = getOwnedTripDayEntity(tripId, targetDayNumber);
        ItineraryEntity itineraryEntity =
                getOwnedItineraryEntity(tripId, dayNumber, sourceTripDayEntity.getId(), itemId);

        itineraryEntity.setTripDayId(targetTripDayEntity.getId());
        itineraryEntity.setVisitOrder(getNextVisitOrder(targetTripDayEntity.getId()));
        itineraryRepository.save(itineraryEntity);

        List<ItineraryEntity> sourceItems =
                itineraryRepository.findAllByTripDayIdOrderByVisitOrderAsc(
                        sourceTripDayEntity.getId());
        rewriteVisitOrder(sourceItems);
        itineraryRepository.saveAll(sourceItems);
    }

    private List<TripDayEntity> createTripDays(Long tripId, Integer durationDays) {
        return createTripDays(tripId, 1, durationDays);
    }

    private List<TripDayEntity> createTripDays(
            Long tripId, Integer startDayNumber, Integer endDayNumber) {
        List<TripDayEntity> tripDays = new ArrayList<>();
        for (int dayNumber = startDayNumber; dayNumber <= endDayNumber; dayNumber += 1) {
            TripDayEntity tripDayEntity = new TripDayEntity();
            tripDayEntity.setTripId(tripId);
            tripDayEntity.setDayNumber(dayNumber);
            tripDays.add(tripDayEntity);
        }
        return tripDays;
    }

    private void shrinkTripDays(Long tripId, Integer requestedDuration) {
        List<TripDayEntity> tripDays = tripDayRepository.findAllByTripIdOrderByDayNumberAsc(tripId);
        List<TripDayEntity> removableTripDays =
                tripDays.stream()
                        .filter((tripDay) -> tripDay.getDayNumber() > requestedDuration)
                        .toList();

        boolean hasItemsOnTrimmedDays =
                removableTripDays.stream()
                        .anyMatch(
                                (tripDay) ->
                                        itineraryRepository.existsByTripDayId(tripDay.getId()));
        if (hasItemsOnTrimmedDays) {
            throw new BusinessException(
                    ResultCode.BAD_REQUEST,
                    "Cannot reduce trip duration while trimmed days still contain itinerary items.");
        }

        tripDayRepository.deleteAll(removableTripDays);
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

    private void validateTripDayReorderRequest(
            Long tripId,
            Integer dayNumber,
            List<ItineraryEntity> currentItems,
            List<Long> itemIds) {
        Set<Long> requestedItemIdSet = new HashSet<>(itemIds);
        if (requestedItemIdSet.size() != itemIds.size()) {
            throw new BusinessException(
                    ResultCode.BAD_REQUEST,
                    "Duplicate itinerary items are not allowed in the reorder request.");
        }

        Set<Long> currentItemIdSet =
                currentItems.stream().map(ItineraryEntity::getId).collect(Collectors.toSet());

        if (itemIds.size() != currentItems.size() || !currentItemIdSet.equals(requestedItemIdSet)) {
            throw new BusinessException(
                    ResultCode.BAD_REQUEST,
                    "Reorder request must include every itinerary item for day %d of trip %d."
                            .formatted(dayNumber, tripId));
        }
    }

    private void rewriteVisitOrder(List<ItineraryEntity> items) {
        for (int index = 0; index < items.size(); index += 1) {
            items.get(index).setVisitOrder(index + 1);
        }
    }

    private void persistTripDayReorder(List<ItineraryEntity> reorderedItems) {
        int temporaryVisitOrderBase =
                reorderedItems.stream()
                        .map(ItineraryEntity::getVisitOrder)
                        .max(Integer::compareTo)
                        .orElse(0);

        for (int index = 0; index < reorderedItems.size(); index += 1) {
            reorderedItems.get(index).setVisitOrder(temporaryVisitOrderBase + index + 1);
        }
        itineraryRepository.saveAll(reorderedItems);

        rewriteVisitOrder(reorderedItems);
        itineraryRepository.saveAll(reorderedItems);
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
