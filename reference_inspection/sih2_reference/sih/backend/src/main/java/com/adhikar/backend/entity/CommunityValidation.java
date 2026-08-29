package com.adhikar.backend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
    name = "community_validations",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"complaint_id", "user_email"})
    }
)
public class CommunityValidation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "complaint_id", nullable = false)
    private Long complaintId;

    @Column(name = "user_email", nullable = false)
    private String userEmail;

    @Column(nullable = false)
    private String voteType; // "CONFIRM" or "REJECT"

    @Column(columnDefinition = "TEXT")
    private String note;

    @Column(nullable = false)
    private LocalDateTime votedAt;

    public CommunityValidation() {
    }

    public CommunityValidation(Long complaintId, String userEmail, String voteType, String note) {
        this.complaintId = complaintId;
        this.userEmail = userEmail;
        this.voteType = voteType;
        this.note = note;
        this.votedAt = LocalDateTime.now();
    }

    @PrePersist
    public void onPrePersist() {
        if (this.votedAt == null) {
            this.votedAt = LocalDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public Long getComplaintId() {
        return complaintId;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public String getVoteType() {
        return voteType;
    }

    public String getNote() {
        return note;
    }

    public LocalDateTime getVotedAt() {
        return votedAt;
    }

    public void setComplaintId(Long complaintId) {
        this.complaintId = complaintId;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public void setVoteType(String voteType) {
        this.voteType = voteType;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public void setVotedAt(LocalDateTime votedAt) {
        this.votedAt = votedAt;
    }
}
