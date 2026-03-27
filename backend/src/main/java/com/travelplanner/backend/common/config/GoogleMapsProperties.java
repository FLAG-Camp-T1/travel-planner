package com.travelplanner.backend.common.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "google.maps")
public class GoogleMapsProperties {
    private String apiKey;
    private String routesApiUrl;
}
