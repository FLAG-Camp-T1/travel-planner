package com.travelplanner.backend.common.context;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;

class CurrentUserConfigurationTest {

    private final ApplicationContextRunner contextRunner =
            new ApplicationContextRunner().withUserConfiguration(CurrentUserConfiguration.class);

    @Test
    void currentUserProvider_UsesDefaultFixedId() {
        contextRunner.run(
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
    void currentUserProvider_AllowsFixedIdOverrideFromProperties() {
        contextRunner
                .withPropertyValues(
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
}
