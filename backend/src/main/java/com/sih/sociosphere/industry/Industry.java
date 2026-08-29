package com.sih.sociosphere.industry;

import com.sih.sociosphere.user.User;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "industries")
@com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Industry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false, length = 200)
    private String companyName;

    private String registrationNumber; // CIN / GST
    private String sector; // IT, AgriTech, CleanTech, Healthcare, MSME, CSR
    private String website;
    private String contactPerson;
    private String contactEmail;
    private String contactPhone;
    private String address;
    private String state;
    private String district;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String areasOfInterest; // e.g. "Water Purification, Solar, Waste Management"

    private Double totalFundingCommitted = 0.0;
    private Integer projectsSupportedCount = 0;
    private boolean verified = true;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    public Industry() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }
    public String getRegistrationNumber() { return registrationNumber; }
    public void setRegistrationNumber(String registrationNumber) { this.registrationNumber = registrationNumber; }
    public String getSector() { return sector; }
    public void setSector(String sector) { this.sector = sector; }
    public String getWebsite() { return website; }
    public void setWebsite(String website) { this.website = website; }
    public String getContactPerson() { return contactPerson; }
    public void setContactPerson(String contactPerson) { this.contactPerson = contactPerson; }
    public String getContactEmail() { return contactEmail; }
    public void setContactEmail(String contactEmail) { this.contactEmail = contactEmail; }
    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getState() { return state; }
    public void setState(String state) { this.state = state; }
    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getAreasOfInterest() { return areasOfInterest; }
    public void setAreasOfInterest(String areasOfInterest) { this.areasOfInterest = areasOfInterest; }
    public Double getTotalFundingCommitted() { return totalFundingCommitted; }
    public void setTotalFundingCommitted(Double totalFundingCommitted) { this.totalFundingCommitted = totalFundingCommitted; }
    public Integer getProjectsSupportedCount() { return projectsSupportedCount; }
    public void setProjectsSupportedCount(Integer projectsSupportedCount) { this.projectsSupportedCount = projectsSupportedCount; }
    public boolean isVerified() { return verified; }
    public void setVerified(boolean verified) { this.verified = verified; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
