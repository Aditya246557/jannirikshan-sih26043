package com.jannirikshan.proposal;

public record ProposalRequest(
        Long complaintId,
        Long universityId,
        Long facultyMentorId,
        Long studentLeadId,
        String title,
        String abstractText,
        String proposedSolution,
        String methodology,
        Double estimatedBudget,
        Integer estimatedTimelineMonths
) {}