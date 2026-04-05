package com.travelplanner.backend.poi.controller;

import com.travelplanner.backend.common.api.ApiResponse;
import com.travelplanner.backend.poi.dto.POIDto;
import com.travelplanner.backend.poi.dto.POISearchRequest;
import com.travelplanner.backend.poi.service.POIService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/poi")
@RequiredArgsConstructor
@Tag(name = "POI Search", description = "Search nearby places around a map location")
public class POIController {

    private final POIService poiService;

    @PostMapping("/search")
    @Operation(
            summary = "Search nearby places",
            description = "Returns nearby places that match the keyword, center point, and radius.")
    public ApiResponse<List<POIDto>> searchPOI(@Valid @RequestBody POISearchRequest request) {
        List<POIDto> poiList = poiService.searchPOI(request);
        return ApiResponse.success(poiList);
    }
}
