package com.travelplanner.backend.trip.service;

import com.travelplanner.backend.common.context.CurrentUserProvider;
import com.travelplanner.backend.trip.dto.CreateTripRequestDto;
import com.travelplanner.backend.trip.dto.TripSummaryDto;
import com.travelplanner.backend.trip.model.TripDayEntity;
import com.travelplanner.backend.trip.model.TripEntity;
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
}
