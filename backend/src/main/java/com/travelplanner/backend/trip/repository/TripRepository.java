package com.travelplanner.backend.trip.repository;

import com.travelplanner.backend.trip.model.TripEntity;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.repository.ListCrudRepository;

public interface TripRepository extends ListCrudRepository<TripEntity, Long> {

    Optional<TripEntity> findByIdAndUserId(Long id, UUID userId);
}
