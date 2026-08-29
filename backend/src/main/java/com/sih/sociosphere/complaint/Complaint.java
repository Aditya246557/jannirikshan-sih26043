package com.sih.sociosphere.complaint;

import com.sih.sociosphere.common.enums.ComplaintStatus;
import com.sih.sociosphere.common.enums.Priority;
import com.sih.sociosphere.user.User;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "complaints",
        indexes = {
                @Index(name = "idx_complaint_status", columnList = "status"),
                @Index(name = "idx_complaint_priority", columnList = "priority"),
                @Index(name = "idx_complaint_category", columnList = "category"),
                @Index(name = "idx_complaint_district", columnList = "district"),
                @Index(name = "idx_complaint_created_at", columnList = "created_at"),
                @Index(name = "idx_complaint_location", columnList = "latitude,longitude")
        }
)
public class Complaint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 100)
    private String category;

    @Column(length = 100)
    private String subcategory;

    @Column(length = 100)
    private String problemType; // Infrastructure, Public Health, Environmental, Agriculture, Sanitation

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Priority severity = Priority.MEDIUM;

    private Integer affectedPeople = 100;

    @Column(columnDefinition = "TEXT")
    private String expectedImpact;

    @Column(columnDefinition = "TEXT")
    private String desiredEngineeringOutcome;

    @Column(length = 255)
    private String contactInfo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private Priority priority = Priority.MEDIUM;

    private Double priorityScore = 65.0; // 0 to 100

    @Column(columnDefinition = "TEXT")
    private String priorityBreakdownJson;

    private boolean priorityManuallyOverridden = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ComplaintStatus status = ComplaintStatus.SUBMITTED;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @Column(length = 500)
    private String address;

    @Column(length = 100)
    private String villageCity;

    @Column(length = 100)
    private String block;

    @Column(length = 100)
    private String district;

    @Column(length = 100)
    private String state;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "created_by",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_complaint_created_by")
    )
    private User createdBy;

    // University & Department Assignment
    private Long assignedUniversityId;
    private Long assignedDepartmentId;
    private Long assignedFacultyId;
    private Long assignedOfficerId;

    // Duplication Management
    private boolean isDuplicate = false;
    private Long masterChallengeId;

    // Moderation & Clarification
    @Column(columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(columnDefinition = "TEXT")
    private String clarificationRequest;

    @Column(columnDefinition = "TEXT")
    private String clarificationResponse;

    @Column(length = 1000)
    private String resolutionRemarks;

    // AI-First Detection & Verification Intelligence
    @Column(length = 100)
    private String aiDetectedClass;

    @Column(length = 100)
    private String aiCategory;

    @Column(length = 150)
    private String aiRecommendedDepartment;

    @Column(length = 100)
    private String citizenSuggestedCategory;

    private boolean aiMismatch = false;

    @Column(columnDefinition = "TEXT")
    private String aiMismatchWarning;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Priority aiPriority;

    private Double aiConfidence;

    @Column(length = 100)
    private String aiDomain;

    private Double aiDomainConfidence;

    @Column(length = 100)
    private String aiCivicIssue;

    private Double aiCivicIssueConfidence;

    @Column(columnDefinition = "TEXT")
    private String aiBoundingBoxes;

    private Double aiDuplicateScore;

    private Long aiClusterId;

    private Integer aiClusterSize;

    private Long aiMatchedUniversityId;

    @Column(length = 200)
    private String aiMatchedUniversityName;

    private Double aiMatchScore;

    @Column(columnDefinition = "TEXT")
    private String aiMatchReason;

    @Column(columnDefinition = "TEXT")
    private String aiRankedCandidatesJson;

    @Column(length = 100)
    private String aiModelVersion;

    private LocalDateTime aiProcessedAt;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;

        if (category == null || category.isBlank()) {
            category = citizenSuggestedCategory != null && !citizenSuggestedCategory.isBlank() ? citizenSuggestedCategory : "Pending AI Verification";
        }
        if (priority == null) priority = Priority.MEDIUM;
        if (severity == null) severity = Priority.MEDIUM;
        if (status == null) status = ComplaintStatus.SUBMITTED;
        if (affectedPeople == null) affectedPeople = 50;
        if (priorityScore == null) priorityScore = 50.0;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Complaint() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getSubcategory() { return subcategory; }
    public void setSubcategory(String subcategory) { this.subcategory = subcategory; }
    public String getProblemType() { return problemType; }
    public void setProblemType(String problemType) { this.problemType = problemType; }
    public Priority getSeverity() { return severity; }
    public void setSeverity(Priority severity) { this.severity = severity; }
    public Integer getAffectedPeople() { return affectedPeople; }
    public void setAffectedPeople(Integer affectedPeople) { this.affectedPeople = affectedPeople; }
    public String getExpectedImpact() { return expectedImpact; }
    public void setExpectedImpact(String expectedImpact) { this.expectedImpact = expectedImpact; }
    public String getDesiredEngineeringOutcome() { return desiredEngineeringOutcome != null ? desiredEngineeringOutcome : expectedImpact; }
    public void setDesiredEngineeringOutcome(String desiredEngineeringOutcome) { this.desiredEngineeringOutcome = desiredEngineeringOutcome; }
    public String getContactInfo() { return contactInfo; }
    public void setContactInfo(String contactInfo) { this.contactInfo = contactInfo; }
    public Priority getPriority() { return priority; }
    public void setPriority(Priority priority) { this.priority = priority; }
    public Double getPriorityScore() { return priorityScore; }
    public void setPriorityScore(Double priorityScore) { this.priorityScore = priorityScore; }
    public String getPriorityBreakdownJson() { return priorityBreakdownJson; }
    public void setPriorityBreakdownJson(String priorityBreakdownJson) { this.priorityBreakdownJson = priorityBreakdownJson; }
    public boolean isPriorityManuallyOverridden() { return priorityManuallyOverridden; }
    public void setPriorityManuallyOverridden(boolean priorityManuallyOverridden) { this.priorityManuallyOverridden = priorityManuallyOverridden; }
    public ComplaintStatus getStatus() { return status; }
    public void setStatus(ComplaintStatus status) { this.status = status; }
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getVillageCity() { return villageCity; }
    public void setVillageCity(String villageCity) { this.villageCity = villageCity; }
    public String getBlock() { return block; }
    public void setBlock(String block) { this.block = block; }
    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }
    public String getState() { return state; }
    public void setState(String state) { this.state = state; }
    public User getCreatedBy() { return createdBy; }
    public void setCreatedBy(User createdBy) { this.createdBy = createdBy; }
    public Long getAssignedUniversityId() { return assignedUniversityId; }
    public void setAssignedUniversityId(Long assignedUniversityId) { this.assignedUniversityId = assignedUniversityId; }
    public Long getAssignedDepartmentId() { return assignedDepartmentId; }
    public void setAssignedDepartmentId(Long assignedDepartmentId) { this.assignedDepartmentId = assignedDepartmentId; }
    public Long getAssignedFacultyId() { return assignedFacultyId; }
    public void setAssignedFacultyId(Long assignedFacultyId) { this.assignedFacultyId = assignedFacultyId; }
    public Long getAssignedOfficerId() { return assignedOfficerId; }
    public void setAssignedOfficerId(Long assignedOfficerId) { this.assignedOfficerId = assignedOfficerId; }
    public boolean isDuplicate() { return isDuplicate; }
    public void setDuplicate(boolean duplicate) { isDuplicate = duplicate; }
    public Long getMasterChallengeId() { return masterChallengeId; }
    public void setMasterChallengeId(Long masterChallengeId) { this.masterChallengeId = masterChallengeId; }
    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }
    public String getClarificationRequest() { return clarificationRequest; }
    public void setClarificationRequest(String clarificationRequest) { this.clarificationRequest = clarificationRequest; }
    public String getClarificationResponse() { return clarificationResponse; }
    public void setClarificationResponse(String clarificationResponse) { this.clarificationResponse = clarificationResponse; }
    public String getResolutionRemarks() { return resolutionRemarks; }
    public void setResolutionRemarks(String resolutionRemarks) { this.resolutionRemarks = resolutionRemarks; }
    public String getAiDetectedClass() { return aiDetectedClass; }
    public void setAiDetectedClass(String aiDetectedClass) { this.aiDetectedClass = aiDetectedClass; }
    public String getAiCategory() { return aiCategory; }
    public void setAiCategory(String aiCategory) { this.aiCategory = aiCategory; }
    public String getAiRecommendedDepartment() { return aiRecommendedDepartment; }
    public void setAiRecommendedDepartment(String aiRecommendedDepartment) { this.aiRecommendedDepartment = aiRecommendedDepartment; }
    public String getCitizenSuggestedCategory() { return citizenSuggestedCategory; }
    public void setCitizenSuggestedCategory(String citizenSuggestedCategory) { this.citizenSuggestedCategory = citizenSuggestedCategory; }
    public boolean isAiMismatch() { return aiMismatch; }
    public void setAiMismatch(boolean aiMismatch) { this.aiMismatch = aiMismatch; }
    public String getAiMismatchWarning() { return aiMismatchWarning; }
    public void setAiMismatchWarning(String aiMismatchWarning) { this.aiMismatchWarning = aiMismatchWarning; }
    public Priority getAiPriority() { return aiPriority; }
    public void setAiPriority(Priority aiPriority) { this.aiPriority = aiPriority; }
    public Double getAiConfidence() { return aiConfidence; }
    public void setAiConfidence(Double aiConfidence) { this.aiConfidence = aiConfidence; }
    public String getAiDomain() { return aiDomain; }
    public void setAiDomain(String aiDomain) { this.aiDomain = aiDomain; }
    public Double getAiDomainConfidence() { return aiDomainConfidence; }
    public void setAiDomainConfidence(Double aiDomainConfidence) { this.aiDomainConfidence = aiDomainConfidence; }
    public String getAiCivicIssue() { return aiCivicIssue; }
    public void setAiCivicIssue(String aiCivicIssue) { this.aiCivicIssue = aiCivicIssue; }
    public Double getAiCivicIssueConfidence() { return aiCivicIssueConfidence; }
    public void setAiCivicIssueConfidence(Double aiCivicIssueConfidence) { this.aiCivicIssueConfidence = aiCivicIssueConfidence; }
    public String getAiBoundingBoxes() { return aiBoundingBoxes; }
    public void setAiBoundingBoxes(String aiBoundingBoxes) { this.aiBoundingBoxes = aiBoundingBoxes; }
    public Double getAiDuplicateScore() { return aiDuplicateScore; }
    public void setAiDuplicateScore(Double aiDuplicateScore) { this.aiDuplicateScore = aiDuplicateScore; }
    public Long getAiClusterId() { return aiClusterId; }
    public void setAiClusterId(Long aiClusterId) { this.aiClusterId = aiClusterId; }
    public Integer getAiClusterSize() { return aiClusterSize; }
    public void setAiClusterSize(Integer aiClusterSize) { this.aiClusterSize = aiClusterSize; }
    public Long getAiMatchedUniversityId() { return aiMatchedUniversityId; }
    public void setAiMatchedUniversityId(Long aiMatchedUniversityId) { this.aiMatchedUniversityId = aiMatchedUniversityId; }
    public String getAiMatchedUniversityName() { return aiMatchedUniversityName; }
    public void setAiMatchedUniversityName(String aiMatchedUniversityName) { this.aiMatchedUniversityName = aiMatchedUniversityName; }
    public Double getAiMatchScore() { return aiMatchScore; }
    public void setAiMatchScore(Double aiMatchScore) { this.aiMatchScore = aiMatchScore; }
    public String getAiMatchReason() { return aiMatchReason; }
    public void setAiMatchReason(String aiMatchReason) { this.aiMatchReason = aiMatchReason; }
    public String getAiRankedCandidatesJson() { return aiRankedCandidatesJson; }
    public void setAiRankedCandidatesJson(String aiRankedCandidatesJson) { this.aiRankedCandidatesJson = aiRankedCandidatesJson; }
    public String getAiModelVersion() { return aiModelVersion; }
    public void setAiModelVersion(String aiModelVersion) { this.aiModelVersion = aiModelVersion; }
    public LocalDateTime getAiProcessedAt() { return aiProcessedAt; }
    public void setAiProcessedAt(LocalDateTime aiProcessedAt) { this.aiProcessedAt = aiProcessedAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
