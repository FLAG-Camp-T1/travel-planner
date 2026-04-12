package com.travelplanner.backend.bookmark.dto;

import lombok.Builder;

@Builder
public record BookmarkCategoryDto(String categoryId, String name, long bookmarkCount) {}
