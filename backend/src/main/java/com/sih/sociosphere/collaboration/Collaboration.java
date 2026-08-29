package com.sih.sociosphere.collaboration;

import com.sih.sociosphere.common.enums.CollaborationStatus;
import com.sih.sociosphere.complaint.Complaint;
import com.sih.sociosphere.industry.Industry;
import com.sih.sociosphere.university.University;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "collaborations")
public class Collaboration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "complaint_id", nullable = false)
    private Complaint complaint;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "university_id", nullable = false)
    private University university;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "industry_id")
    private Industry industry;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private CollaborationStatus status = CollaborationStatus.INTEREST_EXPRESSED;

    @Column(columnDefinition = "TEXT")
    private String scope;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    public Collaboration() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Complaint getComplaint() { return complaint; }
    public void setComplaint(Complaint complaint) { this.complaint = complaint; }
    public University getUniversity() { return university; }
    public void setUniversity(University university) { this.university = university; }
    public Industry getIndustry() { return industry; }
    public void setIndustry(Industry industry) { this.industry = industry; }
    public CollaborationStatus getStatus() { return status; }
    public void setStatus(CollaborationStatus status) { this.status = status; }
    public String getScope() { return scope; }
    public void setScope(String scope) { this.scope = scope; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}