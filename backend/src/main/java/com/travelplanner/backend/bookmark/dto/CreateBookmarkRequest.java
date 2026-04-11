package com.travelplanner.backend.bookmark.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateBookmarkRequest(
        @NotBlank String googlePlaceId,
        @NotBlank String poiName,
        @NotBlank String poiAddress,
        @NotNull Double poiLatitude,
        @NotNull Double poiLongitude,
        String category) {}
