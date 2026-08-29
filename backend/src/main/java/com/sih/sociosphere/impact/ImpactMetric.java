package com.sih.sociosphere.impact;

import com.sih.sociosphere.complaint.Complaint;
import com.sih.sociosphere.project.Project;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "impact_metrics")
public class ImpactMetric {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "complaint_id")
    private Complaint complaint;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;

    private Integer peopleBenefited = 0;
    private Integer villagesCovered = 1;
    private Double costSavedInr = 0.0;
    private Double timeSavedHours = 0.0;
    private Double environmentalImpactScore = 80.0; // 0-100
    private Integer jobsCreated = 0;
    private Double governmentEfficiencyGain = 35.0; // %
    private Double socialImpactScore = 85.0; // 0-100 composite

    @Column(columnDefinition = "TEXT")
    private String outcomeSummary;

    private LocalDateTime recordedAt;

    @PrePersist
    protected void onCreate() {
        if (recordedAt == null) recordedAt = LocalDateTime.now();
    }

    public ImpactMetric() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Complaint getComplaint() { return complaint; }
    public void setComplaint(Complaint complaint) { this.complaint = complaint; }
    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }
    public Integer getPeopleBenefited() { return peopleBenefited; }
    public void setPeopleBenefited(Integer peopleBenefited) { this.peopleBenefited = peopleBenefited; }
    public Integer getVillagesCovered() { return villagesCovered; }
    public void setVillagesCovered(Integer villagesCovered) { this.villagesCovered = villagesCovered; }
    public Double getCostSavedInr() { return costSavedInr; }
    public void setCostSavedInr(Double costSavedInr) { this.costSavedInr = costSavedInr; }
    public Double getTimeSavedHours() { return timeSavedHours; }
    public void setTimeSavedHours(Double timeSavedHours) { this.timeSavedHours = timeSavedHours; }
    public Double getEnvironmentalImpactScore() { return environmentalImpactScore; }
    public void setEnvironmentalImpactScore(Double environmentalImpactScore) { this.environmentalImpactScore = environmentalImpactScore; }
    public Integer getJobsCreated() { return jobsCreated; }
    public void setJobsCreated(Integer jobsCreated) { this.jobsCreated = jobsCreated; }
    public Double getGovernmentEfficiencyGain() { return governmentEfficiencyGain; }
    public void setGovernmentEfficiencyGain(Double governmentEfficiencyGain) { this.governmentEfficiencyGain = governmentEfficiencyGain; }
    public Double getSocialImpactScore() { return socialImpactScore; }
    public void setSocialImpactScore(Double socialImpactScore) { this.socialImpactScore = socialImpactScore; }
    public String getOutcomeSummary() { return outcomeSummary; }
    public void setOutcomeSummary(String outcomeSummary) { this.outcomeSummary = outcomeSummary; }
    public LocalDateTime getRecordedAt() { return recordedAt; }
}
