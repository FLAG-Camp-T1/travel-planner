package com.travelplanner.backend.common.context;

import java.util.UUID;
import org.jspecify.annotations.NonNull;

public interface CurrentUserProvider {

    @NonNull UUID getCurrentUserId();
}
