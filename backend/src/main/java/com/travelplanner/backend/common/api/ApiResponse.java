package com.travelplanner.backend.common.api;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import org.jspecify.annotations.NonNull;

@Data
@Schema(name = "ApiResponse", description = "Standard API response wrapper")
public class ApiResponse<T> {

    @Schema(description = "Application-level result code", example = "20000")
    private Integer code;

    @Schema(description = "Human-readable result message", example = "OK")
    private String message;

    @Schema(description = "Whether the request completed successfully", example = "true")
    private Boolean success;

    @Schema(description = "Response payload; null when no payload is returned", nullable = true)
    private T data;

    // Disable constructor. Use factory method instead
    private ApiResponse() {}

    public static <T> @NonNull ApiResponse<T> success(T data, String customMessage) {
        ApiResponse<T> response = new ApiResponse<>();
        response.setSuccess(true);
        ResultCode resultCode = ResultCode.SUCCESS;
        response.setCode(resultCode.getCode());
        response.setMessage(customMessage);
        response.setData(data);
        return response;
    }

    public static <T> @NonNull ApiResponse<T> success(T data) {
        return success(data, ResultCode.SUCCESS.getMessage());
    }

    public static <T> @NonNull ApiResponse<T> success() {
        return success(null);
    }

    public static <T> @NonNull ApiResponse<T> error(
            @NonNull ResultCode resultCode, String customMessage, T data) {
        ApiResponse<T> response = new ApiResponse<>();
        response.setSuccess(false);
        response.setCode(resultCode.getCode());
        response.setMessage(customMessage);
        response.setData(data);
        return response;
    }

    public static <T> @NonNull ApiResponse<T> error(
            @NonNull ResultCode resultCode, String customMessage) {
        return error(resultCode, customMessage, null);
    }

    public static <T> @NonNull ApiResponse<T> error(ResultCode resultCode) {
        return error(resultCode, resultCode.getMessage());
    }

    public static <T> @NonNull ApiResponse<T> error() {
        return error(ResultCode.INTERNAL_ERROR);
    }
}
