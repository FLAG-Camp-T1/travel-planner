package com.travelplanner.backend.route.service;

import com.travelplanner.backend.common.api.ResultCode;
import com.travelplanner.backend.common.config.GoogleMapsProperties;
import com.travelplanner.backend.common.exception.BusinessException;
import com.travelplanner.backend.route.enums.TravelMode;
import com.travelplanner.backend.route.model.ComputedRouteLeg;
import com.travelplanner.backend.route.util.RouteDurationParser;
import java.util.HashMap;
import java.util.Locale;
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
public class GoogleRouteService implements RouteProvider {

    private final RestTemplate restTemplate;
    private final GoogleMapsProperties googleMapsProperties;
    private final ObjectMapper objectMapper;

    private static final String FIELD_MASK =
            "routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline,routes.viewport";

    @Override
    public ComputedRouteLeg computeLeg(
            @NonNull String originPlaceId,
            @NonNull String destinationPlaceId,
            @NonNull TravelMode travelMode) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-Goog-Api-Key", googleMapsProperties.getApiKey());
        headers.set("X-Goog-FieldMask", FIELD_MASK);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("origin", Map.of("placeId", originPlaceId));
        requestBody.put("destination", Map.of("placeId", destinationPlaceId));
        requestBody.put("travelMode", travelMode);

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
            throw translateProviderError(e);
        } catch (Exception e) {
            log.error("Google Maps Routes API Error with exception: ", e);
            if (e.getMessage() != null && !e.getMessage().isBlank()) {
                throw new BusinessException(
                        ResultCode.GOOGLE_ROUTES_REQUEST_ERROR,
                        "Google Maps Routes request failed: " + e.getMessage());
            }
            throw new BusinessException(ResultCode.GOOGLE_ROUTES_REQUEST_ERROR);
        }
    }

    private BusinessException translateProviderError(HttpStatusCodeException e) {
        String responseBody = e.getResponseBodyAsString();
        ProviderError providerError = parseProviderError(responseBody);
        String providerMessage = providerError.message();
        String normalizedMessage =
                providerMessage == null ? "" : providerMessage.toLowerCase(Locale.ROOT);
        String normalizedStatus =
                providerError.status() == null
                        ? ""
                        : providerError.status().toLowerCase(Locale.ROOT);

        if (mentionsUnsupportedTravelMode(normalizedMessage)) {
            return new BusinessException(
                    ResultCode.GOOGLE_ROUTES_UNSUPPORTED_TRAVEL_MODE_ERROR,
                    providerMessage != null
                            ? providerMessage
                            : "The selected travel mode is not supported for this route.");
        }

        if (mentionsUnsupportedRegion(normalizedMessage, normalizedStatus)) {
            return new BusinessException(
                    ResultCode.GOOGLE_ROUTES_UNSUPPORTED_REGION_ERROR,
                    providerMessage != null
                            ? providerMessage
                            : "Google Maps Routes is not supported for the selected region.");
        }

        if (mentionsInvalidPlaceReference(normalizedMessage)) {
            return new BusinessException(
                    ResultCode.GOOGLE_ROUTES_INVALID_PLACE_REFERENCE_ERROR,
                    providerMessage != null
                            ? providerMessage
                            : "One or more selected places cannot be used to generate a route.");
        }

        if (providerMessage != null) {
            return new BusinessException(
                    ResultCode.GOOGLE_ROUTES_REQUEST_ERROR,
                    "Google Maps Routes request failed: " + providerMessage);
        }

        return new BusinessException(ResultCode.GOOGLE_ROUTES_REQUEST_ERROR);
    }

    private ProviderError parseProviderError(String responseBody) {
        if (responseBody == null || responseBody.isBlank()) {
            return new ProviderError(null, null);
        }

        try {
            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode errorNode = root.path("error");
            if (errorNode.isMissingNode() || errorNode.isNull()) {
                return new ProviderError(null, responseBody.strip());
            }

            String status = asNullableText(errorNode.path("status"));
            String message = asNullableText(errorNode.path("message"));
            return new ProviderError(status, message != null ? message : responseBody.strip());
        } catch (Exception parseException) {
            log.warn("Unable to parse Google Maps Routes provider error body: {}", responseBody);
            return new ProviderError(null, responseBody.strip());
        }
    }

    private boolean mentionsUnsupportedTravelMode(String normalizedMessage) {
        return normalizedMessage.contains("travel mode")
                        && normalizedMessage.contains("not supported")
                || normalizedMessage.contains("two-wheeler")
                || normalizedMessage.contains("two_wheeler")
                || normalizedMessage.contains("mode of travel is not supported");
    }

    private boolean mentionsUnsupportedRegion(String normalizedMessage, String normalizedStatus) {
        return normalizedMessage.contains("not supported in this region")
                || normalizedMessage.contains("not available in this region")
                || normalizedMessage.contains("service area")
                || normalizedMessage.contains("coverage")
                || normalizedStatus.equals("failed_precondition")
                        && normalizedMessage.contains("supported");
    }

    private boolean mentionsInvalidPlaceReference(String normalizedMessage) {
        boolean mentionsPlace =
                normalizedMessage.contains("place")
                        || normalizedMessage.contains("origin")
                        || normalizedMessage.contains("destination");
        boolean mentionsInvalidity =
                normalizedMessage.contains("invalid")
                        || normalizedMessage.contains("not found")
                        || normalizedMessage.contains("unknown")
                        || normalizedMessage.contains("could not geocode")
                        || normalizedMessage.contains("cannot be geocoded")
                        || normalizedMessage.contains("cannot route");
        return mentionsPlace && mentionsInvalidity;
    }

    private String asNullableText(JsonNode node) {
        if (node.isMissingNode() || node.isNull()) {
            return null;
        }

        String text = node.asText();
        return text.isBlank() ? null : text;
    }

    private record ProviderError(String status, String message) {}

    private @NonNull ComputedRouteLeg parseGoogleResponse(String jsonBody) {
        log.info("Google Map Routes API Response: {}", jsonBody);
        try {
            JsonNode jsonNode = objectMapper.readTree(jsonBody);
            JsonNode routesNode = jsonNode.path("routes");

            if (routesNode.isMissingNode() || !routesNode.isArray() || routesNode.isEmpty()) {
                throw new BusinessException(ResultCode.GOOGLE_ROUTES_NOT_FOUND_ERROR);
            }

            JsonNode route = routesNode.path(0);

            ComputedRouteLeg computedRouteLeg = new ComputedRouteLeg();
            computedRouteLeg.setDistanceMeters(route.path("distanceMeters").asInt());
            computedRouteLeg.setDuration(route.path("duration").asString());
            computedRouteLeg.setDurationSeconds(
                    RouteDurationParser.parseDurationSeconds(route.path("duration").asString()));

            computedRouteLeg.setEncodedPolyline(
                    route.path("polyline").path("encodedPolyline").asString());

            JsonNode viewportNode = route.path("viewport");
            if (!viewportNode.isMissingNode()) {
                ComputedRouteLeg.Viewport viewport = new ComputedRouteLeg.Viewport();
                ComputedRouteLeg.LatLng ne = new ComputedRouteLeg.LatLng();
                ne.setLat(viewportNode.path("high").path("latitude").asDouble());
                ne.setLng(viewportNode.path("high").path("longitude").asDouble());
                viewport.setNortheast(ne);

                ComputedRouteLeg.LatLng sw = new ComputedRouteLeg.LatLng();
                sw.setLat(viewportNode.path("low").path("latitude").asDouble());
                sw.setLng(viewportNode.path("low").path("longitude").asDouble());
                viewport.setSouthwest(sw);

                computedRouteLeg.setViewport(viewport);
            }

            return computedRouteLeg;

        } catch (Exception e) {
            if (e instanceof BusinessException) {
                throw (BusinessException) e;
            }
            log.error("Google Maps Routes API Response decoding error: ", e);
            throw new BusinessException(ResultCode.GOOGLE_ROUTES_RESPONSE_DECODE_ERROR);
        }
    }
}
