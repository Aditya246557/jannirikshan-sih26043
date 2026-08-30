package com.jannirikshan.proposal;

import com.jannirikshan.common.enums.ProposalStatus;
import com.jannirikshan.complaint.Complaint;
import com.jannirikshan.faculty.Faculty;
import com.jannirikshan.student.Student;
import com.jannirikshan.university.University;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "solution_proposals")
public class Proposal {

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
    @JoinColumn(name = "faculty_mentor_id")
    private Faculty facultyMentor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_lead_id")
    private Student studentLead;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String abstractText;

    @Column(columnDefinition = "TEXT")
    private String proposedSolution;

    @Column(columnDefinition = "TEXT")
    private String methodology;

    private Double estimatedBudget = 250000.0;
    private Integer estimatedTimelineMonths = 6;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private ProposalStatus status = ProposalStatus.SUBMITTED;

    @Column(columnDefinition = "TEXT")
    private String facultyReviewRemarks;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    public Proposal() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Complaint getComplaint() { return complaint; }
    public void setComplaint(Complaint complaint) { this.complaint = complaint; }
    public University getUniversity() { return university; }
    public void setUniversity(University university) { this.university = university; }
    public Faculty getFacultyMentor() { return facultyMentor; }
    public void setFacultyMentor(Faculty facultyMentor) { this.facultyMentor = facultyMentor; }
    public Student getStudentLead() { return studentLead; }
    public void setStudentLead(Student studentLead) { this.studentLead = studentLead; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getAbstractText() { return abstractText; }
    public void setAbstractText(String abstractText) { this.abstractText = abstractText; }
    public String getProposedSolution() { return proposedSolution; }
    public void setProposedSolution(String proposedSolution) { this.proposedSolution = proposedSolution; }
    public String getMethodology() { return methodology; }
    public void setMethodology(String methodology) { this.methodology = methodology; }
    public Double getEstimatedBudget() { return estimatedBudget; }
    public void setEstimatedBudget(Double estimatedBudget) { this.estimatedBudget = estimatedBudget; }
    public Integer getEstimatedTimelineMonths() { return estimatedTimelineMonths; }
    public void setEstimatedTimelineMonths(Integer estimatedTimelineMonths) { this.estimatedTimelineMonths = estimatedTimelineMonths; }
    public ProposalStatus getStatus() { return status; }
    public void setStatus(ProposalStatus status) { this.status = status; }
    public String getFacultyReviewRemarks() { return facultyReviewRemarks; }
    public void setFacultyReviewRemarks(String facultyReviewRemarks) { this.facultyReviewRemarks = facultyReviewRemarks; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}