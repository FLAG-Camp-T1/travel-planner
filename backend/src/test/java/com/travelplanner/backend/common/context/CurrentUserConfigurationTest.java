package com.travelplanner.backend.common.context;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;

import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

class CurrentUserConfigurationTest {

    private final ApplicationContextRunner contextRunner =
            new ApplicationContextRunner().withUserConfiguration(CurrentUserConfiguration.class);

    @Test
    void currentUserProvider_FailsFastWithoutDevOrTestProfile() {
        contextRunner
                .withUserConfiguration(CurrentUserConsumerConfiguration.class)
                .run(
                        context -> {
                            assertNotNull(context.getStartupFailure());
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
    void currentUserProvider_LoadsInDevProfile() {
        contextRunner
                .withPropertyValues("spring.profiles.active=dev")
                .run(
                        context -> {
                            assertNull(context.getStartupFailure());
                            assertNotNull(context.getBean(CurrentUserProvider.class));
                        });
    }

    @Configuration
    static class CurrentUserConsumerConfiguration {

        @Bean
        String currentUserProbe(CurrentUserProvider currentUserProvider) {
            return currentUserProvider.getCurrentUserId().toString();
        }
    }
}
