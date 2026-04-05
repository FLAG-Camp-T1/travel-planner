package com.travelplanner.backend.place.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;

import com.travelplanner.backend.common.api.ResultCode;
import com.travelplanner.backend.common.config.GoogleMapsProperties;
import com.travelplanner.backend.common.exception.BusinessException;
import com.travelplanner.backend.place.dto.PlaceDetailDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import tools.jackson.databind.ObjectMapper;

@ExtendWith(MockitoExtension.class)
class GooglePlaceDetailsServiceTest {

    @Mock private RestTemplate restTemplate;
    @Mock private GoogleMapsProperties googleMapsProperties;

    private GooglePlaceDetailsService googlePlaceDetailsService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        googlePlaceDetailsService =
                new GooglePlaceDetailsService(restTemplate, googleMapsProperties, objectMapper);
        lenient().when(googleMapsProperties.getApiKey()).thenReturn("fake-test-key");
        lenient()
                .when(googleMapsProperties.getPlacesApiUrl())
                .thenReturn("https://places.googleapis.com/v1/places");
    }

    @Test
    void getPlaceDetails_WhenGoogleReturnsOk_MapsFieldsSafely() {
        String responseBody =
                """
                {
                  "id": "poi-search-1",
                  "displayName": { "text": "National Air and Space Museum" },
                  "formattedAddress": "600 Independence Ave SW, Washington, DC 20560, USA",
                  "location": {
                    "latitude": 38.8882,
                    "longitude": -77.0199
                  },
                  "primaryTypeDisplayName": { "text": "Museum" },
                  "rating": 4.7,
                  "userRatingCount": 12645,
                  "websiteUri": "https://airandspace.si.edu/",
                  "googleMapsUri": "https://maps.google.com/?cid=123",
                  "regularOpeningHours": {
                    "weekdayDescriptions": [
                      "Monday: 10:00 AM – 5:30 PM",
                      "Tuesday: 10:00 AM – 5:30 PM"
                    ]
                  }
                }
                """;
        ResponseEntity<String> response = new ResponseEntity<>(responseBody, HttpStatus.OK);
        when(restTemplate.exchange(
                        anyString(),
                        eq(HttpMethod.GET),
                        org.mockito.Mockito.any(),
                        eq(String.class)))
                .thenReturn(response);

        PlaceDetailDto detail = googlePlaceDetailsService.getPlaceDetails("poi-search-1");

        assertEquals("poi-search-1", detail.getPlaceId());
        assertEquals("National Air and Space Museum", detail.getName());
        assertEquals("Museum", detail.getCategoryLabel());
        assertEquals(4.7, detail.getRating());
        assertEquals(12645, detail.getUserRatingCount());
        assertEquals("https://airandspace.si.edu/", detail.getWebsiteUri());
        assertEquals("https://maps.google.com/?cid=123", detail.getGoogleMapsUri());
        assertEquals(2, detail.getOpeningWeekdayDescriptions().size());
    }

    @Test
    void getPlaceDetails_WhenResponseIsPartial_ReturnsSafeDefaults() {
        ResponseEntity<String> response =
                new ResponseEntity<>("{\"displayName\":{\"text\":\"Place\"}}", HttpStatus.OK);
        when(restTemplate.exchange(
                        anyString(),
                        eq(HttpMethod.GET),
                        org.mockito.Mockito.any(),
                        eq(String.class)))
                .thenReturn(response);

        PlaceDetailDto detail = googlePlaceDetailsService.getPlaceDetails("place-1");

        assertEquals("place-1", detail.getPlaceId());
        assertEquals("Place", detail.getName());
        assertEquals(java.util.List.of(), detail.getOpeningWeekdayDescriptions());
    }

    @Test
    void getPlaceDetails_WhenPlaceIsNotFound_ThrowsNotFound() {
        when(restTemplate.exchange(
                        anyString(),
                        eq(HttpMethod.GET),
                        org.mockito.Mockito.any(),
                        eq(String.class)))
                .thenThrow(new HttpClientErrorException(HttpStatus.NOT_FOUND));

        BusinessException exception =
                assertThrows(
                        BusinessException.class,
                        () -> googlePlaceDetailsService.getPlaceDetails("missing-place"));

        assertEquals(ResultCode.GOOGLE_PLACES_NOT_FOUND_ERROR, exception.getResultCode());
    }

    @Test
    void getPlaceDetails_WhenResponseIsInvalid_ThrowsDecodeError() {
        ResponseEntity<String> response = new ResponseEntity<>("{", HttpStatus.OK);
        when(restTemplate.exchange(
                        anyString(),
                        eq(HttpMethod.GET),
                        org.mockito.Mockito.any(),
                        eq(String.class)))
                .thenReturn(response);

        BusinessException exception =
                assertThrows(
                        BusinessException.class,
                        () -> googlePlaceDetailsService.getPlaceDetails("broken-place"));

        assertEquals(ResultCode.GOOGLE_PLACES_RESPONSE_DECODE_ERROR, exception.getResultCode());
    }
}
