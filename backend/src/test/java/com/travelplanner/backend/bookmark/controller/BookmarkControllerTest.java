package com.travelplanner.backend.bookmark.controller;

import static org.hamcrest.Matchers.nullValue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.travelplanner.backend.bookmark.dto.BookmarkCategoryDto;
import com.travelplanner.backend.bookmark.dto.BookmarkDto;
import com.travelplanner.backend.bookmark.service.BookmarkService;
import com.travelplanner.backend.common.api.ResultCode;
import com.travelplanner.backend.common.exception.GlobalExceptionHandler;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(BookmarkController.class)
@Import(GlobalExceptionHandler.class)
class BookmarkControllerTest {

    @Autowired private MockMvc mockMvc;

    @MockitoBean private BookmarkService bookmarkService;

    @Test
    void getBookmarks_ReturnsSuccessPayload() throws Exception {
        BookmarkDto bookmark =
                BookmarkDto.builder()
                        .bookmarkId("101")
                        .poiId("201")
                        .googlePlaceId("place-1")
                        .poiName("Pike Place Market")
                        .category("Market")
                        .build();

        when(bookmarkService.getCurrentUserBookmarks()).thenReturn(List.of(bookmark));

        mockMvc.perform(get("/api/v1/bookmarks"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(ResultCode.SUCCESS.getCode()))
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].bookmarkId").value("101"))
                .andExpect(jsonPath("$.data[0].category").value("Market"));
    }

    @Test
    void getBookmarkCategories_ReturnsSuccessPayload() throws Exception {
        BookmarkCategoryDto category =
                BookmarkCategoryDto.builder()
                        .categoryId("10")
                        .name("Market")
                        .bookmarkCount(2)
                        .build();

        when(bookmarkService.getCurrentUserBookmarkCategories()).thenReturn(List.of(category));

        mockMvc.perform(get("/api/v1/bookmarks/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(ResultCode.SUCCESS.getCode()))
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].categoryId").value("10"))
                .andExpect(jsonPath("$.data[0].name").value("Market"))
                .andExpect(jsonPath("$.data[0].bookmarkCount").value(2));
    }

    @Test
    void createBookmark_ReturnsSuccessPayload() throws Exception {
        BookmarkDto bookmark =
                BookmarkDto.builder()
                        .bookmarkId("101")
                        .poiId("201")
                        .googlePlaceId("place-1")
                        .poiName("Pike Place Market")
                        .poiAddress("85 Pike St, Seattle, WA 98101, USA")
                        .poiLatitude(47.609722)
                        .poiLongitude(-122.342222)
                        .category("Market")
                        .build();

        when(bookmarkService.createBookmark(any())).thenReturn(bookmark);

        mockMvc.perform(
                        post("/api/v1/bookmarks")
                                .contentType(APPLICATION_JSON)
                                .content(
                                        """
                                        {
                                          "googlePlaceId": "place-1",
                                          "poiName": "Pike Place Market",
                                          "poiAddress": "85 Pike St, Seattle, WA 98101, USA",
                                          "poiLatitude": 47.609722,
                                          "poiLongitude": -122.342222,
                                          "category": "Market"
                                        }
                                        """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(ResultCode.SUCCESS.getCode()))
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.bookmarkId").value("101"))
                .andExpect(jsonPath("$.data.category").value("Market"));
    }

    @Test
    void createBookmarkCategory_ReturnsSuccessPayload() throws Exception {
        BookmarkCategoryDto category =
                BookmarkCategoryDto.builder()
                        .categoryId("10")
                        .name("Weekend Food")
                        .bookmarkCount(0)
                        .build();

        when(bookmarkService.createBookmarkCategory(any())).thenReturn(category);

        mockMvc.perform(
                        post("/api/v1/bookmarks/categories")
                                .contentType(APPLICATION_JSON)
                                .content(
                                        """
                                        {
                                          "name": "Weekend Food"
                                        }
                                        """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(ResultCode.SUCCESS.getCode()))
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.categoryId").value("10"))
                .andExpect(jsonPath("$.data.name").value("Weekend Food"))
                .andExpect(jsonPath("$.data.bookmarkCount").value(0));
    }

    @Test
    void updateBookmark_ReturnsSuccessPayload() throws Exception {
        BookmarkDto bookmark =
                BookmarkDto.builder()
                        .bookmarkId("101")
                        .poiId("201")
                        .googlePlaceId("place-1")
                        .poiName("Pike Place Market")
                        .category("Landmark")
                        .build();

        when(bookmarkService.updateBookmark(any(), any())).thenReturn(bookmark);

        mockMvc.perform(
                        patch("/api/v1/bookmarks/101")
                                .contentType(APPLICATION_JSON)
                                .content(
                                        """
                                        {
                                          "category": "Landmark"
                                        }
                                        """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(ResultCode.SUCCESS.getCode()))
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.bookmarkId").value("101"))
                .andExpect(jsonPath("$.data.category").value("Landmark"));
    }

    @Test
    void deleteBookmark_ReturnsSuccessPayload() throws Exception {
        doNothing().when(bookmarkService).deleteBookmark("101");

        mockMvc.perform(delete("/api/v1/bookmarks/101"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(ResultCode.SUCCESS.getCode()))
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").value(nullValue()));
    }

    @Test
    void deleteBookmarkCategory_WhenKeepingBookmarks_ReturnsSuccessPayload() throws Exception {
        doNothing().when(bookmarkService).deleteBookmarkCategory("10", false);

        mockMvc.perform(delete("/api/v1/bookmarks/categories/10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(ResultCode.SUCCESS.getCode()))
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").value(nullValue()));
    }

    @Test
    void deleteBookmarkCategory_WhenDeletingBookmarks_ReturnsSuccessPayload() throws Exception {
        doNothing().when(bookmarkService).deleteBookmarkCategory("10", true);

        mockMvc.perform(
                        delete("/api/v1/bookmarks/categories/10")
                                .queryParam("deleteBookmarks", "true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(ResultCode.SUCCESS.getCode()))
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").value(nullValue()));
    }
}
