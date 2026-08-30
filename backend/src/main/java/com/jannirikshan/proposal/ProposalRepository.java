package com.jannirikshan.proposal;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProposalRepository extends JpaRepository<Proposal, Long> {
    List<Proposal> findByComplaintId(Long complaintId);
    List<Proposal> findByUniversityId(Long universityId);
}