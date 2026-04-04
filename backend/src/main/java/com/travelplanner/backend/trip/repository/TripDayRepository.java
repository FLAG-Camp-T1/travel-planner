package com.travelplanner.backend.trip.repository;

import com.travelplanner.backend.trip.model.TripDayEntity;
import java.util.List;
import org.springframework.data.repository.ListCrudRepository;

public interface TripDayRepository extends ListCrudRepository<TripDayEntity, Long> {

    List<TripDayEntity> findAllByTripIdOrderByDayNumberAsc(Long tripId);
}
