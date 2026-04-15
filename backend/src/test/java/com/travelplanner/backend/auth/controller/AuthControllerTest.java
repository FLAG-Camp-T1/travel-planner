package com.travelplanner.backend.auth.controller;

import static org.hamcrest.Matchers.nullValue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.travelplanner.backend.auth.dto.AuthTokenResponse;
import com.travelplanner.backend.auth.service.AuthService;
import com.travelplanner.backend.common.api.ResultCode;
import com.travelplanner.backend.common.exception.GlobalExceptionHandler;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(AuthController.class)
@Import(GlobalExceptionHandler.class)
class AuthControllerTest {

    @Autowired private MockMvc mockMvc;

    @MockitoBean private AuthService authService;

    @Test
    void login_ReturnsTokenPayload() throws Exception {
        when(authService.login(any())).thenReturn(new AuthTokenResponse("jwt-token"));

        mockMvc.perform(
                        post("/api/v1/auth/login")
                                .contentType(APPLICATION_JSON)
                                .content(
                                        """
                                        {
                                          "email": "traveler@example.com",
                                          "password": "Travel123!"
                                        }
                                        """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(ResultCode.SUCCESS.getCode()))
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").value("jwt-token"));
    }

    @Test
    void signup_ReturnsTokenPayload() throws Exception {
        when(authService.signup(any())).thenReturn(new AuthTokenResponse("signup-token"));

        mockMvc.perform(
                        post("/api/v1/auth/signup")
                                .contentType(APPLICATION_JSON)
                                .content(
                                        """
                                        {
                                          "username": "traveler01",
                                          "email": "traveler@example.com",
                                          "password": "Travel123!"
                                        }
                                        """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(ResultCode.SUCCESS.getCode()))
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").value("signup-token"));
    }

    @Test
    void logout_ReturnsSuccessPayload() throws Exception {
        doNothing().when(authService).logout();

        mockMvc.perform(post("/api/v1/auth/logout"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(ResultCode.SUCCESS.getCode()))
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").value(nullValue()));
    }

    @Test
    void login_WhenRequestIsInvalid_ReturnsParamInvalid() throws Exception {
        mockMvc.perform(
                        post("/api/v1/auth/login")
                                .contentType(APPLICATION_JSON)
                                .content(
                                        """
                                        {
                                          "email": "invalid-email",
                                          "password": ""
                                        }
                                        """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(ResultCode.PARAM_INVALID.getCode()))
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void login_WhenCredentialsAreInvalid_ReturnsUnauthorizedPayload() throws Exception {
        when(authService.login(any())).thenThrow(new BadCredentialsException("Bad credentials"));

        mockMvc.perform(
                        post("/api/v1/auth/login")
                                .contentType(APPLICATION_JSON)
                                .content(
                                        """
                                        {
                                          "email": "traveler@example.com",
                                          "password": "Travel123!"
                                        }
                                        """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(ResultCode.UNAUTHORIZED.getCode()))
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Invalid email or password."));
    }
}
