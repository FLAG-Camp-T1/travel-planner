package com.travelplanner.backend.trip.repository;

import com.travelplanner.backend.trip.model.ItineraryEntity;
import java.util.List;
import java.util.Optional;
import org.springframework.data.repository.ListCrudRepository;

public interface ItineraryRepository extends ListCrudRepository<ItineraryEntity, Long> {

    boolean existsByTripDayId(Long tripDayId);

    boolean existsByTripDayIdAndVisitOrder(Long tripDayId, Integer visitOrder);

    List<ItineraryEntity> findAllByTripDayIdOrderByVisitOrderAsc(Long tripDayId);

    Optional<ItineraryEntity> findFirstByTripDayIdOrderByVisitOrderDesc(Long tripDayId);
}
