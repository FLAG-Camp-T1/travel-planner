package com.travelplanner.backend.trip.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.travelplanner.backend.common.api.ResultCode;
import com.travelplanner.backend.common.context.CurrentUserProvider;
import com.travelplanner.backend.common.exception.BusinessException;
import com.travelplanner.backend.trip.dto.CreateTripRequestDto;
import com.travelplanner.backend.trip.dto.TripSummaryDto;
import com.travelplanner.backend.trip.dto.UpdateItineraryItemRequestDto;
import com.travelplanner.backend.trip.dto.UpdateTripRequestDto;
import com.travelplanner.backend.trip.model.ItineraryEntity;
import com.travelplanner.backend.trip.model.TripDayEntity;
import com.travelplanner.backend.trip.model.TripEntity;
import com.travelplanner.backend.trip.repository.ItineraryRepository;
import com.travelplanner.backend.trip.repository.TripDayRepository;
import com.travelplanner.backend.trip.repository.TripRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
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
    @Mock private ItineraryRepository itineraryRepository;
    @Mock private CurrentUserProvider currentUserProvider;

    @InjectMocks private TripCommandService tripCommandService;

    @Captor private ArgumentCaptor<List<TripDayEntity>> tripDaysCaptor;
    @Captor private ArgumentCaptor<TripEntity> tripCaptor;
    @Captor private ArgumentCaptor<List<ItineraryEntity>> itineraryItemsCaptor;

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

    @Test
    void updateTrip_UpdatesTrimmedTitleAndStartDate() {
        UpdateTripRequestDto request = new UpdateTripRequestDto();
        request.setTitle("  Updated DC Trip  ");
        request.setStartDate(LocalDate.of(2026, 4, 12));

        TripEntity tripEntity = new TripEntity();
        tripEntity.setId(1001L);
        tripEntity.setUserId(CURRENT_USER_ID);
        tripEntity.setTitle("Spring DC Trip");
        tripEntity.setDuration(3);
        tripEntity.setStartDate(LocalDate.of(2026, 4, 10));

        when(currentUserProvider.getCurrentUserId()).thenReturn(CURRENT_USER_ID);
        when(tripRepository.findByIdAndUserId(1001L, CURRENT_USER_ID))
                .thenReturn(Optional.of(tripEntity));
        when(tripRepository.save(any(TripEntity.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        TripSummaryDto result = tripCommandService.updateTrip(1001L, request);

        assertNotNull(result);
        assertEquals("Updated DC Trip", result.getTitle());
        assertEquals(LocalDate.of(2026, 4, 12), result.getStartDate());
        assertEquals(3, result.getDurationDays());

        verify(tripRepository).save(tripCaptor.capture());
        TripEntity savedTrip = tripCaptor.getValue();
        assertEquals("Updated DC Trip", savedTrip.getTitle());
        assertEquals(LocalDate.of(2026, 4, 12), savedTrip.getStartDate());
    }

    @Test
    void updateTrip_ClearsStartDateWhenNullIsProvided() {
        UpdateTripRequestDto request = new UpdateTripRequestDto();
        request.setTitle("Spring DC Trip");
        request.setStartDate(null);

        TripEntity tripEntity = new TripEntity();
        tripEntity.setId(1001L);
        tripEntity.setUserId(CURRENT_USER_ID);
        tripEntity.setTitle("Spring DC Trip");
        tripEntity.setDuration(3);
        tripEntity.setStartDate(LocalDate.of(2026, 4, 10));

        when(currentUserProvider.getCurrentUserId()).thenReturn(CURRENT_USER_ID);
        when(tripRepository.findByIdAndUserId(1001L, CURRENT_USER_ID))
                .thenReturn(Optional.of(tripEntity));
        when(tripRepository.save(any(TripEntity.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        TripSummaryDto result = tripCommandService.updateTrip(1001L, request);

        assertNotNull(result);
        assertNull(result.getStartDate());

        verify(tripRepository).save(tripCaptor.capture());
        assertNull(tripCaptor.getValue().getStartDate());
    }

    @Test
    void updateTrip_WhenTripIsNotOwned_ThrowsBusinessException() {
        UpdateTripRequestDto request = new UpdateTripRequestDto();
        request.setTitle("Updated DC Trip");

        when(currentUserProvider.getCurrentUserId()).thenReturn(CURRENT_USER_ID);
        when(tripRepository.findByIdAndUserId(1001L, CURRENT_USER_ID)).thenReturn(Optional.empty());

        BusinessException exception =
                assertThrows(
                        BusinessException.class,
                        () -> tripCommandService.updateTrip(1001L, request));

        assertEquals(ResultCode.BAD_REQUEST, exception.getResultCode());
        verify(tripRepository, never()).save(any(TripEntity.class));
    }

    @Test
    void deleteTrip_RemovesOwnedTrip() {
        TripEntity tripEntity = new TripEntity();
        tripEntity.setId(1001L);
        tripEntity.setUserId(CURRENT_USER_ID);

        when(currentUserProvider.getCurrentUserId()).thenReturn(CURRENT_USER_ID);
        when(tripRepository.findByIdAndUserId(1001L, CURRENT_USER_ID))
                .thenReturn(Optional.of(tripEntity));

        tripCommandService.deleteTrip(1001L);

        verify(tripRepository).delete(tripEntity);
    }

    @Test
    void deleteTrip_WhenTripIsNotOwned_ThrowsBusinessException() {
        when(currentUserProvider.getCurrentUserId()).thenReturn(CURRENT_USER_ID);
        when(tripRepository.findByIdAndUserId(1001L, CURRENT_USER_ID)).thenReturn(Optional.empty());

        BusinessException exception =
                assertThrows(BusinessException.class, () -> tripCommandService.deleteTrip(1001L));

        assertEquals(ResultCode.BAD_REQUEST, exception.getResultCode());
        verify(tripRepository, never()).delete(any(TripEntity.class));
    }

    @Test
    void updateTripDayItem_UpdatesTravelMethod() {
        UpdateItineraryItemRequestDto request = new UpdateItineraryItemRequestDto();
        request.setTravelMethod("TRANSIT");

        TripEntity tripEntity = new TripEntity();
        tripEntity.setId(1001L);
        tripEntity.setUserId(CURRENT_USER_ID);

        TripDayEntity tripDayEntity = new TripDayEntity();
        tripDayEntity.setId(2001L);
        tripDayEntity.setTripId(1001L);
        tripDayEntity.setDayNumber(1);

        ItineraryEntity itineraryEntity = new ItineraryEntity();
        itineraryEntity.setId(5001L);
        itineraryEntity.setTripDayId(2001L);
        itineraryEntity.setTravelMethod("DRIVE");

        when(currentUserProvider.getCurrentUserId()).thenReturn(CURRENT_USER_ID);
        when(tripRepository.findByIdAndUserId(1001L, CURRENT_USER_ID))
                .thenReturn(Optional.of(tripEntity));
        when(tripDayRepository.findByTripIdAndDayNumber(1001L, 1))
                .thenReturn(Optional.of(tripDayEntity));
        when(itineraryRepository.findById(5001L)).thenReturn(Optional.of(itineraryEntity));

        tripCommandService.updateTripDayItem(1001L, 1, 5001L, request);

        verify(itineraryRepository).save(itineraryEntity);
        assertEquals("TRANSIT", itineraryEntity.getTravelMethod());
    }

    @Test
    void updateTripDayItem_ClearsTravelMethodWhenUnspecified() {
        UpdateItineraryItemRequestDto request = new UpdateItineraryItemRequestDto();
        request.setTravelMethod("TRAVEL_MODE_UNSPECIFIED");

        TripEntity tripEntity = new TripEntity();
        tripEntity.setId(1001L);
        tripEntity.setUserId(CURRENT_USER_ID);

        TripDayEntity tripDayEntity = new TripDayEntity();
        tripDayEntity.setId(2001L);
        tripDayEntity.setTripId(1001L);
        tripDayEntity.setDayNumber(1);

        ItineraryEntity itineraryEntity = new ItineraryEntity();
        itineraryEntity.setId(5001L);
        itineraryEntity.setTripDayId(2001L);
        itineraryEntity.setTravelMethod("WALK");

        when(currentUserProvider.getCurrentUserId()).thenReturn(CURRENT_USER_ID);
        when(tripRepository.findByIdAndUserId(1001L, CURRENT_USER_ID))
                .thenReturn(Optional.of(tripEntity));
        when(tripDayRepository.findByTripIdAndDayNumber(1001L, 1))
                .thenReturn(Optional.of(tripDayEntity));
        when(itineraryRepository.findById(5001L)).thenReturn(Optional.of(itineraryEntity));

        tripCommandService.updateTripDayItem(1001L, 1, 5001L, request);

        verify(itineraryRepository).save(itineraryEntity);
        assertNull(itineraryEntity.getTravelMethod());
    }

    @Test
    void deleteTripDayItem_RemovesItemAndReordersRemainingStops() {
        TripEntity tripEntity = new TripEntity();
        tripEntity.setId(1001L);
        tripEntity.setUserId(CURRENT_USER_ID);

        TripDayEntity tripDayEntity = new TripDayEntity();
        tripDayEntity.setId(2001L);
        tripDayEntity.setTripId(1001L);
        tripDayEntity.setDayNumber(1);

        ItineraryEntity deletedItem = new ItineraryEntity();
        deletedItem.setId(5002L);
        deletedItem.setTripDayId(2001L);
        deletedItem.setVisitOrder(2);

        ItineraryEntity firstRemainingItem = new ItineraryEntity();
        firstRemainingItem.setId(5001L);
        firstRemainingItem.setTripDayId(2001L);
        firstRemainingItem.setVisitOrder(1);

        ItineraryEntity secondRemainingItem = new ItineraryEntity();
        secondRemainingItem.setId(5003L);
        secondRemainingItem.setTripDayId(2001L);
        secondRemainingItem.setVisitOrder(3);

        when(currentUserProvider.getCurrentUserId()).thenReturn(CURRENT_USER_ID);
        when(tripRepository.findByIdAndUserId(1001L, CURRENT_USER_ID))
                .thenReturn(Optional.of(tripEntity));
        when(tripDayRepository.findByTripIdAndDayNumber(1001L, 1))
                .thenReturn(Optional.of(tripDayEntity));
        when(itineraryRepository.findById(5002L)).thenReturn(Optional.of(deletedItem));
        when(itineraryRepository.findAllByTripDayIdOrderByVisitOrderAsc(2001L))
                .thenReturn(List.of(firstRemainingItem, secondRemainingItem));

        tripCommandService.deleteTripDayItem(1001L, 1, 5002L);

        verify(itineraryRepository).delete(deletedItem);
        verify(itineraryRepository).saveAll(itineraryItemsCaptor.capture());

        List<ItineraryEntity> reorderedItems = itineraryItemsCaptor.getValue();
        assertEquals(2, reorderedItems.size());
        assertEquals(1, reorderedItems.get(0).getVisitOrder());
        assertEquals(2, reorderedItems.get(1).getVisitOrder());
    }

    @Test
    void deleteTripDayItem_WhenItemDoesNotBelongToDay_ThrowsBusinessException() {
        TripEntity tripEntity = new TripEntity();
        tripEntity.setId(1001L);
        tripEntity.setUserId(CURRENT_USER_ID);

        TripDayEntity tripDayEntity = new TripDayEntity();
        tripDayEntity.setId(2001L);
        tripDayEntity.setTripId(1001L);
        tripDayEntity.setDayNumber(1);

        ItineraryEntity itineraryEntity = new ItineraryEntity();
        itineraryEntity.setId(5002L);
        itineraryEntity.setTripDayId(2002L);

        when(currentUserProvider.getCurrentUserId()).thenReturn(CURRENT_USER_ID);
        when(tripRepository.findByIdAndUserId(1001L, CURRENT_USER_ID))
                .thenReturn(Optional.of(tripEntity));
        when(tripDayRepository.findByTripIdAndDayNumber(1001L, 1))
                .thenReturn(Optional.of(tripDayEntity));
        when(itineraryRepository.findById(5002L)).thenReturn(Optional.of(itineraryEntity));

        BusinessException exception =
                assertThrows(
                        BusinessException.class,
                        () -> tripCommandService.deleteTripDayItem(1001L, 1, 5002L));

        assertEquals(ResultCode.BAD_REQUEST, exception.getResultCode());
        verify(itineraryRepository, never()).delete(any(ItineraryEntity.class));
        verify(itineraryRepository, never()).saveAll(any());
    }
}
