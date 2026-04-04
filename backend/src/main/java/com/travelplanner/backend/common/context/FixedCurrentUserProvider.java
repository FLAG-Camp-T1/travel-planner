package com.travelplanner.backend.common.context;

import java.util.UUID;
import org.jspecify.annotations.NonNull;

public class FixedCurrentUserProvider implements CurrentUserProvider {

    private final UUID fixedUserId;

    public FixedCurrentUserProvider(@NonNull UUID fixedUserId) {
        this.fixedUserId = fixedUserId;
    }

    @Override
    public @NonNull UUID getCurrentUserId() {
        return fixedUserId;
    }
}
