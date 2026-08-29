package com.adhikar.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateMilestoneRequest(
        @NotBlank
        String status, // PROPOSAL_SUBMITTED, PROTOTYPE_IN_DEVELOPMENT, PILOT_READY, DEPLOYED

        String prototypeUrl
) {
}
