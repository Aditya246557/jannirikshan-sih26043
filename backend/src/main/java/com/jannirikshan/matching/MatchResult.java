package com.jannirikshan.matching;

public record MatchResult(
        Long universityId,
        String universityName,
        Double score,
        String reasons
) {}