package com.jannirikshan.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.jannirikshan.complaint.ChallengeDuplicateRelation;
import com.jannirikshan.complaint.ChallengeDuplicateRelationRepository;
import com.jannirikshan.complaint.Complaint;
import com.jannirikshan.complaint.ComplaintRepository;
import com.jannirikshan.evidence.Evidence;
import com.jannirikshan.evidence.EvidenceRepository;
import com.jannirikshan.user.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class DuplicateDetectionService {

    private final ComplaintRepository complaintRepository;
    private final EvidenceRepository evidenceRepository;
    private final ChallengeDuplicateRelationRepository relationRepository;
    private final AiClient aiClient;

    public DuplicateDetectionService(
            ComplaintRepository complaintRepository,
            EvidenceRepository evidenceRepository,
            ChallengeDuplicateRelationRepository relationRepository,
            AiClient aiClient
    ) {
        this.complaintRepository = complaintRepository;
        this.evidenceRepository = evidenceRepository;
        this.relationRepository = relationRepository;
        this.aiClient = aiClient;
    }

    public List<Map<String, Object>> findPossibleDuplicates(Complaint target) {
        List<Complaint> allComplaints = complaintRepository.findAll();
        List<Map<String, Object>> matches = new ArrayList<>();

        String targetText = (target.getTitle() != null ? target.getTitle() : "") + " - " + (target.getDescription() != null ? target.getDescription() : "");
        String targetIssue = target.getAiCivicIssue() != null ? target.getAiCivicIssue() : (target.getCategory() != null ? target.getCategory() : "");
        String targetLoc = target.getAddress() != null ? target.getAddress() : (target.getDistrict() != null ? target.getDistrict() : "");

        for (Complaint other : allComplaints) {
            if (other.getId().equals(target.getId())) continue;

            double score = 0.0;
            List<String> reasons = new ArrayList<>();
            boolean isAiDuplicate = false;

            String otherText = (other.getTitle() != null ? other.getTitle() : "") + " - " + (other.getDescription() != null ? other.getDescription() : "");
            String otherIssue = other.getAiCivicIssue() != null ? other.getAiCivicIssue() : (other.getCategory() != null ? other.getCategory() : "");
            String otherLoc = other.getAddress() != null ? other.getAddress() : (other.getDistrict() != null ? other.getDistrict() : "");

            // 1. Try real Hybrid AI Duplicate Check
            try {
                JsonNode aiRes = aiClient.checkDuplicate(
                        targetText, otherText,
                        targetIssue, otherIssue,
                        targetLoc, otherLoc,
                        target.getLatitude(), target.getLongitude(),
                        other.getLatitude(), other.getLongitude()
                );

                if (aiRes != null && aiRes.has("duplicate_score_percent")) {
                    score = aiRes.path("duplicate_score_percent").asDouble();
                    isAiDuplicate = aiRes.path("is_duplicate").asBoolean(false);
                    if (aiRes.has("decision_reason")) {
                        reasons.add("AI: " + aiRes.path("decision_reason").asText());
                    }
                    if (aiRes.has("location_status")) {
                        reasons.add("Location Match: " + aiRes.path("location_status").asText());
                    }
                }
            } catch (Exception ignored) {}

            // 2. Safe Heuristic Fallback if AI score is 0
            if (score <= 0.0) {
                if (target.getDistrict() != null && other.getDistrict() != null &&
                        target.getDistrict().equalsIgnoreCase(other.getDistrict())) {
                    score += 25.0;
                    reasons.add("Same District: " + target.getDistrict());
                }

                if (target.getCategory() != null && other.getCategory() != null &&
                        target.getCategory().equalsIgnoreCase(other.getCategory())) {
                    score += 25.0;
                    reasons.add("Same Category: " + target.getCategory());
                }

                if (target.getLatitude() != null && target.getLongitude() != null &&
                        other.getLatitude() != null && other.getLongitude() != null) {
                    double distKm = haversineDistance(
                            target.getLatitude(), target.getLongitude(),
                            other.getLatitude(), other.getLongitude()
                    );
                    if (distKm <= 0.1) {
                        score += 40.0;
                        reasons.add(String.format("Exact GPS Cluster (%.0fm)", distKm * 1000));
                    } else if (distKm <= 1.0) {
                        score += 30.0;
                        reasons.add(String.format("Very Close GPS (%.2f km)", distKm));
                    } else if (distKm <= 5.0) {
                        score += 15.0;
                        reasons.add(String.format("Nearby Location (%.2f km)", distKm));
                    }
                }

                double tokenSim = calculateTokenSimilarity(targetText, otherText);
                if (tokenSim > 0.3) {
                    score += tokenSim * 20.0;
                    reasons.add(String.format("Text similarity (%.0f%%)", tokenSim * 100));
                }

                score = Math.min(100.0, Math.round(score * 10.0) / 10.0);
            }

            if (score >= 40.0 || isAiDuplicate) {
                Map<String, Object> match = new LinkedHashMap<>();
                match.put("challengeId", other.getId());
                match.put("title", other.getTitle());
                match.put("category", other.getCategory());
                match.put("district", other.getDistrict());
                match.put("status", other.getStatus().name());
                match.put("priority", other.getPriority().name());
                match.put("similarityScore", score);
                match.put("isDuplicate", isAiDuplicate || score >= 70.0);
                match.put("matchReasons", reasons);
                match.put("createdAt", other.getCreatedAt());
                matches.add(match);
            }
        }

        matches.sort((a, b) -> Double.compare((Double) b.get("similarityScore"), (Double) a.get("similarityScore")));
        return matches;
    }

    @Transactional
    public Map<String, Object> mergeDuplicates(Long masterId, Long duplicateId, User adminUser) {
        Complaint master = complaintRepository.findById(masterId)
                .orElseThrow(() -> new IllegalArgumentException("Master challenge not found"));
        Complaint duplicate = complaintRepository.findById(duplicateId)
                .orElseThrow(() -> new IllegalArgumentException("Duplicate challenge not found"));

        duplicate.setDuplicate(true);
        duplicate.setMasterChallengeId(master.getId());
        duplicate.setStatus(com.jannirikshan.common.enums.ComplaintStatus.DUPLICATE);
        duplicate.setResolutionRemarks("Merged into Master Challenge #" + master.getId() + " by Admin " + (adminUser != null ? adminUser.getName() : ""));
        complaintRepository.save(duplicate);

        // Reassign duplicate's evidence to master while preserving history
        List<Evidence> duplicateEvidence = evidenceRepository.findByComplaintId(duplicateId);
        for (Evidence ev : duplicateEvidence) {
            Evidence cloned = new Evidence();
            cloned.setComplaint(master);
            cloned.setOriginalFileName("[Merged from #" + duplicateId + "] " + ev.getOriginalFileName());
            cloned.setContentType(ev.getContentType());
            cloned.setFileSize(ev.getFileSize());
            cloned.setStorageFileName(ev.getStorageFileName());
            cloned.setFileUrl(ev.getFileUrl());
            cloned.setEvidenceType(ev.getEvidenceType());
            cloned.setDescription("Evidence transferred from duplicate report #" + duplicateId + ": " + (ev.getDescription() != null ? ev.getDescription() : ""));
            cloned.setVerificationStatus(ev.getVerificationStatus());
            cloned.setVerificationNote(ev.getVerificationNote());
            evidenceRepository.save(cloned);
        }

        // Record duplicate relation
        ChallengeDuplicateRelation relation = new ChallengeDuplicateRelation();
        relation.setMasterChallenge(master);
        relation.setDuplicateChallenge(duplicate);
        relation.setStatus("MERGED");
        relation.setSimilarityScore(85.0);
        relation.setMatchFactors("Merged by Admin moderation");
        relation.setLinkedBy(adminUser);
        relationRepository.save(relation);

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("success", true);
        resp.put("message", "Challenge #" + duplicateId + " successfully merged into Master #" + masterId);
        resp.put("masterId", masterId);
        resp.put("duplicateId", duplicateId);
        resp.put("evidenceTransferred", duplicateEvidence.size());
        return resp;
    }

    private double haversineDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Earth radius in KM
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    private double calculateTokenSimilarity(String s1, String s2) {
        Set<String> set1 = new HashSet<>(Arrays.asList(s1.toLowerCase().split("\\W+")));
        Set<String> set2 = new HashSet<>(Arrays.asList(s2.toLowerCase().split("\\W+")));
        set1.remove("");
        set2.remove("");
        if (set1.isEmpty() || set2.isEmpty()) return 0.0;
        Set<String> intersection = new HashSet<>(set1);
        intersection.retainAll(set2);
        Set<String> union = new HashSet<>(set1);
        union.addAll(set2);
        return (double) intersection.size() / union.size();
    }
}
