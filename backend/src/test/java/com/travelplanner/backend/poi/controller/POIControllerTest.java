package com.travelplanner.backend.poi.controller;

import static org.mockito.Mockito.when;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.travelplanner.backend.common.api.ResultCode;
import com.travelplanner.backend.common.exception.GlobalExceptionHandler;
import com.travelplanner.backend.poi.dto.POIDto;
import com.travelplanner.backend.poi.service.POIService;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(POIController.class)
@Import(GlobalExceptionHandler.class)
class POIControllerTest {

    @Autowired private MockMvc mockMvc;

    @MockitoBean private POIService poiService;

    @Test
    void searchPOI_ReturnsSuccessPayload() throws Exception {
        POIDto poi = new POIDto();
        poi.setPlaceId("poi-1");
        poi.setName("National Air and Space Museum");
        poi.setPoiType("museum");

        when(poiService.searchPOI(org.mockito.ArgumentMatchers.any())).thenReturn(List.of(poi));

        mockMvc.perform(
                        post("/api/v1/poi/search")
                                .contentType(APPLICATION_JSON)
                                .content(
                                        """
                                        {
                                          "keyword": "museum",
                                          "location": "38.89,-77.03",
                                          "radius": 5000
                                        }
                                        """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(ResultCode.SUCCESS.getCode()))
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].placeId").value("poi-1"))
                .andExpect(jsonPath("$.data[0].name").value("National Air and Space Museum"));
    }

    @Test
    void searchPOI_WhenKeywordIsBlank_ReturnsParamInvalid() throws Exception {
        mockMvc.perform(
                        post("/api/v1/poi/search")
                                .contentType(APPLICATION_JSON)
                                .content(
                                        """
                                        {
                                          "keyword": "   "
                                        }
                                        """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(ResultCode.PARAM_INVALID.getCode()))
                .andExpect(jsonPath("$.success").value(false));
    }
}
