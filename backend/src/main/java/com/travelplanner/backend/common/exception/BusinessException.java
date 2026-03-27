package com.travelplanner.backend.common.exception;

import com.travelplanner.backend.common.api.ResultCode;
import lombok.Getter;
import org.jspecify.annotations.NonNull;

@Getter
public class BusinessException extends RuntimeException {

    private final ResultCode resultCode;

    public BusinessException(@NonNull ResultCode resultCode) {
        super(resultCode.getMessage());
        this.resultCode = resultCode;
    }

    public BusinessException(ResultCode resultCode, String customMessage) {
        super(customMessage);
        this.resultCode = resultCode;
    }
}
