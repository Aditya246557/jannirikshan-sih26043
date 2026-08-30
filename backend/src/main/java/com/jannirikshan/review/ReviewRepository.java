package com.jannirikshan.review;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReviewRepository extends JpaRepository<ProposalReview, Long> {
    List<ProposalReview> findByProposalId(Long proposalId);
}