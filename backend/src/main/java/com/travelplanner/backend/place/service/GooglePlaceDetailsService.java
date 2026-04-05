package com.travelplanner.backend.place.service;

import com.travelplanner.backend.common.api.ResultCode;
import com.travelplanner.backend.common.config.GoogleMapsProperties;
import com.travelplanner.backend.common.exception.BusinessException;
import com.travelplanner.backend.place.dto.PlaceDetailDto;
import java.util.List;
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
public class GooglePlaceDetailsService implements PlaceDetailsService {

    private static final String FIELD_MASK =
            "id,displayName,formattedAddress,location,primaryTypeDisplayName,"
                    + "rating,userRatingCount,websiteUri,googleMapsUri,"
                    + "regularOpeningHours.weekdayDescriptions";

    private final RestTemplate restTemplate;
    private final GoogleMapsProperties googleMapsProperties;
    private final ObjectMapper objectMapper;

    @Override
    public PlaceDetailDto getPlaceDetails(@NonNull String placeId) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Goog-Api-Key", googleMapsProperties.getApiKey());
        headers.set("X-Goog-FieldMask", FIELD_MASK);

        String url = googleMapsProperties.getPlacesApiUrl() + "/" + placeId;

        try {
            ResponseEntity<String> response =
                    restTemplate.exchange(
                            url, HttpMethod.GET, new HttpEntity<>(headers), String.class);
            return parsePlaceDetails(placeId, response.getBody());
        } catch (HttpStatusCodeException e) {
            log.error(
                    "Google Places details request failed for {} with status code {}",
                    placeId,
                    e.getStatusCode());
            log.error("Google Places details error response: {}", e.getResponseBodyAsString());
            if (e.getStatusCode().value() == 404) {
                throw new BusinessException(
                        ResultCode.GOOGLE_PLACES_NOT_FOUND_ERROR,
                        "Place %s not found.".formatted(placeId));
            }
            throw new BusinessException(ResultCode.GOOGLE_PLACES_REQUEST_ERROR);
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("Google Places details request failed for {}", placeId, e);
            throw new BusinessException(ResultCode.GOOGLE_PLACES_REQUEST_ERROR);
        }
    }

    private PlaceDetailDto parsePlaceDetails(String placeId, String jsonBody) {
        if (jsonBody == null || jsonBody.isBlank()) {
            throw new BusinessException(ResultCode.GOOGLE_PLACES_RESPONSE_DECODE_ERROR);
        }

        try {
            JsonNode placeNode = objectMapper.readTree(jsonBody);
            String resolvedPlaceId = asNullableText(placeNode.path("id"));
            PlaceDetailDto dto = new PlaceDetailDto();
            dto.setPlaceId(resolvedPlaceId != null ? resolvedPlaceId : placeId);
            dto.setName(asNullableText(placeNode.path("displayName").path("text")));
            dto.setAddress(asNullableText(placeNode.path("formattedAddress")));
            dto.setLatitude(asNullableDouble(placeNode.path("location").path("latitude")));
            dto.setLongitude(asNullableDouble(placeNode.path("location").path("longitude")));
            dto.setCategoryLabel(
                    asNullableText(placeNode.path("primaryTypeDisplayName").path("text")));
            dto.setRating(asNullableDouble(placeNode.path("rating")));
            dto.setUserRatingCount(asNullableInteger(placeNode.path("userRatingCount")));
            dto.setWebsiteUri(asNullableText(placeNode.path("websiteUri")));
            dto.setGoogleMapsUri(asNullableText(placeNode.path("googleMapsUri")));
            dto.setOpeningWeekdayDescriptions(
                    toStringList(
                            placeNode.path("regularOpeningHours").path("weekdayDescriptions")));
            return dto;
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("Google Places details response decoding error for {}", placeId, e);
            throw new BusinessException(ResultCode.GOOGLE_PLACES_RESPONSE_DECODE_ERROR);
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

    private Integer asNullableInteger(JsonNode node) {
        if (node.isMissingNode() || node.isNull()) {
            return null;
        }

        return node.asInt();
    }

    private List<String> toStringList(JsonNode node) {
        if (!node.isArray() || node.isEmpty()) {
            return List.of();
        }

        return java.util.stream.StreamSupport.stream(node.spliterator(), false)
                .map(this::asNullableText)
                .filter(java.util.Objects::nonNull)
                .toList();
    }
}
