package com.jannirikshan.ai;

public record AiPrediction(
        String predictedCategory,
        String predictedPriority,
        Double confidence,
        String modelVersion
) {}