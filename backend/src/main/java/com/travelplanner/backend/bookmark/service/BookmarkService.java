package com.travelplanner.backend.bookmark.service;

import com.travelplanner.backend.bookmark.dto.BookmarkDto;
import com.travelplanner.backend.bookmark.dto.CreateBookmarkRequest;
import com.travelplanner.backend.bookmark.entity.BookmarkEntity;
import com.travelplanner.backend.bookmark.repository.BookmarkRepository;
import com.travelplanner.backend.common.api.ResultCode;
import com.travelplanner.backend.common.exception.BusinessException;
import com.travelplanner.backend.place.dto.PlaceDetailDto;
import com.travelplanner.backend.place.service.PlaceDetailsService;
import com.travelplanner.backend.trip.model.PoiEntity;
import com.travelplanner.backend.trip.repository.PoiRepository;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.function.Function;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Slf4j
@Service
@RequiredArgsConstructor
public class BookmarkService {

    private static final int CATEGORY_MAX_LENGTH = 20;

    private final BookmarkRepository bookmarkRepository;
    private final PoiRepository poiRepository;
    private final NamedParameterJdbcTemplate jdbcTemplate;
    private final PlaceDetailsService placeDetailsService;

    @Transactional(readOnly = true)
    public List<BookmarkDto> getCurrentUserBookmarks(UUID userId) {
        List<BookmarkEntity> bookmarks = bookmarkRepository.findAllByUserId(userId);
        if (bookmarks.isEmpty()) {
            return Collections.emptyList();
        }

        List<Long> poiIds = bookmarks.stream().map(BookmarkEntity::poiId).distinct().toList();
        Map<String, PoiEntity> poiById =
                poiRepository.findAllById(poiIds).stream()
                        .collect(
                                java.util.stream.Collectors.toMap(
                                        poi -> String.valueOf(poi.getId()), Function.identity()));
        Map<Long, String> categoryNameById =
                findCategoryNames(
                        bookmarks.stream()
                                .map(BookmarkEntity::customCategory)
                                .filter(Objects::nonNull)
                                .distinct()
                                .toList());

        return bookmarks.stream()
                .map(
                        bookmark ->
                                toDto(
                                        bookmark,
                                        poiById.get(String.valueOf(bookmark.poiId())),
                                        categoryNameById.get(bookmark.customCategory())))
                .toList();
    }

    @Transactional
    public BookmarkDto createBookmark(UUID userId, CreateBookmarkRequest request) {
        PoiEntity poi =
                poiRepository
                        .findByPlacesId(request.googlePlaceId().trim())
                        .orElseGet(() -> createPoi(request));
        String normalizedCategory = normalizeCategory(request.category());
        Long categoryId = resolveCategoryId(userId, normalizedCategory);

        return bookmarkRepository
                .findByUserIdAndPoiId(userId, poi.getId())
                .map(
                        existingBookmark ->
                                updateCategory(
                                        existingBookmark,
                                        poi,
                                        normalizedCategory,
                                        categoryId,
                                        request))
                .orElseGet(
                        () -> createBookmark(userId, poi, normalizedCategory, categoryId, request));
    }

    @Transactional
    public void deleteBookmark(UUID userId, String bookmarkId) {
        Long bookmarkPrimaryKey = parseBookmarkId(bookmarkId);
        BookmarkEntity bookmark =
                bookmarkRepository
                        .findById(bookmarkPrimaryKey)
                        .orElseThrow(() -> new BusinessException(ResultCode.BOOKMARK_NOT_FOUND));

        if (!bookmark.userId().equals(userId)) {
            throw new BusinessException(ResultCode.BOOKMARK_NOT_FOUND);
        }

        bookmarkRepository.deleteById(bookmarkPrimaryKey);
    }

    private PoiEntity createPoi(CreateBookmarkRequest request) {
        PoiEntity poi = new PoiEntity();
        poi.setPlacesId(request.googlePlaceId().trim());
        return poiRepository.save(poi);
    }

    private BookmarkDto createBookmark(
            UUID userId,
            PoiEntity poi,
            String category,
            Long categoryId,
            CreateBookmarkRequest request) {
        BookmarkEntity bookmark =
                BookmarkEntity.builder()
                        .userId(userId)
                        .poiId(poi.getId())
                        .customCategory(categoryId)
                        .build();
        BookmarkEntity savedBookmark = bookmarkRepository.save(bookmark);
        return toDto(savedBookmark, poi, category, request);
    }

    private BookmarkDto updateCategory(
            BookmarkEntity bookmark,
            PoiEntity poi,
            String category,
            Long categoryId,
            CreateBookmarkRequest request) {
        if (Objects.equals(bookmark.customCategory(), categoryId)) {
            return toDto(bookmark, poi, category, request);
        }

        BookmarkEntity updatedBookmark =
                BookmarkEntity.builder()
                        .id(bookmark.id())
                        .userId(bookmark.userId())
                        .poiId(bookmark.poiId())
                        .customCategory(categoryId)
                        .build();
        BookmarkEntity savedBookmark = bookmarkRepository.save(updatedBookmark);
        return toDto(savedBookmark, poi, category, request);
    }

    private BookmarkDto toDto(BookmarkEntity bookmark, PoiEntity poi, String category) {
        if (poi == null) {
            throw new BusinessException(ResultCode.INTERNAL_ERROR, "POI data missing for bookmark");
        }

        PlaceDetailDto placeDetail = getPlaceDetailOrNull(poi.getPlacesId());
        return BookmarkDto.builder()
                .bookmarkId(String.valueOf(bookmark.id()))
                .poiId(String.valueOf(poi.getId()))
                .googlePlaceId(poi.getPlacesId())
                .poiName(
                        placeDetail != null && placeDetail.getName() != null
                                ? placeDetail.getName()
                                : poi.getPlacesId())
                .poiAddress(placeDetail != null ? placeDetail.getAddress() : null)
                .poiLatitude(placeDetail != null ? placeDetail.getLatitude() : null)
                .poiLongitude(placeDetail != null ? placeDetail.getLongitude() : null)
                .category(category)
                .build();
    }

    private BookmarkDto toDto(
            BookmarkEntity bookmark,
            PoiEntity poi,
            String category,
            CreateBookmarkRequest request) {
        return BookmarkDto.builder()
                .bookmarkId(String.valueOf(bookmark.id()))
                .poiId(String.valueOf(poi.getId()))
                .googlePlaceId(poi.getPlacesId())
                .poiName(request.poiName().trim())
                .poiAddress(request.poiAddress().trim())
                .poiLatitude(request.poiLatitude())
                .poiLongitude(request.poiLongitude())
                .category(category)
                .build();
    }

    private Map<Long, String> findCategoryNames(List<Long> categoryIds) {
        if (categoryIds.isEmpty()) {
            return Collections.emptyMap();
        }

        return jdbcTemplate
                .query(
                        """
                        SELECT id, category_name
                        FROM bookmark_category
                        WHERE id IN (:categoryIds)
                        """,
                        new MapSqlParameterSource("categoryIds", categoryIds),
                        (rs, rowNum) -> Map.entry(rs.getLong("id"), rs.getString("category_name")))
                .stream()
                .collect(java.util.stream.Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));
    }

    private Long resolveCategoryId(UUID userId, String category) {
        if (category == null) {
            return null;
        }

        MapSqlParameterSource params =
                new MapSqlParameterSource()
                        .addValue("userId", userId)
                        .addValue("categoryName", category);

        jdbcTemplate.update(
                """
                INSERT INTO bookmark_category (user_id, category_name)
                VALUES (:userId, :categoryName)
                ON CONFLICT (user_id, category_name) DO NOTHING
                """,
                params);

        return jdbcTemplate.queryForObject(
                """
                SELECT id
                FROM bookmark_category
                WHERE user_id = :userId AND category_name = :categoryName
                """,
                params,
                Long.class);
    }

    private PlaceDetailDto getPlaceDetailOrNull(String placesId) {
        try {
            return placeDetailsService.getPlaceDetails(placesId);
        } catch (Exception exception) {
            log.warn("Unable to load place details for bookmark place {}", placesId, exception);
            return null;
        }
    }

    private String normalizeCategory(String category) {
        if (!StringUtils.hasText(category)) {
            return null;
        }
        String normalized = category.trim();
        if (normalized.length() > CATEGORY_MAX_LENGTH) {
            throw new BusinessException(
                    ResultCode.PARAM_INVALID,
                    "Bookmark category must be at most " + CATEGORY_MAX_LENGTH + " characters");
        }
        return normalized;
    }

    private Long parseBookmarkId(String bookmarkId) {
        try {
            return Long.valueOf(bookmarkId);
        } catch (NumberFormatException exception) {
            throw new BusinessException(ResultCode.PARAM_INVALID, "bookmarkId must be a number");
        }
    }
}
