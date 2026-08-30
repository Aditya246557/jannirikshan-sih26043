package com.jannirikshan.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.jannirikshan.common.enums.Priority;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class PriorityPredictionService {

    private final AiClient aiClient;

    public PriorityPredictionService(AiClient aiClient) {
        this.aiClient = aiClient;
    }

    /**
     * AI-Powered Multi-Factor Priority Prediction (Module 4) with deterministic fallback.
     */
    public Map<String, Object> calculatePriority(
            Priority userSeverity,
            Integer affectedPeople,
            String category,
            String description
    ) {
        int severityScore = switch (userSeverity != null ? userSeverity : Priority.MEDIUM) {
            case CRITICAL -> 100;
            case HIGH -> 80;
            case MEDIUM -> 50;
            case LOW -> 25;
        };

        int population = (affectedPeople != null && affectedPeople > 0) ? affectedPeople : 50;
        int populationScore;
        if (population >= 10000) populationScore = 100;
        else if (population >= 2500) populationScore = 85;
        else if (population >= 500) populationScore = 70;
        else if (population >= 100) populationScore = 50;
        else if (population >= 20) populationScore = 35;
        else populationScore = 20;

        String text = (description != null ? description : "").toLowerCase();
        int urgencyScore = (text.contains("emergency") || text.contains("danger") || text.contains("immediate") || text.contains("blocked") || text.contains("collapse")) ? 90 : 50;
        int safetyRiskScore = (text.contains("hazard") || text.contains("child") || text.contains("electric") || text.contains("toxic") || text.contains("infection")) ? 95 : 45;
        int envScore = (text.contains("water") || text.contains("soil") || text.contains("pollution") || text.contains("waste") || text.contains("smoke")) ? 85 : 40;

        double finalScore = (severityScore * 0.30)
                + (populationScore * 0.25)
                + (urgencyScore * 0.20)
                + (safetyRiskScore * 0.15)
                + (envScore * 0.10);

        finalScore = Math.min(100.0, Math.max(0.0, Math.round(finalScore * 10.0) / 10.0));

        Priority priorityLevel;
        if (finalScore >= 80.0) {
            priorityLevel = Priority.CRITICAL;
        } else if (finalScore >= 60.0) {
            priorityLevel = Priority.HIGH;
        } else if (finalScore >= 35.0) {
            priorityLevel = Priority.MEDIUM;
        } else {
            priorityLevel = Priority.LOW;
        }

        // Try real AI Module 4 Priority Predictor
        String issueType = extractIssueType(category, description);
        int sev1to5 = userSeverity == Priority.CRITICAL ? 5 : (userSeverity == Priority.HIGH ? 4 : (userSeverity == Priority.LOW ? 1 : 3));
        int risk1to5 = safetyRiskScore >= 80 ? 5 : (safetyRiskScore >= 60 ? 4 : 2);

        try {
            JsonNode aiPrio = aiClient.predictPriority(issueType, 1, sev1to5, risk1to5, 24.0);
            if (aiPrio != null && aiPrio.has("priority")) {
                String aiPrioStr = aiPrio.path("priority").asText();
                double aiConf = aiPrio.path("confidence").asDouble(0.75);

                Map<String, Object> result = new LinkedHashMap<>();
                result.put("priorityScore", finalScore);
                result.put("priorityLevel", aiPrioStr);
                result.put("aiPriority", aiPrioStr);
                result.put("aiConfidence", aiConf);
                result.put("aiConfidencePercent", Math.round(aiConf * 100.0));

                Map<String, Object> breakdown = new LinkedHashMap<>();
                breakdown.put("severityFactor", Map.of("score", severityScore, "weight", "30%", "contribution", Math.round(severityScore * 0.30 * 10.0) / 10.0));
                breakdown.put("affectedPopulationFactor", Map.of("score", populationScore, "weight", "25%", "population", population, "contribution", Math.round(populationScore * 0.25 * 10.0) / 10.0));
                breakdown.put("urgencyFactor", Map.of("score", urgencyScore, "weight", "20%", "contribution", Math.round(urgencyScore * 0.20 * 10.0) / 10.0));
                breakdown.put("safetyRiskFactor", Map.of("score", safetyRiskScore, "weight", "15%", "contribution", Math.round(safetyRiskScore * 0.15 * 10.0) / 10.0));
                breakdown.put("environmentalFactor", Map.of("score", envScore, "weight", "10%", "contribution", Math.round(envScore * 0.10 * 10.0) / 10.0));

                result.put("breakdown", breakdown);
                result.put("algorithm", "Trained Tabular Multi-Factor Priority Classifier (RandomForest Pipeline)");
                return result;
            }
        } catch (Exception ignored) {}

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("priorityScore", finalScore);
        result.put("priorityLevel", priorityLevel.name());
        result.put("aiPriority", priorityLevel.name());
        result.put("aiConfidence", 0.75);
        result.put("aiConfidencePercent", 75.0);

        Map<String, Object> breakdown = new LinkedHashMap<>();
        breakdown.put("severityFactor", Map.of("score", severityScore, "weight", "30%", "contribution", Math.round(severityScore * 0.30 * 10.0) / 10.0));
        breakdown.put("affectedPopulationFactor", Map.of("score", populationScore, "weight", "25%", "population", population, "contribution", Math.round(populationScore * 0.25 * 10.0) / 10.0));
        breakdown.put("urgencyFactor", Map.of("score", urgencyScore, "weight", "20%", "contribution", Math.round(urgencyScore * 0.20 * 10.0) / 10.0));
        breakdown.put("safetyRiskFactor", Map.of("score", safetyRiskScore, "weight", "15%", "contribution", Math.round(safetyRiskScore * 0.15 * 10.0) / 10.0));
        breakdown.put("environmentalFactor", Map.of("score", envScore, "weight", "10%", "contribution", Math.round(envScore * 0.10 * 10.0) / 10.0));

        result.put("breakdown", breakdown);
        result.put("algorithm", "Rule-Based Deterministic Multi-Factor Evaluator (Fallback)");
        return result;
    }

    private String extractIssueType(String category, String description) {
        String combined = ((category != null ? category : "") + " " + (description != null ? description : "")).toLowerCase();
        if (combined.contains("tree") || combined.contains("branch")) return "Fallen Tree";
        if (combined.contains("light") || combined.contains("lamp") || combined.contains("electric")) return "Broken Street Light";
        if (combined.contains("garbage") || combined.contains("waste") || combined.contains("trash")) return "Garbage";
        return "Pothole";
    }
}
