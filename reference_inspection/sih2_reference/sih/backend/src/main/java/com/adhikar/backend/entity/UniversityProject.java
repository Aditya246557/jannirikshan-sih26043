package com.adhikar.backend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "university_projects")
public class UniversityProject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "challenge_id", nullable = false)
    private String challengeId; // e.g. "SS-1042"

    @Column(nullable = false)
    private String universityName;

    @Column(nullable = false)
    private String facultyMentor;

    @Column(nullable = false)
    private Integer studentTeamSize;

    @Column(nullable = false)
    private String domainExpertise;

    @Column(nullable = false)
    private Double matchScore; // e.g. 94.5%

    @Column(columnDefinition = "TEXT")
    private String proposalSummary;

    @Column
    private String prototypeUrl;

    @Column(nullable = false)
    private String status; // PROPOSAL_SUBMITTED, PROTOTYPE_IN_DEVELOPMENT, PILOT_READY, DEPLOYED

    @Column
    private Double totalFunding = 0.0;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    public UniversityProject() {
    }

    public UniversityProject(String challengeId, String universityName, String facultyMentor, Integer studentTeamSize, String domainExpertise, Double matchScore, String proposalSummary) {
        this.challengeId = challengeId;
        this.universityName = universityName;
        this.facultyMentor = facultyMentor;
        this.studentTeamSize = studentTeamSize;
        this.domainExpertise = domainExpertise;
        this.matchScore = matchScore;
        this.proposalSummary = proposalSummary;
        this.status = "PROPOSAL_SUBMITTED";
        this.totalFunding = 0.0;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PrePersist
    public void onPrePersist() {
        if (this.createdAt == null) this.createdAt = LocalDateTime.now();
        if (this.updatedAt == null) this.updatedAt = LocalDateTime.now();
        if (this.status == null) this.status = "PROPOSAL_SUBMITTED";
        if (this.totalFunding == null) this.totalFunding = 0.0;
    }

    @PreUpdate
    public void onPreUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public String getChallengeId() {
        return challengeId;
    }

    public String getUniversityName() {
        return universityName;
    }

    public String getFacultyMentor() {
        return facultyMentor;
    }

    public Integer getStudentTeamSize() {
        return studentTeamSize;
    }

    public String getDomainExpertise() {
        return domainExpertise;
    }

    public Double getMatchScore() {
        return matchScore;
    }

    public String getProposalSummary() {
        return proposalSummary;
    }

    public String getPrototypeUrl() {
        return prototypeUrl;
    }

    public String getStatus() {
        return status;
    }

    public Double getTotalFunding() {
        return totalFunding;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setChallengeId(String challengeId) {
        this.challengeId = challengeId;
    }

    public void setUniversityName(String universityName) {
        this.universityName = universityName;
    }

    public void setFacultyMentor(String facultyMentor) {
        this.facultyMentor = facultyMentor;
    }

    public void setStudentTeamSize(Integer studentTeamSize) {
        this.studentTeamSize = studentTeamSize;
    }

    public void setDomainExpertise(String domainExpertise) {
        this.domainExpertise = domainExpertise;
    }

    public void setMatchScore(Double matchScore) {
        this.matchScore = matchScore;
    }

    public void setProposalSummary(String proposalSummary) {
        this.proposalSummary = proposalSummary;
    }

    public void setPrototypeUrl(String prototypeUrl) {
        this.prototypeUrl = prototypeUrl;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setTotalFunding(Double totalFunding) {
        this.totalFunding = totalFunding;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
