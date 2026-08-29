package com.sih.sociosphere.officer;

import com.sih.sociosphere.user.User;
import jakarta.persistence.*;

@Entity
@Table(name = "government_officers")
public class Officer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    private String designation;
    private String departmentName;
    private String jurisdictionDistrict;

    public Officer() {}
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }
    public String getDepartmentName() { return departmentName; }
    public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }
    public String getJurisdictionDistrict() { return jurisdictionDistrict; }
    public void setJurisdictionDistrict(String jurisdictionDistrict) { this.jurisdictionDistrict = jurisdictionDistrict; }
}