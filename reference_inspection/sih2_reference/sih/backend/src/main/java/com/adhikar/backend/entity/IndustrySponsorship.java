package com.adhikar.backend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "industry_sponsorships")
public class IndustrySponsorship {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "project_id", nullable = false)
    private Long projectId;

    @Column(name = "challenge_id", nullable = false)
    private String challengeId;

    @Column(nullable = false)
    private String companyName;

    @Column(nullable = false)
    private String sponsorEmail;

    @Column(nullable = false)
    private String supportType; // CSR_GRANT, MENTORSHIP, PILOT_PARTNER

    @Column
    private Double grantAmount;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    public IndustrySponsorship() {
    }

    public IndustrySponsorship(Long projectId, String challengeId, String companyName, String sponsorEmail, String supportType, Double grantAmount, String notes) {
        this.projectId = projectId;
        this.challengeId = challengeId;
        this.companyName = companyName;
        this.sponsorEmail = sponsorEmail;
        this.supportType = supportType;
        this.grantAmount = grantAmount;
        this.notes = notes;
        this.createdAt = LocalDateTime.now();
    }

    @PrePersist
    public void onPrePersist() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public Long getProjectId() {
        return projectId;
    }

    public String getChallengeId() {
        return challengeId;
    }

    public String getCompanyName() {
        return companyName;
    }

    public String getSponsorEmail() {
        return sponsorEmail;
    }

    public String getSupportType() {
        return supportType;
    }

    public Double getGrantAmount() {
        return grantAmount;
    }

    public String getNotes() {
        return notes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }

    public void setChallengeId(String challengeId) {
        this.challengeId = challengeId;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public void setSponsorEmail(String sponsorEmail) {
        this.sponsorEmail = sponsorEmail;
    }

    public void setSupportType(String supportType) {
        this.supportType = supportType;
    }

    public void setGrantAmount(Double grantAmount) {
        this.grantAmount = grantAmount;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
