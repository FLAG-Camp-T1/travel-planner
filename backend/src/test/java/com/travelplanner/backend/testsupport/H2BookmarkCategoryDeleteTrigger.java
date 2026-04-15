package com.travelplanner.backend.testsupport;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.UUID;
import org.h2.api.Trigger;

public class H2BookmarkCategoryDeleteTrigger implements Trigger {

    @Override
    public void init(
            Connection connection,
            String schemaName,
            String triggerName,
            String tableName,
            boolean before,
            int type) {}

    @Override
    public void fire(Connection connection, Object[] oldRow, Object[] newRow) throws SQLException {
        Long categoryId = ((Number) oldRow[0]).longValue();
        UUID userId = (UUID) oldRow[1];

        try (PreparedStatement statement =
                connection.prepareStatement(
                        """
                        UPDATE bookmark
                        SET custom_category = NULL
                        WHERE custom_category = ? AND user_id = ?
                        """)) {
            statement.setLong(1, categoryId);
            statement.setObject(2, userId);
            statement.executeUpdate();
        }
    }

    @Override
    public void close() {}

    @Override
    public void remove() {}
}
