package com.travelplanner.backend.place.service;

import com.travelplanner.backend.common.api.ResultCode;
import com.travelplanner.backend.common.config.GoogleMapsProperties;
import com.travelplanner.backend.common.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NonNull;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

@Slf4j
@Service
@RequiredArgsConstructor
public class GooglePlaceLookupService implements PlaceLookupService {

    private static final String FIELD_MASK = "displayName";

    private final RestTemplate restTemplate;
    private final GoogleMapsProperties googleMapsProperties;
    private final ObjectMapper objectMapper;

    @Override
    public String resolveDisplayName(@NonNull String placeId) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Goog-Api-Key", googleMapsProperties.getApiKey());
        headers.set("X-Goog-FieldMask", FIELD_MASK);

        String url = googleMapsProperties.getPlacesApiUrl() + "/" + placeId;

        try {
            log.info("Resolving Google Place display name for placeId={}", placeId);
            ResponseEntity<String> response =
                    restTemplate.exchange(
                            url, HttpMethod.GET, new HttpEntity<>(headers), String.class);
            return parseDisplayName(placeId, response.getBody());
        } catch (HttpStatusCodeException e) {
            log.error(
                    "Google Places API Error for {} with status code: {}",
                    placeId,
                    e.getStatusCode());
            log.error("Google Places API Error message: {}", e.getResponseBodyAsString());
            if (e.getStatusCode().value() == 404) {
                throw new BusinessException(
                        ResultCode.GOOGLE_PLACES_NOT_FOUND_ERROR,
                        "Place %s not found.".formatted(placeId));
            }
            throw new BusinessException(ResultCode.GOOGLE_PLACES_REQUEST_ERROR);
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("Google Places API Error for {}: ", placeId, e);
            throw new BusinessException(ResultCode.GOOGLE_PLACES_REQUEST_ERROR);
        }
    }

    private String parseDisplayName(String placeId, String jsonBody) {
        try {
            JsonNode jsonNode = objectMapper.readTree(jsonBody);
            JsonNode displayNameNode = jsonNode.path("displayName").path("text");

            if (displayNameNode.isMissingNode() || displayNameNode.asText().isBlank()) {
                throw new BusinessException(
                        ResultCode.GOOGLE_PLACES_NOT_FOUND_ERROR,
                        "Place %s not found.".formatted(placeId));
            }

            return displayNameNode.asText();
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("Google Places API Response decoding error for {}: ", placeId, e);
            throw new BusinessException(ResultCode.GOOGLE_PLACES_RESPONSE_DECODE_ERROR);
        }
    }
}
