package com.travelplanner.backend.trip.repository;

import com.travelplanner.backend.trip.model.PoiEntity;
import java.util.Optional;
import org.springframework.data.repository.ListCrudRepository;

public interface PoiRepository extends ListCrudRepository<PoiEntity, Long> {

    Optional<PoiEntity> findByPlacesId(String placesId);
}
