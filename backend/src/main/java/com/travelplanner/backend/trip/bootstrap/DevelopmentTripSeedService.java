package com.travelplanner.backend.trip.bootstrap;

import com.travelplanner.backend.common.context.CurrentUserProvider;
import com.travelplanner.backend.trip.dto.CreateTripRequestDto;
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
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DevelopmentTripSeedService {

    static final String FIXED_TRIP_TITLE = "Washington, D.C. Spring Weekend";
    static final String FLEXIBLE_TRIP_TITLE = "Flexible Tokyo Food Crawl";

    private static final LocalDate FIXED_TRIP_START_DATE = LocalDate.of(2026, 4, 10);
    private static final String DEV_USER_NAME = "Trips Dev User";
    private static final String DEV_PASSWORD_HASH = "dev-bootstrap-not-for-auth";

    private static final SeedPoi PIKE_PLACE_MARKET =
            new SeedPoi("seattle-market", "ChIJVTPokywQkFQRmtVEaUZlJRA");
    private static final SeedPoi SYDNEY_OPERA_HOUSE =
            new SeedPoi("sydney-opera-house", "ChIJN1t_tDeuEmsRUsoyG83frY4");
    private static final SeedPoi ROUTE_EXAMPLE_ORIGIN =
            new SeedPoi("route-example-origin", "ChIJVVVVVYx3j4ARP-3NGldc8qQ");
    private static final SeedPoi ROUTE_EXAMPLE_DESTINATION =
            new SeedPoi("route-example-destination", "ChIJJcSDXXx3j4ARRef7L0P3GpY");

    private static final List<SeedPoi> DEV_POIS =
            List.of(
                    PIKE_PLACE_MARKET,
                    SYDNEY_OPERA_HOUSE,
                    ROUTE_EXAMPLE_ORIGIN,
                    ROUTE_EXAMPLE_DESTINATION);

    private static final List<SeedItineraryStop> FIXED_DAY_ONE_STOPS =
            List.of(
                    new SeedItineraryStop(1, PIKE_PLACE_MARKET.key(), "TRAVEL_MODE_UNSPECIFIED"),
                    new SeedItineraryStop(2, ROUTE_EXAMPLE_ORIGIN.key(), "WALK"),
                    new SeedItineraryStop(3, ROUTE_EXAMPLE_DESTINATION.key(), "TRANSIT"));

    private static final List<SeedItineraryStop> FIXED_DAY_TWO_STOPS =
            List.of(new SeedItineraryStop(1, SYDNEY_OPERA_HOUSE.key(), "TRAVEL_MODE_UNSPECIFIED"));

    private static final List<SeedItineraryStop> FLEXIBLE_DAY_ONE_STOPS =
            List.of(
                    new SeedItineraryStop(
                            1, ROUTE_EXAMPLE_DESTINATION.key(), "TRAVEL_MODE_UNSPECIFIED"));

    private final NamedParameterJdbcTemplate jdbcTemplate;
    private final CurrentUserProvider currentUserProvider;
    private final TripRepository tripRepository;
    private final TripDayRepository tripDayRepository;
    private final PoiRepository poiRepository;
    private final ItineraryRepository itineraryRepository;
    private final TripCommandService tripCommandService;

    @Transactional
    public void seedIfNeeded() {
        UUID currentUserId = currentUserProvider.getCurrentUserId();

        ensureDevelopmentUserExists(currentUserId);

        TripEntity fixedTrip =
                ensureTripExists(currentUserId, FIXED_TRIP_TITLE, 3, FIXED_TRIP_START_DATE);
        TripEntity flexibleTrip = ensureTripExists(currentUserId, FLEXIBLE_TRIP_TITLE, 2, null);

        Map<String, Long> poiIdsByKey = ensurePoiIdsByKey();

        seedTripDayStops(fixedTrip.getId(), 1, FIXED_DAY_ONE_STOPS, poiIdsByKey);
        seedTripDayStops(fixedTrip.getId(), 2, FIXED_DAY_TWO_STOPS, poiIdsByKey);
        seedTripDayStops(flexibleTrip.getId(), 1, FLEXIBLE_DAY_ONE_STOPS, poiIdsByKey);
    }

    private void ensureDevelopmentUserExists(UUID currentUserId) {
        String devEmail = "trips-dev-" + currentUserId + "@example.local";

        jdbcTemplate.update(
                """
                INSERT INTO app_user (user_id, user_name, email, password_hash)
                VALUES (:userId, :userName, :email, :passwordHash)
                ON CONFLICT (user_id) DO NOTHING
                """,
                new MapSqlParameterSource()
                        .addValue("userId", currentUserId)
                        .addValue("userName", DEV_USER_NAME)
                        .addValue("email", devEmail)
                        .addValue("passwordHash", DEV_PASSWORD_HASH));
    }

    private TripEntity ensureTripExists(
            UUID currentUserId, String title, Integer durationDays, LocalDate startDate) {
        return tripRepository
                .findByUserIdAndTitle(currentUserId, title)
                .orElseGet(() -> createTrip(currentUserId, title, durationDays, startDate));
    }

    private TripEntity createTrip(
            UUID currentUserId, String title, Integer durationDays, LocalDate startDate) {
        CreateTripRequestDto request = new CreateTripRequestDto();
        request.setTitle(title);
        request.setDurationDays(durationDays);
        request.setStartDate(startDate);

        TripSummaryDto createdTrip = tripCommandService.createTrip(request);

        return tripRepository
                .findByIdAndUserId(createdTrip.getTripId(), currentUserId)
                .orElseThrow(
                        () ->
                                new IllegalStateException(
                                        "Seeded trip %s could not be reloaded.".formatted(title)));
    }

    private Map<String, Long> ensurePoiIdsByKey() {
        Map<String, Long> poiIdsByKey = new HashMap<>();
        for (SeedPoi poi : DEV_POIS) {
            Long poiId =
                    poiRepository
                            .findByPlacesId(poi.placesId())
                            .map(PoiEntity::getId)
                            .orElseGet(() -> createPoi(poi.placesId()));
            poiIdsByKey.put(poi.key(), poiId);
        }
        return poiIdsByKey;
    }

    private Long createPoi(String placesId) {
        PoiEntity poiEntity = new PoiEntity();
        poiEntity.setPlacesId(placesId);
        return poiRepository.save(poiEntity).getId();
    }

    private void seedTripDayStops(
            Long tripId,
            Integer dayNumber,
            List<SeedItineraryStop> stops,
            Map<String, Long> poiIdsByKey) {
        Long tripDayId = getTripDayId(tripId, dayNumber);
        for (SeedItineraryStop stop : stops) {
            if (itineraryRepository.existsByTripDayIdAndVisitOrder(tripDayId, stop.visitOrder())) {
                continue;
            }

            ItineraryEntity itineraryEntity = new ItineraryEntity();
            itineraryEntity.setTripDayId(tripDayId);
            itineraryEntity.setPoiId(poiIdsByKey.get(stop.poiKey()));
            itineraryEntity.setVisitOrder(stop.visitOrder());
            itineraryEntity.setTravelMethod(stop.travelMethod());
            itineraryRepository.save(itineraryEntity);
        }
    }

    private Long getTripDayId(Long tripId, Integer dayNumber) {
        return tripDayRepository.findAllByTripIdOrderByDayNumberAsc(tripId).stream()
                .filter(tripDay -> dayNumber.equals(tripDay.getDayNumber()))
                .map(TripDayEntity::getId)
                .findFirst()
                .orElseThrow(
                        () ->
                                new IllegalStateException(
                                        "Trip %d is missing day %d.".formatted(tripId, dayNumber)));
    }

    record SeedPoi(String key, String placesId) {}

    record SeedItineraryStop(Integer visitOrder, String poiKey, String travelMethod) {}
}
