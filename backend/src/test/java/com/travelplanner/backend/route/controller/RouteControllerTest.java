package com.travelplanner.backend.route.controller;

import static org.mockito.Mockito.when;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.travelplanner.backend.common.api.ResultCode;
import com.travelplanner.backend.common.exception.BusinessException;
import com.travelplanner.backend.common.exception.GlobalExceptionHandler;
import com.travelplanner.backend.route.enums.TravelMode;
import com.travelplanner.backend.route.model.ComputedRouteLeg;
import com.travelplanner.backend.route.service.RouteProvider;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(RouteController.class)
@Import(GlobalExceptionHandler.class)
class RouteControllerTest {

    @Autowired private MockMvc mockMvc;

    @MockitoBean private RouteProvider routeProvider;

    @Test
    void requestRoute_ReturnsLegacyCompatiblePayload() throws Exception {
        ComputedRouteLeg response = new ComputedRouteLeg();
        response.setDistanceMeters(1200);
        response.setDurationSeconds(600L);
        response.setDuration("600s");
        response.setEncodedPolyline("encoded-segment");

        ComputedRouteLeg.Viewport viewport = new ComputedRouteLeg.Viewport();
        ComputedRouteLeg.LatLng northeast = new ComputedRouteLeg.LatLng();
        northeast.setLat(47.61);
        northeast.setLng(-122.33);
        viewport.setNortheast(northeast);
        ComputedRouteLeg.LatLng southwest = new ComputedRouteLeg.LatLng();
        southwest.setLat(47.60);
        southwest.setLng(-122.34);
        viewport.setSouthwest(southwest);
        response.setViewport(viewport);

        when(routeProvider.computeLeg("origin-place", "destination-place", TravelMode.WALK))
                .thenReturn(response);

        mockMvc.perform(
                        post("/api/v1/routes/request")
                                .contentType(APPLICATION_JSON)
                                .content(
                                        """
                                        {
                                          "originPlaceId": "origin-place",
                                          "destinationPlaceId": "destination-place",
                                          "travelMode": "WALK"
                                        }
                                        """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(ResultCode.SUCCESS.getCode()))
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.distanceMeters").value(1200))
                .andExpect(jsonPath("$.data.duration").value("600s"))
                .andExpect(jsonPath("$.data.encodedPolyline").value("encoded-segment"))
                .andExpect(jsonPath("$.data.viewport.northeast.lat").value(47.61))
                .andExpect(jsonPath("$.data.viewport.southwest.lng").value(-122.34));
    }

    @Test
    void requestRoute_WhenRequestIsInvalid_ReturnsParamInvalid() throws Exception {
        mockMvc.perform(
                        post("/api/v1/routes/request")
                                .contentType(APPLICATION_JSON)
                                .content(
                                        """
                                        {
                                          "originPlaceId": "",
                                          "destinationPlaceId": "destination-place"
                                        }
                                        """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(ResultCode.PARAM_INVALID.getCode()))
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void requestRoute_WhenRouteProviderRaisesSpecificBusinessError_PropagatesMessage()
            throws Exception {
        when(routeProvider.computeLeg("origin-place", "destination-place", TravelMode.DRIVE))
                .thenThrow(
                        new BusinessException(
                                ResultCode.GOOGLE_ROUTES_UNSUPPORTED_REGION_ERROR,
                                "Routes service is not available in this region."));

        mockMvc.perform(
                        post("/api/v1/routes/request")
                                .contentType(APPLICATION_JSON)
                                .content(
                                        """
                                        {
                                          "originPlaceId": "origin-place",
                                          "destinationPlaceId": "destination-place",
                                          "travelMode": "DRIVE"
                                        }
                                        """))
                .andExpect(status().isOk())
                .andExpect(
                        jsonPath("$.code")
                                .value(ResultCode.GOOGLE_ROUTES_UNSUPPORTED_REGION_ERROR.getCode()))
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(
                        jsonPath("$.message")
                                .value("Routes service is not available in this region."));
    }
}
