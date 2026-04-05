package com.travelplanner.backend.common.context;

import java.util.UUID;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "app.current-user")
public class CurrentUserProperties {

    private UUID fixedId = UUID.fromString("00000000-0000-0000-0000-000000000001");
}
