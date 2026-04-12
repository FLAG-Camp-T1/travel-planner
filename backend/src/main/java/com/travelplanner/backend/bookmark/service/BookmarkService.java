package com.travelplanner.backend.bookmark.service;

import com.travelplanner.backend.bookmark.dto.BookmarkCategoryDto;
import com.travelplanner.backend.bookmark.dto.BookmarkDto;
import com.travelplanner.backend.bookmark.dto.CreateBookmarkCategoryRequest;
import com.travelplanner.backend.bookmark.dto.CreateBookmarkRequest;
import com.travelplanner.backend.bookmark.dto.UpdateBookmarkRequest;
import com.travelplanner.backend.bookmark.entity.BookmarkEntity;
import com.travelplanner.backend.bookmark.repository.BookmarkRepository;
import com.travelplanner.backend.common.api.ResultCode;
import com.travelplanner.backend.common.context.CurrentUserProvider;
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
    private final CurrentUserProvider currentUserProvider;

    @Transactional(readOnly = true)
    public List<BookmarkDto> getCurrentUserBookmarks() {
        UUID currentUserId = currentUserProvider.getCurrentUserId();
        List<BookmarkEntity> bookmarks = bookmarkRepository.findAllByUserId(currentUserId);
        if (bookmarks.isEmpty()) {
            return Collections.emptyList();
        }

        List<Long> poiIds = bookmarks.stream().map(BookmarkEntity::poiId).distinct().toList();
        Map<Long, PoiEntity> poiById =
                poiRepository.findAllById(poiIds).stream()
                        .collect(
                                java.util.stream.Collectors.toMap(
                                        PoiEntity::getId, Function.identity()));
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
                                        getRequiredPoi(
                                                poiById.get(bookmark.poiId()), bookmark.poiId()),
                                        categoryNameById.get(bookmark.customCategory())))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<BookmarkCategoryDto> getCurrentUserBookmarkCategories() {
        UUID currentUserId = currentUserProvider.getCurrentUserId();
        return findCurrentUserCategories(currentUserId);
    }

    @Transactional
    public BookmarkDto createBookmark(CreateBookmarkRequest request) {
        UUID currentUserId = currentUserProvider.getCurrentUserId();
        PoiEntity poi =
                poiRepository
                        .findByPlacesId(request.googlePlaceId().trim())
                        .orElseGet(() -> createPoi(request.googlePlaceId().trim()));
        String normalizedCategory = normalizeCategory(request.category());

        BookmarkEntity existingBookmark =
                bookmarkRepository.findByUserIdAndPoiId(currentUserId, poi.getId()).orElse(null);
        if (existingBookmark != null) {
            String categoryName = findCategoryName(existingBookmark.customCategory());
            return toDto(existingBookmark, poi, categoryName, request);
        }

        Long categoryId = resolveCategoryId(currentUserId, normalizedCategory);
        BookmarkEntity savedBookmark =
                bookmarkRepository.save(
                        BookmarkEntity.builder()
                                .userId(currentUserId)
                                .poiId(poi.getId())
                                .customCategory(categoryId)
                                .build());
        return toDto(savedBookmark, poi, normalizedCategory, request);
    }

    @Transactional
    public BookmarkCategoryDto createBookmarkCategory(CreateBookmarkCategoryRequest request) {
        UUID currentUserId = currentUserProvider.getCurrentUserId();
        String normalizedCategory = normalizeCategory(request.name());
        if (normalizedCategory == null) {
            throw new BusinessException(
                    ResultCode.PARAM_INVALID, "Bookmark category name is required");
        }

        Long categoryId = resolveCategoryId(currentUserId, normalizedCategory);
        return BookmarkCategoryDto.builder()
                .categoryId(String.valueOf(categoryId))
                .name(normalizedCategory)
                .bookmarkCount(countBookmarksInCategory(currentUserId, categoryId))
                .build();
    }

    @Transactional
    public BookmarkDto updateBookmark(String bookmarkId, UpdateBookmarkRequest request) {
        Long bookmarkPrimaryKey = parseBookmarkId(bookmarkId);
        BookmarkEntity bookmark = getOwnedBookmark(bookmarkPrimaryKey);
        String normalizedCategory = normalizeCategory(request.category());
        Long categoryId =
                resolveCategoryId(currentUserProvider.getCurrentUserId(), normalizedCategory);

        if (Objects.equals(bookmark.customCategory(), categoryId)) {
            PoiEntity poi = getRequiredPoi(bookmark.poiId());
            return toDto(bookmark, poi, normalizedCategory);
        }

        BookmarkEntity updatedBookmark =
                BookmarkEntity.builder()
                        .id(bookmark.id())
                        .userId(bookmark.userId())
                        .poiId(bookmark.poiId())
                        .customCategory(categoryId)
                        .build();
        BookmarkEntity savedBookmark = bookmarkRepository.save(updatedBookmark);
        PoiEntity poi = getRequiredPoi(savedBookmark.poiId());
        return toDto(savedBookmark, poi, normalizedCategory);
    }

    @Transactional
    public void deleteBookmark(String bookmarkId) {
        Long bookmarkPrimaryKey = parseBookmarkId(bookmarkId);
        BookmarkEntity bookmark = getOwnedBookmark(bookmarkPrimaryKey);
        bookmarkRepository.deleteById(bookmark.id());
    }

    @Transactional
    public void deleteBookmarkCategory(String categoryId, boolean deleteBookmarks) {
        Long categoryPrimaryKey = parseCategoryId(categoryId);
        UUID currentUserId = currentUserProvider.getCurrentUserId();
        requireOwnedCategory(currentUserId, categoryPrimaryKey);
        MapSqlParameterSource params = categoryParameters(currentUserId, categoryPrimaryKey);

        if (deleteBookmarks) {
            deleteBookmarksInCategory(params);
        } else {
            clearCategoryFromBookmarks(params);
        }

        deleteCategoryRecord(params);
    }

    private PoiEntity createPoi(String googlePlaceId) {
        PoiEntity poi = new PoiEntity();
        poi.setPlacesId(googlePlaceId);
        return poiRepository.save(poi);
    }

    private BookmarkDto toDto(BookmarkEntity bookmark, PoiEntity poi, String category) {
        PlaceDetailDto placeDetail = getPlaceDetailOrNull(poi.getPlacesId());
        return BookmarkDto.builder()
                .bookmarkId(String.valueOf(bookmark.id()))
                .poiId(String.valueOf(poi.getId()))
                .googlePlaceId(poi.getPlacesId())
                .poiName(
                        placeDetail != null && StringUtils.hasText(placeDetail.getName())
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

    private String findCategoryName(Long categoryId) {
        if (categoryId == null) {
            return null;
        }

        return findCategoryNames(List.of(categoryId)).get(categoryId);
    }

    private List<BookmarkCategoryDto> findCurrentUserCategories(UUID userId) {
        return jdbcTemplate.query(
                """
                SELECT category.id,
                       category.category_name,
                       COUNT(bookmark.id) AS bookmark_count
                FROM bookmark_category category
                LEFT JOIN bookmark
                       ON bookmark.custom_category = category.id
                      AND bookmark.user_id = category.user_id
                WHERE category.user_id = :userId
                GROUP BY category.id, category.category_name
                ORDER BY LOWER(category.category_name), category.id
                """,
                new MapSqlParameterSource("userId", userId),
                (rs, rowNum) ->
                        BookmarkCategoryDto.builder()
                                .categoryId(String.valueOf(rs.getLong("id")))
                                .name(rs.getString("category_name"))
                                .bookmarkCount(rs.getLong("bookmark_count"))
                                .build());
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

    private long countBookmarksInCategory(UUID userId, Long categoryId) {
        if (categoryId == null) {
            return 0L;
        }

        Long bookmarkCount =
                jdbcTemplate.queryForObject(
                        """
                        SELECT COUNT(*)
                        FROM bookmark
                        WHERE user_id = :userId AND custom_category = :categoryId
                        """,
                        new MapSqlParameterSource()
                                .addValue("userId", userId)
                                .addValue("categoryId", categoryId),
                        Long.class);

        return bookmarkCount != null ? bookmarkCount : 0L;
    }

    private void requireOwnedCategory(UUID userId, Long categoryId) {
        List<Long> categoryIds =
                jdbcTemplate.query(
                        """
                        SELECT id
                        FROM bookmark_category
                        WHERE user_id = :userId AND id = :categoryId
                        """,
                        new MapSqlParameterSource()
                                .addValue("userId", userId)
                                .addValue("categoryId", categoryId),
                        (rs, rowNum) -> rs.getLong("id"));

        if (!categoryIds.isEmpty()) {
            return;
        }

        throw new BusinessException(ResultCode.BOOKMARK_NOT_FOUND, "Bookmark category not found");
    }

    private MapSqlParameterSource categoryParameters(UUID userId, Long categoryId) {
        return new MapSqlParameterSource()
                .addValue("userId", userId)
                .addValue("categoryId", categoryId);
    }

    private void deleteBookmarksInCategory(MapSqlParameterSource params) {
        jdbcTemplate.update(
                """
                DELETE FROM bookmark
                WHERE user_id = :userId AND custom_category = :categoryId
                """,
                params);
    }

    private void clearCategoryFromBookmarks(MapSqlParameterSource params) {
        jdbcTemplate.update(
                """
                UPDATE bookmark
                SET custom_category = NULL
                WHERE user_id = :userId AND custom_category = :categoryId
                """,
                params);
    }

    private void deleteCategoryRecord(MapSqlParameterSource params) {
        jdbcTemplate.update(
                """
                DELETE FROM bookmark_category
                WHERE user_id = :userId AND id = :categoryId
                """,
                params);
    }

    private BookmarkEntity getOwnedBookmark(Long bookmarkId) {
        return bookmarkRepository
                .findByIdAndUserId(bookmarkId, currentUserProvider.getCurrentUserId())
                .orElseThrow(() -> new BusinessException(ResultCode.BOOKMARK_NOT_FOUND));
    }

    private PoiEntity getRequiredPoi(Long poiId) {
        return getRequiredPoi(poiRepository.findById(poiId).orElse(null), poiId);
    }

    private PoiEntity getRequiredPoi(PoiEntity poi, Long poiId) {
        if (poi != null) {
            return poi;
        }

        throw new BusinessException(
                ResultCode.INTERNAL_ERROR, "POI %d missing for bookmark".formatted(poiId));
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

    private Long parseCategoryId(String categoryId) {
        try {
            return Long.valueOf(categoryId);
        } catch (NumberFormatException exception) {
            throw new BusinessException(ResultCode.PARAM_INVALID, "categoryId must be a number");
        }
    }
}
