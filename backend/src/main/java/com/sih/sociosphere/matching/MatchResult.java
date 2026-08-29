package com.sih.sociosphere.matching;

public record MatchResult(
        Long universityId,
        String universityName,
        Double score,
        String reasons
) {}