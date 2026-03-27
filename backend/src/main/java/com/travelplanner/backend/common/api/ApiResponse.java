package com.travelplanner.backend.common.api;

import lombok.Data;
import org.jspecify.annotations.NonNull;

@Data
public class ApiResponse<T> {

    private Integer code;
    private String message;
    private Boolean success;
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
