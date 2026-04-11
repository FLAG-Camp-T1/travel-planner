package com.travelplanner.backend.bookmark.entity;

import java.util.UUID;
import lombok.Builder;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

@Table("bookmark")
@Builder
public record BookmarkEntity(
        @Id Long id,
        @Column("user_id") UUID userId,
        @Column("poi_id") Long poiId,
        @Column("custom_category") Long customCategory) {}
