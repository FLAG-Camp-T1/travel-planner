package com.travelplanner.backend.poi.service;

import com.travelplanner.backend.poi.dto.POIDto;
import com.travelplanner.backend.poi.dto.POISearchRequest;
import java.util.List;

public interface POIService {
    List<POIDto> searchPOI(POISearchRequest request);
}
