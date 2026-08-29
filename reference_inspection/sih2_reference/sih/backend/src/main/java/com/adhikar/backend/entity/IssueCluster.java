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
@Table(name = "issue_clusters")
public class IssueCluster {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String challengeId; // e.g. "SS-1042"

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @Column
    private Double centroidLat;

    @Column
    private Double centroidLng;

    @Column(nullable = false)
    private Integer reportCount = 1;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    public IssueCluster() {
    }

    public IssueCluster(String challengeId, String category, String title, String summary, Double centroidLat, Double centroidLng) {
        this.challengeId = challengeId;
        this.category = category;
        this.title = title;
        this.summary = summary;
        this.centroidLat = centroidLat;
        this.centroidLng = centroidLng;
        this.reportCount = 1;
        this.createdAt = LocalDateTime.now();
    }

    @PrePersist
    public void onPrePersist() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.reportCount == null) {
            this.reportCount = 1;
        }
    }

    public Long getId() {
        return id;
    }

    public String getChallengeId() {
        return challengeId;
    }

    public String getCategory() {
        return category;
    }

    public String getTitle() {
        return title;
    }

    public String getSummary() {
        return summary;
    }

    public Double getCentroidLat() {
        return centroidLat;
    }

    public Double getCentroidLng() {
        return centroidLng;
    }

    public Integer getReportCount() {
        return reportCount;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setChallengeId(String challengeId) {
        this.challengeId = challengeId;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public void setCentroidLat(Double centroidLat) {
        this.centroidLat = centroidLat;
    }

    public void setCentroidLng(Double centroidLng) {
        this.centroidLng = centroidLng;
    }

    public void setReportCount(Integer reportCount) {
        this.reportCount = reportCount;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
