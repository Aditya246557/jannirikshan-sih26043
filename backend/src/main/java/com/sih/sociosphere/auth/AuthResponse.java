package com.sih.sociosphere.auth;

import com.sih.sociosphere.common.enums.UserRole;

public record AuthResponse(

        String token,

        Long userId,

        String name,

        String email,

        UserRole role
) {
}