package com.travelplanner.backend.common.context;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;

@Configuration
@EnableConfigurationProperties(CurrentUserProperties.class)
public class CurrentUserConfiguration {

    @Bean
    public CurrentUserProvider currentUserProvider(
            CurrentUserProperties properties, Environment environment) {
        boolean allowFallbackUser = environment.acceptsProfiles(Profiles.of("dev", "test"));
        return new SecurityContextCurrentUserProvider(properties.getFixedId(), allowFallbackUser);
    }
}
