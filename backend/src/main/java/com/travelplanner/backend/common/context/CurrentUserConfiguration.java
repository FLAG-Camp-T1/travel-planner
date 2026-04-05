package com.travelplanner.backend.common.context;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Configuration
@Profile({"dev", "test"})
@EnableConfigurationProperties(CurrentUserProperties.class)
public class CurrentUserConfiguration {

    @Bean
    public CurrentUserProvider currentUserProvider(CurrentUserProperties properties) {
        return new FixedCurrentUserProvider(properties.getFixedId());
    }
}
