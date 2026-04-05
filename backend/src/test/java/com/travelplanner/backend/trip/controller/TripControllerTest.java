package com.travelplanner.backend.trip.controller;

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

import com.travelplanner.backend.common.api.ResultCode;
import com.travelplanner.backend.common.exception.BusinessException;
import com.travelplanner.backend.common.exception.GlobalExceptionHandler;
import com.travelplanner.backend.trip.dto.CreateTripRequestDto;
import com.travelplanner.backend.trip.dto.GenerateDayRouteResponseDto;
import com.travelplanner.backend.trip.dto.TripSummaryDto;
import com.travelplanner.backend.trip.dto.UpdateItineraryItemRequestDto;
import com.travelplanner.backend.trip.dto.UpdateTripRequestDto;
import com.travelplanner.backend.trip.service.TripCommandService;
import com.travelplanner.backend.trip.service.TripQueryService;
import com.travelplanner.backend.trip.service.TripRouteService;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(TripController.class)
@Import(GlobalExceptionHandler.class)
class TripControllerTest {

    @Autowired private MockMvc mockMvc;

    @MockitoBean private TripCommandService tripCommandService;
    @MockitoBean private TripQueryService tripQueryService;
    @MockitoBean private TripRouteService tripRouteService;

    @Test
    void createTrip_ReturnsSuccessPayload() throws Exception {
        TripSummaryDto response = new TripSummaryDto();
        response.setTripId(1001L);
        response.setTitle("Spring DC Trip");
        response.setDurationDays(3);
        response.setStartDate(LocalDate.of(2026, 4, 10));

        when(tripCommandService.createTrip(any(CreateTripRequestDto.class))).thenReturn(response);

        mockMvc.perform(
                        post("/api/v1/trips/create")
                                .contentType(APPLICATION_JSON)
                                .content(
                                        """
                                        {
                                          "title": "Spring DC Trip",
                                          "durationDays": 3,
                                          "startDate": "2026-04-10"
                                        }
                                        """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(ResultCode.SUCCESS.getCode()))
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.tripId").value(1001))
                .andExpect(jsonPath("$.data.title").value("Spring DC Trip"))
                .andExpect(jsonPath("$.data.durationDays").value(3))
                .andExpect(jsonPath("$.data.startDate").value("2026-04-10"));
    }

    @Test
    void listTrips_ReturnsSuccessPayload() throws Exception {
        TripSummaryDto firstTrip = new TripSummaryDto();
        firstTrip.setTripId(1002L);
        firstTrip.setTitle("Summer Tokyo Trip");
        firstTrip.setDurationDays(5);

        TripSummaryDto secondTrip = new TripSummaryDto();
        secondTrip.setTripId(1001L);
        secondTrip.setTitle("Spring DC Trip");
        secondTrip.setDurationDays(3);

        when(tripQueryService.listTrips()).thenReturn(List.of(firstTrip, secondTrip));

        mockMvc.perform(get("/api/v1/trips"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(ResultCode.SUCCESS.getCode()))
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.length()").value(2))
                .andExpect(jsonPath("$.data[0].tripId").value(1002))
                .andExpect(jsonPath("$.data[0].title").value("Summer Tokyo Trip"));
    }

    @Test
    void updateTrip_ReturnsSuccessPayload() throws Exception {
        TripSummaryDto response = new TripSummaryDto();
        response.setTripId(1001L);
        response.setTitle("Updated DC Trip");
        response.setDurationDays(3);
        response.setStartDate(LocalDate.of(2026, 4, 12));

        when(tripCommandService.updateTrip(any(Long.class), any(UpdateTripRequestDto.class)))
                .thenReturn(response);

        mockMvc.perform(
                        patch("/api/v1/trips/1001")
                                .contentType(APPLICATION_JSON)
                                .content(
                                        """
                                        {
                                          "title": "Updated DC Trip",
                                          "startDate": "2026-04-12"
                                        }
                                        """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(ResultCode.SUCCESS.getCode()))
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.tripId").value(1001))
                .andExpect(jsonPath("$.data.title").value("Updated DC Trip"))
                .andExpect(jsonPath("$.data.startDate").value("2026-04-12"));
    }

    @Test
    void deleteTrip_ReturnsSuccessPayload() throws Exception {
        doNothing().when(tripCommandService).deleteTrip(1001L);

        mockMvc.perform(delete("/api/v1/trips/1001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(ResultCode.SUCCESS.getCode()))
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").value(nullValue()));
    }

    @Test
    void updateTripDayItem_ReturnsSuccessPayload() throws Exception {
        doNothing()
                .when(tripCommandService)
                .updateTripDayItem(
                        any(Long.class),
                        any(Integer.class),
                        any(Long.class),
                        any(UpdateItineraryItemRequestDto.class));

        mockMvc.perform(
                        patch("/api/v1/trips/1001/days/1/items/5001")
                                .contentType(APPLICATION_JSON)
                                .content(
                                        """
                                        {
                                          "travelMethod": "WALK"
                                        }
                                        """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(ResultCode.SUCCESS.getCode()))
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").value(nullValue()));
    }

    @Test
    void deleteTripDayItem_ReturnsSuccessPayload() throws Exception {
        doNothing().when(tripCommandService).deleteTripDayItem(1001L, 1, 5001L);

        mockMvc.perform(delete("/api/v1/trips/1001/days/1/items/5001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(ResultCode.SUCCESS.getCode()))
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").value(nullValue()));
    }

    @Test
    void createTrip_WhenRequestIsInvalid_ReturnsParamInvalid() throws Exception {
        mockMvc.perform(
                        post("/api/v1/trips/create")
                                .contentType(APPLICATION_JSON)
                                .content(
                                        """
                                        {
                                          "title": "",
                                          "durationDays": 0
                                        }
                                        """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(ResultCode.PARAM_INVALID.getCode()))
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void updateTrip_WhenRequestIsInvalid_ReturnsParamInvalid() throws Exception {
        mockMvc.perform(
                        patch("/api/v1/trips/1001")
                                .contentType(APPLICATION_JSON)
                                .content(
                                        """
                                        {
                                          "title": " "
                                        }
                                        """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(ResultCode.PARAM_INVALID.getCode()))
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void updateTripDayItem_WhenRequestIsInvalid_ReturnsParamInvalid() throws Exception {
        mockMvc.perform(
                        patch("/api/v1/trips/1001/days/1/items/5001")
                                .contentType(APPLICATION_JSON)
                                .content(
                                        """
                                        {
                                          "travelMethod": "FLY"
                                        }
                                        """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(ResultCode.PARAM_INVALID.getCode()))
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void getTripDayItems_WhenLookupFails_ReturnsBusinessErrorPayload() throws Exception {
        when(tripQueryService.getTripDayItems(1001L, 1))
                .thenThrow(
                        new BusinessException(
                                ResultCode.GOOGLE_PLACES_REQUEST_ERROR, "Place lookup failed."));

        mockMvc.perform(get("/api/v1/trips/1001/days/1/items"))
                .andExpect(status().isOk())
                .andExpect(
                        jsonPath("$.code").value(ResultCode.GOOGLE_PLACES_REQUEST_ERROR.getCode()))
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Place lookup failed."));
    }

    @Test
    void generateDayRoute_WithNoApplicableRoute_ReturnsNullSummaryAndEmptySegments()
            throws Exception {
        GenerateDayRouteResponseDto response = new GenerateDayRouteResponseDto();
        response.setTripId(1001L);
        response.setDayNumber(1);
        response.setRouteSummary(null);
        response.setSegments(List.of());

        when(tripRouteService.generateDayRoute(1001L, 1)).thenReturn(response);

        mockMvc.perform(post("/api/v1/trips/1001/days/1/route/generate"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(ResultCode.SUCCESS.getCode()))
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.tripId").value(1001))
                .andExpect(jsonPath("$.data.dayNumber").value(1))
                .andExpect(jsonPath("$.data.routeSummary").value(nullValue()))
                .andExpect(jsonPath("$.data.segments").isArray())
                .andExpect(jsonPath("$.data.segments.length()").value(0));
    }
}
