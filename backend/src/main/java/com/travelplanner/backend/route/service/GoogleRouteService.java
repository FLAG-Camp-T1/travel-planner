package com.travelplanner.backend.route.service;

import com.travelplanner.backend.common.api.ResultCode;
import com.travelplanner.backend.common.config.GoogleMapsProperties;
import com.travelplanner.backend.common.exception.BusinessException;
import com.travelplanner.backend.route.dto.RouteRequest;
import com.travelplanner.backend.route.dto.RouteSummaryDto;
import java.util.HashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NonNull;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
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
public class GoogleRouteService {

    private final RestTemplate restTemplate;
    private final GoogleMapsProperties googleMapsProperties;
    private final ObjectMapper objectMapper;

    private static final String FIELD_MASK =
            "routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline,routes.viewport";

    public RouteSummaryDto computeRoute(@NonNull RouteRequest request) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-Goog-Api-Key", googleMapsProperties.getApiKey());
        headers.set("X-Goog-FieldMask", FIELD_MASK);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("origin", Map.of("placeId", request.getOriginPlaceId()));
        requestBody.put("destination", Map.of("placeId", request.getDestinationPlaceId()));
        requestBody.put("travelMode", request.getTravelMode());

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            log.info("Sending request to Google Maps Routes API...");
            ResponseEntity<String> response =
                    restTemplate.postForEntity(
                            googleMapsProperties.getRoutesApiUrl(), entity, String.class);

            return parseGoogleResponse(response.getBody());
        } catch (HttpStatusCodeException e) {
            log.error("Google Maps Routes API Error with status code: {}", e.getStatusCode());
            log.error("Google Maps Routes API Error message: {}", e.getResponseBodyAsString());
            throw new BusinessException(ResultCode.GOOGLE_ROUTES_REQUEST_ERROR);
        } catch (Exception e) {
            log.error("Google Maps Routes API Error with exception: ", e);
            throw new BusinessException(ResultCode.GOOGLE_ROUTES_REQUEST_ERROR);
        }
    }

    private @NonNull RouteSummaryDto parseGoogleResponse(String jsonBody) {
        log.info("Google Map Routes API Response: {}", jsonBody);
        try {
            JsonNode jsonNode = objectMapper.readTree(jsonBody);
            JsonNode routesNode = jsonNode.path("routes");

            if (routesNode.isMissingNode() || !routesNode.isArray() || routesNode.isEmpty()) {
                throw new BusinessException(ResultCode.GOOGLE_ROUTES_REQUEST_ERROR);
            }

            JsonNode route = routesNode.path(0);

            RouteSummaryDto dto = new RouteSummaryDto();
            dto.setDistanceMeters(route.path("distanceMeters").asInt());
            dto.setDuration(route.path("duration").asString());

            dto.setEncodedPolyline(route.path("polyline").path("encodedPolyline").asString());

            JsonNode viewportNode = route.path("viewport");
            if (!viewportNode.isMissingNode()) {
                RouteSummaryDto.Viewport viewport = new RouteSummaryDto.Viewport();
                RouteSummaryDto.LatLng ne = new RouteSummaryDto.LatLng();
                ne.setLat(viewportNode.path("high").path("latitude").asDouble());
                ne.setLng(viewportNode.path("high").path("longitude").asDouble());
                viewport.setNortheast(ne);

                RouteSummaryDto.LatLng sw = new RouteSummaryDto.LatLng();
                sw.setLat(viewportNode.path("low").path("latitude").asDouble());
                sw.setLng(viewportNode.path("low").path("longitude").asDouble());
                viewport.setSouthwest(sw);

                dto.setViewport(viewport);
            }

            return dto;

        } catch (Exception e) {
            if (e instanceof BusinessException) {
                throw (BusinessException) e;
            }
            log.error("Google Maps Routes API Response decoding error: ", e);
            throw new BusinessException(ResultCode.GOOGLE_ROUTES_REQUEST_ERROR);
        }
    }
}
