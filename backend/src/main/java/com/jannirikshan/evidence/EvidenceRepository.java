package com.jannirikshan.evidence;

import com.jannirikshan.common.enums.EvidenceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EvidenceRepository extends JpaRepository<Evidence, Long> {
    List<Evidence> findByComplaintId(Long complaintId);
    List<Evidence> findByVerificationStatus(EvidenceStatus status);
    long countByVerificationStatus(EvidenceStatus status);
}
