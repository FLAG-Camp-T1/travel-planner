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

    static final int SEEDED_TRIP_COUNT = 2;
    static final int SEEDED_POI_COUNT = 8;
    static final int SEEDED_ITINERARY_STOP_COUNT = 8;

    private static final LocalDate FIXED_TRIP_START_DATE = LocalDate.of(2026, 4, 10);
    private static final String DEV_USER_NAME = "Trips Dev User";
    private static final String DEV_PASSWORD_HASH = "dev-bootstrap-not-for-auth";

    private static final SeedPoi DC_PLACE_ONE =
            new SeedPoi("dc-place-1", "ChIJldJnhJG3t4kRnJ3McC1qVyo");
    private static final SeedPoi DC_PLACE_TWO =
            new SeedPoi("dc-place-2", "ChIJCYr0k6i3t4kRJNOniIKWv4Y");
    private static final SeedPoi DC_PLACE_THREE =
            new SeedPoi("dc-place-3", "ChIJbwqv9yK4t4kRGixTvXJNjK0");
    private static final SeedPoi DC_PLACE_FOUR =
            new SeedPoi("dc-place-4", "ChIJIwHC3D-4t4kR7tGTisOikGM");
    private static final SeedPoi TOKYO_PLACE_ONE =
            new SeedPoi("tokyo-place-1", "ChIJmY9L9lCJGGAR3ydy0pQ5y8A");
    private static final SeedPoi TOKYO_PLACE_TWO =
            new SeedPoi("tokyo-place-2", "ChIJv-sM5bGOGGARXL9S7cVu7jo");
    private static final SeedPoi TOKYO_PLACE_THREE =
            new SeedPoi("tokyo-place-3", "ChIJ2f9BNp6OGGARfxtv1tT31dk");
    private static final SeedPoi TOKYO_PLACE_FOUR =
            new SeedPoi("tokyo-place-4", "ChIJ81MDY9SNGGARsEZEhfyZ2JQ");

    private static final List<SeedPoi> DEV_POIS =
            List.of(
                    DC_PLACE_ONE,
                    DC_PLACE_TWO,
                    DC_PLACE_THREE,
                    DC_PLACE_FOUR,
                    TOKYO_PLACE_ONE,
                    TOKYO_PLACE_TWO,
                    TOKYO_PLACE_THREE,
                    TOKYO_PLACE_FOUR);

    private static final List<SeedItineraryStop> FIXED_DAY_ONE_STOPS =
            List.of(
                    new SeedItineraryStop(1, DC_PLACE_ONE.key(), "TRAVEL_MODE_UNSPECIFIED"),
                    new SeedItineraryStop(2, DC_PLACE_TWO.key(), "WALK"),
                    new SeedItineraryStop(3, DC_PLACE_THREE.key(), "TRANSIT"),
                    new SeedItineraryStop(4, DC_PLACE_FOUR.key(), "DRIVE"));

    private static final List<SeedItineraryStop> FLEXIBLE_DAY_ONE_STOPS =
            List.of(
                    new SeedItineraryStop(1, TOKYO_PLACE_ONE.key(), "TRAVEL_MODE_UNSPECIFIED"),
                    new SeedItineraryStop(2, TOKYO_PLACE_TWO.key(), "BICYCLE"),
                    new SeedItineraryStop(3, TOKYO_PLACE_THREE.key(), "DRIVE"),
                    new SeedItineraryStop(4, TOKYO_PLACE_FOUR.key(), "WALK"));

    private static final List<SeedTripPlan> DEV_TRIPS =
            List.of(
                    new SeedTripPlan(
                            FIXED_TRIP_TITLE,
                            1,
                            FIXED_TRIP_START_DATE,
                            Map.of(1, FIXED_DAY_ONE_STOPS)),
                    new SeedTripPlan(
                            FLEXIBLE_TRIP_TITLE, 1, null, Map.of(1, FLEXIBLE_DAY_ONE_STOPS)));

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

        Map<String, Long> poiIdsByKey = ensurePoiIdsByKey();

        for (SeedTripPlan seedTripPlan : DEV_TRIPS) {
            TripEntity tripEntity =
                    ensureTripExists(
                            currentUserId,
                            seedTripPlan.title(),
                            seedTripPlan.durationDays(),
                            seedTripPlan.startDate());

            for (Map.Entry<Integer, List<SeedItineraryStop>> dayEntry :
                    seedTripPlan.stopsByDayNumber().entrySet()) {
                seedTripDayStops(
                        tripEntity.getId(), dayEntry.getKey(), dayEntry.getValue(), poiIdsByKey);
            }
        }
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

    record SeedTripPlan(
            String title,
            Integer durationDays,
            LocalDate startDate,
            Map<Integer, List<SeedItineraryStop>> stopsByDayNumber) {}
}
