package com.travelplanner.backend.place.controller;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.travelplanner.backend.common.api.ResultCode;
import com.travelplanner.backend.common.exception.GlobalExceptionHandler;
import com.travelplanner.backend.place.dto.PlaceDetailDto;
import com.travelplanner.backend.place.service.PlaceDetailsService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(PlaceController.class)
@Import(GlobalExceptionHandler.class)
class PlaceControllerTest {

    @Autowired private MockMvc mockMvc;

    @MockitoBean private PlaceDetailsService placeDetailsService;

    @Test
    void getPlaceDetails_ReturnsSuccessPayload() throws Exception {
        PlaceDetailDto detail = new PlaceDetailDto();
        detail.setPlaceId("poi-search-1");
        detail.setName("National Air and Space Museum");
        detail.setCategoryLabel("Museum");

        when(placeDetailsService.getPlaceDetails("poi-search-1")).thenReturn(detail);

        mockMvc.perform(get("/api/v1/places/poi-search-1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(ResultCode.SUCCESS.getCode()))
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.placeId").value("poi-search-1"))
                .andExpect(jsonPath("$.data.name").value("National Air and Space Museum"))
                .andExpect(jsonPath("$.data.categoryLabel").value("Museum"));
    }
}
