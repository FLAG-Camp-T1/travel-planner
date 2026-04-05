package com.travelplanner.backend.common.config;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.travelplanner.backend.common.exception.GlobalExceptionHandler;
import com.travelplanner.backend.trip.controller.TripController;
import com.travelplanner.backend.trip.service.TripCommandService;
import com.travelplanner.backend.trip.service.TripQueryService;
import com.travelplanner.backend.trip.service.TripRouteService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(TripController.class)
@Import({GlobalExceptionHandler.class, CorsConfig.class})
class CorsConfigTest {

    @Autowired private MockMvc mockMvc;

    @MockitoBean private TripCommandService tripCommandService;
    @MockitoBean private TripQueryService tripQueryService;
    @MockitoBean private TripRouteService tripRouteService;

    @Test
    void preflightRequest_AllowsPatchMethod() throws Exception {
        mockMvc.perform(
                        options("/api/v1/trips/1001")
                                .header("Origin", "http://localhost:5173")
                                .header("Access-Control-Request-Method", "PATCH"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:5173"))
                .andExpect(
                        header().string(
                                        "Access-Control-Allow-Methods",
                                        org.hamcrest.Matchers.containsString("PATCH")));
    }
}
