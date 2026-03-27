package com.travelplanner.backend.route.controller;

import com.travelplanner.backend.common.api.ApiResponse;
import com.travelplanner.backend.route.dto.RouteRequest;
import com.travelplanner.backend.route.dto.RouteSummaryDto;
import com.travelplanner.backend.route.service.GoogleRouteService;
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
public class RouteController {

    private final GoogleRouteService googleRouteService;

    @PostMapping("/request")
    public ApiResponse<RouteSummaryDto> requestRoute(@RequestBody RouteRequest request) {
        log.info("Inbound Route Request: {}", request);
        RouteSummaryDto routeSummaryDto = googleRouteService.computeRoute(request);
        return ApiResponse.success(routeSummaryDto);
    }
}
