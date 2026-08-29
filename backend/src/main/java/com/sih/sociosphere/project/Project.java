package com.sih.sociosphere.project;

import com.sih.sociosphere.common.enums.ProjectStage;
import com.sih.sociosphere.common.enums.ProjectStatus;
import com.sih.sociosphere.complaint.Complaint;
import com.sih.sociosphere.faculty.Faculty;
import com.sih.sociosphere.university.University;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "projects",
        indexes = {
                @Index(name = "idx_project_status", columnList = "status"),
                @Index(name = "idx_project_stage", columnList = "stage"),
                @Index(name = "idx_project_university", columnList = "university_id")
        }
)
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "complaint_id", nullable = false, unique = true)
    private Complaint complaint;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "university_id", nullable = false)
    private University university;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "faculty_mentor_id")
    private Faculty facultyMentor;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String objective;

    @Column(columnDefinition = "TEXT")
    private String solutionDescription;

    @Column(length = 500)
    private String technologyStack; // e.g. "React, Node.js, Arduino, LoRaWAN, Python"

    private Double estimatedCost = 0.0;
    private Double currentFunding = 0.0;
    private Integer timelineMonths = 6;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private ProjectStage stage = ProjectStage.RESEARCH;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private ProjectStatus status = ProjectStatus.ACTIVE;

    private Integer progressPercentage = 0; // 0 to 100

    private LocalDate startDate;
    private LocalDate targetCompletionDate;
    private LocalDate actualCompletionDate;

    @Column(length = 1000)
    private String prototypeUrl;

    @Column(columnDefinition = "TEXT")
    private String deploymentNotes;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (stage == null) stage = ProjectStage.RESEARCH;
        if (status == null) status = ProjectStatus.ACTIVE;
        if (progressPercentage == null) progressPercentage = 0;
        if (startDate == null) startDate = LocalDate.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Project() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Complaint getComplaint() { return complaint; }
    public void setComplaint(Complaint complaint) { this.complaint = complaint; }
    public University getUniversity() { return university; }
    public void setUniversity(University university) { this.university = university; }
    public Faculty getFacultyMentor() { return facultyMentor; }
    public void setFacultyMentor(Faculty facultyMentor) { this.facultyMentor = facultyMentor; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getObjective() { return objective; }
    public void setObjective(String objective) { this.objective = objective; }
    public String getSolutionDescription() { return solutionDescription; }
    public void setSolutionDescription(String solutionDescription) { this.solutionDescription = solutionDescription; }
    public String getTechnologyStack() { return technologyStack; }
    public void setTechnologyStack(String technologyStack) { this.technologyStack = technologyStack; }
    public Double getEstimatedCost() { return estimatedCost; }
    public void setEstimatedCost(Double estimatedCost) { this.estimatedCost = estimatedCost; }
    public Double getCurrentFunding() { return currentFunding; }
    public void setCurrentFunding(Double currentFunding) { this.currentFunding = currentFunding; }
    public Integer getTimelineMonths() { return timelineMonths; }
    public void setTimelineMonths(Integer timelineMonths) { this.timelineMonths = timelineMonths; }
    public ProjectStage getStage() { return stage; }
    public void setStage(ProjectStage stage) { this.stage = stage; }
    public ProjectStatus getStatus() { return status; }
    public void setStatus(ProjectStatus status) { this.status = status; }
    public Integer getProgressPercentage() { return progressPercentage; }
    public void setProgressPercentage(Integer progressPercentage) { this.progressPercentage = progressPercentage; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public LocalDate getTargetCompletionDate() { return targetCompletionDate; }
    public void setTargetCompletionDate(LocalDate targetCompletionDate) { this.targetCompletionDate = targetCompletionDate; }
    public LocalDate getActualCompletionDate() { return actualCompletionDate; }
    public void setActualCompletionDate(LocalDate actualCompletionDate) { this.actualCompletionDate = actualCompletionDate; }
    public String getPrototypeUrl() { return prototypeUrl; }
    public void setPrototypeUrl(String prototypeUrl) { this.prototypeUrl = prototypeUrl; }
    public String getDeploymentNotes() { return deploymentNotes; }
    public void setDeploymentNotes(String deploymentNotes) { this.deploymentNotes = deploymentNotes; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
