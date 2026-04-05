package com.travelplanner.backend.trip.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.travelplanner.backend.common.context.CurrentUserProvider;
import com.travelplanner.backend.trip.dto.CreateTripRequestDto;
import com.travelplanner.backend.trip.dto.TripSummaryDto;
import com.travelplanner.backend.trip.model.TripDayEntity;
import com.travelplanner.backend.trip.model.TripEntity;
import com.travelplanner.backend.trip.repository.TripDayRepository;
import com.travelplanner.backend.trip.repository.TripRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class TripCommandServiceTest {

    private static final UUID CURRENT_USER_ID =
            UUID.fromString("00000000-0000-0000-0000-000000000001");

    @Mock private TripRepository tripRepository;
    @Mock private TripDayRepository tripDayRepository;
    @Mock private CurrentUserProvider currentUserProvider;

    @InjectMocks private TripCommandService tripCommandService;

    @Captor private ArgumentCaptor<List<TripDayEntity>> tripDaysCaptor;

    @Test
    void createTrip_PersistsTripAndGeneratesOrderedDays() {
        CreateTripRequestDto request = new CreateTripRequestDto();
        request.setTitle("  Spring DC Trip  ");
        request.setDurationDays(3);
        request.setStartDate(LocalDate.of(2026, 4, 10));

        TripEntity savedTrip = new TripEntity();
        savedTrip.setId(1001L);
        savedTrip.setUserId(CURRENT_USER_ID);
        savedTrip.setTitle("Spring DC Trip");
        savedTrip.setDuration(3);
        savedTrip.setStartDate(LocalDate.of(2026, 4, 10));

        when(currentUserProvider.getCurrentUserId()).thenReturn(CURRENT_USER_ID);
        when(tripRepository.save(any(TripEntity.class))).thenReturn(savedTrip);

        TripSummaryDto result = tripCommandService.createTrip(request);

        assertNotNull(result);
        assertEquals(1001L, result.getTripId());
        assertEquals("Spring DC Trip", result.getTitle());
        assertEquals(3, result.getDurationDays());
        assertEquals(LocalDate.of(2026, 4, 10), result.getStartDate());

        verify(tripDayRepository).saveAll(tripDaysCaptor.capture());

        List<TripDayEntity> savedTripDays = tripDaysCaptor.getValue();
        assertEquals(3, savedTripDays.size());
        assertEquals(1001L, savedTripDays.get(0).getTripId());
        assertEquals(1, savedTripDays.get(0).getDayNumber());
        assertEquals(2, savedTripDays.get(1).getDayNumber());
        assertEquals(3, savedTripDays.get(2).getDayNumber());
    }
}
