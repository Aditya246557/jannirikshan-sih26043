package com.sih.sociosphere.university;

import com.sih.sociosphere.user.User;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "universities")
@com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class University {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(length = 50, unique = true)
    private String code;

    private String aisheCode;
    private String state;
    private String district;
    private String address;
    private String contactEmail;
    private String contactPhone;
    private String website;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String departmentsList; // Comma or JSON-separated

    @Column(columnDefinition = "TEXT")
    private String expertiseAreas; // e.g. "Water Systems, IoT, Smart Agriculture, Clean Energy"

    @Column(columnDefinition = "TEXT")
    private String researchFacilities;

    private Integer capacity = 10;
    private Integer activeProjectsCount = 0;
    private Integer completedProjectsCount = 0;
    private Double rating = 4.8;
    private boolean verified = true;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public University() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getAisheCode() { return aisheCode; }
    public void setAisheCode(String aisheCode) { this.aisheCode = aisheCode; }
    public String getState() { return state; }
    public void setState(String state) { this.state = state; }
    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getContactEmail() { return contactEmail; }
    public void setContactEmail(String contactEmail) { this.contactEmail = contactEmail; }
    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }
    public String getWebsite() { return website; }
    public void setWebsite(String website) { this.website = website; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getDepartmentsList() { return departmentsList; }
    public void setDepartmentsList(String departmentsList) { this.departmentsList = departmentsList; }
    public String getExpertiseAreas() { return expertiseAreas; }
    public void setExpertiseAreas(String expertiseAreas) { this.expertiseAreas = expertiseAreas; }
    public String getResearchFacilities() { return researchFacilities; }
    public void setResearchFacilities(String researchFacilities) { this.researchFacilities = researchFacilities; }
    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }
    public Integer getActiveProjectsCount() { return activeProjectsCount; }
    public void setActiveProjectsCount(Integer activeProjectsCount) { this.activeProjectsCount = activeProjectsCount; }
    public Integer getCompletedProjectsCount() { return completedProjectsCount; }
    public void setCompletedProjectsCount(Integer completedProjectsCount) { this.completedProjectsCount = completedProjectsCount; }
    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }
    public boolean isVerified() { return verified; }
    public void setVerified(boolean verified) { this.verified = verified; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
