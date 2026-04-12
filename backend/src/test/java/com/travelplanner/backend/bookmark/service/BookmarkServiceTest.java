package com.travelplanner.backend.bookmark.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.travelplanner.backend.bookmark.dto.BookmarkCategoryDto;
import com.travelplanner.backend.bookmark.dto.CreateBookmarkCategoryRequest;
import com.travelplanner.backend.bookmark.repository.BookmarkRepository;
import com.travelplanner.backend.common.api.ResultCode;
import com.travelplanner.backend.common.context.CurrentUserProvider;
import com.travelplanner.backend.common.exception.BusinessException;
import com.travelplanner.backend.place.service.PlaceDetailsService;
import com.travelplanner.backend.trip.repository.PoiRepository;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;

@ExtendWith(MockitoExtension.class)
class BookmarkServiceTest {

    private static final UUID CURRENT_USER_ID =
            UUID.fromString("00000000-0000-0000-0000-000000000001");

    @Mock private BookmarkRepository bookmarkRepository;
    @Mock private PoiRepository poiRepository;
    @Mock private NamedParameterJdbcTemplate jdbcTemplate;
    @Mock private PlaceDetailsService placeDetailsService;
    @Mock private CurrentUserProvider currentUserProvider;

    @InjectMocks private BookmarkService bookmarkService;

    @Test
    void getCurrentUserBookmarkCategories_ReturnsCategoriesWithCounts() {
        BookmarkCategoryDto market =
                BookmarkCategoryDto.builder()
                        .categoryId("10")
                        .name("Market")
                        .bookmarkCount(2)
                        .build();
        BookmarkCategoryDto landmark =
                BookmarkCategoryDto.builder()
                        .categoryId("11")
                        .name("Landmark")
                        .bookmarkCount(0)
                        .build();

        when(currentUserProvider.getCurrentUserId()).thenReturn(CURRENT_USER_ID);
        when(jdbcTemplate.query(
                        any(String.class), any(MapSqlParameterSource.class), any(RowMapper.class)))
                .thenReturn(List.of(market, landmark));

        List<BookmarkCategoryDto> result = bookmarkService.getCurrentUserBookmarkCategories();

        assertEquals(2, result.size());
        assertEquals("Market", result.get(0).name());
        assertEquals(2L, result.get(0).bookmarkCount());
        assertEquals("Landmark", result.get(1).name());
        assertEquals(0L, result.get(1).bookmarkCount());
    }

    @Test
    void createBookmarkCategory_ReturnsExistingCategoryWhenNameAlreadyExists() {
        when(currentUserProvider.getCurrentUserId()).thenReturn(CURRENT_USER_ID);
        when(jdbcTemplate.queryForObject(
                        any(String.class), any(MapSqlParameterSource.class), eq(Long.class)))
                .thenReturn(10L)
                .thenReturn(0L);

        BookmarkCategoryDto result =
                bookmarkService.createBookmarkCategory(
                        new CreateBookmarkCategoryRequest("Weekend Food"));

        assertEquals("10", result.categoryId());
        assertEquals("Weekend Food", result.name());
        assertEquals(0L, result.bookmarkCount());
        verify(jdbcTemplate).update(any(String.class), any(MapSqlParameterSource.class));
    }

    @Test
    void createBookmarkCategory_WhenNameIsBlank_ThrowsBusinessException() {
        when(currentUserProvider.getCurrentUserId()).thenReturn(CURRENT_USER_ID);

        BusinessException exception =
                assertThrows(
                        BusinessException.class,
                        () ->
                                bookmarkService.createBookmarkCategory(
                                        new CreateBookmarkCategoryRequest("   ")));

        assertEquals(ResultCode.PARAM_INVALID, exception.getResultCode());
        assertEquals("Bookmark category name is required", exception.getMessage());
        verify(jdbcTemplate, never()).update(any(String.class), any(MapSqlParameterSource.class));
    }

    @Test
    void createBookmarkCategory_WhenNameIsTooLong_ThrowsBusinessException() {
        when(currentUserProvider.getCurrentUserId()).thenReturn(CURRENT_USER_ID);

        BusinessException exception =
                assertThrows(
                        BusinessException.class,
                        () ->
                                bookmarkService.createBookmarkCategory(
                                        new CreateBookmarkCategoryRequest(
                                                "Category Name Is Way Too Long")));

        assertEquals(ResultCode.PARAM_INVALID, exception.getResultCode());
        assertEquals("Bookmark category must be at most 20 characters", exception.getMessage());
        verify(jdbcTemplate, never()).update(any(String.class), any(MapSqlParameterSource.class));
    }

    @Test
    void deleteBookmarkCategory_WhenKeepingBookmarks_UncategorizesBookmarksThenDeletesCategory() {
        when(currentUserProvider.getCurrentUserId()).thenReturn(CURRENT_USER_ID);
        when(jdbcTemplate.query(
                        any(String.class), any(MapSqlParameterSource.class), any(RowMapper.class)))
                .thenReturn(List.of("Weekend Food"));

        bookmarkService.deleteBookmarkCategory("10", false);

        verify(jdbcTemplate).update(contains("UPDATE bookmark"), any(MapSqlParameterSource.class));
        verify(jdbcTemplate)
                .update(
                        contains("DELETE FROM bookmark_category"),
                        any(MapSqlParameterSource.class));
    }

    @Test
    void deleteBookmarkCategory_WhenDeletingBookmarks_RemovesBookmarksThenDeletesCategory() {
        when(currentUserProvider.getCurrentUserId()).thenReturn(CURRENT_USER_ID);
        when(jdbcTemplate.query(
                        any(String.class), any(MapSqlParameterSource.class), any(RowMapper.class)))
                .thenReturn(List.of("Weekend Food"));

        bookmarkService.deleteBookmarkCategory("10", true);

        verify(jdbcTemplate)
                .update(contains("DELETE FROM bookmark\n"), any(MapSqlParameterSource.class));
        verify(jdbcTemplate)
                .update(
                        contains("DELETE FROM bookmark_category"),
                        any(MapSqlParameterSource.class));
    }

    @Test
    void deleteBookmarkCategory_WhenCategoryDoesNotExist_ThrowsBusinessException() {
        when(currentUserProvider.getCurrentUserId()).thenReturn(CURRENT_USER_ID);
        when(jdbcTemplate.query(
                        any(String.class), any(MapSqlParameterSource.class), any(RowMapper.class)))
                .thenReturn(List.of());

        BusinessException exception =
                assertThrows(
                        BusinessException.class,
                        () -> bookmarkService.deleteBookmarkCategory("10", false));

        assertEquals(ResultCode.BOOKMARK_NOT_FOUND, exception.getResultCode());
        assertEquals("Bookmark category not found", exception.getMessage());
        verify(jdbcTemplate, never()).update(any(String.class), any(MapSqlParameterSource.class));
    }
}
