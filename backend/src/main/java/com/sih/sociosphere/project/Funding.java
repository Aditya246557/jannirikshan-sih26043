package com.sih.sociosphere.project;

import com.sih.sociosphere.common.enums.FundingStatus;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "project_funding")
public class Funding {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(nullable = false)
    private String sponsorName; // Industry or Govt agency

    @Column(nullable = false)
    private Double amount;

    private String fundingStage; // Seed, Prototype, Pilot, Scale
    private String transactionRef;
    private LocalDate fundingDate;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private FundingStatus status = FundingStatus.COMMITTED;

    @Column(columnDefinition = "TEXT")
    private String note;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (fundingDate == null) fundingDate = LocalDate.now();
        if (status == null) status = FundingStatus.COMMITTED;
    }

    public Funding() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }
    public String getSponsorName() { return sponsorName; }
    public void setSponsorName(String sponsorName) { this.sponsorName = sponsorName; }
    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }
    public String getFundingStage() { return fundingStage; }
    public void setFundingStage(String fundingStage) { this.fundingStage = fundingStage; }
    public String getTransactionRef() { return transactionRef; }
    public void setTransactionRef(String transactionRef) { this.transactionRef = transactionRef; }
    public LocalDate getFundingDate() { return fundingDate; }
    public void setFundingDate(LocalDate fundingDate) { this.fundingDate = fundingDate; }
    public FundingStatus getStatus() { return status; }
    public void setStatus(FundingStatus status) { this.status = status; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
