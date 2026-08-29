package com.sih.sociosphere.user;

import com.sih.sociosphere.common.enums.UserRole;
import java.time.LocalDateTime;

public record UserResponse(
        Long id,
        String name,
        String email,
        UserRole role,
        boolean enabled,
        LocalDateTime createdAt
) {}