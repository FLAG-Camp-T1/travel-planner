package com.travelplanner.backend.trip.bootstrap;

import static org.junit.jupiter.api.Assertions.assertTrue;
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
    void seedIfNeeded_CreatesTwoCityTripsPoisAndItinerariesWhenMissing() {
        AtomicLong poiSequence = new AtomicLong(200L);

        when(currentUserProvider.getCurrentUserId()).thenReturn(CURRENT_USER_ID);
        when(tripRepository.findByUserIdAndTitle(
                        CURRENT_USER_ID, DevelopmentTripSeedService.FIXED_TRIP_TITLE))
                .thenReturn(Optional.empty())
                .thenReturn(
                        Optional.of(
                                tripEntity(1001L, DevelopmentTripSeedService.FIXED_TRIP_TITLE, 1)));
        when(tripRepository.findByUserIdAndTitle(
                        CURRENT_USER_ID, DevelopmentTripSeedService.FLEXIBLE_TRIP_TITLE))
                .thenReturn(Optional.empty())
                .thenReturn(
                        Optional.of(
                                tripEntity(
                                        1002L, DevelopmentTripSeedService.FLEXIBLE_TRIP_TITLE, 1)));

        when(tripRepository.findByIdAndUserId(1001L, CURRENT_USER_ID))
                .thenReturn(
                        Optional.of(
                                tripEntity(1001L, DevelopmentTripSeedService.FIXED_TRIP_TITLE, 1)));
        when(tripRepository.findByIdAndUserId(1002L, CURRENT_USER_ID))
                .thenReturn(
                        Optional.of(
                                tripEntity(
                                        1002L, DevelopmentTripSeedService.FLEXIBLE_TRIP_TITLE, 1)));

        when(tripCommandService.createTrip(any()))
                .thenReturn(tripSummary(1001L, DevelopmentTripSeedService.FIXED_TRIP_TITLE, 1))
                .thenReturn(tripSummary(1002L, DevelopmentTripSeedService.FLEXIBLE_TRIP_TITLE, 1));

        when(tripDayRepository.findAllByTripIdOrderByDayNumberAsc(1001L))
                .thenReturn(List.of(tripDay(11L, 1001L, 1)));
        when(tripDayRepository.findAllByTripIdOrderByDayNumberAsc(1002L))
                .thenReturn(List.of(tripDay(21L, 1002L, 1)));

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
        verify(tripCommandService, times(DevelopmentTripSeedService.SEEDED_TRIP_COUNT))
                .createTrip(any());
        verify(poiRepository, times(DevelopmentTripSeedService.SEEDED_POI_COUNT))
                .save(any(PoiEntity.class));
        verify(itineraryRepository, times(DevelopmentTripSeedService.SEEDED_ITINERARY_STOP_COUNT))
                .save(itineraryCaptor.capture());

        List<ItineraryEntity> savedStops = itineraryCaptor.getAllValues();
        assertTrue(
                savedStops.stream()
                        .anyMatch(
                                stop ->
                                        stop.getTripDayId().equals(11L)
                                                && stop.getVisitOrder().equals(1)
                                                && "TRAVEL_MODE_UNSPECIFIED"
                                                        .equals(stop.getTravelMethod())));
        assertTrue(
                savedStops.stream()
                        .anyMatch(
                                stop ->
                                        stop.getTripDayId().equals(11L)
                                                && stop.getVisitOrder().equals(2)
                                                && "WALK".equals(stop.getTravelMethod())));
        assertTrue(
                savedStops.stream()
                        .anyMatch(
                                stop ->
                                        stop.getTripDayId().equals(11L)
                                                && stop.getVisitOrder().equals(3)
                                                && "TRANSIT".equals(stop.getTravelMethod())));
        assertTrue(
                savedStops.stream()
                        .anyMatch(
                                stop ->
                                        stop.getTripDayId().equals(11L)
                                                && stop.getVisitOrder().equals(4)
                                                && "DRIVE".equals(stop.getTravelMethod())));
        assertTrue(
                savedStops.stream()
                        .anyMatch(
                                stop ->
                                        stop.getTripDayId().equals(21L)
                                                && stop.getVisitOrder().equals(2)
                                                && "BICYCLE".equals(stop.getTravelMethod())));
        assertTrue(
                savedStops.stream()
                        .anyMatch(
                                stop ->
                                        stop.getTripDayId().equals(21L)
                                                && stop.getVisitOrder().equals(3)
                                                && "DRIVE".equals(stop.getTravelMethod())));
        assertTrue(
                savedStops.stream()
                        .anyMatch(
                                stop ->
                                        stop.getTripDayId().equals(21L)
                                                && stop.getVisitOrder().equals(4)
                                                && "WALK".equals(stop.getTravelMethod())));
    }

    @Test
    void seedIfNeeded_WhenSeedDataAlreadyExists_DoesNotCreateDuplicates() {
        when(currentUserProvider.getCurrentUserId()).thenReturn(CURRENT_USER_ID);
        when(tripRepository.findByUserIdAndTitle(
                        CURRENT_USER_ID, DevelopmentTripSeedService.FIXED_TRIP_TITLE))
                .thenReturn(
                        Optional.of(
                                tripEntity(1001L, DevelopmentTripSeedService.FIXED_TRIP_TITLE, 1)));
        when(tripRepository.findByUserIdAndTitle(
                        CURRENT_USER_ID, DevelopmentTripSeedService.FLEXIBLE_TRIP_TITLE))
                .thenReturn(
                        Optional.of(
                                tripEntity(
                                        1002L, DevelopmentTripSeedService.FLEXIBLE_TRIP_TITLE, 1)));

        when(tripDayRepository.findAllByTripIdOrderByDayNumberAsc(1001L))
                .thenReturn(List.of(tripDay(11L, 1001L, 1)));
        when(tripDayRepository.findAllByTripIdOrderByDayNumberAsc(1002L))
                .thenReturn(List.of(tripDay(21L, 1002L, 1)));

        when(poiRepository.findByPlacesId(eq("ChIJldJnhJG3t4kRnJ3McC1qVyo")))
                .thenReturn(Optional.of(poiEntity(201L, "ChIJldJnhJG3t4kRnJ3McC1qVyo")));
        when(poiRepository.findByPlacesId(eq("ChIJCYr0k6i3t4kRJNOniIKWv4Y")))
                .thenReturn(Optional.of(poiEntity(202L, "ChIJCYr0k6i3t4kRJNOniIKWv4Y")));
        when(poiRepository.findByPlacesId(eq("ChIJbwqv9yK4t4kRGixTvXJNjK0")))
                .thenReturn(Optional.of(poiEntity(203L, "ChIJbwqv9yK4t4kRGixTvXJNjK0")));
        when(poiRepository.findByPlacesId(eq("ChIJIwHC3D-4t4kR7tGTisOikGM")))
                .thenReturn(Optional.of(poiEntity(204L, "ChIJIwHC3D-4t4kR7tGTisOikGM")));
        when(poiRepository.findByPlacesId(eq("ChIJmY9L9lCJGGAR3ydy0pQ5y8A")))
                .thenReturn(Optional.of(poiEntity(205L, "ChIJmY9L9lCJGGAR3ydy0pQ5y8A")));
        when(poiRepository.findByPlacesId(eq("ChIJv-sM5bGOGGARXL9S7cVu7jo")))
                .thenReturn(Optional.of(poiEntity(206L, "ChIJv-sM5bGOGGARXL9S7cVu7jo")));
        when(poiRepository.findByPlacesId(eq("ChIJ2f9BNp6OGGARfxtv1tT31dk")))
                .thenReturn(Optional.of(poiEntity(207L, "ChIJ2f9BNp6OGGARfxtv1tT31dk")));
        when(poiRepository.findByPlacesId(eq("ChIJ81MDY9SNGGARsEZEhfyZ2JQ")))
                .thenReturn(Optional.of(poiEntity(208L, "ChIJ81MDY9SNGGARsEZEhfyZ2JQ")));

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
