package com.jannirikshan.industry;

import com.jannirikshan.common.enums.PartnershipStatus;
import com.jannirikshan.common.enums.PartnershipType;
import com.jannirikshan.complaint.Complaint;
import com.jannirikshan.project.Project;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "industry_partnerships")
public class IndustryPartnership {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "industry_id", nullable = false)
    private Industry industry;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "challenge_id")
    private Complaint challenge;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private PartnershipType partnershipType = PartnershipType.FUNDING;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private PartnershipStatus status = PartnershipStatus.OFFERED;

    private Double fundingAmount = 0.0;

    @Column(columnDefinition = "TEXT")
    private String mentorshipScope;

    @Column(columnDefinition = "TEXT")
    private String technologyResourcesOffered;

    @Column(columnDefinition = "TEXT")
    private String proposalDetails;

    private String approvedBy;
    private LocalDateTime approvedAt;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (partnershipType == null) partnershipType = PartnershipType.FUNDING;
        if (status == null) status = PartnershipStatus.OFFERED;
    }

    public IndustryPartnership() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Industry getIndustry() { return industry; }
    public void setIndustry(Industry industry) { this.industry = industry; }
    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }
    public Complaint getChallenge() { return challenge; }
    public void setChallenge(Complaint challenge) { this.challenge = challenge; }
    public PartnershipType getPartnershipType() { return partnershipType; }
    public void setPartnershipType(PartnershipType partnershipType) { this.partnershipType = partnershipType; }
    public PartnershipStatus getStatus() { return status; }
    public void setStatus(PartnershipStatus status) { this.status = status; }
    public Double getFundingAmount() { return fundingAmount; }
    public void setFundingAmount(Double fundingAmount) { this.fundingAmount = fundingAmount; }
    public String getMentorshipScope() { return mentorshipScope; }
    public void setMentorshipScope(String mentorshipScope) { this.mentorshipScope = mentorshipScope; }
    public String getTechnologyResourcesOffered() { return technologyResourcesOffered; }
    public void setTechnologyResourcesOffered(String technologyResourcesOffered) { this.technologyResourcesOffered = technologyResourcesOffered; }
    public String getProposalDetails() { return proposalDetails; }
    public void setProposalDetails(String proposalDetails) { this.proposalDetails = proposalDetails; }
    public String getApprovedBy() { return approvedBy; }
    public void setApprovedBy(String approvedBy) { this.approvedBy = approvedBy; }
    public LocalDateTime getApprovedAt() { return approvedAt; }
    public void setApprovedAt(LocalDateTime approvedAt) { this.approvedAt = approvedAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
