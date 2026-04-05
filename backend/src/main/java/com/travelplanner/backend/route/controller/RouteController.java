package com.travelplanner.backend.route.controller;

import com.travelplanner.backend.common.api.ApiResponse;
import com.travelplanner.backend.route.dto.RouteRequest;
import com.travelplanner.backend.route.dto.RouteSummaryDto;
import com.travelplanner.backend.route.model.ComputedRouteLeg;
import com.travelplanner.backend.route.service.RouteProvider;
import com.travelplanner.backend.route.util.RouteSummaryMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/v1/routes")
@RequiredArgsConstructor
@Tag(name = "Routes", description = "APIs for retrieving map routes")
public class RouteController {

    private final RouteProvider routeProvider;

    @PostMapping("/request")
    @Operation(
            summary = "Request a new route",
            description =
                    "Request a route between two specified Google Place IDs using Google Routes API")
    public ApiResponse<RouteSummaryDto> requestRoute(@RequestBody RouteRequest request) {
        log.info("Inbound Route Request: {}", request);
        ComputedRouteLeg computedRouteLeg =
                routeProvider.computeLeg(
                        request.getOriginPlaceId(),
                        request.getDestinationPlaceId(),
                        request.getTravelMode());
        RouteSummaryDto routeSummaryDto = RouteSummaryMapper.toRouteSummaryDto(computedRouteLeg);
        return ApiResponse.success(routeSummaryDto);
    }
}
