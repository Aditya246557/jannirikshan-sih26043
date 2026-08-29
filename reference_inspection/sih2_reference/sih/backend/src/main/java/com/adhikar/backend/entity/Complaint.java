package com.adhikar.backend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "complaints")
public class Complaint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private String location;

    // GPS coordinates
    @Column
    private Double latitude;

    @Column
    private Double longitude;

    // Current workflow status
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;

    @Column(nullable = false)
    private String citizenEmail;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    // AI-generated fields
    @Column
    private String aiCategory;

    @Column
    private Double aiConfidence;

    @Column
    private Double civicRelevanceScore;

    @Column
    private String severity;

    @Column
    private Double trustScore;

    @Column
    private Boolean isDuplicate = false;

    @Column
    private Long clusterId;

    @Column
    private String challengeId;

    @Column
    private String deviceInfo;

    @Column
    private LocalDateTime capturedAt;

    @Column
    private String verificationStatus;

    @Column
    private String resolutionVerificationStatus;

    @Column(columnDefinition = "TEXT")
    private String resolutionImageUrl;

    @Column
    private String priority;

    // Government / Authority assignment
    @Column
    private String assignedDepartment;

    // Government review remarks
    @Column(columnDefinition = "TEXT")
    private String adminRemarks;

    // Reason when a problem is rejected
    @Column(columnDefinition = "TEXT")
    private String rejectionReason;

    // Evidence image URL
    @Column(columnDefinition = "TEXT")
    private String evidenceImageUrl;



    public Complaint() {
    }


    public Complaint(
            String title,
            String description,
            String category,
            String location,
            String citizenEmail
    ) {

        this.title = title;
        this.description = description;
        this.category = category;
        this.location = location;
        this.citizenEmail = citizenEmail;

        this.status = Status.PENDING;
        this.createdAt = LocalDateTime.now();

        this.aiCategory = category;
        this.priority = "MEDIUM";
    }


    // =====================================================
    // JPA SAFETY DEFAULTS
    // =====================================================

    @PrePersist
    public void setDefaults() {

        if (this.status == null) {
            this.status = Status.PENDING;
        }

        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }

        if (this.aiCategory == null ||
                this.aiCategory.isBlank()) {

            this.aiCategory = this.category;
        }

        if (this.priority == null ||
                this.priority.isBlank()) {

            this.priority = "MEDIUM";
        }
    }


    // =====================================================
    // GETTERS
    // =====================================================

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public String getCategory() {
        return category;
    }

    public String getLocation() {
        return location;
    }

    public Double getLatitude() {
        return latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public Status getStatus() {
        return status;
    }

    public String getCitizenEmail() {
        return citizenEmail;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public String getAiCategory() {
        return aiCategory;
    }

    public Double getAiConfidence() {
        return aiConfidence;
    }

    public Double getCivicRelevanceScore() {
        return civicRelevanceScore;
    }

    public String getSeverity() {
        return severity;
    }

    public Double getTrustScore() {
        return trustScore;
    }

    public Boolean getIsDuplicate() {
        return isDuplicate;
    }

    public Long getClusterId() {
        return clusterId;
    }

    public String getChallengeId() {
        return challengeId;
    }

    public String getDeviceInfo() {
        return deviceInfo;
    }

    public LocalDateTime getCapturedAt() {
        return capturedAt;
    }

    public String getVerificationStatus() {
        return verificationStatus;
    }

    public String getResolutionVerificationStatus() {
        return resolutionVerificationStatus;
    }

    public String getResolutionImageUrl() {
        return resolutionImageUrl;
    }

    public String getPriority() {
        return priority;
    }

    public String getAssignedDepartment() {
        return assignedDepartment;
    }

    public String getAdminRemarks() {
        return adminRemarks;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public String getEvidenceImageUrl() {
        return evidenceImageUrl;
    }


    // =====================================================
    // SETTERS
    // =====================================================

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public void setAiCategory(String aiCategory) {
        this.aiCategory = aiCategory;
    }

    public void setAiConfidence(Double aiConfidence) {
        this.aiConfidence = aiConfidence;
    }

    public void setCivicRelevanceScore(Double civicRelevanceScore) {
        this.civicRelevanceScore = civicRelevanceScore;
    }

    public void setSeverity(String severity) {
        this.severity = severity;
    }

    public void setTrustScore(Double trustScore) {
        this.trustScore = trustScore;
    }

    public void setIsDuplicate(Boolean isDuplicate) {
        this.isDuplicate = isDuplicate;
    }

    public void setClusterId(Long clusterId) {
        this.clusterId = clusterId;
    }

    public void setChallengeId(String challengeId) {
        this.challengeId = challengeId;
    }

    public void setDeviceInfo(String deviceInfo) {
        this.deviceInfo = deviceInfo;
    }

    public void setCapturedAt(LocalDateTime capturedAt) {
        this.capturedAt = capturedAt;
    }

    public void setVerificationStatus(String verificationStatus) {
        this.verificationStatus = verificationStatus;
    }

    public void setResolutionVerificationStatus(String resolutionVerificationStatus) {
        this.resolutionVerificationStatus = resolutionVerificationStatus;
    }

    public void setResolutionImageUrl(String resolutionImageUrl) {
        this.resolutionImageUrl = resolutionImageUrl;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public void setAssignedDepartment(
            String assignedDepartment
    ) {
        this.assignedDepartment = assignedDepartment;
    }

    public void setAdminRemarks(
            String adminRemarks
    ) {
        this.adminRemarks = adminRemarks;
    }

    public void setRejectionReason(
            String rejectionReason
    ) {
        this.rejectionReason = rejectionReason;
    }

    public void setEvidenceImageUrl(
            String evidenceImageUrl
    ) {
        this.evidenceImageUrl = evidenceImageUrl;
    }


    // =====================================================
    // WORKFLOW STATUS
    // =====================================================

    public enum Status {

        // Citizen has submitted the problem
        PENDING,

        // Government/Admin is reviewing it
        UNDER_REVIEW,

        // Government has validated the problem
        VALIDATED,

        // Rejected by Government/Admin
        REJECTED,

        // Accepted and work has started
        IN_PROGRESS,

        // Problem has been resolved
        RESOLVED
    }
}