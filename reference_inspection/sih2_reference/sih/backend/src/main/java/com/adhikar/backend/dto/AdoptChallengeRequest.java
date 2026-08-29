package com.adhikar.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AdoptChallengeRequest(
        @NotBlank
        String challengeId,

        @NotBlank
        String universityName,

        @NotBlank
        String facultyMentor,

        @NotNull
        Integer studentTeamSize,

        @NotBlank
        String domainExpertise,

        String proposalSummary
) {
}
