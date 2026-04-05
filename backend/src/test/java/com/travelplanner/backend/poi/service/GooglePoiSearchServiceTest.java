package com.travelplanner.backend.poi.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.travelplanner.backend.common.api.ResultCode;
import com.travelplanner.backend.common.config.GoogleMapsProperties;
import com.travelplanner.backend.common.exception.BusinessException;
import com.travelplanner.backend.poi.dto.POIDto;
import com.travelplanner.backend.poi.dto.POISearchRequest;
import java.util.List;
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
class GooglePoiSearchServiceTest {

    @Mock private RestTemplate restTemplate;
    @Mock private GoogleMapsProperties googleMapsProperties;

    private GooglePoiSearchService googlePoiSearchService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        googlePoiSearchService =
                new GooglePoiSearchService(restTemplate, googleMapsProperties, objectMapper);
        lenient().when(googleMapsProperties.getApiKey()).thenReturn("fake-test-key");
        lenient()
                .when(googleMapsProperties.getPlacesApiUrl())
                .thenReturn("https://places.googleapis.com/v1/places");
    }

    @Test
    void searchPOI_WhenGoogleReturnsOk_MapsResultsSafely() {
        POISearchRequest request = new POISearchRequest();
        request.setKeyword("museum");
        request.setLocation("38.89,-77.03");
        request.setRadius(5000);
        request.setPoiType("museum");

        String responseBody =
                """
                {
                  "places": [
                    {
                      "id": "poi-1",
                      "displayName": {
                        "text": "National Air and Space Museum"
                      },
                      "formattedAddress": "600 Independence Ave SW, Washington, DC 20560, USA",
                      "location": {
                        "latitude": 38.8882,
                        "longitude": -77.0199
                      },
                      "primaryType": "museum",
                      "rating": 4
                    }
                  ]
                }
                """;
        ResponseEntity<String> response = new ResponseEntity<>(responseBody, HttpStatus.OK);

        when(restTemplate.exchange(
                        anyString(),
                        eq(HttpMethod.POST),
                        org.mockito.Mockito.any(),
                        eq(String.class)))
                .thenReturn(response);

        List<POIDto> poiResults = googlePoiSearchService.searchPOI(request);

        assertEquals(1, poiResults.size());
        assertEquals("poi-1", poiResults.getFirst().getPlaceId());
        assertEquals("National Air and Space Museum", poiResults.getFirst().getName());
        assertEquals(38.8882, poiResults.getFirst().getLatitude());
        assertEquals(-77.0199, poiResults.getFirst().getLongitude());
        assertEquals("museum", poiResults.getFirst().getPoiType());
        assertEquals(4.0, poiResults.getFirst().getRating());
    }

    @Test
    void searchPOI_WhenGoogleReturnsZeroResults_ReturnsEmptyList() {
        POISearchRequest request = new POISearchRequest();
        request.setKeyword("very-unlikely-place");

        ResponseEntity<String> response = new ResponseEntity<>("{\"places\":[]}", HttpStatus.OK);
        when(restTemplate.exchange(
                        anyString(),
                        eq(HttpMethod.POST),
                        org.mockito.Mockito.any(),
                        eq(String.class)))
                .thenReturn(response);

        List<POIDto> poiResults = googlePoiSearchService.searchPOI(request);

        assertEquals(List.of(), poiResults);
    }

    @Test
    void searchPOI_WhenPoiTypeIsInvalid_ThrowsParamInvalidWithoutCallingProvider() {
        POISearchRequest request = new POISearchRequest();
        request.setKeyword("museum");
        request.setPoiType("invalid-type");

        BusinessException exception =
                assertThrows(
                        BusinessException.class, () -> googlePoiSearchService.searchPOI(request));

        assertEquals(ResultCode.PARAM_INVALID, exception.getResultCode());
        verify(restTemplate, org.mockito.Mockito.never())
                .exchange(
                        anyString(),
                        eq(HttpMethod.POST),
                        org.mockito.Mockito.any(),
                        eq(String.class));
    }

    @Test
    void searchPOI_WhenResultPayloadIsPartial_ReturnsSafeDefaults() {
        POISearchRequest request = new POISearchRequest();
        request.setKeyword("park");

        String responseBody =
                """
                {
                  "places": [
                    {
                      "id": "poi-2",
                      "displayName": {
                        "text": "National Mall"
                      },
                      "formattedAddress": "Washington, DC 20004, USA"
                    }
                  ]
                }
                """;
        ResponseEntity<String> response = new ResponseEntity<>(responseBody, HttpStatus.OK);
        when(restTemplate.exchange(
                        anyString(),
                        eq(HttpMethod.POST),
                        org.mockito.Mockito.any(),
                        eq(String.class)))
                .thenReturn(response);

        List<POIDto> poiResults = googlePoiSearchService.searchPOI(request);

        assertEquals(1, poiResults.size());
        assertNull(poiResults.getFirst().getLatitude());
        assertNull(poiResults.getFirst().getLongitude());
        assertNull(poiResults.getFirst().getPoiType());
        assertNull(poiResults.getFirst().getRating());
    }

    @Test
    void searchPOI_WhenLocationFormatIsInvalid_ThrowsParamInvalid() {
        POISearchRequest request = new POISearchRequest();
        request.setKeyword("museum");
        request.setLocation("bad-location");
        request.setRadius(5000);

        BusinessException exception =
                assertThrows(
                        BusinessException.class, () -> googlePoiSearchService.searchPOI(request));

        assertEquals(ResultCode.PARAM_INVALID, exception.getResultCode());
    }

    @Test
    void searchPOI_WhenGoogleReturnsClientError_ThrowsRequestError() {
        POISearchRequest request = new POISearchRequest();
        request.setKeyword("museum");

        when(restTemplate.exchange(
                        anyString(),
                        eq(HttpMethod.POST),
                        org.mockito.Mockito.any(),
                        eq(String.class)))
                .thenThrow(
                        new HttpClientErrorException(
                                HttpStatus.BAD_REQUEST,
                                "Bad Request",
                                "{\"error\":{\"message\":\"API key not valid\"}}".getBytes(),
                                java.nio.charset.StandardCharsets.UTF_8));

        BusinessException exception =
                assertThrows(
                        BusinessException.class, () -> googlePoiSearchService.searchPOI(request));

        assertEquals(ResultCode.GOOGLE_PLACES_REQUEST_ERROR, exception.getResultCode());
    }
}
