package com.travelplanner.backend.route.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.any;
import static org.mockito.Mockito.anyString;
import static org.mockito.Mockito.eq;

import com.travelplanner.backend.common.api.ResultCode;
import com.travelplanner.backend.common.config.GoogleMapsProperties;
import com.travelplanner.backend.common.exception.BusinessException;
import com.travelplanner.backend.route.dto.RouteRequest;
import com.travelplanner.backend.route.dto.RouteSummaryDto;
import com.travelplanner.backend.route.enums.TravelMode;
import org.jspecify.annotations.NonNull;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import tools.jackson.databind.ObjectMapper;

@ExtendWith(MockitoExtension.class)
public class GoogleRouteServiceTest {

    @Mock private RestTemplate restTemplate;

    @Mock private GoogleMapsProperties properties;

    private GoogleRouteService googleRouteService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        googleRouteService = new GoogleRouteService(restTemplate, properties, objectMapper);

        Mockito.lenient().when(properties.getApiKey()).thenReturn("fake-test-key");
        Mockito.lenient()
                .when(properties.getRoutesApiUrl())
                .thenReturn("https://fake.google.com/duckstop");
    }

    private @NonNull RouteRequest createValidRequest() {
        RouteRequest request = new RouteRequest();
        request.setOriginPlaceId("fake-origin");
        request.setDestinationPlaceId("fake-dest");
        request.setTravelMode(TravelMode.DRIVE);
        return request;
    }

    @Test
    void requestRoute_Success_ShouldParseCorrectly() {
        RouteRequest request = createValidRequest();

        String fakeGoogleJson =
                "{\n"
                        + "  \"routes\": [\n"
                        + "    {\n"
                        + "      \"distanceMeters\": 6504,\n"
                        + "      \"duration\": \"620s\",\n"
                        + "      \"polyline\": {\n"
                        + "        \"encodedPolyline\": \"_grdFdt~iVT...fake_polyline...\"\n"
                        + "      },\n"
                        + "      \"viewport\": {\n"
                        + "        \"low\": { \"latitude\": 37.598, \"longitude\": -122.409 },\n"
                        + "        \"high\": { \"latitude\": 37.618, \"longitude\": -122.381 }\n"
                        + "      }\n"
                        + "    }\n"
                        + "  ]\n"
                        + "}";

        ResponseEntity<String> fakeResponse = new ResponseEntity<>(fakeGoogleJson, HttpStatus.OK);
        Mockito.when(
                        restTemplate.postForEntity(
                                Mockito.eq("https://fake.google.com/duckstop"),
                                Mockito.any(),
                                Mockito.eq(String.class)))
                .thenReturn(fakeResponse);

        RouteSummaryDto result = googleRouteService.computeRoute(request);

        assertNotNull(result);
        assertEquals(6504, result.getDistanceMeters());
        assertEquals("620s", result.getDuration());
        assertEquals("_grdFdt~iVT...fake_polyline...", result.getEncodedPolyline());

        assertNotNull(result.getViewport());
        assertEquals(37.618, result.getViewport().getNortheast().getLat());
        assertEquals(-122.381, result.getViewport().getNortheast().getLng());
        assertEquals(37.598, result.getViewport().getSouthwest().getLat());
        assertEquals(-122.409, result.getViewport().getSouthwest().getLng());
    }

    @Test
    void computeRoute_WhenGoogleApiFails_ShouldThrowBusinessException() {
        RouteRequest request = createValidRequest();
        Mockito.when(restTemplate.postForEntity(any(String.class), any(), eq(String.class)))
                .thenThrow(new RestClientException("Connection Timeout"));

        BusinessException exception =
                assertThrows(
                        BusinessException.class,
                        () -> {
                            googleRouteService.computeRoute(request);
                        });

        assertEquals(
                ResultCode.GOOGLE_ROUTES_REQUEST_ERROR.getCode(),
                exception.getResultCode().getCode());
    }

    @Test
    void computeRoute_WhenGoogleReturns4xxError_ShouldCatchHttpStatusCodeException() {
        // Cover HttpStatusCodeException case
        RouteRequest request = createValidRequest();

        Mockito.when(restTemplate.postForEntity(anyString(), any(), eq(String.class)))
                .thenThrow(
                        new org.springframework.web.client.HttpClientErrorException(
                                HttpStatus.BAD_REQUEST,
                                "Bad Request",
                                "Invalid Key".getBytes(),
                                java.nio.charset.Charset.defaultCharset()));

        BusinessException exception =
                assertThrows(
                        BusinessException.class,
                        () -> {
                            googleRouteService.computeRoute(request);
                        });
        assertNotNull(exception);
    }

    @Test
    void computeRoute_WhenNetworkCompletelyFails_ShouldCatchGeneralException() {
        // Cover Exception case
        RouteRequest request = createValidRequest();

        Mockito.when(restTemplate.postForEntity(anyString(), any(), eq(String.class)))
                .thenThrow(new RuntimeException("DNS Resolution Failed"));

        BusinessException exception =
                assertThrows(
                        BusinessException.class,
                        () -> {
                            googleRouteService.computeRoute(request);
                        });
        assertNotNull(exception);
    }

    @Test
    void computeRoute_WhenNoRoutesFound_ShouldThrowRouteNotFoundException() {
        // Cover routesNode.isMissingNode() || routesNode.isEmpty() cases
        RouteRequest request = createValidRequest();

        String emptyRoutesJson = "{ \"routes\": [] }";
        ResponseEntity<String> fakeResponse = new ResponseEntity<>(emptyRoutesJson, HttpStatus.OK);

        Mockito.when(restTemplate.postForEntity(anyString(), any(), eq(String.class)))
                .thenReturn(fakeResponse);

        BusinessException exception =
                assertThrows(
                        BusinessException.class,
                        () -> {
                            googleRouteService.computeRoute(request);
                        });
        assertNotNull(exception);
    }

    @Test
    void computeRoute_WhenGoogleReturnsInvalidJson_ShouldCatchParseException() {
        // Cover json decode error case
        RouteRequest request = createValidRequest();

        String invalidJson = "<html>502 Bad Gateway</html>";
        ResponseEntity<String> fakeResponse = new ResponseEntity<>(invalidJson, HttpStatus.OK);

        Mockito.when(restTemplate.postForEntity(anyString(), any(), eq(String.class)))
                .thenReturn(fakeResponse);

        BusinessException exception =
                assertThrows(
                        BusinessException.class,
                        () -> {
                            googleRouteService.computeRoute(request);
                        });
        assertNotNull(exception);
    }
}
