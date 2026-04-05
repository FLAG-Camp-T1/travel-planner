package com.travelplanner.backend.common.api;

import lombok.Getter;

@Getter
public enum ResultCode {
    // Basic Status
    SUCCESS(20000, "OK"),

    // Client Side Error
    BAD_REQUEST(40000, "Bad Request"),
    PARAM_INVALID(40001, "Param Invalid"),
    PARAM_MISSING(40002, "Param Missing"),
    UNAUTHORIZED(40100, "Unauthorized"),

    // Server Side Error
    INTERNAL_ERROR(50000, "Internal Error"),
    // Routes Errors
    GOOGLE_ROUTES_REQUEST_ERROR(50100, "Google Maps Routes API Request Error"),
    GOOGLE_ROUTES_NOT_FOUND_ERROR(50101, "Routes Not Found"),
    GOOGLE_ROUTES_RESPONSE_DECODE_ERROR(50102, "Routes Response Decode Error"),
    // Places Errors
    GOOGLE_PLACES_REQUEST_ERROR(50110, "Google Places API Request Error"),
    GOOGLE_PLACES_NOT_FOUND_ERROR(50111, "Place Not Found"),
    GOOGLE_PLACES_RESPONSE_DECODE_ERROR(50112, "Places Response Decode Error"),
    // Trip Errors
    TRIP_ROUTE_GENERATION_ERROR(50120, "Trip Route Generation Error"),
    TRIP_ROUTE_SEGMENT_BUILD_ERROR(50121, "Trip Route Segment Build Error"),
    TRIP_ROUTE_POLYLINE_AGGREGATION_ERROR(50122, "Trip Route Polyline Aggregation Error"),
    ;

    private final Integer code;
    private final String message;

    ResultCode(Integer code, String message) {
        this.code = code;
        this.message = message;
    }
}
