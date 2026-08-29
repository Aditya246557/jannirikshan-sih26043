package com.sih.sociosphere.department;

import com.sih.sociosphere.university.University;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "departments")
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "university_id", nullable = false)
    private University university;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(length = 50)
    private String code;

    private String hodName;
    private String hodEmail;
    private String contactPhone;

    @Column(columnDefinition = "TEXT")
    private String researchFocus;

    private Integer totalFaculty = 0;
    private Integer totalStudents = 0;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    public Department() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public University getUniversity() { return university; }
    public void setUniversity(University university) { this.university = university; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getHodName() { return hodName; }
    public void setHodName(String hodName) { this.hodName = hodName; }
    public String getHodEmail() { return hodEmail; }
    public void setHodEmail(String hodEmail) { this.hodEmail = hodEmail; }
    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }
    public String getResearchFocus() { return researchFocus; }
    public void setResearchFocus(String researchFocus) { this.researchFocus = researchFocus; }
    public Integer getTotalFaculty() { return totalFaculty; }
    public void setTotalFaculty(Integer totalFaculty) { this.totalFaculty = totalFaculty; }
    public Integer getTotalStudents() { return totalStudents; }
    public void setTotalStudents(Integer totalStudents) { this.totalStudents = totalStudents; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
