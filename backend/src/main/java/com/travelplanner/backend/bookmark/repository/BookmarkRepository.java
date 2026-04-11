package com.travelplanner.backend.bookmark.repository;

import com.travelplanner.backend.bookmark.entity.BookmarkEntity;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.repository.CrudRepository;

public interface BookmarkRepository extends CrudRepository<BookmarkEntity, Long> {

    List<BookmarkEntity> findAllByUserId(UUID userId);

    Optional<BookmarkEntity> findByUserIdAndPoiId(UUID userId, Long poiId);
}
