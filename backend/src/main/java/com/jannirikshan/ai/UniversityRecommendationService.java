package com.jannirikshan.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jannirikshan.complaint.Complaint;
import com.jannirikshan.university.University;
import com.jannirikshan.university.UniversityRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class UniversityRecommendationService {

    private static final Logger log = LoggerFactory.getLogger(UniversityRecommendationService.class);

    private final UniversityRepository universityRepository;
    private final AiClient aiClient;
    private final ObjectMapper objectMapper;

    public UniversityRecommendationService(
            UniversityRepository universityRepository,
            AiClient aiClient
    ) {
        this.universityRepository = universityRepository;
        this.aiClient = aiClient;
        this.objectMapper = new ObjectMapper();
    }

    public Map<String, Object> getUniversityMatchDetails(Complaint challenge) {
        String title = challenge.getTitle() != null ? challenge.getTitle() : "";
        String desc = challenge.getDescription() != null ? challenge.getDescription() : "";
        String cat = challenge.getCategory() != null ? challenge.getCategory() : "";
        String civicIssue = challenge.getAiCivicIssue() != null ? challenge.getAiCivicIssue() : "";
        String prio = challenge.getPriority() != null ? challenge.getPriority().name() : "MEDIUM";
        String state = challenge.getState() != null ? challenge.getState() : "";
        String district = challenge.getDistrict() != null ? challenge.getDistrict() : "";

        // 1. Try real AI semantic matching endpoint on port 8000
        try {
            JsonNode aiNode = aiClient.matchUniversity(title, desc, cat, civicIssue, prio, state, district);
            if (aiNode != null && aiNode.has("bestUniversityId")) {
                Map<String, Object> result = new LinkedHashMap<>();
                long bestId = aiNode.path("bestUniversityId").asLong();
                String bestName = aiNode.path("bestUniversityName").asText();
                double matchScore = aiNode.path("matchScore").asDouble();
                double confidence = aiNode.path("confidence").asDouble();
                String reason = aiNode.path("reason").asText();

                List<Map<String, Object>> rankedList = new ArrayList<>();
                if (aiNode.has("rankedCandidates") && aiNode.path("rankedCandidates").isArray()) {
                    for (JsonNode cand : aiNode.path("rankedCandidates")) {
                        Map<String, Object> cMap = new LinkedHashMap<>();
                        cMap.put("universityId", cand.path("universityId").asLong());
                        cMap.put("name", cand.path("name").asText());
                        cMap.put("universityName", cand.path("name").asText());
                        cMap.put("code", cand.path("code").asText());
                        cMap.put("state", cand.path("state").asText());
                        cMap.put("matchScore", cand.path("matchScore").asInt());
                        cMap.put("matchScorePercent", cand.path("matchScorePercent").asDouble());
                        cMap.put("confidence", cand.path("confidence").asDouble());
                        cMap.put("confidencePercent", cand.path("confidencePercent").asDouble());

                        List<String> reasons = new ArrayList<>();
                        if (cand.has("matchReasons") && cand.path("matchReasons").isArray()) {
                            for (JsonNode rNode : cand.path("matchReasons")) {
                                reasons.add(rNode.asText());
                            }
                        }
                        cMap.put("matchReasons", reasons);
                        rankedList.add(cMap);
                    }
                }

                result.put("bestUniversityId", bestId);
                result.put("bestUniversityName", bestName);
                result.put("matchScore", matchScore);
                result.put("confidence", confidence);
                result.put("confidencePercent", Math.round(confidence * 100.0));
                result.put("reason", reason);
                result.put("rankedCandidates", rankedList);
                result.put("method", "Trained SentenceTransformer Semantic Matching + Domain Affinity");
                return result;
            }
        } catch (Exception e) {
            log.warn("AI university matching call failed, using fallback: {}", e.getMessage());
        }

        // 2. Safe Institutional Fallback
        List<Map<String, Object>> fallbackRanking = recommendUniversities(challenge);
        Map<String, Object> top1 = fallbackRanking.isEmpty() ? Collections.emptyMap() : fallbackRanking.get(0);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("bestUniversityId", top1.getOrDefault("universityId", 1L));
        result.put("bestUniversityName", top1.getOrDefault("name", "IIT Bombay"));
        result.put("matchScore", top1.getOrDefault("matchScore", 75));
        result.put("confidence", 0.75);
        result.put("confidencePercent", 75.0);
        result.put("reason", "Institutional expertise taxonomy & capacity match for " + cat);
        result.put("rankedCandidates", fallbackRanking);
        result.put("method", "Rule-based Expertise Taxonomy Fallback");
        return result;
    }

    public List<Map<String, Object>> recommendUniversities(Complaint challenge) {
        List<University> allUniversities = universityRepository.findAll();
        List<Map<String, Object>> recommendations = new ArrayList<>();

        String category = challenge.getCategory() != null ? challenge.getCategory().toLowerCase() : "";
        String state = challenge.getState() != null ? challenge.getState().toLowerCase() : "";

        for (University u : allUniversities) {
            double score = 45.0;
            List<String> matchReasons = new ArrayList<>();

            String expertise = ((u.getExpertiseAreas() != null ? u.getExpertiseAreas() : "") + " " + (u.getDepartmentsList() != null ? u.getDepartmentsList() : "")).toLowerCase();
            if (expertise.contains(category)
                    || (category.contains("road") && (expertise.contains("pavement") || expertise.contains("transportation") || expertise.contains("civil")))
                    || (category.contains("water") && (expertise.contains("water") || expertise.contains("desalination")))
                    || (category.contains("light") && (expertise.contains("light") || expertise.contains("electrical")))
                    || (category.contains("garbage") && (expertise.contains("waste") || expertise.contains("biotech")))
                    || (category.contains("tree") && (expertise.contains("robotics") || expertise.contains("drainage")))) {
                score += 35.0;
                matchReasons.add("Strong research alignment in " + challenge.getCategory());
            }

            if (u.getState() != null && u.getState().toLowerCase().equals(state)) {
                score += 15.0;
                matchReasons.add("Regional State Proximity (" + u.getState() + ")");
            }

            if (u.getCapacity() != null && u.getCapacity() > (u.getActiveProjectsCount() != null ? u.getActiveProjectsCount() : 0)) {
                score += 8.0;
                matchReasons.add("Available Research Capacity (" + (u.getCapacity() - (u.getActiveProjectsCount() != null ? u.getActiveProjectsCount() : 0)) + " slots open)");
            }

            score = Math.min(96.0, Math.max(52.0, score));

            Map<String, Object> rec = new LinkedHashMap<>();
            rec.put("universityId", u.getId());
            rec.put("name", u.getName());
            rec.put("universityName", u.getName());
            rec.put("code", u.getCode());
            rec.put("state", u.getState());
            rec.put("district", u.getDistrict());
            rec.put("matchScore", (int) Math.round(score));
            rec.put("matchScorePercent", score);
            rec.put("confidence", score / 100.0);
            rec.put("confidencePercent", score);
            rec.put("matchReasons", matchReasons);
            recommendations.add(rec);
        }

        recommendations.sort((a, b) -> Integer.compare((Integer) b.get("matchScore"), (Integer) a.get("matchScore")));
        return recommendations;
    }
}
