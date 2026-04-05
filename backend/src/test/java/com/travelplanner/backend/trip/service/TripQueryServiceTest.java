package com.travelplanner.backend.trip.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

import com.travelplanner.backend.common.api.ResultCode;
import com.travelplanner.backend.common.context.CurrentUserProvider;
import com.travelplanner.backend.common.exception.BusinessException;
import com.travelplanner.backend.place.service.PlaceLookupService;
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
    @Mock private ItineraryRepository itineraryRepository;
    @Mock private PoiRepository poiRepository;
    @Mock private PlaceLookupService placeLookupService;
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

    @Test
    void getTripDayItems_ReturnsOrderedItemsWithResolvedNames() {
        TripEntity tripEntity = new TripEntity();
        tripEntity.setId(1001L);
        tripEntity.setUserId(CURRENT_USER_ID);

        TripDayEntity tripDayEntity = new TripDayEntity();
        tripDayEntity.setId(11L);
        tripDayEntity.setTripId(1001L);
        tripDayEntity.setDayNumber(1);

        ItineraryEntity firstItem = new ItineraryEntity();
        firstItem.setId(5001L);
        firstItem.setTripDayId(11L);
        firstItem.setPoiId(201L);
        firstItem.setVisitOrder(1);
        firstItem.setTravelMethod("TRAVEL_MODE_UNSPECIFIED");

        ItineraryEntity secondItem = new ItineraryEntity();
        secondItem.setId(5002L);
        secondItem.setTripDayId(11L);
        secondItem.setPoiId(202L);
        secondItem.setVisitOrder(2);
        secondItem.setTravelMethod("WALK");

        PoiEntity firstPoi = new PoiEntity();
        firstPoi.setId(201L);
        firstPoi.setPlacesId("ChIJVTPokywQkFQRmtVEaUZlJRA");

        PoiEntity secondPoi = new PoiEntity();
        secondPoi.setId(202L);
        secondPoi.setPlacesId("ChIJVVVVVYx3j4ARP-3NGldc8qQ");

        when(currentUserProvider.getCurrentUserId()).thenReturn(CURRENT_USER_ID);
        when(tripRepository.findByIdAndUserId(1001L, CURRENT_USER_ID))
                .thenReturn(Optional.of(tripEntity));
        when(tripDayRepository.findByTripIdAndDayNumber(1001L, 1))
                .thenReturn(Optional.of(tripDayEntity));
        when(itineraryRepository.findAllByTripDayIdOrderByVisitOrderAsc(11L))
                .thenReturn(List.of(firstItem, secondItem));
        when(poiRepository.findAllById(List.of(201L, 202L)))
                .thenReturn(List.of(firstPoi, secondPoi));
        when(placeLookupService.resolveDisplayName("ChIJVTPokywQkFQRmtVEaUZlJRA"))
                .thenReturn("Pike Place Market");
        when(placeLookupService.resolveDisplayName("ChIJVVVVVYx3j4ARP-3NGldc8qQ"))
                .thenReturn("Route Example Origin");

        TripDayItemsResponseDto result = tripQueryService.getTripDayItems(1001L, 1);

        assertEquals(1001L, result.getTripId());
        assertEquals(1, result.getDayNumber());
        assertEquals(2, result.getItems().size());
        assertEquals(5001L, result.getItems().get(0).getItemId());
        assertEquals("Pike Place Market", result.getItems().get(0).getName());
        assertNull(result.getItems().get(0).getTravelMethod());
        assertEquals("Walk", result.getItems().get(1).getTravelMethod());
    }

    @Test
    void getTripDayItems_WhenPlaceLookupFails_PropagatesBusinessException() {
        TripEntity tripEntity = new TripEntity();
        tripEntity.setId(1001L);
        tripEntity.setUserId(CURRENT_USER_ID);

        TripDayEntity tripDayEntity = new TripDayEntity();
        tripDayEntity.setId(11L);
        tripDayEntity.setTripId(1001L);
        tripDayEntity.setDayNumber(1);

        ItineraryEntity itineraryItem = new ItineraryEntity();
        itineraryItem.setId(5001L);
        itineraryItem.setTripDayId(11L);
        itineraryItem.setPoiId(201L);
        itineraryItem.setVisitOrder(1);
        itineraryItem.setTravelMethod("DRIVE");

        PoiEntity poiEntity = new PoiEntity();
        poiEntity.setId(201L);
        poiEntity.setPlacesId("ChIJVTPokywQkFQRmtVEaUZlJRA");

        when(currentUserProvider.getCurrentUserId()).thenReturn(CURRENT_USER_ID);
        when(tripRepository.findByIdAndUserId(1001L, CURRENT_USER_ID))
                .thenReturn(Optional.of(tripEntity));
        when(tripDayRepository.findByTripIdAndDayNumber(1001L, 1))
                .thenReturn(Optional.of(tripDayEntity));
        when(itineraryRepository.findAllByTripDayIdOrderByVisitOrderAsc(11L))
                .thenReturn(List.of(itineraryItem));
        when(poiRepository.findAllById(List.of(201L))).thenReturn(List.of(poiEntity));
        when(placeLookupService.resolveDisplayName("ChIJVTPokywQkFQRmtVEaUZlJRA"))
                .thenThrow(new BusinessException(ResultCode.GOOGLE_PLACES_REQUEST_ERROR));

        BusinessException exception =
                assertThrows(
                        BusinessException.class, () -> tripQueryService.getTripDayItems(1001L, 1));

        assertEquals(ResultCode.GOOGLE_PLACES_REQUEST_ERROR, exception.getResultCode());
    }
}
