package com.travelplanner.backend;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.util.UUID;
import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@Testcontainers(disabledWithoutDocker = true)
class PostgresSchemaMigrationSmokeTest {

    @Container
    static final PostgreSQLContainer<?> POSTGRES =
            new PostgreSQLContainer<>("postgres:16-alpine")
                    .withDatabaseName("travel_planner_migration_test")
                    .withUsername("postgres")
                    .withPassword("postgres");

    @Test
    void productionMigrations_ApplyAndPreserveBookmarkCategoryDeleteSemantics() {
        Flyway flyway =
                Flyway.configure()
                        .cleanDisabled(false)
                        .locations("classpath:db/migration")
                        .dataSource(
                                POSTGRES.getJdbcUrl(),
                                POSTGRES.getUsername(),
                                POSTGRES.getPassword())
                        .load();
        flyway.clean();
        flyway.migrate();

        JdbcTemplate jdbcTemplate = jdbcTemplate();
        UUID userA = UUID.randomUUID();
        UUID userB = UUID.randomUUID();

        assertEquals(1, tableCount(jdbcTemplate, "app_user"));
        assertEquals("2", flyway.info().current().getVersion().getVersion());

        insertUser(jdbcTemplate, userA, "traveler-a", "traveler-a@example.com");
        insertUser(jdbcTemplate, userB, "traveler-b", "traveler-b@example.com");

        Long poiA = insertPoi(jdbcTemplate, "poi-a");
        Long poiB = insertPoi(jdbcTemplate, "poi-b");
        Long categoryA = insertCategory(jdbcTemplate, userA, "favorites");
        Long categoryB = insertCategory(jdbcTemplate, userB, "favorites");

        jdbcTemplate.update(
                "INSERT INTO bookmark (user_id, poi_id, custom_category) VALUES (?, ?, ?)",
                userA,
                poiA,
                categoryA);

        jdbcTemplate.update(
                "DELETE FROM bookmark_category WHERE id = ? AND user_id = ?", categoryA, userA);

        Long remainingCategoryId =
                jdbcTemplate.queryForObject(
                        "SELECT custom_category FROM bookmark WHERE user_id = ? AND poi_id = ?",
                        Long.class,
                        userA,
                        poiA);
        UUID remainingUserId =
                jdbcTemplate.queryForObject(
                        "SELECT user_id FROM bookmark WHERE user_id = ? AND poi_id = ?",
                        UUID.class,
                        userA,
                        poiA);

        assertEquals(null, remainingCategoryId);
        assertEquals(userA, remainingUserId);
        assertNotNull(
                jdbcTemplate.queryForObject(
                        "SELECT id FROM bookmark_category WHERE id = ? AND user_id = ?",
                        Long.class,
                        categoryB,
                        userB));

        assertThrows(
                DataAccessException.class,
                () ->
                        jdbcTemplate.update(
                                "INSERT INTO bookmark (user_id, poi_id, custom_category) VALUES (?, ?, ?)",
                                userA,
                                poiB,
                                categoryB));
    }

    private static JdbcTemplate jdbcTemplate() {
        DriverManagerDataSource dataSource = new DriverManagerDataSource();
        dataSource.setDriverClassName("org.postgresql.Driver");
        dataSource.setUrl(POSTGRES.getJdbcUrl());
        dataSource.setUsername(POSTGRES.getUsername());
        dataSource.setPassword(POSTGRES.getPassword());
        return new JdbcTemplate(dataSource);
    }

    private static void insertUser(
            JdbcTemplate jdbcTemplate, UUID userId, String userName, String email) {
        jdbcTemplate.update(
                "INSERT INTO app_user (user_id, user_name, email, password_hash) VALUES (?, ?, ?, ?)",
                userId,
                userName,
                email,
                "hash");
    }

    private static Long insertPoi(JdbcTemplate jdbcTemplate, String placesId) {
        return jdbcTemplate.queryForObject(
                "INSERT INTO poi (places_id) VALUES (?) RETURNING id", Long.class, placesId);
    }

    private static Long insertCategory(
            JdbcTemplate jdbcTemplate, UUID userId, String categoryName) {
        return jdbcTemplate.queryForObject(
                "INSERT INTO bookmark_category (user_id, category_name) VALUES (?, ?) RETURNING id",
                Long.class,
                userId,
                categoryName);
    }

    private static int tableCount(JdbcTemplate jdbcTemplate, String tableName) {
        Integer count =
                jdbcTemplate.queryForObject(
                        "SELECT COUNT(*) FROM information_schema.tables WHERE table_name = ?",
                        Integer.class,
                        tableName);
        return count == null ? 0 : count;
    }
}
