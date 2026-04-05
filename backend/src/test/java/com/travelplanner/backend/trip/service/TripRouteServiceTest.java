package com.travelplanner.backend.trip.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.travelplanner.backend.common.context.CurrentUserProvider;
import com.travelplanner.backend.route.enums.TravelMode;
import com.travelplanner.backend.route.model.ComputedRouteLeg;
import com.travelplanner.backend.route.service.RouteProvider;
import com.travelplanner.backend.trip.dto.GenerateDayRouteResponseDto;
import com.travelplanner.backend.trip.model.ItineraryEntity;
import com.travelplanner.backend.trip.model.PoiEntity;
import com.travelplanner.backend.trip.model.TripDayEntity;
import com.travelplanner.backend.trip.model.TripEntity;
import com.travelplanner.backend.trip.repository.ItineraryRepository;
import com.travelplanner.backend.trip.repository.PoiRepository;
import com.travelplanner.backend.trip.repository.TripDayRepository;
import com.travelplanner.backend.trip.repository.TripRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class TripRouteServiceTest {

    private static final UUID CURRENT_USER_ID =
            UUID.fromString("00000000-0000-0000-0000-000000000001");

    @Mock private TripRepository tripRepository;
    @Mock private TripDayRepository tripDayRepository;
    @Mock private ItineraryRepository itineraryRepository;
    @Mock private PoiRepository poiRepository;
    @Mock private RouteProvider routeProvider;
    @Mock private CurrentUserProvider currentUserProvider;

    @InjectMocks private TripRouteService tripRouteService;

    @Test
    void generateDayRoute_WithNoItems_ReturnsNullSummaryAndNoSegments() {
        TripEntity tripEntity = tripEntity(1001L);
        TripDayEntity tripDayEntity = tripDayEntity(11L, 1001L, 1);

        when(currentUserProvider.getCurrentUserId()).thenReturn(CURRENT_USER_ID);
        when(tripRepository.findByIdAndUserId(1001L, CURRENT_USER_ID))
                .thenReturn(Optional.of(tripEntity));
        when(tripDayRepository.findByTripIdAndDayNumber(1001L, 1))
                .thenReturn(Optional.of(tripDayEntity));
        when(itineraryRepository.findAllByTripDayIdOrderByVisitOrderAsc(11L)).thenReturn(List.of());

        GenerateDayRouteResponseDto result = tripRouteService.generateDayRoute(1001L, 1);

        assertEquals(1001L, result.getTripId());
        assertEquals(1, result.getDayNumber());
        assertNull(result.getRouteSummary());
        assertEquals(0, result.getSegments().size());
        verify(routeProvider, never())
                .computeLeg(
                        org.mockito.ArgumentMatchers.any(),
                        org.mockito.ArgumentMatchers.any(),
                        org.mockito.ArgumentMatchers.any());
    }

    @Test
    void generateDayRoute_WithOneItem_ReturnsNullSummaryAndNoSegments() {
        TripEntity tripEntity = tripEntity(1001L);
        TripDayEntity tripDayEntity = tripDayEntity(11L, 1001L, 1);
        ItineraryEntity firstItem = itineraryItem(5001L, 11L, 201L, 1, "TRAVEL_MODE_UNSPECIFIED");

        when(currentUserProvider.getCurrentUserId()).thenReturn(CURRENT_USER_ID);
        when(tripRepository.findByIdAndUserId(1001L, CURRENT_USER_ID))
                .thenReturn(Optional.of(tripEntity));
        when(tripDayRepository.findByTripIdAndDayNumber(1001L, 1))
                .thenReturn(Optional.of(tripDayEntity));
        when(itineraryRepository.findAllByTripDayIdOrderByVisitOrderAsc(11L))
                .thenReturn(List.of(firstItem));

        GenerateDayRouteResponseDto result = tripRouteService.generateDayRoute(1001L, 1);

        assertNull(result.getRouteSummary());
        assertEquals(0, result.getSegments().size());
        verify(routeProvider, never())
                .computeLeg(
                        org.mockito.ArgumentMatchers.any(),
                        org.mockito.ArgumentMatchers.any(),
                        org.mockito.ArgumentMatchers.any());
    }

    @Test
    void generateDayRoute_WithMultipleItems_ComputesSegmentsAndAggregatesSummary() {
        TripEntity tripEntity = tripEntity(1001L);
        TripDayEntity tripDayEntity = tripDayEntity(11L, 1001L, 1);

        ItineraryEntity firstItem = itineraryItem(5001L, 11L, 201L, 1, "TRAVEL_MODE_UNSPECIFIED");
        ItineraryEntity secondItem = itineraryItem(5002L, 11L, 202L, 2, "WALK");
        ItineraryEntity thirdItem = itineraryItem(5003L, 11L, 203L, 3, "TRANSIT");

        PoiEntity firstPoi = poiEntity(201L, "place-1");
        PoiEntity secondPoi = poiEntity(202L, "place-2");
        PoiEntity thirdPoi = poiEntity(203L, "place-3");

        ComputedRouteLeg firstLeg =
                routeLeg(
                        1200,
                        600L,
                        "encoded-1",
                        List.of(point(47.60, -122.34), point(47.61, -122.33)));
        ComputedRouteLeg secondLeg =
                routeLeg(
                        2300,
                        900L,
                        "encoded-2",
                        List.of(point(47.61, -122.33), point(47.62, -122.32)));

        when(currentUserProvider.getCurrentUserId()).thenReturn(CURRENT_USER_ID);
        when(tripRepository.findByIdAndUserId(1001L, CURRENT_USER_ID))
                .thenReturn(Optional.of(tripEntity));
        when(tripDayRepository.findByTripIdAndDayNumber(1001L, 1))
                .thenReturn(Optional.of(tripDayEntity));
        when(itineraryRepository.findAllByTripDayIdOrderByVisitOrderAsc(11L))
                .thenReturn(List.of(firstItem, secondItem, thirdItem));
        when(poiRepository.findAllById(List.of(201L, 202L, 203L)))
                .thenReturn(List.of(firstPoi, secondPoi, thirdPoi));
        when(routeProvider.computeLeg("place-1", "place-2", TravelMode.WALK)).thenReturn(firstLeg);
        when(routeProvider.computeLeg("place-2", "place-3", TravelMode.TRANSIT))
                .thenReturn(secondLeg);

        GenerateDayRouteResponseDto result = tripRouteService.generateDayRoute(1001L, 1);

        assertEquals(2, result.getSegments().size());
        assertEquals("Walk", result.getSegments().get(0).getTravelMethod());
        assertEquals("Transit", result.getSegments().get(1).getTravelMethod());
        assertEquals(3500, result.getRouteSummary().getTotalDistanceMeters());
        assertEquals(1500L, result.getRouteSummary().getTotalDurationSeconds());
        assertEquals("encoded-1", result.getSegments().get(0).getEncodedPolyline());
        assertEquals(47.61, result.getSegments().get(0).getViewport().getNortheast().getLat());
        assertEquals("encoded-2", result.getSegments().get(1).getEncodedPolyline());
    }

    private static TripEntity tripEntity(Long tripId) {
        TripEntity tripEntity = new TripEntity();
        tripEntity.setId(tripId);
        tripEntity.setUserId(CURRENT_USER_ID);
        return tripEntity;
    }

    private static TripDayEntity tripDayEntity(Long id, Long tripId, Integer dayNumber) {
        TripDayEntity tripDayEntity = new TripDayEntity();
        tripDayEntity.setId(id);
        tripDayEntity.setTripId(tripId);
        tripDayEntity.setDayNumber(dayNumber);
        return tripDayEntity;
    }

    private static ItineraryEntity itineraryItem(
            Long id, Long tripDayId, Long poiId, Integer visitOrder, String travelMethod) {
        ItineraryEntity itineraryEntity = new ItineraryEntity();
        itineraryEntity.setId(id);
        itineraryEntity.setTripDayId(tripDayId);
        itineraryEntity.setPoiId(poiId);
        itineraryEntity.setVisitOrder(visitOrder);
        itineraryEntity.setTravelMethod(travelMethod);
        return itineraryEntity;
    }

    private static PoiEntity poiEntity(Long id, String placesId) {
        PoiEntity poiEntity = new PoiEntity();
        poiEntity.setId(id);
        poiEntity.setPlacesId(placesId);
        return poiEntity;
    }

    private static ComputedRouteLeg routeLeg(
            int distanceMeters,
            long durationSeconds,
            String encodedPolyline,
            List<ComputedRouteLeg.LatLng> points) {
        ComputedRouteLeg computedRouteLeg = new ComputedRouteLeg();
        computedRouteLeg.setDistanceMeters(distanceMeters);
        computedRouteLeg.setDurationSeconds(durationSeconds);
        computedRouteLeg.setDuration(durationSeconds + "s");
        computedRouteLeg.setEncodedPolyline(encodedPolyline);

        ComputedRouteLeg.Viewport viewport = new ComputedRouteLeg.Viewport();
        viewport.setNortheast(point(points.getLast().getLat(), points.getLast().getLng()));
        viewport.setSouthwest(point(points.getFirst().getLat(), points.getFirst().getLng()));
        computedRouteLeg.setViewport(viewport);
        return computedRouteLeg;
    }

    private static ComputedRouteLeg.LatLng point(double lat, double lng) {
        ComputedRouteLeg.LatLng point = new ComputedRouteLeg.LatLng();
        point.setLat(lat);
        point.setLng(lng);
        return point;
    }
}
