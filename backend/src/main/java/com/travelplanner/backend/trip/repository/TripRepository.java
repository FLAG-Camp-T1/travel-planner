package com.travelplanner.backend.trip.repository;

import com.travelplanner.backend.trip.model.TripEntity;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.repository.ListCrudRepository;

public interface TripRepository extends ListCrudRepository<TripEntity, Long> {

    List<TripEntity> findAllByUserIdOrderByIdDesc(UUID userId);

    Optional<TripEntity> findByIdAndUserId(Long id, UUID userId);

    Optional<TripEntity> findByUserIdAndTitle(UUID userId, String title);
}
