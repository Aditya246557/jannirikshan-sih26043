package com.jannirikshan.citizen;

import com.jannirikshan.user.User;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "citizen_profiles")
public class CitizenProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    private String phone;
    private String address;
    private String villageCity;
    private String block;
    private String district;
    private String state;
    private String pincode;
    private String preferredLanguage;

    @Column(columnDefinition = "TEXT")
    private String bio;

    private Integer totalChallengesSubmitted = 0;
    private Integer totalResolved = 0;

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

    public CitizenProfile() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getVillageCity() { return villageCity; }
    public void setVillageCity(String villageCity) { this.villageCity = villageCity; }
    public String getBlock() { return block; }
    public void setBlock(String block) { this.block = block; }
    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }
    public String getState() { return state; }
    public void setState(String state) { this.state = state; }
    public String getPincode() { return pincode; }
    public void setPincode(String pincode) { this.pincode = pincode; }
    public String getPreferredLanguage() { return preferredLanguage; }
    public void setPreferredLanguage(String preferredLanguage) { this.preferredLanguage = preferredLanguage; }
    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
    public Integer getTotalChallengesSubmitted() { return totalChallengesSubmitted; }
    public void setTotalChallengesSubmitted(Integer totalChallengesSubmitted) { this.totalChallengesSubmitted = totalChallengesSubmitted; }
    public Integer getTotalResolved() { return totalResolved; }
    public void setTotalResolved(Integer totalResolved) { this.totalResolved = totalResolved; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
