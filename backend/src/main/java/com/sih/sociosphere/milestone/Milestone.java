package com.sih.sociosphere.milestone;

import com.sih.sociosphere.common.enums.MilestoneStatus;
import com.sih.sociosphere.project.Project;
import com.sih.sociosphere.student.Student;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "project_milestones",
        indexes = {
                @Index(name = "idx_milestone_project", columnList = "project_id"),
                @Index(name = "idx_milestone_status", columnList = "status")
        }
)
public class Milestone {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    private Integer milestoneOrder;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private LocalDate targetDate;
    private LocalDate completionDate;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private MilestoneStatus status = MilestoneStatus.PENDING;

    private Integer progressPercentage = 0; // 0 to 100

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_student_id")
    private Student assignedStudent;

    @Column(columnDefinition = "TEXT")
    private String deliverablesJson; // links or notes

    @Column(columnDefinition = "TEXT")
    private String studentSubmissionNotes;

    @Column(columnDefinition = "TEXT")
    private String facultyFeedback;

    private String approvedByFacultyName;
    private LocalDateTime approvedAt;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) status = MilestoneStatus.PENDING;
        if (progressPercentage == null) progressPercentage = 0;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Milestone() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }
    public Integer getMilestoneOrder() { return milestoneOrder; }
    public void setMilestoneOrder(Integer milestoneOrder) { this.milestoneOrder = milestoneOrder; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public LocalDate getTargetDate() { return targetDate; }
    public void setTargetDate(LocalDate targetDate) { this.targetDate = targetDate; }
    public LocalDate getCompletionDate() { return completionDate; }
    public void setCompletionDate(LocalDate completionDate) { this.completionDate = completionDate; }
    public MilestoneStatus getStatus() { return status; }
    public void setStatus(MilestoneStatus status) { this.status = status; }
    public Integer getProgressPercentage() { return progressPercentage; }
    public void setProgressPercentage(Integer progressPercentage) { this.progressPercentage = progressPercentage; }
    public Student getAssignedStudent() { return assignedStudent; }
    public void setAssignedStudent(Student assignedStudent) { this.assignedStudent = assignedStudent; }
    public String getDeliverablesJson() { return deliverablesJson; }
    public void setDeliverablesJson(String deliverablesJson) { this.deliverablesJson = deliverablesJson; }
    public String getStudentSubmissionNotes() { return studentSubmissionNotes; }
    public void setStudentSubmissionNotes(String studentSubmissionNotes) { this.studentSubmissionNotes = studentSubmissionNotes; }
    public String getFacultyFeedback() { return facultyFeedback; }
    public void setFacultyFeedback(String facultyFeedback) { this.facultyFeedback = facultyFeedback; }
    public String getApprovedByFacultyName() { return approvedByFacultyName; }
    public void setApprovedByFacultyName(String approvedByFacultyName) { this.approvedByFacultyName = approvedByFacultyName; }
    public LocalDateTime getApprovedAt() { return approvedAt; }
    public void setApprovedAt(LocalDateTime approvedAt) { this.approvedAt = approvedAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
