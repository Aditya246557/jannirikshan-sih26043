package com.sih.sociosphere.review;

import com.sih.sociosphere.proposal.Proposal;
import com.sih.sociosphere.user.User;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "proposal_reviews")
public class ProposalReview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proposal_id", nullable = false)
    private Proposal proposal;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewer_id", nullable = false)
    private User reviewer;

    private Integer technicalScore = 80;
    private Integer feasibilityScore = 85;
    private Integer impactScore = 90;

    @Column(columnDefinition = "TEXT")
    private String comments;

    private boolean approved = true;
    private LocalDateTime reviewedAt;

    @PrePersist
    protected void onCreate() {
        if (reviewedAt == null) reviewedAt = LocalDateTime.now();
    }

    public ProposalReview() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Proposal getProposal() { return proposal; }
    public void setProposal(Proposal proposal) { this.proposal = proposal; }
    public User getReviewer() { return reviewer; }
    public void setReviewer(User reviewer) { this.reviewer = reviewer; }
    public Integer getTechnicalScore() { return technicalScore; }
    public void setTechnicalScore(Integer technicalScore) { this.technicalScore = technicalScore; }
    public Integer getFeasibilityScore() { return feasibilityScore; }
    public void setFeasibilityScore(Integer feasibilityScore) { this.feasibilityScore = feasibilityScore; }
    public Integer getImpactScore() { return impactScore; }
    public void setImpactScore(Integer impactScore) { this.impactScore = impactScore; }
    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }
    public boolean isApproved() { return approved; }
    public void setApproved(boolean approved) { this.approved = approved; }
    public LocalDateTime getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(LocalDateTime reviewedAt) { this.reviewedAt = reviewedAt; }
}