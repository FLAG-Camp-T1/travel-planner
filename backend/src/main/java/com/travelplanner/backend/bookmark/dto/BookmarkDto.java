package com.travelplanner.backend.bookmark.dto;

import lombok.Builder;

@Builder
public record BookmarkDto(
        String bookmarkId,
        String poiId,
        String googlePlaceId,
        String poiName,
        String poiAddress,
        Double poiLatitude,
        Double poiLongitude,
        String category) {}
