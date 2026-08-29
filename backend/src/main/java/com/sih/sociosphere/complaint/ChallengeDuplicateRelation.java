package com.sih.sociosphere.complaint;

import com.sih.sociosphere.user.User;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "challenge_duplicate_relations")
public class ChallengeDuplicateRelation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "master_challenge_id", nullable = false)
    private Complaint masterChallenge;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "duplicate_challenge_id", nullable = false)
    private Complaint duplicateChallenge;

    private Double similarityScore; // 0 to 100
    private String matchFactors; // e.g. "District, Category, 1.2km proximity"

    @Column(length = 30)
    private String status = "LINKED"; // LINKED, MERGED, DISMISSED

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "linked_by_user_id")
    private User linkedBy;

    private LocalDateTime linkedAt;

    @PrePersist
    protected void onCreate() {
        if (linkedAt == null) linkedAt = LocalDateTime.now();
    }

    public ChallengeDuplicateRelation() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Complaint getMasterChallenge() { return masterChallenge; }
    public void setMasterChallenge(Complaint masterChallenge) { this.masterChallenge = masterChallenge; }
    public Complaint getDuplicateChallenge() { return duplicateChallenge; }
    public void setDuplicateChallenge(Complaint duplicateChallenge) { this.duplicateChallenge = duplicateChallenge; }
    public Double getSimilarityScore() { return similarityScore; }
    public void setSimilarityScore(Double similarityScore) { this.similarityScore = similarityScore; }
    public String getMatchFactors() { return matchFactors; }
    public void setMatchFactors(String matchFactors) { this.matchFactors = matchFactors; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public User getLinkedBy() { return linkedBy; }
    public void setLinkedBy(User linkedBy) { this.linkedBy = linkedBy; }
    public LocalDateTime getLinkedAt() { return linkedAt; }
    public void setLinkedAt(LocalDateTime linkedAt) { this.linkedAt = linkedAt; }
}
