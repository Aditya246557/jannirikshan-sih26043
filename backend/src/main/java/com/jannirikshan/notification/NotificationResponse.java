package com.jannirikshan.notification;

import java.time.LocalDateTime;

public record NotificationResponse(
        Long id,
        String title,
        String message,
        boolean read,
        LocalDateTime createdAt
) {
}