package com.travelplanner.backend;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.ClassPathResource;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;

class SchemaMigrationIntegrationTest {

    @Test
    void migrationScript_CreatesExpectedTripsTables() {
        JdbcTemplate jdbcTemplate = migratedJdbcTemplate();

        assertEquals(1, tableCount(jdbcTemplate, "APP_USER"));
        assertEquals(1, tableCount(jdbcTemplate, "POI"));
        assertEquals(1, tableCount(jdbcTemplate, "TRIP"));
        assertEquals(1, tableCount(jdbcTemplate, "TRIP_DAY"));
        assertEquals(1, tableCount(jdbcTemplate, "ITINERARY"));
        assertEquals(1, tableCount(jdbcTemplate, "BOOKMARK_CATEGORY"));
        assertEquals(1, tableCount(jdbcTemplate, "BOOKMARK"));
    }

    @Test
    void migrationScript_EnforcesTripDurationConstraint() {
        JdbcTemplate jdbcTemplate = migratedJdbcTemplate();
        UUID userId = UUID.randomUUID();

        jdbcTemplate.update(
                "INSERT INTO APP_USER (USER_ID, USER_NAME, EMAIL, PASSWORD_HASH) VALUES (?, ?, ?, ?)",
                userId,
                "schema-test-user",
                "schema-" + userId + "@example.com",
                "hash");

        assertThrows(
                DataAccessException.class,
                () ->
                        jdbcTemplate.update(
                                "INSERT INTO TRIP (USER_ID, TITLE, DURATION) VALUES (?, ?, ?)",
                                userId,
                                "Invalid Duration Trip",
                                16));
    }

    private static JdbcTemplate migratedJdbcTemplate() {
        DriverManagerDataSource dataSource = new DriverManagerDataSource();
        dataSource.setDriverClassName("org.h2.Driver");
        dataSource.setUrl(
                "jdbc:h2:mem:"
                        + UUID.randomUUID()
                        + ";MODE=PostgreSQL;DB_CLOSE_DELAY=-1;DEFAULT_NULL_ORDERING=HIGH");
        dataSource.setUsername("sa");
        dataSource.setPassword("");

        ResourceDatabasePopulator databasePopulator =
                new ResourceDatabasePopulator(
                        new ClassPathResource("db/migration/V1__baseline_schema.sql"));
        databasePopulator.execute(dataSource);

        return new JdbcTemplate(dataSource);
    }

    private static int tableCount(JdbcTemplate jdbcTemplate, String tableName) {
        Integer count =
                jdbcTemplate.queryForObject(
                        "SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = ?",
                        Integer.class,
                        tableName);
        return count == null ? 0 : count;
    }
}
