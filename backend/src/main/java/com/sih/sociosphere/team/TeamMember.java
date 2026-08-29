package com.sih.sociosphere.team;

import com.sih.sociosphere.student.Student;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "team_members")
public class TeamMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id", nullable = false)
    private Team team;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    private String roleInTeam; // Lead Developer, Hardware Lead, UI/UX Designer, Field Researcher
    private String status = "ACTIVE"; // ACTIVE, INVITED, LEFT

    private LocalDateTime joinedAt;

    @PrePersist
    protected void onCreate() {
        if (joinedAt == null) joinedAt = LocalDateTime.now();
    }

    public TeamMember() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Team getTeam() { return team; }
    public void setTeam(Team team) { this.team = team; }
    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }
    public String getRoleInTeam() { return roleInTeam; }
    public void setRoleInTeam(String roleInTeam) { this.roleInTeam = roleInTeam; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getJoinedAt() { return joinedAt; }
    public void setJoinedAt(LocalDateTime joinedAt) { this.joinedAt = joinedAt; }
}
