package com.travelplanner.backend.poi.service;

import com.travelplanner.backend.common.api.ResultCode;
import com.travelplanner.backend.common.config.GoogleMapsProperties;
import com.travelplanner.backend.common.exception.BusinessException;
import com.travelplanner.backend.poi.dto.POIDto;
import com.travelplanner.backend.poi.dto.POISearchRequest;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NonNull;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

@Slf4j
@Service
@RequiredArgsConstructor
public class GooglePoiSearchService implements POIService {

    private static final String FIELD_MASK =
            "places.id,places.displayName,places.formattedAddress,"
                    + "places.location,places.primaryType,places.primaryTypeDisplayName,places.rating";
    private static final int DEFAULT_PAGE_SIZE = 10;

    private final RestTemplate restTemplate;
    private final GoogleMapsProperties googleMapsProperties;
    private final ObjectMapper objectMapper;

    @Override
    public List<POIDto> searchPOI(POISearchRequest request) {
        HttpHeaders headers = buildHeaders();
        Map<String, Object> requestBody = buildSearchTextRequest(request);

        try {
            ResponseEntity<String> response =
                    restTemplate.exchange(
                            googleMapsProperties.getPlacesApiUrl() + ":searchText",
                            HttpMethod.POST,
                            new HttpEntity<>(requestBody, headers),
                            String.class);
            return parseSearchTextResponse(response.getBody());
        } catch (HttpStatusCodeException e) {
            log.error("Google Places text search failed with status: {}", e.getStatusCode());
            log.error("Google Places text search response: {}", e.getResponseBodyAsString());
            throw new BusinessException(
                    ResultCode.GOOGLE_PLACES_REQUEST_ERROR, "Google Places API request failed");
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("Google Places text search request failed", e);
            throw new BusinessException(
                    ResultCode.GOOGLE_PLACES_REQUEST_ERROR, "Google Places API request failed");
        }
    }

    private @NonNull HttpHeaders buildHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-Goog-Api-Key", googleMapsProperties.getApiKey());
        headers.set("X-Goog-FieldMask", FIELD_MASK);
        return headers;
    }

    private Map<String, Object> buildSearchTextRequest(POISearchRequest request) {
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("textQuery", request.getKeyword().trim());
        requestBody.put("pageSize", DEFAULT_PAGE_SIZE);

        parseLocationBias(request.getLocation(), request.getRadius())
                .ifPresent(locationBias -> requestBody.put("locationBias", locationBias));

        return requestBody;
    }

    private List<POIDto> parseSearchTextResponse(String responseBody) {
        if (responseBody == null || responseBody.isBlank()) {
            throw new BusinessException(ResultCode.POI_SEARCH_FAILED, "POI search failed: unknown");
        }

        try {
            JsonNode jsonNode = objectMapper.readTree(responseBody);
            JsonNode placesNode = jsonNode.path("places");
            if (!placesNode.isArray() || placesNode.isEmpty()) {
                return List.of();
            }

            return java.util.stream.StreamSupport.stream(placesNode.spliterator(), false)
                    .map(this::toPoiDto)
                    .toList();
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to decode Google Places text search response: {}", responseBody, e);
            throw new BusinessException(ResultCode.POI_SEARCH_FAILED, "POI search failed: decode");
        }
    }

    private POIDto toPoiDto(JsonNode placeNode) {
        POIDto dto = new POIDto();
        dto.setPlaceId(asNullableText(placeNode.path("id")));
        dto.setName(asNullableText(placeNode.path("displayName").path("text")));
        dto.setAddress(asNullableText(placeNode.path("formattedAddress")));
        dto.setLatitude(asNullableDouble(placeNode.path("location").path("latitude")));
        dto.setLongitude(asNullableDouble(placeNode.path("location").path("longitude")));
        dto.setPoiType(resolvePoiTypeLabel(placeNode));
        dto.setRating(asNullableDouble(placeNode.path("rating")));
        return dto;
    }

    private String resolvePoiTypeLabel(JsonNode placeNode) {
        String displayName = asNullableText(placeNode.path("primaryTypeDisplayName").path("text"));
        if (displayName != null) {
            return displayName;
        }

        return asNullableText(placeNode.path("primaryType"));
    }

    private Optional<Map<String, Object>> parseLocationBias(String location, Integer radius) {
        if (location == null || location.isBlank()) {
            return Optional.empty();
        }
        if (radius == null) {
            return Optional.empty();
        }
        if (radius <= 0) {
            throw new BusinessException(ResultCode.PARAM_INVALID, "Search radius must be positive");
        }

        String[] coordinateParts = location.split(",");
        if (coordinateParts.length != 2) {
            throw new BusinessException(
                    ResultCode.PARAM_INVALID, "Search location must be in 'lat,lng' format");
        }

        try {
            double latitude = Double.parseDouble(coordinateParts[0].trim());
            double longitude = Double.parseDouble(coordinateParts[1].trim());

            return Optional.of(
                    Map.of(
                            "circle",
                            Map.of(
                                    "center",
                                    Map.of("latitude", latitude, "longitude", longitude),
                                    "radius",
                                    radius.doubleValue())));
        } catch (NumberFormatException e) {
            throw new BusinessException(
                    ResultCode.PARAM_INVALID, "Search location must be in 'lat,lng' format");
        }
    }

    private String asNullableText(JsonNode node) {
        if (node.isMissingNode() || node.isNull()) {
            return null;
        }

        String text = node.asText();
        return text.isBlank() ? null : text;
    }

    private Double asNullableDouble(JsonNode node) {
        if (node.isMissingNode() || node.isNull()) {
            return null;
        }

        return node.asDouble();
    }
}
