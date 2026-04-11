package com.travelplanner.backend.bookmark.controller;

import com.travelplanner.backend.bookmark.dto.BookmarkDto;
import com.travelplanner.backend.bookmark.dto.CreateBookmarkRequest;
import com.travelplanner.backend.bookmark.dto.UpdateBookmarkRequest;
import com.travelplanner.backend.bookmark.service.BookmarkService;
import com.travelplanner.backend.common.api.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/v1/bookmarks")
@RequiredArgsConstructor
@Tag(name = "Bookmarks", description = "APIs for managing POI bookmarks")
public class BookmarkController {

    private final BookmarkService bookmarkService;

    @GetMapping
    @Operation(summary = "Get all bookmarks for current user")
    public ApiResponse<List<BookmarkDto>> getBookmarks() {
        return ApiResponse.success(bookmarkService.getCurrentUserBookmarks());
    }

    @PostMapping
    @Operation(summary = "Create a bookmark for current user")
    public ApiResponse<BookmarkDto> createBookmark(
            @Valid @RequestBody CreateBookmarkRequest request) {
        log.info("Inbound Bookmark Create Request: {}", request);
        return ApiResponse.success(bookmarkService.createBookmark(request));
    }

    @PatchMapping("/{bookmarkId}")
    @Operation(summary = "Update a bookmark category for current user")
    public ApiResponse<BookmarkDto> updateBookmark(
            @PathVariable String bookmarkId, @RequestBody UpdateBookmarkRequest request) {
        return ApiResponse.success(bookmarkService.updateBookmark(bookmarkId, request));
    }

    @DeleteMapping("/{bookmarkId}")
    @Operation(summary = "Delete a bookmark for current user")
    public ApiResponse<Void> deleteBookmark(@PathVariable String bookmarkId) {
        bookmarkService.deleteBookmark(bookmarkId);
        return ApiResponse.success();
    }
}
