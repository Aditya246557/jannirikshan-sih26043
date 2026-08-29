package com.sih.sociosphere.ai;

public record AiPrediction(
        String predictedCategory,
        String predictedPriority,
        Double confidence,
        String modelVersion
) {}