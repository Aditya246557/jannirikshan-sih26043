package com.adhikar.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record CommunityVoteRequest(
        @NotBlank
        String voteType, // "CONFIRM" or "REJECT"

        String note
) {
}
