package com.travelplanner.backend.auth.repository;

import com.travelplanner.backend.auth.model.UserEntity;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.repository.ListCrudRepository;

public interface UserRepository extends ListCrudRepository<UserEntity, UUID> {
    Optional<UserEntity> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByUserName(String userName);
}
