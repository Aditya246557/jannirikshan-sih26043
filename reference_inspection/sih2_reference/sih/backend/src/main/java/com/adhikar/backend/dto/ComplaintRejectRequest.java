package com.adhikar.backend.dto;

public record ComplaintRejectRequest(
        String reason,
        String remarks
) {
}