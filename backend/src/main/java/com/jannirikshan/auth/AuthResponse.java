package com.jannirikshan.auth;

import com.jannirikshan.common.enums.UserRole;

public record AuthResponse(

        String token,

        Long userId,

        String name,

        String email,

        UserRole role
) {
}