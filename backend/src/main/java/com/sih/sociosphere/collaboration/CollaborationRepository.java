package com.sih.sociosphere.collaboration;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CollaborationRepository extends JpaRepository<Collaboration, Long> {
    List<Collaboration> findByComplaintId(Long complaintId);
    List<Collaboration> findByUniversityId(Long universityId);
    List<Collaboration> findByIndustryId(Long industryId);
}