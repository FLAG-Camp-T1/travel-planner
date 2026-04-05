package com.travelplanner.backend.trip.bootstrap;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.travelplanner.backend.common.context.CurrentUserProvider;
import com.travelplanner.backend.trip.dto.TripSummaryDto;
import com.travelplanner.backend.trip.model.ItineraryEntity;
import com.travelplanner.backend.trip.model.PoiEntity;
import com.travelplanner.backend.trip.model.TripDayEntity;
import com.travelplanner.backend.trip.model.TripEntity;
import com.travelplanner.backend.trip.repository.ItineraryRepository;
import com.travelplanner.backend.trip.repository.PoiRepository;
import com.travelplanner.backend.trip.repository.TripDayRepository;
import com.travelplanner.backend.trip.repository.TripRepository;
import com.travelplanner.backend.trip.service.TripCommandService;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;

@ExtendWith(MockitoExtension.class)
class DevelopmentTripSeedServiceTest {

    private static final UUID CURRENT_USER_ID =
            UUID.fromString("00000000-0000-0000-0000-000000000001");

    @Mock private NamedParameterJdbcTemplate jdbcTemplate;
    @Mock private CurrentUserProvider currentUserProvider;
    @Mock private TripRepository tripRepository;
    @Mock private TripDayRepository tripDayRepository;
    @Mock private PoiRepository poiRepository;
    @Mock private ItineraryRepository itineraryRepository;
    @Mock private TripCommandService tripCommandService;

    @InjectMocks private DevelopmentTripSeedService developmentTripSeedService;

    @Captor private ArgumentCaptor<ItineraryEntity> itineraryCaptor;

    @Test
    void seedIfNeeded_CreatesDevUserTripsPoisAndItinerariesWhenMissing() {
        AtomicLong poiSequence = new AtomicLong(200L);

        when(currentUserProvider.getCurrentUserId()).thenReturn(CURRENT_USER_ID);
        when(tripRepository.findByUserIdAndTitle(
                        CURRENT_USER_ID, DevelopmentTripSeedService.FIXED_TRIP_TITLE))
                .thenReturn(Optional.empty())
                .thenReturn(
                        Optional.of(
                                tripEntity(1001L, DevelopmentTripSeedService.FIXED_TRIP_TITLE, 3)));
        when(tripRepository.findByUserIdAndTitle(
                        CURRENT_USER_ID, DevelopmentTripSeedService.FLEXIBLE_TRIP_TITLE))
                .thenReturn(Optional.empty())
                .thenReturn(
                        Optional.of(
                                tripEntity(
                                        1002L, DevelopmentTripSeedService.FLEXIBLE_TRIP_TITLE, 2)));

        when(tripRepository.findByIdAndUserId(1001L, CURRENT_USER_ID))
                .thenReturn(
                        Optional.of(
                                tripEntity(1001L, DevelopmentTripSeedService.FIXED_TRIP_TITLE, 3)));
        when(tripRepository.findByIdAndUserId(1002L, CURRENT_USER_ID))
                .thenReturn(
                        Optional.of(
                                tripEntity(
                                        1002L, DevelopmentTripSeedService.FLEXIBLE_TRIP_TITLE, 2)));

        when(tripCommandService.createTrip(any()))
                .thenReturn(tripSummary(1001L, DevelopmentTripSeedService.FIXED_TRIP_TITLE, 3))
                .thenReturn(tripSummary(1002L, DevelopmentTripSeedService.FLEXIBLE_TRIP_TITLE, 2));

        when(tripDayRepository.findAllByTripIdOrderByDayNumberAsc(1001L))
                .thenReturn(
                        List.of(
                                tripDay(11L, 1001L, 1),
                                tripDay(12L, 1001L, 2),
                                tripDay(13L, 1001L, 3)));
        when(tripDayRepository.findAllByTripIdOrderByDayNumberAsc(1002L))
                .thenReturn(List.of(tripDay(21L, 1002L, 1), tripDay(22L, 1002L, 2)));

        when(poiRepository.findByPlacesId(any())).thenReturn(Optional.empty());
        when(poiRepository.save(any(PoiEntity.class)))
                .thenAnswer(
                        invocation -> {
                            PoiEntity poiEntity = invocation.getArgument(0);
                            poiEntity.setId(poiSequence.incrementAndGet());
                            return poiEntity;
                        });

        when(itineraryRepository.existsByTripDayIdAndVisitOrder(anyLong(), any()))
                .thenReturn(false);

        developmentTripSeedService.seedIfNeeded();

        verify(jdbcTemplate).update(any(String.class), any(MapSqlParameterSource.class));
        verify(tripCommandService, times(2)).createTrip(any());
        verify(poiRepository, times(4)).save(any(PoiEntity.class));
        verify(itineraryRepository, times(5)).save(itineraryCaptor.capture());

        List<ItineraryEntity> savedStops = itineraryCaptor.getAllValues();
        assertEquals(11L, savedStops.get(0).getTripDayId());
        assertEquals(1, savedStops.get(0).getVisitOrder());
        assertEquals("TRAVEL_MODE_UNSPECIFIED", savedStops.get(0).getTravelMethod());
        assertEquals(12L, savedStops.get(3).getTripDayId());
        assertEquals(21L, savedStops.get(4).getTripDayId());
    }

    @Test
    void seedIfNeeded_WhenSeedDataAlreadyExists_DoesNotCreateDuplicates() {
        when(currentUserProvider.getCurrentUserId()).thenReturn(CURRENT_USER_ID);
        when(tripRepository.findByUserIdAndTitle(
                        CURRENT_USER_ID, DevelopmentTripSeedService.FIXED_TRIP_TITLE))
                .thenReturn(
                        Optional.of(
                                tripEntity(1001L, DevelopmentTripSeedService.FIXED_TRIP_TITLE, 3)));
        when(tripRepository.findByUserIdAndTitle(
                        CURRENT_USER_ID, DevelopmentTripSeedService.FLEXIBLE_TRIP_TITLE))
                .thenReturn(
                        Optional.of(
                                tripEntity(
                                        1002L, DevelopmentTripSeedService.FLEXIBLE_TRIP_TITLE, 2)));

        when(tripDayRepository.findAllByTripIdOrderByDayNumberAsc(1001L))
                .thenReturn(
                        List.of(
                                tripDay(11L, 1001L, 1),
                                tripDay(12L, 1001L, 2),
                                tripDay(13L, 1001L, 3)));
        when(tripDayRepository.findAllByTripIdOrderByDayNumberAsc(1002L))
                .thenReturn(List.of(tripDay(21L, 1002L, 1), tripDay(22L, 1002L, 2)));

        when(poiRepository.findByPlacesId(eq("ChIJVTPokywQkFQRmtVEaUZlJRA")))
                .thenReturn(Optional.of(poiEntity(201L, "ChIJVTPokywQkFQRmtVEaUZlJRA")));
        when(poiRepository.findByPlacesId(eq("ChIJN1t_tDeuEmsRUsoyG83frY4")))
                .thenReturn(Optional.of(poiEntity(202L, "ChIJN1t_tDeuEmsRUsoyG83frY4")));
        when(poiRepository.findByPlacesId(eq("ChIJVVVVVYx3j4ARP-3NGldc8qQ")))
                .thenReturn(Optional.of(poiEntity(203L, "ChIJVVVVVYx3j4ARP-3NGldc8qQ")));
        when(poiRepository.findByPlacesId(eq("ChIJJcSDXXx3j4ARRef7L0P3GpY")))
                .thenReturn(Optional.of(poiEntity(204L, "ChIJJcSDXXx3j4ARRef7L0P3GpY")));

        when(itineraryRepository.existsByTripDayIdAndVisitOrder(anyLong(), any())).thenReturn(true);

        developmentTripSeedService.seedIfNeeded();

        verify(jdbcTemplate).update(any(String.class), any(MapSqlParameterSource.class));
        verify(tripCommandService, never()).createTrip(any());
        verify(poiRepository, never()).save(any(PoiEntity.class));
        verify(itineraryRepository, never()).save(any(ItineraryEntity.class));
    }

    private static TripEntity tripEntity(Long id, String title, Integer durationDays) {
        TripEntity tripEntity = new TripEntity();
        tripEntity.setId(id);
        tripEntity.setUserId(CURRENT_USER_ID);
        tripEntity.setTitle(title);
        tripEntity.setDuration(durationDays);
        return tripEntity;
    }

    private static TripSummaryDto tripSummary(Long tripId, String title, Integer durationDays) {
        TripSummaryDto tripSummary = new TripSummaryDto();
        tripSummary.setTripId(tripId);
        tripSummary.setTitle(title);
        tripSummary.setDurationDays(durationDays);
        return tripSummary;
    }

    private static TripDayEntity tripDay(Long id, Long tripId, Integer dayNumber) {
        TripDayEntity tripDayEntity = new TripDayEntity();
        tripDayEntity.setId(id);
        tripDayEntity.setTripId(tripId);
        tripDayEntity.setDayNumber(dayNumber);
        return tripDayEntity;
    }

    private static PoiEntity poiEntity(Long id, String placesId) {
        PoiEntity poiEntity = new PoiEntity();
        poiEntity.setId(id);
        poiEntity.setPlacesId(placesId);
        return poiEntity;
    }
}
