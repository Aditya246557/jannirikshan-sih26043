package com.adhikar.backend.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.adhikar.backend.dto.AdoptChallengeRequest;
import com.adhikar.backend.entity.Complaint;
import com.adhikar.backend.entity.IssueCluster;
import com.adhikar.backend.entity.UniversityProject;
import com.adhikar.backend.repository.ComplaintRepository;
import com.adhikar.backend.repository.IssueClusterRepository;
import com.adhikar.backend.repository.UniversityProjectRepository;

@Service
public class UniversityService {

    private final IssueClusterRepository issueClusterRepository;
    private final ComplaintRepository complaintRepository;
    private final UniversityProjectRepository universityProjectRepository;

    public UniversityService(
            IssueClusterRepository issueClusterRepository,
            ComplaintRepository complaintRepository,
            UniversityProjectRepository universityProjectRepository
    ) {
        this.issueClusterRepository = issueClusterRepository;
        this.complaintRepository = complaintRepository;
        this.universityProjectRepository = universityProjectRepository;
    }

    // =====================================================
    // LIST MATCHED CHALLENGES FOR UNIVERSITIES
    // =====================================================

    public List<Map<String, Object>> getMatchedChallenges(String universityDomain) {

        // 1. Backfill IssueClusters for any validated/in-progress complaint that does not have a cluster yet
        List<Complaint> allComplaints = complaintRepository.findAll();
        for (Complaint complaint : allComplaints) {
            if ((complaint.getStatus() == Complaint.Status.VALIDATED || complaint.getStatus() == Complaint.Status.IN_PROGRESS)
                    && (complaint.getClusterId() == null || complaint.getChallengeId() == null)) {

                String challengeId = "SS-" + (1000 + complaint.getId());
                String cat = complaint.getAiCategory() != null ? complaint.getAiCategory() :
                             (complaint.getCategory() != null ? complaint.getCategory() : "General");

                Optional<IssueCluster> existing = issueClusterRepository.findByChallengeId(challengeId);
                IssueCluster cluster;
                if (existing.isPresent()) {
                    cluster = existing.get();
                } else {
                    cluster = new IssueCluster(
                            challengeId,
                            cat,
                            "Cluster: " + (complaint.getTitle() != null ? complaint.getTitle() : "Civic Issue #" + complaint.getId()),
                            "Validated report near " + (complaint.getLocation() != null ? complaint.getLocation() : "Location"),
                            complaint.getLatitude() != null ? complaint.getLatitude() : 0.0,
                            complaint.getLongitude() != null ? complaint.getLongitude() : 0.0
                    );
                    cluster = issueClusterRepository.save(cluster);
                }

                complaint.setClusterId(cluster.getId());
                complaint.setChallengeId(cluster.getChallengeId());
                complaintRepository.save(complaint);
            }
        }

        List<IssueCluster> clusters = issueClusterRepository.findAll();
        List<Map<String, Object>> responseList = new ArrayList<>();

        for (IssueCluster cluster : clusters) {

            Map<String, Object> item = new HashMap<>();
            item.put("clusterId", cluster.getId());
            item.put("challengeId", cluster.getChallengeId());
            item.put("category", cluster.getCategory());
            item.put("title", cluster.getTitle());
            item.put("summary", cluster.getSummary());
            item.put("reportCount", cluster.getReportCount());
            item.put("centroidLat", cluster.getCentroidLat());
            item.put("centroidLng", cluster.getCentroidLng());
            item.put("createdAt", cluster.getCreatedAt());

            // Compute AI Domain Match Score
            double matchScore = calculateMatchScore(cluster.getCategory(), cluster.getTitle(), universityDomain);
            item.put("matchScore", matchScore);

            // Required Expertise Mapping
            item.put("requiredExpertise", getRequiredExpertise(cluster.getCategory()));

            // Check adoption status
            List<UniversityProject> existing = universityProjectRepository.findByChallengeId(cluster.getChallengeId());
            item.put("isAdopted", !existing.isEmpty());
            item.put("adoptionCount", existing.size());

            responseList.add(item);
        }

        // Sort by match score descending
        responseList.sort((a, b) -> Double.compare((Double) b.get("matchScore"), (Double) a.get("matchScore")));

        return responseList;
    }

    private double calculateMatchScore(String category, String title, String universityDomain) {
        if (category == null) return 70.0;
        String cat = category.toLowerCase();

        if (cat.contains("pothole") || cat.contains("road")) return 94.5;
        if (cat.contains("garbage") || cat.contains("waste")) return 91.0;
        if (cat.contains("light") || cat.contains("electric")) return 88.5;
        if (cat.contains("tree") || cat.contains("park")) return 85.0;

        return 78.0;
    }

    private String getRequiredExpertise(String category) {
        if (category == null) return "Civil + Environmental Engineering";
        String cat = category.toLowerCase();

        if (cat.contains("pothole")) return "Civil Engineering + GIS + Pavement R&D";
        if (cat.contains("garbage")) return "Environmental Engineering + Recycling Tech";
        if (cat.contains("light")) return "Electrical Engineering + IoT + Solar R&D";
        if (cat.contains("tree")) return "Forestry + Disaster Management + Botany";

        return "Civil + Urban Planning";
    }

    // =====================================================
    // ADOPT CHALLENGE
    // =====================================================

    public UniversityProject adoptChallenge(AdoptChallengeRequest request) {

        Optional<UniversityProject> existing =
                universityProjectRepository.findByChallengeIdAndUniversityName(
                        request.challengeId(), request.universityName()
                );

        if (existing.isPresent()) {
            throw new IllegalStateException("Your university has already adopted this challenge.");
        }

        IssueCluster cluster = issueClusterRepository.findByChallengeId(request.challengeId())
                .orElseThrow(() -> new IllegalArgumentException("Challenge cluster not found."));

        ChallengeProfile profile = getChallengeProfile(cluster.getCategory());
        double matchScore = calculateMatchScore(cluster.getCategory(), cluster.getTitle(), request.domainExpertise());

        UniversityProject project = new UniversityProject(
                request.challengeId(),
                request.universityName(),
                request.facultyMentor(),
                request.studentTeamSize(),
                request.domainExpertise().isBlank() ? profile.requiredExpertise() : request.domainExpertise(),
                matchScore,
                request.proposalSummary().isBlank() ? profile.proposalSummary() : request.proposalSummary()
        );

        return universityProjectRepository.save(project);
    }

    // =====================================================
    // GET ADOPTED PROJECTS
    // =====================================================

    public List<UniversityProject> getAllProjects() {
        List<UniversityProject> projects = universityProjectRepository.findAll();

        // Correct projects created before category-specific adoption defaults were introduced.
        for (UniversityProject project : projects) {
            issueClusterRepository.findByChallengeId(project.getChallengeId())
                    .ifPresent(cluster -> repairLegacyProjectProfile(project, cluster));
        }

        return projects;
    }

    public List<UniversityProject> getProjectsByUniversity(String universityName) {
        return universityProjectRepository.findByUniversityName(universityName);
    }

    // =====================================================
    // UPDATE MILESTONE & PROTOTYPE
    // =====================================================

    public UniversityProject updateMilestone(Long projectId, String status, String prototypeUrl) {
        UniversityProject project = universityProjectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("University project not found"));

        if (status != null && !status.isBlank()) {
            project.setStatus(status.trim().toUpperCase());
        }

        if (prototypeUrl != null && !prototypeUrl.isBlank()) {
            project.setPrototypeUrl(prototypeUrl.trim());
        }

        return universityProjectRepository.save(project);
    }

    private void repairLegacyProjectProfile(UniversityProject project, IssueCluster cluster) {
        boolean hasLegacyHydrologyDomain = "Civil Engineering + GIS + Hydrology"
                .equals(project.getDomainExpertise());
        boolean hasLegacyDrainageSummary = project.getProposalSummary() != null
                && project.getProposalSummary().toLowerCase().contains("road drainage monitoring");

        if (!hasLegacyHydrologyDomain && !hasLegacyDrainageSummary) {
            return;
        }

        ChallengeProfile profile = getChallengeProfile(cluster.getCategory());
        project.setDomainExpertise(profile.requiredExpertise());
        project.setProposalSummary(profile.proposalSummary());
        project.setMatchScore(calculateMatchScore(cluster.getCategory(), cluster.getTitle(), profile.requiredExpertise()));
        universityProjectRepository.save(project);
    }

    private ChallengeProfile getChallengeProfile(String category) {
        String normalizedCategory = category == null ? "" : category.toLowerCase();

        if (normalizedCategory.contains("pothole") || normalizedCategory.contains("road")) {
            return new ChallengeProfile(
                    "Civil Engineering + GIS + Pavement R&D",
                    "Developing a road-surface inspection and pothole prioritisation solution for this challenge cluster."
            );
        }
        if (normalizedCategory.contains("garbage") || normalizedCategory.contains("waste")) {
            return new ChallengeProfile(
                    "Environmental Engineering + Recycling Technology",
                    "Developing a waste hotspot monitoring and collection optimisation solution for this challenge cluster."
            );
        }
        if (normalizedCategory.contains("light") || normalizedCategory.contains("electric")) {
            return new ChallengeProfile(
                    "Electrical Engineering + IoT + Solar R&D",
                    "Developing a smart public-lighting fault detection and maintenance solution for this challenge cluster."
            );
        }
        if (normalizedCategory.contains("tree") || normalizedCategory.contains("park")) {
            return new ChallengeProfile(
                    "Forestry + Disaster Management + Botany",
                    "Developing a rapid fallen-tree risk assessment, clearance coordination, and road-safety monitoring solution for this challenge cluster."
            );
        }

        return new ChallengeProfile(
                "Civil Engineering + Urban Planning",
                "Developing a civic infrastructure solution for this challenge cluster."
        );
    }

    private record ChallengeProfile(
            String requiredExpertise,
            String proposalSummary
    ) {
    }
}
