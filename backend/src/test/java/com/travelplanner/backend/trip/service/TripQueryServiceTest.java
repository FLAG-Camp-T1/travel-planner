package com.travelplanner.backend.trip.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

import com.travelplanner.backend.common.api.ResultCode;
import com.travelplanner.backend.common.context.CurrentUserProvider;
import com.travelplanner.backend.common.exception.BusinessException;
import com.travelplanner.backend.trip.dto.TripDaysResponseDto;
import com.travelplanner.backend.trip.dto.TripSummaryDto;
import com.travelplanner.backend.trip.model.TripDayEntity;
import com.travelplanner.backend.trip.model.TripEntity;
import com.travelplanner.backend.trip.repository.TripDayRepository;
import com.travelplanner.backend.trip.repository.TripRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class TripQueryServiceTest {

    private static final UUID CURRENT_USER_ID =
            UUID.fromString("00000000-0000-0000-0000-000000000001");

    @Mock private TripRepository tripRepository;
    @Mock private TripDayRepository tripDayRepository;
    @Mock private CurrentUserProvider currentUserProvider;

    @InjectMocks private TripQueryService tripQueryService;

    @Test
    void getTrip_ReturnsOwnedTripSummary() {
        TripEntity tripEntity = new TripEntity();
        tripEntity.setId(1001L);
        tripEntity.setUserId(CURRENT_USER_ID);
        tripEntity.setTitle("Spring DC Trip");
        tripEntity.setDuration(3);
        tripEntity.setStartDate(LocalDate.of(2026, 4, 10));

        when(currentUserProvider.getCurrentUserId()).thenReturn(CURRENT_USER_ID);
        when(tripRepository.findByIdAndUserId(1001L, CURRENT_USER_ID))
                .thenReturn(Optional.of(tripEntity));

        TripSummaryDto result = tripQueryService.getTrip(1001L);

        assertEquals(1001L, result.getTripId());
        assertEquals("Spring DC Trip", result.getTitle());
        assertEquals(3, result.getDurationDays());
        assertEquals(LocalDate.of(2026, 4, 10), result.getStartDate());
    }

    @Test
    void getTrip_WhenTripIsMissing_ThrowsBusinessException() {
        when(currentUserProvider.getCurrentUserId()).thenReturn(CURRENT_USER_ID);
        when(tripRepository.findByIdAndUserId(1001L, CURRENT_USER_ID)).thenReturn(Optional.empty());

        BusinessException exception =
                assertThrows(BusinessException.class, () -> tripQueryService.getTrip(1001L));

        assertEquals(ResultCode.BAD_REQUEST, exception.getResultCode());
        assertEquals("Trip 1001 not found.", exception.getMessage());
    }

    @Test
    void getTripDays_DerivesDatesForFixedTrips() {
        TripEntity tripEntity = new TripEntity();
        tripEntity.setId(1001L);
        tripEntity.setUserId(CURRENT_USER_ID);
        tripEntity.setTitle("Spring DC Trip");
        tripEntity.setDuration(3);
        tripEntity.setStartDate(LocalDate.of(2026, 4, 10));

        TripDayEntity day1 = new TripDayEntity();
        day1.setId(1L);
        day1.setTripId(1001L);
        day1.setDayNumber(1);

        TripDayEntity day2 = new TripDayEntity();
        day2.setId(2L);
        day2.setTripId(1001L);
        day2.setDayNumber(2);

        when(currentUserProvider.getCurrentUserId()).thenReturn(CURRENT_USER_ID);
        when(tripRepository.findByIdAndUserId(1001L, CURRENT_USER_ID))
                .thenReturn(Optional.of(tripEntity));
        when(tripDayRepository.findAllByTripIdOrderByDayNumberAsc(1001L))
                .thenReturn(List.of(day1, day2));

        TripDaysResponseDto result = tripQueryService.getTripDays(1001L);

        assertEquals(1001L, result.getTripId());
        assertEquals(2, result.getDays().size());
        assertEquals(1, result.getDays().get(0).getDayNumber());
        assertEquals(LocalDate.of(2026, 4, 10), result.getDays().get(0).getDate());
        assertEquals(2, result.getDays().get(1).getDayNumber());
        assertEquals(LocalDate.of(2026, 4, 11), result.getDays().get(1).getDate());
    }

    @Test
    void getTripDays_LeavesDatesNullForFlexibleTrips() {
        TripEntity tripEntity = new TripEntity();
        tripEntity.setId(1002L);
        tripEntity.setUserId(CURRENT_USER_ID);
        tripEntity.setTitle("Flexible Trip");
        tripEntity.setDuration(2);
        tripEntity.setStartDate(null);

        TripDayEntity day1 = new TripDayEntity();
        day1.setId(1L);
        day1.setTripId(1002L);
        day1.setDayNumber(1);

        when(currentUserProvider.getCurrentUserId()).thenReturn(CURRENT_USER_ID);
        when(tripRepository.findByIdAndUserId(1002L, CURRENT_USER_ID))
                .thenReturn(Optional.of(tripEntity));
        when(tripDayRepository.findAllByTripIdOrderByDayNumberAsc(1002L)).thenReturn(List.of(day1));

        TripDaysResponseDto result = tripQueryService.getTripDays(1002L);

        assertEquals(1, result.getDays().size());
        assertNull(result.getDays().get(0).getDate());
    }
}
