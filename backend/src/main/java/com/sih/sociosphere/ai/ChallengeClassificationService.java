package com.sih.sociosphere.ai;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class ChallengeClassificationService {

    private final AiClient aiClient;

    private static final Map<String, List<String>> KEYWORD_MAP = new LinkedHashMap<>();

    static {
        KEYWORD_MAP.put("Water Management", List.of("water", "leak", "pipeline", "contamination", "salinity", "filter", "drinking", "drain", "sewage", "borewell"));
        KEYWORD_MAP.put("Roads & Transport", List.of("road", "pothole", "traffic", "signal", "bridge", "asphalt", "bus", "pedestrian", "highway", "crossing"));
        KEYWORD_MAP.put("Sanitation & Waste", List.of("garbage", "waste", "dump", "trash", "sanitation", "toilet", "plastic", "cleanliness", "dustbin", "landfill"));
        KEYWORD_MAP.put("Smart Agriculture", List.of("crop", "stubble", "pest", "irrigation", "soil", "farmer", "fertilizer", "storage", "harvest", "grain"));
        KEYWORD_MAP.put("Clean Energy", List.of("solar", "electricity", "power", "grid", "transformer", "blackout", "voltage", "streetlight", "renewable", "generator"));
        KEYWORD_MAP.put("Public Health", List.of("hospital", "clinic", "medicine", "dengue", "malaria", "ambulance", "doctor", "epidemic", "health", "vaccine"));
        KEYWORD_MAP.put("Disaster & Flood", List.of("flood", "erosion", "landslide", "cyclone", "drainage", "waterlogging", "embankment", "silt", "warning"));
        KEYWORD_MAP.put("Education & Skill", List.of("school", "college", "classroom", "laboratory", "literacy", "computer", "teacher", "library"));
    }

    public ChallengeClassificationService(AiClient aiClient) {
        this.aiClient = aiClient;
    }

    public Map<String, Object> predictCategory(String title, String description) {
        // 1. Try real NLP Domain Classifier
        try {
            JsonNode aiData = aiClient.classifyDomain(null, title, description);
            if (aiData != null && aiData.has("domain")) {
                String domain = aiData.path("domain").asText();
                double conf = aiData.path("domain_confidence").asDouble(0.85);
                String civicIssue = aiData.has("civic_issue") && !aiData.path("civic_issue").isNull() ? aiData.path("civic_issue").asText() : null;

                Map<String, Object> result = new LinkedHashMap<>();
                result.put("predictedCategory", mapDomainToCategory(domain, civicIssue));
                result.put("domain", domain);
                result.put("domainConfidence", conf);
                result.put("domainConfidencePercent", Math.round(conf * 10000.0) / 100.0);
                result.put("civicIssue", civicIssue);
                result.put("confidence", Math.round(conf * 100.0) / 100.0);
                result.put("method", "Trained NLP Domain Classifier (all-MiniLM-L6-v2 + LogisticRegression)");
                return result;
            }
        } catch (Exception ignored) {}

        // 2. Safe Heuristic Fallback
        String combined = (title + " " + description).toLowerCase();
        String bestCategory = "Other";
        int maxHits = 0;
        Map<String, Integer> scoreMap = new HashMap<>();

        for (Map.Entry<String, List<String>> entry : KEYWORD_MAP.entrySet()) {
            int hits = 0;
            for (String kw : entry.getValue()) {
                if (combined.contains(kw)) {
                    hits++;
                }
            }
            if (hits > 0) {
                scoreMap.put(entry.getKey(), hits);
                if (hits > maxHits) {
                    maxHits = hits;
                    bestCategory = entry.getKey();
                }
            }
        }

        double confidence = maxHits == 0 ? 0.35 : Math.min(0.95, 0.40 + (maxHits * 0.15));

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("predictedCategory", bestCategory);
        result.put("domain", bestCategory);
        result.put("domainConfidence", confidence);
        result.put("domainConfidencePercent", Math.round(confidence * 100.0));
        result.put("civicIssue", null);
        result.put("confidence", Math.round(confidence * 100.0) / 100.0);
        result.put("keywordHits", scoreMap);
        result.put("method", "Rule-Based Keyword Matching (Fallback)");
        return result;
    }

    private String mapDomainToCategory(String domain, String civicIssue) {
        if ("Civic Complaints".equalsIgnoreCase(domain)) {
            if (civicIssue != null) {
                return switch (civicIssue.toLowerCase()) {
                    case "pothole" -> "Roads & Infrastructure";
                    case "garbage" -> "Sanitation & Waste";
                    case "broken street light", "broken_street_light" -> "Electrical & Public Lighting";
                    case "fallen tree", "fallen_tree" -> "Environment & Emergency Clearance";
                    default -> "Civic Infrastructure";
                };
            }
            return "Civic Infrastructure";
        }
        return switch (domain) {
            case "Infrastructure" -> "Roads & Infrastructure";
            case "Sanitation" -> "Sanitation & Waste";
            case "Water" -> "Water Management";
            case "Agriculture" -> "Smart Agriculture";
            case "Healthcare" -> "Public Health";
            case "Education" -> "Education & Skill";
            case "Environment" -> "Environment & Climate";
            case "Accessibility" -> "Universal Accessibility";
            default -> domain;
        };
    }
}
