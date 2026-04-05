package com.travelplanner.backend.trip.bootstrap;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@Profile("dev")
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "app.bootstrap", name = "seed-enabled", havingValue = "true")
public class TripDevelopmentBootstrap implements ApplicationRunner {

    private final DevelopmentTripSeedService developmentTripSeedService;

    @Override
    public void run(ApplicationArguments args) {
        log.info("Running development Trips bootstrap seed.");
        developmentTripSeedService.seedIfNeeded();
    }
}
