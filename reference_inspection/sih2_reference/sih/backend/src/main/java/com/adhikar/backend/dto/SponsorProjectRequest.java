package com.adhikar.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record SponsorProjectRequest(
        @NotNull
        Long projectId,

        @NotBlank
        String challengeId,

        @NotBlank
        String companyName,

        @NotBlank
        String supportType, // CSR_GRANT, MENTORSHIP, PILOT_PARTNER

        Double grantAmount,

        String notes
) {
}
