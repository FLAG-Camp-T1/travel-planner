package com.travelplanner.backend.common.exception;

import com.travelplanner.backend.common.api.ApiResponse;
import com.travelplanner.backend.common.api.ResultCode;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NonNull;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(value = BusinessException.class)
    public ApiResponse<Void> handleBusinessException(@NonNull BusinessException e) {
        log.warn("BusinessException: [{}] {}", e.getResultCode().getCode(), e.getMessage());
        return ApiResponse.error(e.getResultCode(), e.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ApiResponse<Void> handleMethodArgumentNotValidException(
            @NonNull MethodArgumentNotValidException e) {
        String errorMessage =
                e.getBindingResult().getFieldErrors().stream()
                        .findFirst()
                        .map(FieldError::getDefaultMessage)
                        .orElse(ResultCode.PARAM_INVALID.getMessage());
        log.warn("MethodArgumentNotValidException: {}", errorMessage);
        return ApiResponse.error(ResultCode.PARAM_INVALID, errorMessage);
    }

    @ExceptionHandler(Exception.class)
    public ApiResponse<Void> handleSystemException(Exception e) {
        log.error("SystemException: ", e);
        return ApiResponse.error(ResultCode.INTERNAL_ERROR);
    }
}
