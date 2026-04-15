package com.travelplanner.backend.common.context;

import com.travelplanner.backend.auth.model.AuthenticatedUser;
import java.util.UUID;
import org.jspecify.annotations.NonNull;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public class SecurityContextCurrentUserProvider implements CurrentUserProvider {

    private final UUID fallbackUserId;
    private final boolean allowFallbackUser;

    public SecurityContextCurrentUserProvider(UUID fallbackUserId, boolean allowFallbackUser) {
        this.fallbackUserId = fallbackUserId;
        this.allowFallbackUser = allowFallbackUser;
    }

    @Override
    public @NonNull UUID getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null
                && authentication.isAuthenticated()
                && !(authentication instanceof AnonymousAuthenticationToken)) {
            Object principal = authentication.getPrincipal();
            if (principal instanceof AuthenticatedUser authenticatedUser) {
                return authenticatedUser.getUserId();
            }
        }

        if (allowFallbackUser) {
            return fallbackUserId;
        }

        throw new IllegalStateException("No authenticated user available in security context.");
    }
}
