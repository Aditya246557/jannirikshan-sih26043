package com.adhikar.backend.service;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;

import org.springframework.stereotype.Service;

import com.adhikar.backend.dto.ComplaintRequest;
import com.adhikar.backend.entity.CommunityValidation;
import com.adhikar.backend.entity.Complaint;
import com.adhikar.backend.entity.IssueCluster;
import com.adhikar.backend.repository.CommunityValidationRepository;
import com.adhikar.backend.repository.ComplaintRepository;
import com.adhikar.backend.repository.IssueClusterRepository;

@Service
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final ComplaintAIService complaintAIService;
    private final CommunityValidationRepository communityValidationRepository;
    private final IssueClusterRepository issueClusterRepository;

    public ComplaintService(
            ComplaintRepository complaintRepository,
            ComplaintAIService complaintAIService,
            CommunityValidationRepository communityValidationRepository,
            IssueClusterRepository issueClusterRepository
    ) {
        this.complaintRepository = complaintRepository;
        this.complaintAIService = complaintAIService;
        this.communityValidationRepository = communityValidationRepository;
        this.issueClusterRepository = issueClusterRepository;
    }


    // =====================================================
    // CREATE COMPLAINT
    // =====================================================

    public Complaint createComplaint(
            ComplaintRequest request,
            String citizenEmail
    ) {

        String combinedText =
                request.title() + " " +
                request.description();

        // AI category prediction
        String aiCategory =
                complaintAIService.predictCategory(
                        combinedText
                );

        // AI priority prediction
        String priority =
                complaintAIService.predictPriority(
                        combinedText
                );

        Complaint complaint = new Complaint(
                request.title(),
                request.description(),
                request.category(),
                request.location(),
                citizenEmail
        );

        complaint.setAiCategory(aiCategory);
        complaint.setPriority(priority);

        complaint.setLatitude(
                request.latitude()
        );

        complaint.setLongitude(
                request.longitude()
        );

        if (request.deviceInfo() != null && !request.deviceInfo().isBlank()) {
            complaint.setDeviceInfo(request.deviceInfo().trim());
        }

        if (request.capturedAt() != null && !request.capturedAt().isBlank()) {
            try {
                complaint.setCapturedAt(OffsetDateTime.parse(request.capturedAt()).toLocalDateTime());
            } catch (Exception ignored) {
                try {
                    complaint.setCapturedAt(LocalDateTime.parse(request.capturedAt()));
                } catch (Exception ignoredAgain) {
                    complaint.setCapturedAt(LocalDateTime.now());
                }
            }
        } else {
            complaint.setCapturedAt(LocalDateTime.now());
        }

        return complaintRepository.save(complaint);
    }


    // =====================================================
    // CITIZEN COMPLAINTS
    // =====================================================

    public List<Complaint> getMyComplaints(String citizenEmail) {
        return complaintRepository.findByCitizenEmail(citizenEmail);
    }


    // =====================================================
    // ADMIN - ALL COMPLAINTS
    // =====================================================

    public List<Complaint> getAllComplaints() {
        return complaintRepository.findAll();
    }


    // =====================================================
    // GET COMPLAINT BY ID
    // =====================================================

    public Complaint getComplaintById(Long id) {
        return complaintRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));
    }


    // =====================================================
    // START GOVERNMENT REVIEW
    // PENDING → UNDER_REVIEW
    // =====================================================

    public Complaint startReview(Long id, String remarks) {
        Complaint complaint = getComplaintById(id);

        if (complaint.getStatus() != Complaint.Status.PENDING) {
            throw new IllegalStateException("Only PENDING complaints can be reviewed.");
        }

        complaint.setStatus(Complaint.Status.UNDER_REVIEW);

        if (remarks != null && !remarks.isBlank()) {
            complaint.setAdminRemarks(remarks.trim());
        }

        return complaintRepository.save(complaint);
    }


    // =====================================================
    // VALIDATE COMPLAINT
    // PENDING / UNDER_REVIEW → VALIDATED
    // =====================================================

    public Complaint validateComplaint(Long id, String remarks) {
        Complaint complaint = getComplaintById(id);

        if (complaint.getStatus() != Complaint.Status.PENDING &&
            complaint.getStatus() != Complaint.Status.UNDER_REVIEW) {
            throw new IllegalStateException("Only PENDING or UNDER_REVIEW complaints can be validated.");
        }

        complaint.setStatus(Complaint.Status.VALIDATED);

        if (remarks != null && !remarks.isBlank()) {
            complaint.setAdminRemarks(remarks.trim());
        }

        // Ensure an IssueCluster exists so this validated complaint appears on the University & Industry portals
        ensureClusterForComplaint(complaint);

        return complaintRepository.save(complaint);
    }

    public void ensureClusterForComplaint(Complaint complaint) {
        if (complaint.getClusterId() != null && complaint.getChallengeId() != null) {
            return;
        }

        String challengeId = "SS-" + (1000 + complaint.getId());
        String category = complaint.getAiCategory() != null ? complaint.getAiCategory() :
                          (complaint.getCategory() != null ? complaint.getCategory() : "General");

        Optional<IssueCluster> existingCluster = issueClusterRepository.findByChallengeId(challengeId);
        IssueCluster cluster;
        if (existingCluster.isPresent()) {
            cluster = existingCluster.get();
        } else {
            cluster = new IssueCluster(
                    challengeId,
                    category,
                    "Cluster: " + (complaint.getTitle() != null ? complaint.getTitle() : "Civic Issue #" + complaint.getId()),
                    "Validated report near " + (complaint.getLocation() != null ? complaint.getLocation() : "Location"),
                    complaint.getLatitude() != null ? complaint.getLatitude() : 0.0,
                    complaint.getLongitude() != null ? complaint.getLongitude() : 0.0
            );
            cluster = issueClusterRepository.save(cluster);
        }

        complaint.setClusterId(cluster.getId());
        complaint.setChallengeId(cluster.getChallengeId());
    }


    // =====================================================
    // REJECT COMPLAINT
    // PENDING / UNDER_REVIEW → REJECTED
    // =====================================================

    public Complaint rejectComplaint(Long id, String reason, String remarks) {
        Complaint complaint = getComplaintById(id);

        if (complaint.getStatus() != Complaint.Status.PENDING &&
            complaint.getStatus() != Complaint.Status.UNDER_REVIEW) {
            throw new IllegalStateException("Only PENDING or UNDER_REVIEW complaints can be rejected.");
        }

        if (reason == null || reason.isBlank()) {
            throw new IllegalArgumentException("Rejection reason is required.");
        }

        complaint.setStatus(Complaint.Status.REJECTED);
        complaint.setRejectionReason(reason.trim());

        if (remarks != null && !remarks.isBlank()) {
            complaint.setAdminRemarks(remarks.trim());
        }

        return complaintRepository.save(complaint);
    }


    // =====================================================
    // SET PRIORITY
    // =====================================================

    public Complaint updatePriority(Long id, String priority) {
        Complaint complaint = getComplaintById(id);

        if (complaint.getStatus() == Complaint.Status.REJECTED ||
            complaint.getStatus() == Complaint.Status.RESOLVED) {
            throw new IllegalStateException("Priority cannot be changed for this complaint.");
        }

        if (priority == null || priority.isBlank()) {
            throw new IllegalArgumentException("Priority is required.");
        }

        String normalizedPriority = priority.trim().toUpperCase();
        Set<String> allowedPriorities = Set.of("LOW", "MEDIUM", "HIGH");

        if (!allowedPriorities.contains(normalizedPriority)) {
            throw new IllegalArgumentException("Priority must be LOW, MEDIUM or HIGH.");
        }

        complaint.setPriority(normalizedPriority);
        return complaintRepository.save(complaint);
    }

    public Complaint assignDepartment(
            Long id,
            String department
    ) {

        Complaint complaint =
                getComplaintById(id);

        if (complaint.getStatus() ==
                    Complaint.Status.REJECTED ||
                complaint.getStatus() ==
                    Complaint.Status.RESOLVED) {

            throw new IllegalStateException(
                    "Department cannot be assigned to this complaint."
            );
        }

        if (department == null ||
                department.isBlank()) {

            throw new IllegalArgumentException(
                    "Department is required."
            );
        }

        complaint.setAssignedDepartment(
                department.trim()
        );

        return complaintRepository.save(
                complaint
        );
    }


    // =====================================================
    // GENERIC STATUS UPDATE
    // Used for later workflow stages
    // =====================================================

    public Complaint updateStatus(
            Long id,
            Complaint.Status targetStatus
    ) {

        Complaint complaint =
                getComplaintById(id);

        Complaint.Status currentStatus =
                complaint.getStatus();

        boolean validTransition = false;

        if (currentStatus ==
                Complaint.Status.VALIDATED &&
                targetStatus ==
                Complaint.Status.IN_PROGRESS) {

            validTransition = true;
        }

        if (currentStatus ==
                Complaint.Status.IN_PROGRESS &&
                targetStatus ==
                Complaint.Status.RESOLVED) {

            validTransition = true;
        }

        if (!validTransition) {

            throw new IllegalStateException(
                    "Invalid status transition: " +
                    currentStatus +
                    " → " +
                    targetStatus
            );
        }

        complaint.setStatus(
                targetStatus
        );

        return complaintRepository.save(
                complaint
        );
    }


    // =====================================================
    // SAVE COMPLAINT WITH INTELLIGENCE PIPELINE
    // =====================================================

    public Complaint saveComplaint(Complaint complaint) {

        // 1. Calculate AI civic relevance, severity, priority, department recommendation
        evaluateComplaintIntelligence(complaint);

        // 2. Check duplicate & geospatial clustering
        checkDuplicatesAndCluster(complaint);

        return complaintRepository.save(complaint);
    }


    // =====================================================
    // SOCIO-SPHERE INTELLIGENCE ENGINE
    // =====================================================

    public void evaluateComplaintIntelligence(Complaint complaint) {

        String text = ((complaint.getTitle() != null ? complaint.getTitle() : "") + " " +
                       (complaint.getDescription() != null ? complaint.getDescription() : "")).toLowerCase();

        String category = complaint.getAiCategory() != null ? complaint.getAiCategory().toLowerCase() :
                          (complaint.getCategory() != null ? complaint.getCategory().toLowerCase() : "");

        // 1. Civic Relevance Score (0 - 100%)
        double relevance = 45.0;
        if (complaint.getAiConfidence() != null && complaint.getAiConfidence() > 0) {
            relevance = Math.min(100.0, Math.max(50.0, complaint.getAiConfidence() * 0.95 + 5.0));
        } else if (text.contains("pothole") || text.contains("garbage") || text.contains("tree") || text.contains("light")) {
            relevance = 75.0;
        }
        complaint.setCivicRelevanceScore(Math.round(relevance * 100.0) / 100.0);

        // Verification status
        if (relevance >= 50.0) {
            complaint.setVerificationStatus("VALID");
        } else {
            complaint.setVerificationStatus("REQUIRES_REVIEW");
        }

        // 2. Explainable Severity
        String severity = "MEDIUM";
        boolean hasUrgentKeywords = text.contains("urgent") || text.contains("emergency") ||
                                    text.contains("accident") || text.contains("danger") ||
                                    text.contains("blocked") || text.contains("life") || text.contains("fire");

        if (category.contains("fallen_tree")) {
            severity = hasUrgentKeywords ? "CRITICAL" : "HIGH";
        } else if (category.contains("broken_street_light")) {
            severity = hasUrgentKeywords ? "CRITICAL" : "HIGH";
        } else if (category.contains("pothole")) {
            severity = hasUrgentKeywords ? "HIGH" : "MEDIUM";
        } else if (category.contains("garbage")) {
            severity = hasUrgentKeywords ? "HIGH" : "LOW";
        } else {
            severity = hasUrgentKeywords ? "HIGH" : "MEDIUM";
        }
        complaint.setSeverity(severity);

        // 3. Calculated Priority
        String computedPriority = complaint.getPriority();
        if (computedPriority == null || computedPriority.isBlank() || computedPriority.equals("MEDIUM")) {
            if ("CRITICAL".equals(severity)) {
                computedPriority = "CRITICAL";
            } else if ("HIGH".equals(severity)) {
                computedPriority = Boolean.TRUE.equals(complaint.getIsDuplicate()) ? "CRITICAL" : "HIGH";
            } else if ("MEDIUM".equals(severity)) {
                computedPriority = "MEDIUM";
            } else {
                computedPriority = "LOW";
            }
        }
        complaint.setPriority(computedPriority);

        // 4. Department Recommendation
        if (complaint.getAssignedDepartment() == null || complaint.getAssignedDepartment().isBlank()) {
            String dept = getRecommendedDepartment(category);
            complaint.setAssignedDepartment(dept);
        }

        // 5. Initial Trust Score
        if (complaint.getTrustScore() == null || complaint.getTrustScore() == 0.0) {
            complaint.setTrustScore(complaint.getCivicRelevanceScore());
        }
    }


    // =====================================================
    // DEPARTMENT ROUTING MAPPING
    // =====================================================

    public String getRecommendedDepartment(String category) {
        if (category == null) return "Municipal Administration";

        String cat = category.toLowerCase();
        if (cat.contains("pothole") || cat.contains("road")) {
            return "Roads & Engineering Dept";
        } else if (cat.contains("garbage") || cat.contains("waste") || cat.contains("sanitation")) {
            return "Sanitation & Solid Waste Management";
        } else if (cat.contains("broken_street_light") || cat.contains("light") || cat.contains("electric")) {
            return "Electrical & Public Lighting Division";
        } else if (cat.contains("fallen_tree") || cat.contains("tree") || cat.contains("park")) {
            return "Parks & Emergency Response Team";
        }
        return "Municipal Administration";
    }


    // =====================================================
    // GEOSPATIAL DUPLICATE DETECTION & CLUSTERING
    // =====================================================

    public void checkDuplicatesAndCluster(Complaint complaint) {

        if (complaint.getLatitude() == null || complaint.getLongitude() == null) {
            return;
        }

        List<Complaint> allComplaints = complaintRepository.findAll();

        for (Complaint other : allComplaints) {
            if (other.getId() != null && other.getId().equals(complaint.getId())) {
                continue;
            }

            if (other.getLatitude() == null || other.getLongitude() == null) {
                continue;
            }

            double distMeters = calculateHaversineDistance(
                    complaint.getLatitude(), complaint.getLongitude(),
                    other.getLatitude(), other.getLongitude()
            );

            // 300 meters threshold for duplicate/cluster match
            if (distMeters <= 300.0) {
                String cat1 = complaint.getAiCategory() != null ? complaint.getAiCategory() : complaint.getCategory();
                String cat2 = other.getAiCategory() != null ? other.getAiCategory() : other.getCategory();

                if (cat1 != null && cat2 != null && cat1.equalsIgnoreCase(cat2)) {
                    complaint.setIsDuplicate(true);
                    other.setIsDuplicate(true);

                    // Check existing cluster or create new IssueCluster
                    if (other.getClusterId() != null) {
                        complaint.setClusterId(other.getClusterId());
                        complaint.setChallengeId(other.getChallengeId());

                        Optional<IssueCluster> existingCluster = issueClusterRepository.findById(other.getClusterId());
                        if (existingCluster.isPresent()) {
                            IssueCluster cluster = existingCluster.get();
                            cluster.setReportCount(cluster.getReportCount() + 1);
                            issueClusterRepository.save(cluster);
                        }
                    } else {
                        // Create new cluster
                        String challengeId = "SS-" + (1000 + (long)(Math.random() * 8999));
                        IssueCluster newCluster = new IssueCluster(
                                challengeId,
                                cat1,
                                "Cluster: " + complaint.getTitle(),
                                "Multiple reports near " + complaint.getLocation(),
                                complaint.getLatitude(),
                                complaint.getLongitude()
                        );
                        newCluster = issueClusterRepository.save(newCluster);

                        complaint.setClusterId(newCluster.getId());
                        complaint.setChallengeId(newCluster.getChallengeId());

                        other.setClusterId(newCluster.getId());
                        other.setChallengeId(newCluster.getChallengeId());
                        complaintRepository.save(other);
                    }

                    break;
                }
            }
        }
    }

    public double calculateHaversineDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371000; // Earth radius in meters
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                 + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                 * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }


    // =====================================================
    // COMMUNITY VALIDATION & TRUST SCORE
    // =====================================================

    public Complaint addCommunityVote(Long complaintId, String userEmail, String voteType, String note) {

        Complaint complaint = getComplaintById(complaintId);

        Optional<CommunityValidation> existing =
                communityValidationRepository.findByComplaintIdAndUserEmail(complaintId, userEmail);

        if (existing.isPresent()) {
            throw new IllegalStateException("You have already voted on this complaint.");
        }

        CommunityValidation validation = new CommunityValidation(complaintId, userEmail, voteType, note);
        communityValidationRepository.save(validation);

        // Recalculate trust score
        long confirmVotes = communityValidationRepository.countByComplaintIdAndVoteType(complaintId, "CONFIRM");
        long totalVotes = communityValidationRepository.countByComplaintId(complaintId);

        if (totalVotes > 0) {
            double confirmPercent = ((double) confirmVotes / totalVotes) * 100.0;
            double relevance = complaint.getCivicRelevanceScore() != null ? complaint.getCivicRelevanceScore() : 75.0;

            double updatedTrustScore = (relevance * 0.5) + (confirmPercent * 0.5);
            complaint.setTrustScore(Math.round(updatedTrustScore * 100.0) / 100.0);
        }

        return complaintRepository.save(complaint);
    }

    public double getCommunityConfirmationPercentage(Long complaintId) {
        long totalVotes = communityValidationRepository.countByComplaintId(complaintId);
        if (totalVotes == 0) return 100.0; // Default 100% when submitted
        long confirmVotes = communityValidationRepository.countByComplaintIdAndVoteType(complaintId, "CONFIRM");
        return Math.round(((double) confirmVotes / totalVotes) * 10000.0) / 100.0;
    }
}
