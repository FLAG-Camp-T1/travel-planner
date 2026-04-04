package com.travelplanner.backend.trip.service;

import com.travelplanner.backend.common.api.ResultCode;
import com.travelplanner.backend.common.context.CurrentUserProvider;
import com.travelplanner.backend.common.exception.BusinessException;
import com.travelplanner.backend.trip.dto.TripDayDto;
import com.travelplanner.backend.trip.dto.TripDaysResponseDto;
import com.travelplanner.backend.trip.dto.TripSummaryDto;
import com.travelplanner.backend.trip.model.TripEntity;
import com.travelplanner.backend.trip.repository.TripDayRepository;
import com.travelplanner.backend.trip.repository.TripRepository;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TripQueryService {

    private final TripRepository tripRepository;
    private final TripDayRepository tripDayRepository;
    private final CurrentUserProvider currentUserProvider;

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
}
