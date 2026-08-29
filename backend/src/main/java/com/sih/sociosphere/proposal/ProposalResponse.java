package com.sih.sociosphere.proposal;

import com.sih.sociosphere.common.enums.ProposalStatus;
import java.time.LocalDateTime;

public record ProposalResponse(
        Long id,
        Long complaintId,
        String complaintTitle,
        Long universityId,
        String universityName,
        String title,
        String abstractText,
        String proposedSolution,
        Double estimatedBudget,
        Integer estimatedTimelineMonths,
        ProposalStatus status,
        LocalDateTime createdAt
) {}