package com.travelplanner.backend.common.context;

import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(CurrentUserProperties.class)
public class CurrentUserConfiguration {

    @Bean
    @ConditionalOnMissingBean(CurrentUserProvider.class)
    public CurrentUserProvider currentUserProvider(CurrentUserProperties properties) {
        return new FixedCurrentUserProvider(properties.getFixedId());
    }
}
