package com.jannirikshan.faculty;

import com.jannirikshan.department.Department;
import com.jannirikshan.university.University;
import com.jannirikshan.user.User;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "faculty_members")
public class Faculty {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "university_id", nullable = false)
    private University university;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    private String designation; // Professor, Associate Professor, etc.
    private String specialization;
    private String employeeId;
    private String phone;
    private Integer maxMentoringCapacity = 5;
    private Integer activeProjectsCount = 0;

    @Column(columnDefinition = "TEXT")
    private String bio;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    public Faculty() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public University getUniversity() { return university; }
    public void setUniversity(University university) { this.university = university; }
    public Department getDepartment() { return department; }
    public void setDepartment(Department department) { this.department = department; }
    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }
    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }
    public String getEmployeeId() { return employeeId; }
    public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public Integer getMaxMentoringCapacity() { return maxMentoringCapacity; }
    public void setMaxMentoringCapacity(Integer maxMentoringCapacity) { this.maxMentoringCapacity = maxMentoringCapacity; }
    public Integer getActiveProjectsCount() { return activeProjectsCount; }
    public void setActiveProjectsCount(Integer activeProjectsCount) { this.activeProjectsCount = activeProjectsCount; }
    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
