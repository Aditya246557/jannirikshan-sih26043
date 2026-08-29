package com.sih.sociosphere.evidence;

import com.sih.sociosphere.common.enums.EvidenceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EvidenceRepository extends JpaRepository<Evidence, Long> {
    List<Evidence> findByComplaintId(Long complaintId);
    List<Evidence> findByVerificationStatus(EvidenceStatus status);
    long countByVerificationStatus(EvidenceStatus status);
}
