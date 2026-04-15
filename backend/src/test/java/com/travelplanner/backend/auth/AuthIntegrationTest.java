package com.travelplanner.backend.auth;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.UUID;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private JdbcTemplate jdbcTemplate;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private ObjectMapper objectMapper;

    @AfterEach
    void cleanDatabase() {
        jdbcTemplate.update("DELETE FROM itinerary");
        jdbcTemplate.update("DELETE FROM trip_day");
        jdbcTemplate.update("DELETE FROM trip");
        jdbcTemplate.update("DELETE FROM bookmark");
        jdbcTemplate.update("DELETE FROM bookmark_category");
        jdbcTemplate.update("DELETE FROM poi");
        jdbcTemplate.update("DELETE FROM app_user");
    }

    @Test
    void signup_UsesUsernameFieldAndReturnsToken() throws Exception {
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
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").isString());
    }

    @Test
    void login_ReturnsJwtForExistingUser() throws Exception {
        insertUser("traveler01", "traveler@example.com", "Travel123!");

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
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").isString());
    }

    @Test
    void protectedTripsEndpoint_RequiresJwtAndUsesAuthenticatedUser() throws Exception {
        signup("traveler01", "traveler@example.com", "Travel123!");
        UUID userId =
                jdbcTemplate.queryForObject(
                        "SELECT user_id FROM app_user WHERE email = ?",
                        UUID.class,
                        "traveler@example.com");
        jdbcTemplate.update(
                "INSERT INTO trip (user_id, title, duration) VALUES (?, ?, ?)",
                userId,
                "Authenticated User Trip",
                3);

        mockMvc.perform(get("/api/v1/trips"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Authentication is required."));

        String token = loginAndExtractToken("traveler@example.com", "Travel123!");

        mockMvc.perform(get("/api/v1/trips").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].title").value("Authenticated User Trip"));
    }

    @Test
    void protectedEndpointPreflight_AllowsAuthorizationHeader() throws Exception {
        mockMvc.perform(
                        options("/api/v1/trips")
                                .header("Origin", "http://localhost:5173")
                                .header("Access-Control-Request-Method", "GET")
                                .header(
                                        "Access-Control-Request-Headers",
                                        "authorization,content-type"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:5173"))
                .andExpect(
                        header().string(
                                        "Access-Control-Allow-Headers",
                                        containsString("authorization")));
    }

    @Test
    void signupEndpointPreflight_AllowsJsonRequestFromFrontend() throws Exception {
        mockMvc.perform(
                        options("/api/v1/auth/signup")
                                .header("Origin", "http://localhost:5173")
                                .header("Access-Control-Request-Method", "POST")
                                .header("Access-Control-Request-Headers", "content-type"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:5173"))
                .andExpect(header().string("Access-Control-Allow-Methods", containsString("POST")));
    }

    private void insertUser(String username, String email, String rawPassword) {
        jdbcTemplate.update(
                "INSERT INTO app_user (user_id, user_name, email, password_hash) VALUES (?, ?, ?, ?)",
                UUID.randomUUID(),
                username,
                email,
                passwordEncoder.encode(rawPassword));
    }

    private void signup(String username, String email, String password) throws Exception {
        mockMvc.perform(
                        post("/api/v1/auth/signup")
                                .contentType(APPLICATION_JSON)
                                .content(
                                        """
                                        {
                                          "username": "%s",
                                          "email": "%s",
                                          "password": "%s"
                                        }
                                        """
                                                .formatted(username, email, password)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    private String loginAndExtractToken(String email, String password) throws Exception {
        MvcResult result =
                mockMvc.perform(
                                post("/api/v1/auth/login")
                                        .contentType(APPLICATION_JSON)
                                        .content(
                                                """
                                                {
                                                  "email": "%s",
                                                  "password": "%s"
                                                }
                                                """
                                                        .formatted(email, password)))
                        .andExpect(status().isOk())
                        .andExpect(jsonPath("$.success").value(true))
                        .andReturn();

        JsonNode response = objectMapper.readTree(result.getResponse().getContentAsString());
        return response.path("data").path("token").asText();
    }
}
