package com.travelplanner.backend.poi.service;

import com.travelplanner.backend.common.api.ResultCode;
import com.travelplanner.backend.common.config.GoogleMapsProperties;
import com.travelplanner.backend.common.exception.BusinessException;
import com.travelplanner.backend.poi.dto.POIDto;
import com.travelplanner.backend.poi.dto.POISearchRequest;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

@Service
@RequiredArgsConstructor
public class GooglePlaceService implements POIService {

    private final RestTemplate restTemplate;
    private final GoogleMapsProperties googleMapsProperties;
    private static final String GOOGLE_PLACE_SEARCH_URL =
            "https://maps.googleapis.com/maps/api/place/textsearch/json";

    @Override
    public List<POIDto> searchPOI(POISearchRequest request) {
        UriComponentsBuilder uriBuilder =
                UriComponentsBuilder.fromUriString(GOOGLE_PLACE_SEARCH_URL)
                        .queryParam("query", request.getKeyword())
                        .queryParam("key", googleMapsProperties.getApiKey());

        if (request.getLocation() != null) uriBuilder.queryParam("location", request.getLocation());
        if (request.getRadius() != null) uriBuilder.queryParam("radius", request.getRadius());
        if (request.getPoiType() != null) uriBuilder.queryParam("type", request.getPoiType());

        ResponseEntity<Map> response;
        try {
            response = restTemplate.getForEntity(uriBuilder.toUriString(), Map.class);
        } catch (Exception e) {
            throw new BusinessException(
                    ResultCode.GOOGLE_PLACES_REQUEST_ERROR, "Google Places API request failed");
        }

        Map<String, Object> responseBody = response.getBody();

        if (responseBody == null || !"OK".equals(responseBody.get("status"))) {
            String errorStatus =
                    responseBody != null ? (String) responseBody.get("status") : "unknown";
            throw new BusinessException(
                    ResultCode.POI_SEARCH_FAILED, "POI search failed: " + errorStatus);
        }

        List<Map<String, Object>> results = (List<Map<String, Object>>) responseBody.get("results");
        return results.stream()
                .map(
                        result -> {
                            POIDto dto = new POIDto();
                            dto.setPlaceId((String) result.get("place_id"));
                            dto.setName((String) result.get("name"));
                            dto.setAddress((String) result.get("formatted_address"));

                            Map<String, Object> geometry =
                                    (Map<String, Object>) result.get("geometry");
                            Map<String, Object> location =
                                    (Map<String, Object>) geometry.get("location");
                            dto.setLatitude((Double) location.get("lat"));
                            dto.setLongitude((Double) location.get("lng"));

                            List<String> types = (List<String>) result.get("types");
                            dto.setPoiType(
                                    types != null && !types.isEmpty() ? types.get(0) : "unknown");
                            dto.setRating((Double) result.get("rating"));

                            return dto;
                        })
                .collect(Collectors.toList());
    }
}
