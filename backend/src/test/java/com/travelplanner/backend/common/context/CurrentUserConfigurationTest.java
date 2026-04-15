package com.travelplanner.backend.common.context;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.travelplanner.backend.auth.model.AuthenticatedUser;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

class CurrentUserConfigurationTest {

    private final ApplicationContextRunner contextRunner =
            new ApplicationContextRunner().withUserConfiguration(CurrentUserConfiguration.class);

    @Test
    void currentUserProvider_ThrowsWhenNoSecurityContextAndNoDevFallback() {
        contextRunner.run(
                context -> {
                    CurrentUserProvider currentUserProvider =
                            context.getBean(CurrentUserProvider.class);

                    IllegalStateException exception =
                            assertThrows(
                                    IllegalStateException.class,
                                    currentUserProvider::getCurrentUserId);

                    assertEquals(
                            "No authenticated user available in security context.",
                            exception.getMessage());
                });
    }

    @Test
    void currentUserProvider_UsesDefaultFixedIdForTestProfile() {
        contextRunner
                .withPropertyValues("spring.profiles.active=test")
                .run(
                        context -> {
                            CurrentUserProvider currentUserProvider =
                                    context.getBean(CurrentUserProvider.class);

                            assertNotNull(currentUserProvider);
                            assertEquals(
                                    UUID.fromString("00000000-0000-0000-0000-000000000001"),
                                    currentUserProvider.getCurrentUserId());
                        });
    }

    @Test
    void currentUserProvider_AllowsFixedIdOverrideFromPropertiesInTestProfile() {
        contextRunner
                .withPropertyValues(
                        "spring.profiles.active=test",
                        "app.current-user.fixed-id=00000000-0000-0000-0000-000000000099")
                .run(
                        context -> {
                            CurrentUserProvider currentUserProvider =
                                    context.getBean(CurrentUserProvider.class);

                            assertNotNull(currentUserProvider);
                            assertEquals(
                                    UUID.fromString("00000000-0000-0000-0000-000000000099"),
                                    currentUserProvider.getCurrentUserId());
                        });
    }

    @Test
    void currentUserProvider_ReturnsAuthenticatedUserIdWhenSecurityContextIsPresent() {
        contextRunner
                .withPropertyValues("spring.profiles.active=test")
                .run(
                        context -> {
                            CurrentUserProvider currentUserProvider =
                                    context.getBean(CurrentUserProvider.class);
                            AuthenticatedUser authenticatedUser =
                                    new AuthenticatedUser(
                                            UUID.fromString("00000000-0000-0000-0000-000000000123"),
                                            "traveler01",
                                            "traveler@example.com",
                                            "{bcrypt}hash");

                            SecurityContextHolder.getContext()
                                    .setAuthentication(
                                            new UsernamePasswordAuthenticationToken(
                                                    authenticatedUser,
                                                    null,
                                                    authenticatedUser.getAuthorities()));
                            try {
                                assertEquals(
                                        UUID.fromString("00000000-0000-0000-0000-000000000123"),
                                        currentUserProvider.getCurrentUserId());
                            } finally {
                                SecurityContextHolder.clearContext();
                            }
                        });
    }
}
