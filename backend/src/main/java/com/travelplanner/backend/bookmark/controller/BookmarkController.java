package com.travelplanner.backend.bookmark.controller;

import com.travelplanner.backend.bookmark.dto.BookmarkDto;
import com.travelplanner.backend.bookmark.dto.CreateBookmarkRequest;
import com.travelplanner.backend.bookmark.service.BookmarkService;
import com.travelplanner.backend.common.api.ApiResponse;
import com.travelplanner.backend.common.api.ResultCode;
import com.travelplanner.backend.common.exception.BusinessException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/v1/bookmarks")
@RequiredArgsConstructor
@Tag(name = "Bookmarks", description = "APIs for managing POI bookmarks")
public class BookmarkController {

    private static final String USER_ID_HEADER = "X-User-Id";

    private final BookmarkService bookmarkService;

    @Value("${app.current-user.fixed-id:00000000-0000-0000-0000-000000000001}")
    private String defaultUserId;

    @GetMapping
    @Operation(summary = "Get all bookmarks for current user")
    public ApiResponse<List<BookmarkDto>> getBookmarks(
            @RequestHeader(value = USER_ID_HEADER, required = false) String userIdHeader) {
        return ApiResponse.success(
                bookmarkService.getCurrentUserBookmarks(resolveUserId(userIdHeader)));
    }

    @PostMapping
    @Operation(summary = "Create a bookmark for current user")
    public ApiResponse<BookmarkDto> createBookmark(
            @RequestHeader(value = USER_ID_HEADER, required = false) String userIdHeader,
            @Valid @RequestBody CreateBookmarkRequest request) {
        log.info("Inbound Bookmark Create Request: {}", request);
        return ApiResponse.success(
                bookmarkService.createBookmark(resolveUserId(userIdHeader), request));
    }

    @DeleteMapping("/{bookmarkId}")
    @Operation(summary = "Delete a bookmark for current user")
    public ApiResponse<Void> deleteBookmark(
            @RequestHeader(value = USER_ID_HEADER, required = false) String userIdHeader,
            @PathVariable String bookmarkId) {
        bookmarkService.deleteBookmark(resolveUserId(userIdHeader), bookmarkId);
        return ApiResponse.success();
    }

    private UUID resolveUserId(String userIdHeader) {
        String rawUserId = StringUtils.hasText(userIdHeader) ? userIdHeader.trim() : defaultUserId;
        try {
            return UUID.fromString(rawUserId);
        } catch (IllegalArgumentException exception) {
            throw new BusinessException(ResultCode.PARAM_INVALID, "X-User-Id must be a valid UUID");
        }
    }
}
