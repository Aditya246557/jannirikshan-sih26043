package com.sih.sociosphere.team;

import com.sih.sociosphere.project.Project;
import com.sih.sociosphere.student.Student;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "project_teams")
public class Team {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(nullable = false, length = 150)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "leader_student_id")
    private Student leader;

    private Integer totalMembers = 1;
    private Integer overallProgressPercentage = 0;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    public Team() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Student getLeader() { return leader; }
    public void setLeader(Student leader) { this.leader = leader; }
    public Integer getTotalMembers() { return totalMembers; }
    public void setTotalMembers(Integer totalMembers) { this.totalMembers = totalMembers; }
    public Integer getOverallProgressPercentage() { return overallProgressPercentage; }
    public void setOverallProgressPercentage(Integer overallProgressPercentage) { this.overallProgressPercentage = overallProgressPercentage; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
